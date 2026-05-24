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
  return (error ? error.response : data) as ApiResponse
}

export const verifyEmail = async (
  payload: VerifyEmailSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.auth.verifyEmail({ body: payload }).safe()
  return (error ? error.response : data) as ApiResponse
}

export const forgotPassword = async (
  payload: ForgotPasswordSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.auth.forgotPassword({ body: payload }).safe()
  return (error ? error.response : data) as ApiResponse
}

export const resetPassword = async (
  payload: ResetPasswordSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.auth.resetPassword({ body: payload }).safe()
  return (error ? error.response : data) as ApiResponse
}

export const getProfile = async (): Promise<User | null> => {
  const [data, error] = await tuyau.api.auth.profile({}).safe()
  if (error || !data?.success) return null
  return (data.data as User) ?? null
}
