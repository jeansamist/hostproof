"use server"

import { tuyau } from "@/lib/api"
import type {
  CreateCleaningReviewSchema,
  CreateManyCleaningReviewSchema,
  UpdateCleaningReviewSchema,
  UpdateManyCleaningReviewSchema,
} from "@/schemas/cleaning-review.schemas"
import { cookies } from "next/headers"
import type { ApiResponse } from "./housing.services"

const apiBase = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

const authHeaders = async () => {
  const token = (await cookies()).get("token")?.value
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export type CleaningReviewEmployee = {
  id: number
  fullName: string
  email: string | null
}

export type CleaningReviewHousing = {
  id: number
  name: string
}

export type CleaningReview = {
  id: number
  assignedEmployeeId: number | null
  reservationId: number | null
  additionnalInfos: string | null
  status: string
  aiOutput: unknown | null
  localVideoPath: string | null
  uri: string | null
  mimeType: string | null
  employee?: CleaningReviewEmployee
  housing?: CleaningReviewHousing
  createdAt: string
  updatedAt: string | null
}

export type PaginatedCleaningReviews = {
  data: CleaningReview[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
  }
}

export type PublicReviewInfo = {
  id: number
  status: string
  uri: string
  hasVideo: boolean
  housing: { name: string; address: string } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aiOutput: any | null
}

export const getCleaningReviews = async (
  page = 1,
  perPage = 15,
  reservationId?: number
): Promise<PaginatedCleaningReviews | null> => {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    ...(reservationId ? { reservationId: String(reservationId) } : {}),
  })
  const res = await fetch(`${apiBase()}/api/auth/cleaning-reviews?${params}`, {
    headers: await authHeaders(),
    cache: "no-store",
  })
  if (!res.ok) return null
  const json = await res.json()
  return { data: json.data ?? [], meta: json.meta }
}

export const getCleaningReviewById = async (
  id: number
): Promise<CleaningReview | null> => {
  const res = await fetch(`${apiBase()}/api/auth/cleaning-reviews/${id}`, {
    headers: await authHeaders(),
    cache: "no-store",
  })
  if (!res.ok) return null
  const json = await res.json()
  return (json.data as CleaningReview) ?? null
}

export const getCleaningReviewsByReservation = async (
  reservationId: number
): Promise<CleaningReview[]> => {
  const result = await getCleaningReviews(1, 100, reservationId)
  return result?.data ?? []
}

export const getCleaningReviewByUri = async (
  uri: string
): Promise<PublicReviewInfo | null> => {
  const res = await fetch(`${apiBase()}/api/public/reviews/${uri}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  })
  if (!res.ok) return null
  const json = await res.json()
  return (json.data as PublicReviewInfo) ?? null
}

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

export const deleteCleaningReview = async (id: number): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.cleaningReviews
    .destroy({ params: { id } })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const sendCleaningReviewInvitation = async (
  id: number,
  publicLink: string
): Promise<ApiResponse> => {
  const res = await fetch(`${apiBase()}/api/auth/cleaning-reviews/${id}/send-invitation`, {
    method: "POST",
    headers: { ...(await authHeaders()), "Content-Type": "application/json" },
    body: JSON.stringify({ publicLink }),
  })
  return res.json()
}
