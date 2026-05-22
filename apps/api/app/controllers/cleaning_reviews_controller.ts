import { type CleaningReviewService } from '#services/cleaning_review_service'
import CleaningReviewTransformer from '#transformers/cleaning_review_transformer'
import { ApiResponse } from '#utils/api_response'
import {
  createCleaningReviewValidator,
  updateCleaningReviewValidator,
} from '#validators/cleaning_review'
import { paginateValidator } from '#validators/pagination'
import type { HttpContext } from '@adonisjs/core/http'

export default class CleaningReviewsController {
  constructor(private readonly cleaningReviewService: CleaningReviewService) {}

  async index({ request, serialize, response }: HttpContext) {
    const { page = 1, perPage = 15 } = await request.validateUsing(paginateValidator)
    const paginator = await this.cleaningReviewService.getPaginatedUserCleaningReviews(
      page,
      perPage
    )
    const serialized = await serialize(CleaningReviewTransformer.transform(paginator.all()))
    return response.ok(
      ApiResponse.success(
        serialized.data,
        'Cleaning reviews retrieved successfully',
        paginator.getMeta()
      )
    )
  }

  async store({ request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(createCleaningReviewValidator)
    const cleaningReview = await this.cleaningReviewService.createCleaningReview(payload)
    const serialized = await serialize(CleaningReviewTransformer.transform(cleaningReview))
    return response.ok(ApiResponse.success(serialized.data, 'Cleaning review created successfully'))
  }

  async show({ request, serialize, response }: HttpContext) {
    const cleaningReview = await this.cleaningReviewService.getCleaningReviewById(
      request.param('id')
    )
    const serialized = await serialize(CleaningReviewTransformer.transform(cleaningReview))
    return response.ok(
      ApiResponse.success(serialized.data, 'Cleaning review retrieved successfully')
    )
  }

  async update({ params, request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(updateCleaningReviewValidator)
    const cleaningReview = await this.cleaningReviewService.updateCleaningReview(params.id, payload)
    const serialized = await serialize(CleaningReviewTransformer.transform(cleaningReview))
    return response.ok(ApiResponse.success(serialized.data, 'Cleaning review updated successfully'))
  }

  async destroy({ params, response }: HttpContext) {
    await this.cleaningReviewService.deleteCleaningReview(params.id)
    return response.ok(ApiResponse.success(null, 'Cleaning review deleted successfully'))
  }
}
