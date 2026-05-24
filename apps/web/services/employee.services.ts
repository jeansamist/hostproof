"use server"

import { tuyau } from "@/lib/api"

export type Employee = {
  id: number
  fullName: string
  email: string | null
  tel: string | null
  gender: string | null
  avatar: string | null
}

export const getEmployees = async (): Promise<Employee[]> => {
  const [data, error] = await tuyau.api.employees.index({ query: { perPage: 200 } }).safe()
  if (error || !data?.success) return []
  return (data.data as Employee[]) ?? []
}
import type {
  CreateEmployeeSchema,
  CreateManyEmployeeSchema,
  UpdateEmployeeSchema,
  UpdateManyEmployeeSchema,
} from "@/schemas/employee.schemas"
import type { ApiResponse } from "./housing.services"

export const createEmployee = async (
  payload: CreateEmployeeSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.employees
    .store({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const createManyEmployees = async (
  payload: CreateManyEmployeeSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.employees
    .createMany({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const updateEmployee = async (
  payload: UpdateEmployeeSchema & { id: number }
): Promise<ApiResponse> => {
  const { id, ...body } = payload
  const [data, error] = await tuyau.api.employees
    .update({
      body,
      params: { id },
    })
    .safe()
  return (error ? error.response : data) as ApiResponse
}

export const updateManyEmployees = async (
  payload: UpdateManyEmployeeSchema
): Promise<ApiResponse> => {
  const [data, error] = await tuyau.api.employees
    .updateMany({ body: payload })
    .safe()
  return (error ? error.response : data) as ApiResponse
}
