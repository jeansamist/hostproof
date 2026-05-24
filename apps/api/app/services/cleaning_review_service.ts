import { inject } from '@adonisjs/core'
import CleaningReviewRepository from '#repositories/cleaning_review_repository'
import EmployeeRepository from '#repositories/employee_repository'
import ReservationRepository from '#repositories/reservation_repository'
import { type EmployeeSchema, type HousingSchema } from '#database/schema'
import { HttpContext } from '@adonisjs/core/http'
import { httpError } from '#utils/http_error'

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
    private readonly ctx: HttpContext
  ) {}

  private get userId() {
    return this.ctx.auth.user!.id
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

  async getPaginatedUserCleaningReviews(page: number, perPage: number) {
    return this.repository.paginateByUserId(this.userId, page, perPage)
  }

  async createCleaningReview(data: CreateCleaningReviewPayload) {
    await this.getOwnedEmployee(data.assignedEmployeeId)
    await this.getOwnedReservation(data.reservationId)
    return this.repository.create(this.normalizeCreatePayload(data))
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
}
