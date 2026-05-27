import vine from '@vinejs/vine'

export const createChecklistItemValidator = vine.create(
  vine.object({
    label: vine.string().trim().minLength(1).maxLength(255),
  })
)

export const updateChecklistItemValidator = vine.create(
  vine.object({
    label: vine.string().trim().minLength(1).maxLength(255).optional(),
    position: vine.number().withoutDecimals().optional(),
  })
)
