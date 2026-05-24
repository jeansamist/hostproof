"use server"

import { tuyau } from "@/lib/api"
import type {
  CreateHousingSchema,
  CreateManyHousingSchema,
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
  const created: unknown[] = []

  for (const [index, housing] of payload.housings.entries()) {
    const result = await createHousing(housing)
    if (!result?.success) {
      return {
        ...result,
        message: result?.message
          ? `Housing #${index + 1}: ${result.message}`
          : `Failed to create housing #${index + 1}`,
      }
    }
    created.push(result.data)
  }

  return {
    success: true,
    message: "Housings created successfully",
    data: created,
  }
}

