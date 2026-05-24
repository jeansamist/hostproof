import { z } from "zod/v3"

export const createEmployeeSchema = z.object({
  fullName: z.string().trim().min(1),
  gender: z.enum(["male", "female", "other"]),
  tel: z.string().trim().nullable().optional(),
  email: z.string().email().trim().nullable().optional(),
  avatar: z.string().trim().nullable().optional(),
})
export type CreateEmployeeSchema = z.infer<typeof createEmployeeSchema>

export const updateEmployeeSchema = z.object({
  id: z.number().positive().optional(),
  fullName: z.string().trim().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  tel: z.string().trim().nullable().optional(),
  email: z.string().email().trim().nullable().optional(),
  avatar: z.string().trim().nullable().optional(),
})
export type UpdateEmployeeSchema = z.infer<typeof updateEmployeeSchema>

export const createManyEmployeeSchema = z.object({
  employees: z.array(createEmployeeSchema),
})
export type CreateManyEmployeeSchema = z.infer<typeof createManyEmployeeSchema>

export const updateManyEmployeeSchema = z.object({
  employees: z.array(
    updateEmployeeSchema.extend({ id: z.number().positive() })
  ),
})
export type UpdateManyEmployeeSchema = z.infer<typeof updateManyEmployeeSchema>
