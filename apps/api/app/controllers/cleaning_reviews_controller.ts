import { CleaningReviewService } from '#services/cleaning_review_service'
import CleaningReviewTransformer from '#transformers/cleaning_review_transformer'
import { ApiResponse } from '#utils/api_response'
import {
  createCleaningReviewValidator,
  createManyCleaningReviewValidator,
  updateCleaningReviewValidator,
  updateManyCleaningReviewValidator,
} from '#validators/cleaning_review'
import { paginateValidator } from '#validators/pagination'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
@inject()
export default class CleaningReviewsController {
  constructor(private readonly cleaningReviewService: CleaningReviewService) {}

  async index({ request, serialize, response }: HttpContext) {
    const { page = 1, perPage = 15 } = await request.validateUsing(paginateValidator)
    const reservationId = request.input('reservationId', undefined) as number | undefined
    const paginator = await this.cleaningReviewService.getPaginatedUserCleaningReviews(
      page,
      perPage,
      reservationId ? Number(reservationId) : undefined
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

  async createMany({ request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(createManyCleaningReviewValidator)
    const cleaningReviews = await this.cleaningReviewService.createManyCleaningReviews(
      payload.cleaningReviews
    )
    const serialized = await serialize(CleaningReviewTransformer.transform(cleaningReviews))
    return response.ok(
      ApiResponse.success(serialized.data, 'Cleaning reviews created successfully')
    )
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

  async updateMany({ request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(updateManyCleaningReviewValidator)
    const cleaningReviews = await this.cleaningReviewService.updateManyCleaningReviews(
      payload.cleaningReviews
    )
    const serialized = await serialize(CleaningReviewTransformer.transform(cleaningReviews))
    return response.ok(
      ApiResponse.success(serialized.data, 'Cleaning reviews updated successfully')
    )
  }

  async destroy({ params, response }: HttpContext) {
    await this.cleaningReviewService.deleteCleaningReview(params.id)
    return response.ok(ApiResponse.success(null, 'Cleaning review deleted successfully'))
  }

  async sendInvitation({ params, request, response }: HttpContext) {
    const { publicLink } = request.only(['publicLink'])
    if (!publicLink || typeof publicLink !== 'string') {
      return response.badRequest(ApiResponse.failure(null, 'publicLink is required'))
    }
    await this.cleaningReviewService.sendInvitationEmail(params.id, publicLink)
    return response.ok(ApiResponse.success(null, 'Invitation email sent successfully'))
  }
}
