import { describe, it, expect } from 'vitest';
import { generateTotpSecret, verifyTotpToken } from '@/lib/totp';
import * as OTPAuth from 'otpauth';

describe('TOTP Multi-Factor Authentication Engine Unit Tests', () => {
  it('should generate valid Base32 TOTP secret and otpauth URI', () => {
    const email = 'trustee@imf-foundation.org';
    const { secret, uri } = generateTotpSecret(email);

    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThanOrEqual(16);
    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain('Imam%20E%20Mahdi%20Foundation');
    expect(uri).toContain(encodeURIComponent(email));
  });

  it('should generate and verify valid 6-digit TOTP tokens', () => {
    const { secret } = generateTotpSecret('finance@imf-foundation.org');

    const totp = new OTPAuth.TOTP({
      issuer: 'Imam E Mahdi Foundation',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const currentToken = totp.generate();
    expect(currentToken).toMatch(/^\d{6}$/);

    const isValid = verifyTotpToken(currentToken, secret);
    expect(isValid).toBe(true);
  });

  it('should reject invalid or malformed TOTP tokens', () => {
    const { secret } = generateTotpSecret('director@imf-foundation.org');

    expect(verifyTotpToken('000000', secret)).toBe(false);
    expect(verifyTotpToken('999999', secret)).toBe(false);
    expect(verifyTotpToken('', secret)).toBe(false);
    expect(verifyTotpToken('123', secret)).toBe(false);
    expect(verifyTotpToken('abcdef', secret)).toBe(false);
  });
});
