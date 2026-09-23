import { z } from 'zod';
import { RoleType, UserStatus } from '@prisma/client';

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  preferredLanguage: z.enum(['en', 'hi', 'ur', 'ar']).default('en'),
  countryCode: z.string().length(3).default('IND'),
  roles: z.array(z.nativeEnum(RoleType)).min(1, 'At least one role must be assigned'),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional().nullable(),
  status: z.nativeEnum(UserStatus).optional(),
  preferredLanguage: z.enum(['en', 'hi', 'ur', 'ar']).optional(),
  roles: z.array(z.nativeEnum(RoleType)).optional(),
});

export const AssignRolesSchema = z.object({
  userId: z.string(),
  roles: z.array(z.nativeEnum(RoleType)).min(1, 'At least one role must be specified'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type AssignRolesInput = z.infer<typeof AssignRolesSchema>;
