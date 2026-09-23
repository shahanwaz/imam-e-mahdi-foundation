import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  preferredLanguage: z.enum(['en', 'hi', 'ur', 'ar']).default('en'),
  countryCode: z.string().length(3).default('IND'),
  role: z.enum(['DONOR', 'VOLUNTEER', 'MEMBER']).default('DONOR'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().length(6, 'TOTP code must be exactly 6 digits').optional(),
});

export const Verify2FASchema = z.object({
  totpCode: z.string().length(6, 'TOTP code must be exactly 6 digits'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type Verify2FAInput = z.infer<typeof Verify2FASchema>;
