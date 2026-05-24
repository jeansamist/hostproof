import vine from '@vinejs/vine'

const reservationPayload = vine.object({
  moveInDate: vine.date({ formats: ['YYYY-MM-DD'] }),
  moveOutDate: vine.date({ formats: ['YYYY-MM-DD'] }).afterField('moveInDate'),
  housingId: vine.number().positive().withoutDecimals(),
  numberOfAdult: vine.number().positive().withoutDecimals(),
  numberOfChild: vine.number().nonNegative().withoutDecimals(),
  numberOfBaby: vine.number().nonNegative().withoutDecimals(),
  specialInfos: vine.string().trim().nullable().optional(),
})

const updateReservationPayload = vine.object({
  moveInDate: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
  moveOutDate: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
  housingId: vine.number().positive().withoutDecimals().optional(),
  numberOfAdult: vine.number().positive().withoutDecimals().optional(),
  numberOfChild: vine.number().nonNegative().withoutDecimals().optional(),
  numberOfBaby: vine.number().nonNegative().withoutDecimals().optional(),
  specialInfos: vine.string().trim().nullable().optional(),
})

export const createReservationValidator = vine.create(reservationPayload)

export const createManyReservationValidator = vine.create(
  vine.object({
    reservations: vine.array(reservationPayload),
  })
)

export const updateReservationValidator = vine.create(updateReservationPayload)

export const updateManyReservationValidator = vine.create(
  vine.object({
    reservations: vine.array(
      vine.object({
        id: vine.number().positive().withoutDecimals(),
        moveInDate: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
        moveOutDate: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
        housingId: vine.number().positive().withoutDecimals().optional(),
        numberOfAdult: vine.number().positive().withoutDecimals().optional(),
        numberOfChild: vine.number().nonNegative().withoutDecimals().optional(),
        numberOfBaby: vine.number().nonNegative().withoutDecimals().optional(),
        specialInfos: vine.string().trim().nullable().optional(),
      })
    ),
  })
)
