import { z } from "zod/v3"

export const cleaningReviewStatusSchema = z.enum([
  "Created",
  "AI Analizing",
  "Analized",
  "Done",
  "Failed",
])

export const createCleaningReviewSchema = z.object({
  assignedEmployeeId: z.number().positive(),
  reservationId: z.number().positive(),
  additionnalInfos: z.string().trim().nullable().optional(),
  status: cleaningReviewStatusSchema,
  aiOutput: z.unknown().nullable().optional(),
  localVideoPath: z.string().trim().nullable().optional(),
  uri: z.string().trim().nullable().optional(),
  mimeType: z.string().trim().nullable().optional(),
})
export type CreateCleaningReviewSchema = z.infer<
  typeof createCleaningReviewSchema
>

export const updateCleaningReviewSchema = z.object({
  id: z.number().positive().optional(),
  assignedEmployeeId: z.number().positive().optional(),
  reservationId: z.number().positive().optional(),
  additionnalInfos: z.string().trim().nullable().optional(),
  status: cleaningReviewStatusSchema.optional(),
  aiOutput: z.unknown().nullable().optional(),
  localVideoPath: z.string().trim().nullable().optional(),
  uri: z.string().trim().nullable().optional(),
  mimeType: z.string().trim().nullable().optional(),
})
export type UpdateCleaningReviewSchema = z.infer<
  typeof updateCleaningReviewSchema
>

export const createManyCleaningReviewSchema = z.object({
  cleaningReviews: z.array(createCleaningReviewSchema),
})
export type CreateManyCleaningReviewSchema = z.infer<
  typeof createManyCleaningReviewSchema
>

export const updateManyCleaningReviewSchema = z.object({
  cleaningReviews: z.array(
    updateCleaningReviewSchema.extend({ id: z.number().positive() })
  ),
})
export type UpdateManyCleaningReviewSchema = z.infer<
  typeof updateManyCleaningReviewSchema
>
