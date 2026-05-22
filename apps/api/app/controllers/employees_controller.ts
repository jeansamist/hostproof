import { type EmployeeService } from '#services/employee_service'
import EmployeeTransformer from '#transformers/employee_transformer'
import { ApiResponse } from '#utils/api_response'
import { createEmployeeValidator, updateEmployeeValidator } from '#validators/employee'
import { paginateValidator } from '#validators/pagination'
import type { HttpContext } from '@adonisjs/core/http'

export default class EmployeesController {
  constructor(private readonly employeeService: EmployeeService) {}

  /**
   * Display a list of resource
   */
  async index({ request, serialize, response }: HttpContext) {
    const { page = 1, perPage = 15 } = await request.validateUsing(paginateValidator)
    const paginator = await this.employeeService.getPaginatedUserEmployees(page, perPage)
    const serialized = await serialize(EmployeeTransformer.transform(paginator.all()))
    return response.ok(
      ApiResponse.success(serialized.data, 'Employees retrieved successfully', paginator.getMeta())
    )
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(createEmployeeValidator)
    const employee = await this.employeeService.createEmployee(payload)
    const serialized = await serialize(EmployeeTransformer.transform(employee))
    return response.ok(ApiResponse.success(serialized.data, 'Employee created successfully'))
  }

  /**
   * Show individual record
   */
  async show({ request, serialize, response }: HttpContext) {
    const employee = await this.employeeService.getEmployeeById(request.param('id'))
    const serialized = await serialize(EmployeeTransformer.transform(employee))
    return response.ok(ApiResponse.success(serialized.data, 'Employee retrieved successfully'))
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(updateEmployeeValidator)
    const employee = await this.employeeService.updateEmployee(params.id, payload)
    const serialized = await serialize(EmployeeTransformer.transform(employee))
    return response.ok(ApiResponse.success(serialized.data, 'Employee updated successfully'))
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    await this.employeeService.deleteEmployee(params.id)
    return response.ok(ApiResponse.success(null, 'Employee deleted successfully'))
  }
}
