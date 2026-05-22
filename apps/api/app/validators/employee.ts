import vine from '@vinejs/vine'

export const createEmployeeValidator = vine.create(
  vine.object({
    fullName: vine.string().trim(),
    gender: vine.enum(['male', 'female', 'other']),
    tel: vine.string().trim().nullable().optional(),
    email: vine.string().trim().toLowerCase().email().normalizeEmail().nullable().optional(),
    avatar: vine.string().trim().nullable().optional(),
  })
)

export const updateEmployeeValidator = vine.create(
  vine.object({
    fullName: vine.string().trim().optional(),
    gender: vine.enum(['male', 'female', 'other']).optional(),
    tel: vine.string().trim().nullable().optional(),
    email: vine.string().trim().toLowerCase().email().normalizeEmail().nullable().optional(),
    avatar: vine.string().trim().nullable().optional(),
  })
)
