import { BaseTransformer } from '@adonisjs/core/transformers'
import CleaningReview from '#models/cleaning_review'

export default class CleaningReviewTransformer extends BaseTransformer<CleaningReview> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'assignedEmployeeId',
      'reservationId',
      'additionnalInfos',
      'status',
      'aiOutput',
      'localVideoPath',
      'uri',
      'mimeType',
      'createdAt',
      'updatedAt',
    ])
  }
}
