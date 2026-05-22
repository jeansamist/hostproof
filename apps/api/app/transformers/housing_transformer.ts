import type Housing from '#models/housing'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class HousingTransformer extends BaseTransformer<Housing> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'address',
      'type',
      'capacity',
      'createdAt',
      'updatedAt',
    ])
  }
}
