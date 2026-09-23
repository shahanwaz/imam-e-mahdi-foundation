import { z } from 'zod';
import { StorageBucket } from '@prisma/client';

export const UploadFileMetadataSchema = z.object({
  bucket: z.nativeEnum(StorageBucket),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(3).max(100),
  fileBase64: z.string().min(1, 'File content base64 is required'),
});

export type UploadFileMetadataInput = z.infer<typeof UploadFileMetadataSchema>;
