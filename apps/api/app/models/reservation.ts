import { ReservationSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { type BelongsTo, type HasMany } from '@adonisjs/lucid/types/relations'
import CleaningReview from './cleaning_review.ts'
import Housing from './housing.ts'

export default class Reservation extends ReservationSchema {
  @belongsTo(() => Housing)
  declare housing: BelongsTo<typeof Housing>

  @hasMany(() => CleaningReview)
  declare cleaningReviews: HasMany<typeof CleaningReview>
}
