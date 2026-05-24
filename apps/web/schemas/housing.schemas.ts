import { z } from "zod/v3"

export const createHousingSchema = z.object({
  name: z.string(),
  address: z.string(),
  type: z.enum(["apartment", "house", "villa"]),
  capacity: z.number().positive(),
})
export type CreateHousingSchema = z.infer<typeof createHousingSchema>

export const updateHousingSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(["apartment", "house", "villa"]).optional(),
  capacity: z.number().positive().optional(),
})
export type UpdateHousingSchema = z.infer<typeof updateHousingSchema>

export const createManyHousingSchema = z.object({
  housings: z.array(createHousingSchema),
})
export type CreateManyHousingSchema = z.infer<typeof createManyHousingSchema>

export const updateManyHousingSchema = z.object({
  housings: z.array(
    updateHousingSchema.extend({
      id: z.number().positive(),
    })
  ),
})
export type UpdateManyHousingSchema = z.infer<typeof updateManyHousingSchema>
