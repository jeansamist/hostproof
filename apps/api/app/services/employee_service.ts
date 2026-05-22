import { inject } from '@adonisjs/core'
import EmployeeRepository from '#repositories/employee_repository'
import { EmployeeSchema } from '#database/schema'
import { HttpContext } from '@adonisjs/core/http'
import { httpError } from '#utils/http_error'

type EmployeeGender = 'male' | 'female' | 'other'

type CreateEmployeePayload = {
  fullName: string
  gender: EmployeeGender
  tel?: string | null
  email?: string | null
  avatar?: string | null
}

type UpdateEmployeePayload = Partial<CreateEmployeePayload>

@inject()
export class EmployeeService {
  constructor(
    private readonly repository: EmployeeRepository,
    private readonly ctx: HttpContext
  ) {}

  private get userId() {
    return this.ctx.auth.user!.id
  }

  private normalizeCreatePayload(data: CreateEmployeePayload) {
    return {
      ...data,
      tel: data.tel ?? null,
      email: data.email ?? null,
      avatar: data.avatar ?? null,
    }
  }

  private normalizeUpdatePayload(data: UpdateEmployeePayload) {
    return {
      ...data,
      ...(Object.hasOwn(data, 'tel') ? { tel: data.tel ?? null } : {}),
      ...(Object.hasOwn(data, 'email') ? { email: data.email ?? null } : {}),
      ...(Object.hasOwn(data, 'avatar') ? { avatar: data.avatar ?? null } : {}),
    }
  }

  checkOwnership(employee: EmployeeSchema) {
    if (employee.userId !== this.userId) {
      throw httpError(403, 'You are not allowed to access this employee')
    }
  }

  async getPaginatedUserEmployees(page: number, perPage: number) {
    return this.repository.paginateByUserId(this.userId, page, perPage)
  }

  async createEmployee(data: CreateEmployeePayload) {
    const existingEmployee = await this.repository.findByFullNameForUser(this.userId, data.fullName)
    if (existingEmployee) {
      throw httpError(400, 'Employee with the same fullname already exists for this user.')
    }

    return this.repository.create({
      ...this.normalizeCreatePayload(data),
      userId: this.userId,
    })
  }

  async updateEmployee(id: number, data: UpdateEmployeePayload) {
    const employee = await this.repository.findById(id)
    this.checkOwnership(employee)

    if (data.fullName) {
      const existingEmployee = await this.repository.findByFullNameForUser(
        this.userId,
        data.fullName
      )
      if (existingEmployee && existingEmployee.id !== id) {
        throw httpError(400, 'Employee with the same fullname already exists for this user.')
      }
    }

    return this.repository.update(employee, this.normalizeUpdatePayload(data))
  }

  async deleteEmployee(id: number) {
    const employee = await this.repository.findById(id)
    this.checkOwnership(employee)
    return this.repository.delete(employee)
  }

  async getEmployeesForUser() {
    return this.repository.findAllByUserId(this.userId)
  }

  async getEmployeeById(id: number) {
    const employee = await this.repository.findById(id)
    this.checkOwnership(employee)
    return employee
  }
}
