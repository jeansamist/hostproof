import { ReservationSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import Housing from './housing.ts'

export default class Reservation extends ReservationSchema {
  @belongsTo(() => Housing)
  declare housing: BelongsTo<typeof Housing>
}
