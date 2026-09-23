import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadFile, getFile } from '@/lib/storage';
import { StorageBucket } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Mock Prisma for unit tests
vi.mock('@/lib/db', () => ({
  prisma: {
    storageObject: {
      create: vi.fn().mockImplementation(({ data }) => ({
        id: 'storage_123',
        ...data,
      })),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/db';

describe('Secure Storage & Encrypted KYC Vault Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upload public asset unencrypted', async () => {
    const fileContent = 'IMAGE_BINARY_DATA_EXAMPLE';
    const buffer = Buffer.from(fileContent);

    const result = await uploadFile({
      bucket: StorageBucket.PUBLIC_ASSETS,
      fileName: 'banner.png',
      mimeType: 'image/png',
      buffer,
      uploadedById: 'user_1',
    });

    expect(result.fileKey).toContain('public_assets');
    expect(result.storageId).toBe('storage_123');

    // Verify DB call was unencrypted
    expect(prisma.storageObject.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bucket: StorageBucket.PUBLIC_ASSETS,
        isEncrypted: false,
        encryptionIv: null,
        authTag: null,
      }),
    });
  });

  it('should automatically encrypt confidential KYC documents with AES-256-GCM', async () => {
    const kycContent = 'AADHAAR_CARD_CONFIDENTIAL_1234_5678_9012';
    const buffer = Buffer.from(kycContent);

    const result = await uploadFile({
      bucket: StorageBucket.PRIVATE_KYC,
      fileName: 'aadhaar_scan.pdf',
      mimeType: 'application/pdf',
      buffer,
      uploadedById: 'user_1',
    });

    expect(result.fileKey).toContain('private_kyc');

    // Verify DB call captured encryption IV and Auth Tag
    expect(prisma.storageObject.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bucket: StorageBucket.PRIVATE_KYC,
        isEncrypted: true,
        encryptionIv: expect.any(String),
        authTag: expect.any(String),
      }),
    });

    // Check that physical file on disk is encrypted and does not contain plain text
    const fullPath = path.join('./uploads', result.fileKey);
    const diskContent = fs.readFileSync(fullPath, 'utf8');
    expect(diskContent).not.toContain(kycContent);
  });
});
