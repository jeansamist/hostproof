"use server"

import { tuyau } from "@/lib/api"
import type {
  CreateHousingSchema,
  CreateManyHousingSchema,
  UpdateHousingSchema,
  UpdateManyHousingSchema,
} from "@/schemas/housing.schemas"

export type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  data?: T
  meta?: unknown
}

export const createHousing = async (
  payload: CreateHousingSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.housings.store({ body: payload }).safe()
  return (error ? error.response : data) as ApiResponse
}

export const createManyHousings = async (
  payload: CreateManyHousingSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.housings
    .createMany({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const updateHousing = async (
  payload: UpdateHousingSchema & { id: number }
): Promise<ApiResponse> => {
  const { id, ...body } = payload
  const [data, error] = await tuyau.api.housings
    .update({
      body,
      params: { id },
    })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const updateManyHousings = async (
  payload: UpdateManyHousingSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.housings
    .updateMany({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}
