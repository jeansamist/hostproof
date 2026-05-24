import { HousingService } from '#services/housing_service'
import HousingTransformer from '#transformers/housing_transformer'
import { ApiResponse } from '#utils/api_response'
import {
  createHousingValidator,
  createManyHousingValidator,
  updateHousingValidator,
  updateManyHousingValidator,
} from '#validators/housing'
import { paginateValidator } from '#validators/pagination'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class HousingsController {
  constructor(protected readonly housingService: HousingService) {}

  /**
   * Display a list of resource
   */
  async index({ request, serialize, response }: HttpContext) {
    const { page = 1, perPage = 15 } = await request.validateUsing(paginateValidator)
    const paginator = await this.housingService.getPaginatedUserHousings(page, perPage)
    const serialized = await serialize(HousingTransformer.transform(paginator.all()))
    return response.ok(
      ApiResponse.success(serialized.data, 'Housings retrieved successfully', paginator.getMeta())
    )
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(createHousingValidator)
    const housing = await this.housingService.createHousing(payload)
    const serialized = await serialize(HousingTransformer.transform(housing))
    return response.ok(ApiResponse.success(serialized.data, 'Housing created successfully'))
  }

  async createMany({ request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(createManyHousingValidator)
    const housings = await this.housingService.createManyHousings(payload.housings)
    const serialized = await serialize(HousingTransformer.transform(housings))
    return response.ok(ApiResponse.success(serialized.data, 'Housings created successfully'))
  }

  /**
   * Show individual record
   */
  async show({ request, serialize, response }: HttpContext) {
    const housing = await this.housingService.getHousingById(request.param('id'))
    const serialized = await serialize(HousingTransformer.transform(housing))
    return response.ok(ApiResponse.success(serialized.data, 'Housing retrieved successfully'))
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(updateHousingValidator)
    const housing = await this.housingService.updateHousing(params.id, payload)
    const serialized = await serialize(HousingTransformer.transform(housing))
    return response.ok(ApiResponse.success(serialized.data, 'Housing updated successfully'))
  }

  async updateMany({ request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(updateManyHousingValidator)
    const housings = await this.housingService.updateManyHousings(payload.housings)
    const serialized = await serialize(HousingTransformer.transform(housings))
    return response.ok(ApiResponse.success(serialized.data, 'Housings updated successfully'))
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    await this.housingService.deleteHousing(params.id)
    return response.ok(ApiResponse.success(null, 'Housing deleted successfully'))
  }
}
