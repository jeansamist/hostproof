import { CleaningReviewSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from './employee.ts'
import Reservation from './reservation.ts'

export default class CleaningReview extends CleaningReviewSchema {
  @belongsTo(() => Employee, {
    foreignKey: 'assignedEmployeeId',
  })
  declare assignedEmployee: BelongsTo<typeof Employee>

  @belongsTo(() => Reservation)
  declare reservation: BelongsTo<typeof Reservation>
}
