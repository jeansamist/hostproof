import vine from '@vinejs/vine'

export const paginateValidator = vine.create(
  vine.object({
    page: vine.number().withoutDecimals().positive().optional(),
    perPage: vine.number().withoutDecimals().positive().optional(),
  })
)

export const paginateWithWalletValidator = vine.create(
  vine.object({
    page: vine.number().withoutDecimals().positive().optional(),
    perPage: vine.number().withoutDecimals().positive().optional(),
    walletId: vine.number().withoutDecimals().positive().optional(),
  })
)
