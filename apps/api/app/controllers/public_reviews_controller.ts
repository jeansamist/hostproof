import CleaningReview from '#models/cleaning_review'
import { CleaningReviewService } from '#services/cleaning_review_service'
import CleaningReviewTransformer from '#transformers/cleaning_review_transformer'
import { ApiResponse } from '#utils/api_response'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

const VIDEO_EXTNAMES = ['mp4', 'webm', 'mov', 'avi', 'mkv']
@inject()
export default class PublicReviewsController {
  constructor(protected readonly cleaningReviewService: CleaningReviewService) {}
  async show({ params, response }: HttpContext) {
    const review = await CleaningReview.query()
      .where('uri', params.uri)
      .preload('reservation', (q) => q.preload('housing'))
      .firstOrFail()

    const housing = (review.reservation as any)?.housing
    return response.ok(
      ApiResponse.success({
        id: review.id,
        status: review.status,
        uri: review.uri,
        hasVideo: !!review.localVideoPath,
        housing: housing ? { name: housing.name, address: housing.address } : null,
      })
    )
  }

  async submit({ params, request, response, serialize }: HttpContext) {
    const file = request.file('video', {
      size: '500mb',
      extnames: VIDEO_EXTNAMES,
    })

    const cleaningReview = await this.cleaningReviewService.submitVideo({
      uri: params.uri,
      videoPath: '',
      file,
    })
    const serialized = await serialize(CleaningReviewTransformer.transform(cleaningReview))
    return response.ok(
      ApiResponse.success(
        serialized.data,
        'Video uploaded successfully. The review is now being analysed.'
      )
    )
  }
}
