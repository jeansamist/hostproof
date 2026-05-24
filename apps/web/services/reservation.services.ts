"use server"

import { tuyau } from "@/lib/api"
import type {
  CreateManyReservationSchema,
  CreateReservationSchema,
  UpdateManyReservationSchema,
  UpdateReservationSchema,
} from "@/schemas/reservation.schemas"
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

export type ReservationHousing = {
  id: number
  name: string
  type: string
  address: string
}

export type Reservation = {
  id: number
  moveInDate: string
  moveOutDate: string
  housingId: number
  numberOfAdult: number
  numberOfChild: number
  numberOfBaby: number
  specialInfos: string | null
  housing?: ReservationHousing
  createdAt: string
  updatedAt: string | null
}

export type PaginatedReservations = {
  data: Reservation[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
  }
}

export const getReservations = async (
  page = 1,
  perPage = 15,
  search?: string
): Promise<PaginatedReservations | null> => {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    ...(search ? { search } : {}),
  })
  const res = await fetch(`${apiBase()}/api/auth/reservations?${params}`, {
    headers: await authHeaders(),
    cache: "no-store",
  })
  if (!res.ok) return null
  const json = await res.json()
  return { data: json.data ?? [], meta: json.meta }
}

export const getReservationById = async (id: number): Promise<Reservation | null> => {
  const res = await fetch(`${apiBase()}/api/auth/reservations/${id}`, {
    headers: await authHeaders(),
    cache: "no-store",
  })
  if (!res.ok) return null
  const json = await res.json()
  return (json.data as Reservation) ?? null
}

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

export const deleteReservation = async (id: number): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.reservations
    .destroy({ params: { id } })
    .safe()
  return (error ? error.response : data) as ApiResponse
}
