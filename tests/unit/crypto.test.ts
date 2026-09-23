import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  encryptData,
  decryptData,
  generateHmacSignature,
  verifyHmacSignature,
  generateSecureToken,
  maskSensitiveId,
} from '@/lib/crypto';

describe('Crypto & Security Engine Unit Tests', () => {
  it('should securely hash and verify passwords using bcrypt', async () => {
    const rawPassword = 'SecretPassword@2026!';
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash).toMatch(/^\$2[aby]\$\d+\$/); // Valid bcrypt hash format

    const isValid = await verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword('WrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('should perform AES-256-GCM envelope encryption and decryption on sensitive PII', () => {
    const sensitiveAadhaar = '1234-5678-9012';
    const encrypted = encryptData(sensitiveAadhaar);

    expect(encrypted.cipherText).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();
    expect(encrypted.cipherText).not.toBe(sensitiveAadhaar);

    const decrypted = decryptData(encrypted.cipherText, encrypted.iv, encrypted.authTag);
    expect(decrypted).toBe(sensitiveAadhaar);
  });

  it('should fail decryption if ciphertext or auth tag is tampered with', () => {
    const sensitiveData = 'CONFIDENTIAL_BANK_ACCOUNT_998877';
    const encrypted = encryptData(sensitiveData);

    // Tamper with auth tag
    const tamperedAuthTag = 'ff'.repeat(16);
    expect(() => {
      decryptData(encrypted.cipherText, encrypted.iv, tamperedAuthTag);
    }).toThrow();
  });

  it('should generate deterministic HMAC-SHA256 signatures and verify authenticity', () => {
    const receiptPayload = 'DOC:80G|ID:IMF-REC-2026-001|AMOUNT:50000|DATE:2026-09-15';
    const signature = generateHmacSignature(receiptPayload);

    expect(signature).toBeDefined();
    expect(signature.length).toBe(64); // SHA-256 hex string

    const isAuthentic = verifyHmacSignature(receiptPayload, signature);
    expect(isAuthentic).toBe(true);

    // Tampering with payload by 1 character
    const tamperedPayload = 'DOC:80G|ID:IMF-REC-2026-001|AMOUNT:50001|DATE:2026-09-15';
    const isTamperedAuthentic = verifyHmacSignature(tamperedPayload, signature);
    expect(isTamperedAuthentic).toBe(false);
  });

  it('should generate high-entropy secure random tokens', () => {
    const token1 = generateSecureToken(32);
    const token2 = generateSecureToken(32);

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it('should correctly mask sensitive PAN and National IDs', () => {
    expect(maskSensitiveId('ABCDE1234F')).toBe('ABC*****4F');
    expect(maskSensitiveId('123456789012')).toBe('123*******12');
    expect(maskSensitiveId('AB')).toBe('****');
  });
});
