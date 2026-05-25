import { appUrl } from '#config/app'
import { type EmployeeSchema, type HousingSchema } from '#database/schema'
import CleaningReviewInvitationNotification from '#mails/cleaning_review_invitation_notification'
import CleaningReviewRepository from '#repositories/cleaning_review_repository'
import EmployeeRepository from '#repositories/employee_repository'
import ReservationRepository from '#repositories/reservation_repository'
import { httpError } from '#utils/http_error'
import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { HttpContext } from '@adonisjs/core/http'
import { Logger } from '@adonisjs/core/logger'
import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdir, unlink } from 'node:fs/promises'
import CronManager from '../managers/crons_manager.ts'
import { AiService } from './ai_service.ts'

type CleaningReviewStatus = 'Created' | 'AI Analizing' | 'Analized' | 'Done' | 'Failed'

type CleaningReviewAiOutput = unknown

type CreateCleaningReviewPayload = {
  assignedEmployeeId: number
  reservationId: number
  additionnalInfos?: string | null
  status: CleaningReviewStatus
  aiOutput?: CleaningReviewAiOutput | null
  localVideoPath?: string | null
  uri?: string | null
  mimeType?: string | null
}

type UpdateCleaningReviewPayload = Partial<CreateCleaningReviewPayload>
type UpdateManyCleaningReviewPayload = Array<{ id: number } & UpdateCleaningReviewPayload>

type CleaningReviewWithRelations = {
  assignedEmployee: Pick<EmployeeSchema, 'userId'>
  reservation: {
    housing: Pick<HousingSchema, 'userId'>
  }
}

@inject()
export class CleaningReviewService {
  constructor(
    private readonly repository: CleaningReviewRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly reservationRepository: ReservationRepository,
    private readonly ctx: HttpContext,
    protected readonly cronManager: CronManager,
    protected readonly logger: Logger,
    protected readonly aiService: AiService
  ) {}

  private get userId() {
    try {
      return this.ctx.auth.user!.id
    } catch (error) {
      return 0
    }
  }

  private normalizeCreatePayload(data: CreateCleaningReviewPayload) {
    return {
      ...data,
      additionnalInfos: data.additionnalInfos ?? null,
      aiOutput: data.aiOutput ?? null,
      localVideoPath: data.localVideoPath ?? null,
      uri: data.uri ?? null,
      mimeType: data.mimeType ?? null,
    }
  }

  private normalizeUpdatePayload(data: UpdateCleaningReviewPayload) {
    return {
      ...data,
      ...(Object.hasOwn(data, 'additionnalInfos')
        ? { additionnalInfos: data.additionnalInfos ?? null }
        : {}),
      ...(Object.hasOwn(data, 'aiOutput') ? { aiOutput: data.aiOutput ?? null } : {}),
      ...(Object.hasOwn(data, 'localVideoPath')
        ? { localVideoPath: data.localVideoPath ?? null }
        : {}),
      ...(Object.hasOwn(data, 'uri') ? { uri: data.uri ?? null } : {}),
      ...(Object.hasOwn(data, 'mimeType') ? { mimeType: data.mimeType ?? null } : {}),
    }
  }

  private async getOwnedEmployee(assignedEmployeeId: number) {
    const employee = await this.employeeRepository.findById(assignedEmployeeId)
    if (employee.userId !== this.userId) {
      throw httpError(403, 'You are not allowed to access this employee')
    }
    return employee
  }

  private async getOwnedReservation(reservationId: number) {
    const reservation = await this.reservationRepository.findById(reservationId)
    if (reservation.housing.userId !== this.userId) {
      throw httpError(403, 'You are not allowed to access this reservation')
    }
    return reservation
  }

  checkOwnership(cleaningReview: CleaningReviewWithRelations) {
    if (cleaningReview.assignedEmployee.userId !== this.userId) {
      throw httpError(403, 'You are not allowed to access this cleaning review')
    }

    if (cleaningReview.reservation.housing.userId !== this.userId) {
      throw httpError(403, 'You are not allowed to access this cleaning review')
    }
  }

  async getPaginatedUserCleaningReviews(page: number, perPage: number, reservationId?: number) {
    return this.repository.paginateByUserId(this.userId, page, perPage, reservationId)
  }

  async createCleaningReview(data: CreateCleaningReviewPayload) {
    await this.getOwnedEmployee(data.assignedEmployeeId)
    await this.getOwnedReservation(data.reservationId)
    return this.repository.create({
      ...this.normalizeCreatePayload(data),
      uri: data.uri ?? randomUUID(),
    })
  }

  async getCleaningReviewByUri(uri: string) {
    return this.repository.findByUri(uri)
  }

  async createManyCleaningReviews(data: CreateCleaningReviewPayload[]) {
    const cleaningReviews = []
    for (const item of data) {
      cleaningReviews.push(await this.createCleaningReview(item))
    }
    return cleaningReviews
  }

