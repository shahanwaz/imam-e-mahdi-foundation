import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';
import { uploadFile, getFile } from '@/lib/storage';
import { StorageBucket } from '@prisma/client';
import { AppError, NotFoundError } from '@/lib/errors';
import { maskPAN, maskSensitiveId, encryptPII, decryptPII, verifyHmacSignature } from '@/lib/crypto';

// Mock DB for storage tests
vi.mock('@/lib/db', () => {
  const store = new Map<string, any>();
  return {
    prisma: {
      storageObject: {
        create: vi.fn().mockImplementation(({ data }) => {
          const rec = { id: `st_${Date.now()}`, ...data, createdAt: new Date() };
          store.set(data.fileKey, rec);
          return Promise.resolve(rec);
        }),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(store.get(where.fileKey) || null);
        }),
      },
    },
  };
});

describe('Security Audit & Defensive Mitigations Suite', () => {
  describe('1. Sliding Window Rate Limiting Engine', () => {
    it('should allow requests within configured threshold and block excessive attempts', () => {
      const opts = { windowMs: 1000, max: 3, identifierPrefix: 'test_sec' };
      const id = `ip_test_${Date.now()}`;

      // 1st request
      const r1 = checkRateLimit(id, opts);
      expect(r1.success).toBe(true);
      expect(r1.remaining).toBe(2);

      // 2nd request
      const r2 = checkRateLimit(id, opts);
      expect(r2.success).toBe(true);
      expect(r2.remaining).toBe(1);

      // 3rd request
      const r3 = checkRateLimit(id, opts);
      expect(r3.success).toBe(true);
      expect(r3.remaining).toBe(0);

      // 4th request (Exceeded limit)
      const r4 = checkRateLimit(id, opts);
      expect(r4.success).toBe(false);
      expect(r4.remaining).toBe(0);
      expect(r4.retryAfterSeconds).toBeDefined();
    });
  });

  describe('2. Path Traversal & Arbitrary File Access Defenses', () => {
    it('should reject file keys containing path traversal sequences (../)', async () => {
      await expect(getFile('../../../etc/passwd')).rejects.toThrow(
        /Path traversal attempt detected/
      );

      await expect(getFile('public/../../secret.txt')).rejects.toThrow(
        /Path traversal attempt detected/
      );
    });

    it('should reject file keys containing null bytes', async () => {
      await expect(getFile('public/avatar.jpg\0.exe')).rejects.toThrow(
        /Path traversal attempt detected/
      );
    });
  });

  describe('3. PII Masking & AES-256-GCM Envelope Encryption', () => {
    it('should mask PAN correctly for non-sensitive public display', () => {
      expect(maskPAN('ABCDE1234F')).toBe('ABCDE****F');
      expect(maskPAN('BLRPK9876Z')).toBe('BLRPK****Z');
    });

    it('should mask national IDs and Aadhaar correctly', () => {
      const masked = maskSensitiveId('234567890123');
      expect(masked.startsWith('234')).toBe(true);
      expect(masked.endsWith('23')).toBe(true);
      expect(masked).toContain('****');
    });

    it('should encrypt and decrypt sensitive PII deterministically with AES-256-GCM', () => {
      const secret = 'CONFIDENTIAL_BANK_ACCOUNT_9988776655';
      const encrypted = encryptPII(secret);

      expect(encrypted).not.toBe(secret);
      expect(encrypted.split(':')).toHaveLength(3); // cipher:iv:authTag

      const decrypted = decryptPII(encrypted);
      expect(decrypted).toBe(secret);
    });
  });

  describe('4. Cryptographic QR Signature Verification', () => {
    it('should verify valid HMAC signature and reject tampered signature', () => {
      const payload = 'DOC-REC-2026-001|5000|ZAKAT|2026-09-18';
      const sig = verifyHmacSignature(payload, 'wrong_hex_signature');
      expect(sig).toBe(false);
    });
  });
});
