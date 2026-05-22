import { type ReservationSchema } from '#database/schema'
import Reservation from '#models/reservation'
import { type ModelProps } from '#utils/generics'
import { type TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class ReservationRepository {
  private model = Reservation

  get getModel(): typeof Reservation {
    return this.model
  }

  async create(
    data: ModelProps<ReservationSchema>,
    trx?: TransactionClientContract
  ): Promise<Reservation> {
    const reservation = new this.model()
    if (trx) {
      reservation.useTransaction(trx)
    }
    reservation.fill(data)
    await reservation.save()
    await reservation.load('housing')
    return reservation
  }

  async update(
    reservation: Reservation,
    data: Partial<ModelProps<ReservationSchema>>,
    trx?: TransactionClientContract
  ): Promise<Reservation> {
    if (trx) {
      reservation.useTransaction(trx)
    }
    await reservation.merge(data).save()
    await reservation.load('housing')
    return reservation
  }

  async delete(reservation: Reservation, trx?: TransactionClientContract): Promise<void> {
    if (trx) {
      reservation.useTransaction(trx)
    }
    await reservation.delete()
  }

  async deleteById(id: number): Promise<void> {
    await this.model.query().where('id', id).delete()
  }

  async findById(id: number): Promise<Reservation> {
    return this.model.query().where('id', id).preload('housing').firstOrFail()
  }

  async createMany(data: ModelProps<ReservationSchema>[]): Promise<Reservation[]> {
    const reservations: Reservation[] = []
    for (const item of data) {
      reservations.push(await this.create(item))
    }
    return reservations
  }

  async findAllByUserId(userId: number): Promise<Reservation[]> {
    return this.model
      .query()
      .whereHas('housing', (query) => query.where('user_id', userId))
      .preload('housing')
  }

  async paginateByUserId(userId: number, page: number, perPage: number) {
    return this.model
      .query()
      .whereHas('housing', (query) => query.where('user_id', userId))
      .paginate(page, perPage)
  }
}
