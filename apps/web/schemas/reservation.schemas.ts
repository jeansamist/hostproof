import { z } from "zod/v3"

export const createReservationSchema = z.object({
  moveInDate: z.string().min(1),
  moveOutDate: z.string().min(1),
  housingId: z.number().positive(),
  numberOfAdult: z.number().positive(),
  numberOfChild: z.number().nonnegative(),
  numberOfBaby: z.number().nonnegative(),
  specialInfos: z.string().trim().nullable().optional(),
})
export type CreateReservationSchema = z.infer<typeof createReservationSchema>

export const updateReservationSchema = z.object({
  id: z.number().positive().optional(),
  moveInDate: z.string().min(1).optional(),
  moveOutDate: z.string().min(1).optional(),
  housingId: z.number().positive().optional(),
  numberOfAdult: z.number().positive().optional(),
  numberOfChild: z.number().nonnegative().optional(),
  numberOfBaby: z.number().nonnegative().optional(),
  specialInfos: z.string().trim().nullable().optional(),
})
export type UpdateReservationSchema = z.infer<typeof updateReservationSchema>

export const createManyReservationSchema = z.object({
  reservations: z.array(createReservationSchema),
})
export type CreateManyReservationSchema = z.infer<
  typeof createManyReservationSchema
>

export const updateManyReservationSchema = z.object({
  reservations: z.array(
    updateReservationSchema.extend({ id: z.number().positive() })
  ),
})
export type UpdateManyReservationSchema = z.infer<
  typeof updateManyReservationSchema
>
