"use server"

import { tuyau } from "@/lib/api"
import type {
  CreateManyReservationSchema,
  CreateReservationSchema,
  UpdateManyReservationSchema,
  UpdateReservationSchema,
} from "@/schemas/reservation.schemas"
import type { ApiResponse } from "./housing.services"

export const createReservation = async (
  payload: CreateReservationSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.reservations
    .store({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const createManyReservations = async (
  payload: CreateManyReservationSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.reservations
    .createMany({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const updateReservation = async (
  payload: UpdateReservationSchema & { id: number }
): Promise<ApiResponse> => {
  const { id, ...body } = payload
  const [data, error] = await tuyau.api.reservations
    .update({
      body,
      params: { id },
    })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const updateManyReservations = async (
  payload: UpdateManyReservationSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.reservations
    .updateMany({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}
