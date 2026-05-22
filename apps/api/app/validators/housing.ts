import vine from '@vinejs/vine'

export const createHousingValidator = vine.create(
  vine.object({
    name: vine.string(),
    address: vine.string(),
    type: vine.enum(['apartment', 'house', 'villa']),
    capacity: vine.number().positive(),
  })
)

export const updateHousingValidator = vine.create(
  vine.object({
    name: vine.string().optional(),
    address: vine.string().optional(),
    type: vine.enum(['apartment', 'house', 'villa']).optional(),
    capacity: vine.number().positive().optional(),
  })
)
