import { appUrl } from '#config/app'
import { type EmployeeSchema, type HousingSchema } from '#database/schema'
import CleaningReviewInvitationNotification from '#mails/cleaning_review_invitation_notification'
import CleaningReviewMissingProductsNotification from '#mails/cleaning_review_missing_products_notification'
import CleaningReviewRequestNewReviewNotification from '#mails/cleaning_review_request_new_review_notification'
import CleaningReviewVoiceMessageNotification from '#mails/cleaning_review_voice_message_notification'
import ChecklistItemRepository from '#repositories/checklist_item_repository'
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
import transmit from '@adonisjs/transmit/services/main'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdir, unlink } from 'node:fs/promises'
import CronManager from '../managers/crons_manager.ts'
import User from '../models/user.ts'
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
  voiceMessageFile?: string | null
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
    private readonly checklistItemRepository: ChecklistItemRepository,
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
      voiceMessageFile: data.voiceMessageFile ?? null,
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
      ...(Object.hasOwn(data, 'voiceMessageFile')
        ? { voiceMessageFile: data.voiceMessageFile ?? null }
        : {}),
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

  async sendRequestNewReviewEmail(uri: string, toDoItems: string[], appReviewLink: string) {
    const cleaningReview = await this.repository.findByUri(uri)
    await cleaningReview.load('assignedEmployee')
    await cleaningReview.load('reservation', (q) => q.preload('housing'))

    const housing = (cleaningReview.reservation as any)?.housing
    const ownerId = housing?.userId
    if (!ownerId) throw httpError(422, 'Could not determine review owner')

    const owner = await User.find(ownerId)
    if (!owner) throw httpError(422, 'Review owner not found')

    const employee = cleaningReview.assignedEmployee
    const notification = new CleaningReviewRequestNewReviewNotification(
      `${owner.firstName} ${owner.lastName}`,
      owner.email,
      employee?.fullName ?? 'The employee',
      appReviewLink,
      toDoItems,
      housing?.name
    )
    this.cronManager.addQueueJob(
      'emails',
      async () => {
        this.logger.info('Send request new review email to owner')
        await mail.send(notification)
      },
      { retries: 2, retryDelayMs: 1000 }
    )
  }

  async sendMissingProductsEmail(uri: string, missingProducts: string[], appReviewLink: string) {
    const cleaningReview = await this.repository.findByUri(uri)
    await cleaningReview.load('assignedEmployee')
    await cleaningReview.load('reservation', (q) => q.preload('housing'))

    const housing = (cleaningReview.reservation as any)?.housing
    const ownerId = housing?.userId
    if (!ownerId) throw httpError(422, 'Could not determine review owner')

    const owner = await User.find(ownerId)
    if (!owner) throw httpError(422, 'Review owner not found')

    const employee = cleaningReview.assignedEmployee
    const notification = new CleaningReviewMissingProductsNotification(
      `${owner.firstName} ${owner.lastName}`,
      owner.email,
      employee?.fullName ?? 'The employee',
      appReviewLink,
      missingProducts,
      housing?.name
    )
    this.cronManager.addQueueJob(
      'emails',
      async () => {
        this.logger.info('Send missing products email to owner')
        await mail.send(notification)
      },
      { retries: 2, retryDelayMs: 1000 }
    )
  }

  async submitVoiceMessage(uri: string, file: MultipartFile, appReviewLink: string) {
    const cleaningReview = await this.repository.findByUri(uri)

    if (!file || file.hasErrors) {
      throw httpError(400, 'Invalid audio file')
    }

    const targetDirectory = app.makePath('public', 'uploads', 'audio', 'voice-messages')
    await mkdir(targetDirectory, { recursive: true })

    const fileName = `${randomUUID()}.${file.extname ?? 'webm'}`
    await file.move(targetDirectory, { name: fileName })

    const relativePath = `/uploads/audio/voice-messages/${fileName}`
    const normalizedAppUrl = appUrl.endsWith('/') ? appUrl : `${appUrl}/`
    const fileUri = new URL(relativePath.slice(1), normalizedAppUrl).toString()

    await this.repository.update(cleaningReview, { voiceMessageFile: fileUri })
    await this.sendVoiceMessageEmail(uri, appReviewLink)

    return fileUri
  }

  async sendVoiceMessageEmail(uri: string, appReviewLink: string) {
    const cleaningReview = await this.repository.findByUri(uri)
    await cleaningReview.load('assignedEmployee')
    await cleaningReview.load('reservation', (q) => q.preload('housing'))

    const housing = (cleaningReview.reservation as any)?.housing
    const ownerId = housing?.userId
    if (!ownerId) throw httpError(422, 'Could not determine review owner')

    const owner = await User.find(ownerId)
    if (!owner) throw httpError(422, 'Review owner not found')

    const employee = cleaningReview.assignedEmployee
    const notification = new CleaningReviewVoiceMessageNotification(
      `${owner.firstName} ${owner.lastName}`,
      owner.email,
      employee?.fullName ?? 'The employee',
      appReviewLink,
      housing?.name
    )
    this.cronManager.addQueueJob(
      'emails',
      async () => {
        this.logger.info('Send voice message notification email to owner')
        await mail.send(notification)
      },
      { retries: 2, retryDelayMs: 1000 }
    )
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

  async analyzeVideo(cleaningReviewId: number, uri?: string) {
    const cleaningReview = await this.repository.findById(cleaningReviewId)
    if (!cleaningReview.localVideoPath) {
      throw new Error('No video to analyze')
    }
    this.logger.info(`[CleaningReviewService]: Analyzing video content using file reference...`)

    // Load the checklist defined by the housing owner so the AI can verify each point
    const ownerId = (cleaningReview.reservation as any)?.housing?.userId as number | undefined
    const checklistItems = ownerId
      ? await this.checklistItemRepository.findAllByUserId(ownerId)
      : []

    const checklistSection =
      checklistItems.length > 0
        ? `\n\nDefault cleaning checklist defined by the property manager — verify that EACH of these points has been filmed and confirmed in the video. Flag any that are missing or unclear in negativeAspects and toDo:\n${checklistItems.map((item, i) => `${i + 1}. ${item.label}`).join('\n')}`
        : ''

    //  Add review notes, reservation details, and owner checklist to give more context to the AI
    const response = await this.aiService.uploadAndAnalyzeVideo(
      cleaningReview.localVideoPath,
      uri,
      `Additional context for the AI analysis:
- Today date: ${new Date().toLocaleDateString()}
- Reservation notes: ${cleaningReview.reservation?.specialInfos ?? 'N/A'}
- Notes told to the employee: ${cleaningReview.additionnalInfos ?? 'N/A'}
- Reservation dates: ${cleaningReview.reservation ? `${cleaningReview.reservation.moveInDate.toString()} to ${cleaningReview.reservation.moveOutDate.toLocaleString()}` : 'N/A'}
- Housing details: ${cleaningReview.reservation && cleaningReview.reservation.housing ? `Type: ${cleaningReview.reservation.housing.type}, Size: ${cleaningReview.reservation.housing.capacity.toString()} sqm` : 'N/A'}${checklistSection}
`
    )

    return this.repository
      .update(cleaningReview, {
        aiOutput: response,
        status: 'Analized',
      })
      .then((updatedReview) => {
        transmit.broadcast(`cleaning-reviews/${uri}`, {
          message: 'AI_ANALYSIS_COMPLETED',
          aiOutput: response,
        })
        return updatedReview
      })
  }

  async retryAnalysis(uri: string) {
    const cleaningReview = await this.repository.findByUri(uri)
    if (cleaningReview.status !== 'Failed') {
      throw httpError(422, 'Only failed reviews can be retried')
    }
    if (!cleaningReview.localVideoPath) {
      throw httpError(422, 'No video found to re-analyse')
    }

    const updatedReview = await this.repository.update(cleaningReview, { status: 'AI Analizing' })
    transmit.broadcast(`cleaning-reviews/${uri}`, { message: 'VIDEO_UPLOADED_AND_CONVERTED' })

    this.cronManager.addQueueJob(
      'ai-analysis',
      async () => {
        try {
          await this.analyzeVideo(updatedReview.id, uri)
        } catch (error) {
          this.logger.error('Failed to retry video analysis for cleaning review')
          transmit.broadcast(`cleaning-reviews/${uri}`, { message: 'AI_ANALYSIS_FAILED' })
          await this.repository.update(updatedReview, { status: 'Failed' })
        }
      },
      { retries: 2, retryDelayMs: 1000 }
    )

    return updatedReview
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
    transmit.broadcast(`cleaning-reviews/${data.uri}`, { message: 'VIDEO_UPLOADED_AND_CONVERTED' })

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
              await this.analyzeVideo(updatedReview.id, data.uri)
            } catch (error) {
              this.logger.error('Failed to analyze video for cleaning review')
              console.log({
                error,
                cleaningReviewId: updatedReview.id,
              })

              transmit.broadcast(`cleaning-reviews/${data.uri}`, {
                message: 'AI_ANALYSIS_FAILED',
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
