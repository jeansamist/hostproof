import CleaningReview from '#models/cleaning_review'
import { ApiResponse } from '#utils/api_response'
import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import { mkdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { appUrl } from '#config/app'

const VIDEO_EXTNAMES = ['mp4', 'webm', 'mov', 'avi', 'mkv']

export default class PublicReviewsController {
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

  async submit({ params, request, response }: HttpContext) {
    const review = await CleaningReview.query()
      .where('uri', params.uri)
      .firstOrFail()

    if (review.status === 'Done' || review.status === 'Analized') {
      return response.forbidden(ApiResponse.failure(null, 'This review has already been completed'))
    }

    const file = request.file('video', {
      size: '500mb',
      extnames: VIDEO_EXTNAMES,
    })

    if (!file) {
      return response.badRequest(ApiResponse.failure(null, 'Please upload a video file'))
    }

    if (file.hasErrors) {
      return response.badRequest(ApiResponse.failure(file.errors, 'Invalid video file'))
    }

    const targetDirectory = app.makePath('public', 'uploads', 'videos', 'cleaning-reviews')
    await mkdir(targetDirectory, { recursive: true })

    const fileName = `${randomUUID()}.${file.extname}`
    await file.move(targetDirectory, { name: fileName })

    const relativePath = `/uploads/videos/cleaning-reviews/${fileName}`
    const normalizedAppUrl = appUrl.endsWith('/') ? appUrl : `${appUrl}/`
    const fileUri = new URL(relativePath.slice(1), normalizedAppUrl).toString()

    review.localVideoPath = relativePath
    review.mimeType = `${file.type}/${file.subtype ?? file.extname}`
    review.status = 'AI Analizing'
    await review.save()

    return response.ok(
      ApiResponse.success(
        { id: review.id, status: review.status, localVideoPath: fileUri },
        'Video uploaded successfully. The review is now being analysed.'
      )
    )
  }
}
