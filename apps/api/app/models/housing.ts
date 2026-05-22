import { HousingSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { type BelongsTo, type HasMany } from '@adonisjs/lucid/types/relations'
import Reservation from './reservation.ts'
import User from './user.ts'

export default class Housing extends HousingSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Reservation)
  declare reservations: HasMany<typeof Reservation>
}
