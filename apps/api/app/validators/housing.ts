import vine from '@vinejs/vine'

const housingPayload = vine.object({
  name: vine.string(),
  address: vine.string(),
  type: vine.enum(['apartment', 'house', 'villa']),
  capacity: vine.number().positive(),
})

const updateHousingPayload = vine.object({
  name: vine.string().optional(),
  address: vine.string().optional(),
  type: vine.enum(['apartment', 'house', 'villa']).optional(),
  capacity: vine.number().positive().optional(),
})

export const createHousingValidator = vine.create(housingPayload)

export const createManyHousingValidator = vine.create(
  vine.object({
    housings: vine.array(housingPayload),
  })
)

export const updateHousingValidator = vine.create(updateHousingPayload)

export const updateManyHousingValidator = vine.create(
  vine.object({
    housings: vine.array(
      vine.object({
        id: vine.number().positive().withoutDecimals(),
        name: vine.string().optional(),
        address: vine.string().optional(),
        type: vine.enum(['apartment', 'house', 'villa']).optional(),
        capacity: vine.number().positive().optional(),
      })
    ),
  })
)
