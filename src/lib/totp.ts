import * as OTPAuth from 'otpauth';

const ISSUER = 'Imam E Mahdi Foundation';

/**
 * Generate a new TOTP secret for a user
 */
export function generateTotpSecret(userEmail: string): { secret: string; uri: string } {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret({ size: 20 }),
  });

  return {
    secret: totp.secret.base32,
    uri: totp.toString(),
  };
}

/**
 * Verify a 6-digit TOTP token against a base32 secret
 */
export function verifyTotpToken(token: string, secretBase32: string): boolean {
  if (!token || !secretBase32) return false;

  try {
    const totp = new OTPAuth.TOTP({
      issuer: ISSUER,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });

    // delta returns null if invalid, or number of time steps delta if valid (window: 1 period tolerance)
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  } catch (error) {
    console.error('[TOTP_VERIFICATION_ERROR]', error);
    return false;
  }
}
