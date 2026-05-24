import { HousingSchema } from '#database/schema'
import HousingRepository from '#repositories/housing_repository'
import ReservationRepository from '#repositories/reservation_repository'
import { httpError } from '#utils/http_error'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

type CreateReservationPayload = {
  moveInDate: DateTime
  moveOutDate: DateTime
  housingId: number
  numberOfAdult: number
  numberOfChild: number
  numberOfBaby: number
  specialInfos?: string | null
}

type UpdateReservationPayload = Partial<CreateReservationPayload>
type UpdateManyReservationPayload = Array<{ id: number } & UpdateReservationPayload>

type ReservationWithHousing = {
  housing: Pick<HousingSchema, 'userId'>
}

@inject()
export class ReservationService {
  constructor(
    private readonly repository: ReservationRepository,
    private readonly housingRepository: HousingRepository,
    private readonly ctx: HttpContext
  ) {}

  private get userId() {
    return this.ctx.auth.user!.id
  }

  private normalizeCreatePayload(data: CreateReservationPayload) {
    return {
      ...data,
      specialInfos: data.specialInfos ?? null,
    }
  }

  private normalizeUpdatePayload(data: UpdateReservationPayload) {
    return {
      ...data,
      ...(Object.hasOwn(data, 'specialInfos') ? { specialInfos: data.specialInfos ?? null } : {}),
    }
  }

  private ensureDateRange(moveInDate: DateTime, moveOutDate: DateTime) {
    if (moveOutDate <= moveInDate) {
      throw httpError(400, 'Move out date must be after move in date.')
    }
  }

  private async getOwnedHousing(housingId: number) {
    const housing = await this.housingRepository.findById(housingId)
    if (housing.userId !== this.userId) {
      throw httpError(403, 'You are not allowed to access this housing')
    }
    return housing
  }

  checkOwnership(reservation: ReservationWithHousing) {
    if (reservation.housing.userId !== this.userId) {
      throw httpError(403, 'You are not allowed to access this reservation')
    }
  }

  async getPaginatedUserReservations(page: number, perPage: number) {
    return this.repository.paginateByUserId(this.userId, page, perPage)
  }

  async createReservation(data: CreateReservationPayload) {
    await this.getOwnedHousing(data.housingId)
    const normalized = this.normalizeCreatePayload(data)
    this.ensureDateRange(normalized.moveInDate, normalized.moveOutDate)
    return this.repository.create(normalized)
  }

  async createManyReservations(data: CreateReservationPayload[]) {
    const reservations = []
    for (const item of data) {
      reservations.push(await this.createReservation(item))
    }
    return reservations
  }

  async updateReservation(id: number, data: UpdateReservationPayload) {
    const reservation = await this.repository.findById(id)
    this.checkOwnership(reservation)

    if (data.housingId) {
      await this.getOwnedHousing(data.housingId)
    }

    const normalized = this.normalizeUpdatePayload(data)
    const nextMoveInDate = normalized.moveInDate ?? reservation.moveInDate
    const nextMoveOutDate = normalized.moveOutDate ?? reservation.moveOutDate

    if (nextMoveInDate && nextMoveOutDate) {
      this.ensureDateRange(nextMoveInDate, nextMoveOutDate)
    }

    return this.repository.update(reservation, normalized)
  }

  async updateManyReservations(data: UpdateManyReservationPayload) {
    const reservations = []
    for (const item of data) {
      const { id, ...payload } = item
      await this.getReservationById(id)
      reservations.push(await this.updateReservation(id, payload))
    }
    return reservations
  }

  async deleteReservation(id: number) {
    const reservation = await this.repository.findById(id)
    this.checkOwnership(reservation)
    return this.repository.delete(reservation)
  }

  async getReservationsForUser() {
    return this.repository.findAllByUserId(this.userId)
  }

  async getReservationById(id: number) {
    const reservation = await this.repository.findById(id)
    this.checkOwnership(reservation)
    return reservation
  }
}
