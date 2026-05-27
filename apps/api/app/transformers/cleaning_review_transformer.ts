import { BaseTransformer } from '@adonisjs/core/transformers'
import CleaningReview from '#models/cleaning_review'

export default class CleaningReviewTransformer extends BaseTransformer<CleaningReview> {
  toObject() {
    const base = this.pick(this.resource, [
      'id',
      'assignedEmployeeId',
      'reservationId',
      'additionnalInfos',
      'status',
      'aiOutput',
      'localVideoPath',
      'uri',
      'mimeType',
      'voiceMessageFile',
      'createdAt',
      'updatedAt',
    ])

    let employee: { id: number; fullName: string; email: string | null } | undefined
    let housing: { id: number; name: string } | undefined

    try {
      const e = this.resource.assignedEmployee as any
      if (e) employee = { id: e.id, fullName: e.fullName, email: e.email ?? null }
    } catch {}

    try {
      const h = (this.resource.reservation as any)?.housing
      if (h) housing = { id: h.id, name: h.name }
    } catch {}

    return { ...base, employee, housing }
  }
}
