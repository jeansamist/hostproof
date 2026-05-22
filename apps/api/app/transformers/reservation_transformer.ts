import { BaseTransformer } from '@adonisjs/core/transformers'
import Reservation from '#models/reservation'

export default class ReservationTransformer extends BaseTransformer<Reservation> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'moveInDate',
      'moveOutDate',
      'housingId',
      'numberOfAdult',
      'numberOfChild',
      'numberOfBaby',
      'specialInfos',
      'createdAt',
      'updatedAt',
    ])
  }
}
