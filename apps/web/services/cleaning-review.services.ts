"use server"

import { tuyau } from "@/lib/api"
import type {
  CreateCleaningReviewSchema,
  CreateManyCleaningReviewSchema,
  UpdateCleaningReviewSchema,
  UpdateManyCleaningReviewSchema,
} from "@/schemas/cleaning-review.schemas"
import type { ApiResponse } from "./housing.services"

export const createCleaningReview = async (
  payload: CreateCleaningReviewSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.cleaningReviews
    .store({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const createManyCleaningReviews = async (
  payload: CreateManyCleaningReviewSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.cleaningReviews
    .createMany({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const updateCleaningReview = async (
  payload: UpdateCleaningReviewSchema & { id: number }
): Promise<ApiResponse> => {
  const { id, ...body } = payload
  const [data, error] = await tuyau.api.cleaningReviews
    .update({
      body,
      params: { id },
    })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const updateManyCleaningReviews = async (
  payload: UpdateManyCleaningReviewSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.cleaningReviews
    .updateMany({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}
