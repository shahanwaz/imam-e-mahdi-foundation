import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_ROUNDS = 12;

function getEncryptionKey(): Buffer {
  if (process.env.NODE_ENV === 'production' && !process.env.ENCRYPTION_KEY_PII) {
    throw new Error('FATAL SECURITY ERROR: ENCRYPTION_KEY_PII must be configured in production environment.');
  }
  const keyHex = process.env.ENCRYPTION_KEY_PII || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  return Buffer.from(keyHex.padEnd(64, '0').slice(0, 64), 'hex');
}

function getHmacSecret(): string {
  if (process.env.NODE_ENV === 'production' && !process.env.QR_HMAC_SECRET) {
    throw new Error('FATAL SECURITY ERROR: QR_HMAC_SECRET must be configured in production environment.');
  }
  return process.env.QR_HMAC_SECRET || 'imf-dos-hmac-qr-verification-secret-key-2026';
}

/**
 * Encrypts sensitive string data (e.g. Aadhaar, PAN, Bank Details) using AES-256-GCM
 */
export function encryptData(plainText: string): { cipherText: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    cipherText: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Decrypts AES-256-GCM cipherText using key, IV, and auth tag
 */
export function decryptData(cipherText: string, ivHex: string, authTagHex: string): string {
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(cipherText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password against bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates an HMAC-SHA256 tamper-proof signature for receipts/certificates
 */
export function generateHmacSignature(payload: string): string {
  const secret = getHmacSecret();
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verifies an HMAC-SHA256 signature
 */
export function verifyHmacSignature(payload: string, signature: string): boolean {
  const expected = generateHmacSignature(payload);
  const expectedBuf = Buffer.from(expected, 'hex');
  const sigBuf = Buffer.from(signature, 'hex');
  if (expectedBuf.length !== sigBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, sigBuf);
}

/**
 * Generates cryptographically secure random token (e.g. for session tokens, password resets)
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Masks sensitive national identity or PAN for safe display
 * e.g. "ABCDE1234F" -> "ABCDE****F"
 */
export function maskSensitiveId(id: string): string {
  if (!id || id.length < 4) return '****';
  const start = id.slice(0, Math.min(3, id.length - 2));
  const end = id.slice(-2);
  return `${start}${'*'.repeat(Math.max(4, id.length - start.length - end.length))}${end}`;
}

export function maskPAN(pan: string): string {
  if (!pan || pan.length < 5) return 'XXXXX0000X';
  const clean = pan.trim().toUpperCase();
  if (clean.length === 10) {
    return `${clean.slice(0, 5)}****${clean.slice(9)}`;
  }
  return maskSensitiveId(clean);
}

export const maskPan = maskPAN;

/**
 * Single-string PII encryption using AES-256-GCM format: cipherText:iv:authTag
 */
export function encryptPII(plainText: string): string {
  if (!plainText) return '';
  const { cipherText, iv, authTag } = encryptData(plainText);
  return `${cipherText}:${iv}:${authTag}`;
}

/**
 * Decrypts single-string PII in format: cipherText:iv:authTag
 */
export function decryptPII(encryptedString: string): string {
  if (!encryptedString) return '';
  const parts = encryptedString.split(':');
  if (parts.length !== 3) return encryptedString;
  const [cipherText, iv, authTag] = parts;
  return decryptData(cipherText, iv, authTag);
}

