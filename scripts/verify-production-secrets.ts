/**
 * Pre-Flight Production Secrets & Environment Validation Script
 * Run in CI/CD pipeline or before deployment:
 *   npx tsx scripts/verify-production-secrets.ts
 */

interface EnvRequirement {
  key: string;
  requiredInProd: boolean;
  minLength?: number;
  pattern?: RegExp;
  description: string;
}

const REQUIRED_SECRETS: EnvRequirement[] = [
  {
    key: 'DATABASE_URL',
    requiredInProd: true,
    pattern: /^postgresql:\/\/.+/,
    description: 'PostgreSQL connection string with username, password, host, and database name',
  },
  {
    key: 'REDIS_URL',
    requiredInProd: true,
    pattern: /^redis:\/\/.+/,
    description: 'Redis connection string for BullMQ queues and caching',
  },
  {
    key: 'ENCRYPTION_KEY_PII',
    requiredInProd: true,
    minLength: 64, // 64 hex characters = 32 bytes
    pattern: /^[0-9a-fA-F]{64}$/,
    description: '32-byte AES-256-GCM encryption key for PII & KYC Vault (64 hex characters)',
  },
  {
    key: 'QR_HMAC_SECRET',
    requiredInProd: true,
    minLength: 32,
    description: 'HMAC-SHA256 digital signature secret key for QR verification gateway',
  },
  {
    key: 'NEXTAUTH_SECRET',
    requiredInProd: true,
    minLength: 32,
    description: 'Cryptographic session encryption secret for NextAuth JWTs',
  },
  {
    key: 'RAZORPAY_KEY_ID',
    requiredInProd: true,
    description: 'Razorpay Payment Gateway API Key ID',
  },
  {
    key: 'RAZORPAY_KEY_SECRET',
    requiredInProd: true,
    description: 'Razorpay Payment Gateway API Key Secret',
  },
  {
    key: 'STRIPE_SECRET_KEY',
    requiredInProd: false,
    description: 'Stripe International Payment Gateway Secret Key',
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    requiredInProd: false,
    description: 'Stripe Webhook Signature Verification Secret',
  },
];

export function validateProductionSecrets(env: NodeJS.ProcessEnv = process.env): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const isProd = env.NODE_ENV === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const req of REQUIRED_SECRETS) {
    const val = env[req.key];

    if (!val) {
      if (isProd && req.requiredInProd) {
        errors.push(`[FATAL] Missing required production environment variable: ${req.key} (${req.description})`);
      } else {
        warnings.push(`[WARNING] Optional/Development variable not set: ${req.key} (${req.description})`);
      }
      continue;
    }

    if (req.minLength && val.length < req.minLength) {
      errors.push(`[SECURITY] Variable ${req.key} has insufficient length (${val.length} chars, expected >= ${req.minLength})`);
    }

    if (req.pattern && !req.pattern.test(val)) {
      errors.push(`[FORMAT] Variable ${req.key} does not match required format pattern.`);
    }

    // Check against obvious dummy secrets in production
    if (isProd && (val.includes('dummy') || val.includes('placeholder') || val.includes('123456'))) {
      errors.push(`[INSECURE] Variable ${req.key} appears to contain a dummy/default placeholder value.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Execute standalone verification
const result = validateProductionSecrets();
console.log('--- Production Secret & Environment Pre-Flight Verification ---');
console.log(`Node Environment: ${process.env.NODE_ENV || 'development'}`);
if (result.warnings.length > 0) {
  console.log('\nWarnings:');
  result.warnings.forEach((w) => console.log(' ', w));
}

if (result.errors.length > 0) {
  console.error('\nConfiguration Errors:');
  result.errors.forEach((e) => console.error(' ', e));
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
} else {
  console.log('\n✓ Pre-flight secrets and configuration checks PASSED.');
}
