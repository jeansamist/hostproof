import vine from '@vinejs/vine'

const employeePayload = vine.object({
  fullName: vine.string().trim(),
  gender: vine.enum(['male', 'female', 'other']),
  tel: vine.string().trim().nullable().optional(),
  email: vine.string().trim().toLowerCase().email().normalizeEmail().nullable().optional(),
  avatar: vine.string().trim().nullable().optional(),
})

const updateEmployeePayload = vine.object({
  fullName: vine.string().trim().optional(),
  gender: vine.enum(['male', 'female', 'other']).optional(),
  tel: vine.string().trim().nullable().optional(),
  email: vine.string().trim().toLowerCase().email().normalizeEmail().nullable().optional(),
  avatar: vine.string().trim().nullable().optional(),
})

export const createEmployeeValidator = vine.create(employeePayload)

export const createManyEmployeeValidator = vine.create(
  vine.object({
    employees: vine.array(employeePayload),
  })
)

export const updateEmployeeValidator = vine.create(updateEmployeePayload)

export const updateManyEmployeeValidator = vine.create(
  vine.object({
    employees: vine.array(
      vine.object({
        id: vine.number().positive().withoutDecimals(),
        fullName: vine.string().trim().optional(),
        gender: vine.enum(['male', 'female', 'other']).optional(),
        tel: vine.string().trim().nullable().optional(),
        email: vine.string().trim().toLowerCase().email().normalizeEmail().nullable().optional(),
        avatar: vine.string().trim().nullable().optional(),
      })
    ),
  })
)
