import fs from 'fs';
import path from 'path';
import { StorageBucket } from '@prisma/client';
import { prisma } from './db';
import { encryptData, decryptData, generateSecureToken } from './crypto';
import { AppError, NotFoundError } from './errors';

export interface UploadFileOptions {
  bucket: StorageBucket;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  uploadedById?: string;
}

export interface FileDownloadResult {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  isEncrypted: boolean;
}

function getUploadsBaseDir(): string {
  const custom = process.env.STORAGE_LOCAL_DIR;
  if (custom && path.isAbsolute(custom)) {
    return custom;
  }
  return path.join(process.cwd(), 'uploads');
}

// Ensure upload directories exist
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function resolveSecureFilePath(fileKey: string): string {
  // Reject null bytes and path traversal sequences
  if (!fileKey || fileKey.includes('\0') || fileKey.includes('..')) {
    throw new AppError('Invalid file key: Path traversal attempt detected', 400);
  }

  const baseDir = getUploadsBaseDir();
  const baseResolved = path.resolve(/*turbopackIgnore: true*/ baseDir);
  const fullFilePath = path.resolve(/*turbopackIgnore: true*/ baseDir, fileKey);

  if (!fullFilePath.startsWith(baseResolved)) {
    throw new AppError('Forbidden: Access outside storage root is prohibited', 403);
  }

  return fullFilePath;
}

/**
 * Uploads a file with bucket-specific security controls (AES-256 encryption for KYC)
 */
export async function uploadFile(options: UploadFileOptions): Promise<{ fileKey: string; storageId: string }> {
  const { bucket, fileName, mimeType, buffer, uploadedById } = options;

  // Bucket isolation & path generation
  const datePrefix = new Date().toISOString().slice(0, 10);
  const randomSuffix = generateSecureToken(8);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileKey = `${bucket.toLowerCase()}/${datePrefix}/${randomSuffix}_${sanitizedFileName}`;

  const shouldEncrypt = bucket === StorageBucket.PRIVATE_KYC;
  let finalBuffer = buffer;
  let encryptionIv: string | null = null;
  let authTag: string | null = null;

  if (shouldEncrypt) {
    const encrypted = encryptData(buffer.toString('base64'));
    finalBuffer = Buffer.from(encrypted.cipherText, 'utf8');
    encryptionIv = encrypted.iv;
    authTag = encrypted.authTag;
  }

  // Local storage write with traversal check
  const fullFilePath = resolveSecureFilePath(fileKey);
  ensureDirectoryExists(path.dirname(fullFilePath));
  fs.writeFileSync(fullFilePath, finalBuffer);

  // Register in DB
  const storageRecord = await prisma.storageObject.create({
    data: {
      fileKey,
      fileName,
      fileSize: buffer.length,
      mimeType,
      bucket,
      isEncrypted: shouldEncrypt,
      encryptionIv,
      authTag,
      uploadedById: uploadedById || null,
    },
  });

  return {
    fileKey,
    storageId: storageRecord.id,
  };
}

/**
 * Retrieves a file and handles automatic decryption if encrypted at rest
 */
export async function getFile(fileKey: string): Promise<FileDownloadResult> {
  const fullFilePath = resolveSecureFilePath(fileKey);

  const storageRecord = await prisma.storageObject.findUnique({
    where: { fileKey },
  });

  if (!storageRecord || storageRecord.deletedAt) {
    throw new NotFoundError(`File [${fileKey}] not found`);
  }

  if (!fs.existsSync(/*turbopackIgnore: true*/ fullFilePath)) {
    throw new NotFoundError(`Physical file for key [${fileKey}] does not exist on disk`);
  }

  const rawBuffer = fs.readFileSync(/*turbopackIgnore: true*/ fullFilePath);

  if (storageRecord.isEncrypted) {
    if (!storageRecord.encryptionIv || !storageRecord.authTag) {
      throw new AppError('Encrypted file is missing cryptographic metadata', 500);
    }
    const cipherText = rawBuffer.toString('utf8');
    const decryptedBase64 = decryptData(cipherText, storageRecord.encryptionIv, storageRecord.authTag);
    const decryptedBuffer = Buffer.from(decryptedBase64, 'base64');

    return {
      fileName: storageRecord.fileName,
      mimeType: storageRecord.mimeType,
      buffer: decryptedBuffer,
      isEncrypted: true,
    };
  }

  return {
    fileName: storageRecord.fileName,
    mimeType: storageRecord.mimeType,
    buffer: rawBuffer,
    isEncrypted: false,
  };
}

/**
 * Soft deletes a file
 */
export async function deleteFile(fileKey: string): Promise<void> {
  await prisma.storageObject.update({
    where: { fileKey },
    data: { deletedAt: new Date() },
  });
}
