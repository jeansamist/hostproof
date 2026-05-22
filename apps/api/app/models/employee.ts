import { EmployeeSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { type BelongsTo, type HasMany } from '@adonisjs/lucid/types/relations'
import CleaningReview from './cleaning_review.ts'
import User from './user.ts'

export default class Employee extends EmployeeSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => CleaningReview, {
    foreignKey: 'assignedEmployeeId',
  })
  declare cleaningReviews: HasMany<typeof CleaningReview>
}
