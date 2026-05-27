"use server"

import { cookies } from "next/headers"
import type { ApiResponse } from "./housing.services"

const apiBase = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

const authHeaders = async () => {
  const token = (await cookies()).get("token")?.value
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export type ChecklistItem = {
  id: number
  label: string
  position: number
  userId: number
  createdAt: string
  updatedAt: string | null
}

export const getChecklistItems = async (): Promise<ChecklistItem[]> => {
  const res = await fetch(`${apiBase()}/api/auth/checklist-items`, {
    headers: await authHeaders(),
    cache: "no-store",
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.data ?? []
}

export const createChecklistItem = async (label: string): Promise<ApiResponse> => {
  const res = await fetch(`${apiBase()}/api/auth/checklist-items`, {
    method: "POST",
    headers: { ...(await authHeaders()), "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  })
  return res.json()
}

export const updateChecklistItem = async (
  id: number,
  data: { label?: string; position?: number }
): Promise<ApiResponse> => {
  const res = await fetch(`${apiBase()}/api/auth/checklist-items/${id}`, {
    method: "PUT",
    headers: { ...(await authHeaders()), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}

export const deleteChecklistItem = async (id: number): Promise<ApiResponse> => {
  const res = await fetch(`${apiBase()}/api/auth/checklist-items/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  })
  return res.json()
}
