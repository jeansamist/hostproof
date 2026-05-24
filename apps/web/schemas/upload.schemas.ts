import { z } from "zod/v3"

export const uploadPurposeSchema = z.enum(["employee-avatar"])
export type UploadPurposeSchema = z.infer<typeof uploadPurposeSchema>

export const uploadResponseSchema = z.object({
  fileName: z.string().min(1),
  localPath: z.string().min(1),
  mimeType: z.string().min(1),
  purpose: uploadPurposeSchema,
  size: z.number().nonnegative(),
  uri: z.string().url(),
})
export type UploadResponseSchema = z.infer<typeof uploadResponseSchema>
