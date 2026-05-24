"use server"

import { cookies } from "next/headers"

export type DashboardStats = {
  totalHousings: number
  totalEmployees: number
  upcomingReservations: number
  succeededCleaningReviews: number
}

export const getDashboardStats = async (): Promise<DashboardStats | null> => {
  const token = (await cookies()).get("token")?.value
  if (!token) return null

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"}/api/auth/dashboard/stats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  )

  if (!res.ok) return null

  const data = await res.json()
  return (data?.data as DashboardStats) ?? null
}