  async updateCleaningReview(id: number, data: UpdateCleaningReviewPayload) {
    const cleaningReview = await this.repository.findById(id)
    this.checkOwnership(cleaningReview)

    if (data.assignedEmployeeId) {
      await this.getOwnedEmployee(data.assignedEmployeeId)
    }

    if (data.reservationId) {
      await this.getOwnedReservation(data.reservationId)
    }

    return this.repository.update(cleaningReview, this.normalizeUpdatePayload(data))
  }

  async updateManyCleaningReviews(data: UpdateManyCleaningReviewPayload) {
    const cleaningReviews = []
    for (const item of data) {
      const { id, ...payload } = item
      cleaningReviews.push(await this.updateCleaningReview(id, payload))
    }
    return cleaningReviews
  }

  async deleteCleaningReview(id: number) {
    const cleaningReview = await this.repository.findById(id)
    this.checkOwnership(cleaningReview)
    return this.repository.delete(cleaningReview)
  }

  async getCleaningReviewsForUser() {
    return this.repository.findAllByUserId(this.userId)
  }

  async getCleaningReviewById(id: number) {
    const cleaningReview = await this.repository.findById(id)
    this.checkOwnership(cleaningReview)
    return cleaningReview
  }

  async sendInvitationEmail(id: number, publicLink: string) {
    const cleaningReview = await this.repository.findById(id)
    this.checkOwnership(cleaningReview)

    if (!cleaningReview.assignedEmployee?.email) {
      throw httpError(422, 'The assigned employee has no email address')
    }

    let housingName: string | undefined
    try {
      housingName = cleaningReview.reservation?.housing?.name ?? undefined
    } catch {}

    const notification = new CleaningReviewInvitationNotification(
      cleaningReview.assignedEmployee.fullName,
      cleaningReview.assignedEmployee.email,
      publicLink,
      housingName,
      cleaningReview.additionnalInfos
    )
    this.cronManager.addQueueJob(
      'emails',
      async () => {
        this.logger.info('Send cleaning review invitation email')
        await mail.send(notification)
      },
      { retries: 2, retryDelayMs: 1000 }
    )
  }
  async convertToMp4(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i',
        inputPath,
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-movflags',
        '+faststart',
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
  async uploadVideo(file: MultipartFile) {
    this.logger.info(`[CleaningReviewService]: Uploading video file...`)
    const targetDirectory = app.makePath('public', 'uploads', 'videos', 'cleaning-reviews')
    await mkdir(targetDirectory, { recursive: true })

    const id = randomUUID()
    const tempName = `${id}_tmp.${file.extname}`
    const mp4Name = `${id}.mp4`

    await file.move(targetDirectory, { name: tempName })

    const tempPath = `${targetDirectory}/${tempName}`
    const mp4Path = `${targetDirectory}/${mp4Name}`

    try {
      await this.convertToMp4(tempPath, mp4Path)
    } catch {
      return null
    } finally {
      unlink(tempPath).catch(() => {})
    }
    const relativePath = `/uploads/videos/cleaning-reviews/${mp4Name}`
    const normalizedAppUrl = appUrl.endsWith('/') ? appUrl : `${appUrl}/`
    const fileUri = new URL(relativePath.slice(1), normalizedAppUrl).toString()
    return { relativePath, fileUri }
  }

  async analyzeVideo(cleaningReviewId: number) {
    const cleaningReview = await this.repository.findById(cleaningReviewId)
    if (!cleaningReview.localVideoPath) {
      throw new Error('No video to analyze')
    }
    this.logger.info(`[CleaningReviewService]: Analyzing video content using file reference...`)
    const response = await this.aiService.uploadAndAnalyzeVideo(cleaningReview.localVideoPath)
    return this.repository.update(cleaningReview, {
      aiOutput: response,
      status: 'Analized',
    })
  }

  async submitVideo(data: { uri: string; videoPath: string; file: MultipartFile | null }) {
    const cleaningReview = await this.repository.findByUri(data.uri)
    if (cleaningReview.status === 'Done' || cleaningReview.status === 'Analized') {
      throw httpError(403, 'This review has already been completed')
    }
    if (!data.file) {
      throw httpError(400, 'Please upload a video file')
    }
    if (data.file.hasErrors) {
      throw httpError(400, 'Invalid video file')
    }

    const uploadResult = await this.uploadVideo(data.file)
    if (!uploadResult) {
      throw httpError(500, 'Failed to process the video. Please try again.')
    }

    const { relativePath: videoPath } = uploadResult
    return this.repository
      .update(cleaningReview, {
        localVideoPath: videoPath,
        mimeType: 'video/mp4',
        status: 'AI Analizing',
      })
      .then((updatedReview) => {
        this.cronManager.addQueueJob(
          'ai-analysis',
          async () => {
            try {
              await this.analyzeVideo(updatedReview.id)
            } catch (error) {
              this.logger.error('Failed to analyze video for cleaning review')
              console.log({
                error,
                cleaningReviewId: updatedReview.id,
              })

              await this.repository.update(updatedReview, { status: 'Failed' })
            }
          },
          { retries: 2, retryDelayMs: 1000 }
        )
        return updatedReview
      })
  }
}
