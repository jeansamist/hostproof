"use server"

import { tuyau } from "@/lib/api"
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  SignInSchema,
  SignUpSchema,
  VerifyEmailSchema,
} from "@/schemas/auth.schemas"
import type { User } from "@/types"
import { cookies } from "next/headers"

export type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  data?: T
  meta?: unknown
}

export const signUp = async (payload: SignUpSchema): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.auth.signUp({ body: payload }).safe()
  return (error ? error.response : data) as ApiResponse
}

export const signIn = async (payload: SignInSchema): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.auth.signIn({ body: payload }).safe()
  const accessToken = data?.data?.accessToken
  if (data?.success && accessToken) {
    const c = await cookies()
    c.set("token", accessToken.token || "", {
      expires: new Date(accessToken.expiresAt || ""),
    })
  }
  return (error ? error.response : data) as ApiResponse
}

export const verifyEmail = async (
  payload: VerifyEmailSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.auth
    .verifyEmail({ body: payload })
    .safe()
  const accessToken = data?.data?.accessToken
  if (data?.success && accessToken) {
    const c = await cookies()
    c.set("token", accessToken.token || "", {
      expires: new Date(accessToken.expiresAt || ""),
    })
  }
  return (error ? error.response : data) as ApiResponse
}

export const forgotPassword = async (
  payload: ForgotPasswordSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.auth
    .forgotPassword({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const resetPassword = async (
  payload: ResetPasswordSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.auth
    .resetPassword({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const getProfile = async (): Promise<User | null> => {
  const [data, error] = await tuyau.api.auth.profile({}).safe()
  if (error || !data?.success) return null
  return (data.data as User) ?? null
}

const apiBase = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

const authHeaders = async () => {
  const token = (await cookies()).get("token")?.value
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const updateProfile = async (payload: {
  firstName?: string
  lastName?: string
  avatar?: string
}): Promise<ApiResponse> => {
  const res = await fetch(`${apiBase()}/api/auth/update-profile`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  })
  return res.json()
}

export const deleteAccount = async (): Promise<ApiResponse> => {
  const res = await fetch(`${apiBase()}/api/auth/delete-account`, {
    method: "POST",
    headers: await authHeaders(),
  })
  if (res.ok) {
    const c = await cookies()
    c.delete("token")
  }
  return res.json()
}
