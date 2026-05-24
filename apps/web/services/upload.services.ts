"use server"

import { uploadResponseSchema, type UploadPurposeSchema } from "@/schemas/upload.schemas"
import { cookies } from "next/headers"
import type { ApiResponse } from "./housing.services"

export const uploadFile = async ({
  file,
  purpose,
}: {
  file: File
  purpose: UploadPurposeSchema
}): Promise<ApiResponse> => {
  const token = (await cookies()).get("token")?.value

  if (!token) {
    return {
      success: false,
      message: "You are not authenticated",
    }
  }

  const formData = new FormData()
  formData.set("purpose", purpose)
  formData.set("file", file)

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/api/auth/uploads`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    }
  )

  const result = (await response.json()) as ApiResponse

  if (result.success && result.data) {
    result.data = uploadResponseSchema.parse(result.data)
  }

  return result
}
