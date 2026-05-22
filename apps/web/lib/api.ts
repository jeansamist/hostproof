import { createTuyau } from "@tuyau/core/client"
import { registry } from "api/registry"
import { cookies } from "next/headers"

export const tuyau = createTuyau({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  headers: { Accept: "application/json" },
  registry,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = (await cookies()).get("token")?.value
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`)
        }
      },
    ],
  },
})
