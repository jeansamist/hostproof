import vine from '@vinejs/vine'

export const uploadPurposeValues = ['employee-avatar'] as const

export const uploadValidator = vine.create(
  vine.object({
    purpose: vine.enum(uploadPurposeValues),
  })
)
