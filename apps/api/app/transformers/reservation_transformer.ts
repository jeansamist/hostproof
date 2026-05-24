import { BaseTransformer } from '@adonisjs/core/transformers'
import Reservation from '#models/reservation'

export default class ReservationTransformer extends BaseTransformer<Reservation> {
  toObject() {
    const base = this.pick(this.resource, [
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

    let housing: { id: number; name: string; type: string; address: string } | undefined
    try {
      const h = this.resource.housing as any
      if (h) housing = { id: h.id, name: h.name, type: h.type, address: h.address }
    } catch {
      housing = undefined
    }

    return { ...base, housing }
  }
}
