import { HousingSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.ts'

export default class Housing extends HousingSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
