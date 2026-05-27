import CleaningReview from '#models/cleaning_review'
import { CleaningReviewService } from '#services/cleaning_review_service'
import CleaningReviewTransformer from '#transformers/cleaning_review_transformer'
import { ApiResponse } from '#utils/api_response'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

const VIDEO_EXTNAMES = ['mp4', 'webm', 'mov', 'avi', 'mkv']
const AUDIO_EXTNAMES = ['webm', 'mp3', 'ogg', 'wav', 'm4a', 'opus']
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
        aiOutput: review.aiOutput ?? null,
        voiceMessageFile: review.voiceMessageFile ?? null,
      })
    )
  }

  async requestNewReview({ params, request, response }: HttpContext) {
    const { toDoItems = [], appReviewLink = '' } = request.only(['toDoItems', 'appReviewLink'])
    await this.cleaningReviewService.sendRequestNewReviewEmail(
      params.uri,
      Array.isArray(toDoItems) ? toDoItems : [],
      appReviewLink
    )
    return response.ok(ApiResponse.success(null, 'New review request sent successfully'))
  }

  async notifyMissingProducts({ params, request, response }: HttpContext) {
    const { missingProducts = [], appReviewLink = '' } = request.only([
      'missingProducts',
      'appReviewLink',
    ])
    await this.cleaningReviewService.sendMissingProductsEmail(
      params.uri,
      Array.isArray(missingProducts) ? missingProducts : [],
      appReviewLink
    )
    return response.ok(ApiResponse.success(null, 'Missing products notification sent successfully'))
  }

  async retry({ params, response }: HttpContext) {
    await this.cleaningReviewService.retryAnalysis(params.uri)
    return response.ok(ApiResponse.success(null, 'Analysis retry queued successfully'))
  }

  async submitVoiceMessage({ params, request, response }: HttpContext) {
    const { appReviewLink = '' } = request.only(['appReviewLink'])
    const file = request.file('audio', {
      size: '50mb',
      extnames: AUDIO_EXTNAMES,
    })
    const fileUri = await this.cleaningReviewService.submitVoiceMessage(
      params.uri,
      file as any,
      appReviewLink
    )
    return response.ok(
      ApiResponse.success({ voiceMessageFile: fileUri }, 'Voice message submitted successfully')
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
