import { appUrl } from '#config/app'
import { ApiResponse } from '#utils/api_response'
import { uploadValidator } from '#validators/upload'
import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { mkdir } from 'node:fs/promises'

type UploadPurpose = 'employee-avatar'

const uploadConfigs: Record<
  UploadPurpose,
  {
    extnames: string[]
    folder: string[]
    maxSize: string
    requiredFileType: 'image' | 'video'
  }
> = {
  'employee-avatar': {
    extnames: ['jpg', 'jpeg', 'png', 'webp'],
    folder: ['uploads', 'images', 'avatars'],
    maxSize: '5mb',
    requiredFileType: 'image',
  },
}

export default class UploadsController {
  async store({ request, response }: HttpContext) {
    const { purpose } = await request.validateUsing(uploadValidator)
    const config = uploadConfigs[purpose]

    const file = request.file('file', {
      size: config.maxSize,
      extnames: config.extnames,
    })

    if (!file) {
      return response.badRequest(ApiResponse.failure(null, 'Please upload a file'))
    }

    if (file.hasErrors) {
      return response.badRequest(ApiResponse.failure(file.errors, 'Invalid uploaded file'))
    }

    if (!file.extname || file.type !== config.requiredFileType) {
      return response.badRequest(
        ApiResponse.failure(null, `Only ${config.requiredFileType} uploads are allowed`)
      )
    }

    const targetDirectory = app.makePath('public', ...config.folder)
    await mkdir(targetDirectory, { recursive: true })

    const fileName = `${randomUUID()}.${file.extname}`
    await file.move(targetDirectory, { name: fileName })

    const relativePath = `/${[...config.folder, fileName].join('/')}`
    const normalizedAppUrl = appUrl.endsWith('/') ? appUrl : `${appUrl}/`
    const uri = new URL(relativePath.slice(1), normalizedAppUrl).toString()

    return response.ok(
      ApiResponse.success(
        {
          fileName,
          localPath: relativePath,
          mimeType: `${file.type}/${file.subtype ?? file.extname}`,
          purpose,
          size: file.size,
          uri,
        },
        'File uploaded successfully'
      )
    )
  }
}
