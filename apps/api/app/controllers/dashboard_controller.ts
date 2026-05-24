import { DashboardService } from '#services/dashboard_service'
import { ApiResponse } from '#utils/api_response'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  async stats({ response }: HttpContext) {
    const stats = await this.dashboardService.getStats()
    return response.ok(ApiResponse.success(stats, 'Dashboard stats retrieved successfully'))
  }
}
