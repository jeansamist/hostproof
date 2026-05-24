import CleaningReview from '#models/cleaning_review'
import { ApiResponse } from '#utils/api_response'
import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import { mkdir, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { appUrl } from '#config/app'

const VIDEO_EXTNAMES = ['mp4', 'webm', 'mov', 'avi', 'mkv']

function convertToMp4(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-movflags', '+faststart',
      '-y',
      outputPath,
    ])
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited with code ${code}`))
    })
    ffmpeg.on('error', reject)
  })
}

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

    const id = randomUUID()
    const tempName = `${id}_tmp.${file.extname}`
    const mp4Name = `${id}.mp4`

    await file.move(targetDirectory, { name: tempName })

    const tempPath = `${targetDirectory}/${tempName}`
    const mp4Path = `${targetDirectory}/${mp4Name}`

    try {
      await convertToMp4(tempPath, mp4Path)
    } catch {
      return response.internalServerError(
        ApiResponse.failure(null, 'Failed to process the video. Please try again.')
      )
    } finally {
      unlink(tempPath).catch(() => {})
    }

    const relativePath = `/uploads/videos/cleaning-reviews/${mp4Name}`
    const normalizedAppUrl = appUrl.endsWith('/') ? appUrl : `${appUrl}/`
    const fileUri = new URL(relativePath.slice(1), normalizedAppUrl).toString()

    review.localVideoPath = relativePath
    review.mimeType = 'video/mp4'
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
