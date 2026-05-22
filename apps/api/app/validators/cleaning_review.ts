import vine from '@vinejs/vine'

const cleaningReviewStatuses = ['Created', 'AI Analizing', 'Analized', 'Done', 'Failed'] as const

export const createCleaningReviewValidator = vine.create(
  vine.object({
    assignedEmployeeId: vine.number().positive().withoutDecimals(),
    reservationId: vine.number().positive().withoutDecimals(),
    additionnalInfos: vine.string().trim().nullable().optional(),
    status: vine.enum(cleaningReviewStatuses),
    aiOutput: vine.any().nullable().optional(),
    localVideoPath: vine.string().trim().nullable().optional(),
    uri: vine.string().trim().nullable().optional(),
    mimeType: vine.string().trim().nullable().optional(),
  })
)

export const updateCleaningReviewValidator = vine.create(
  vine.object({
    assignedEmployeeId: vine.number().positive().withoutDecimals().optional(),
    reservationId: vine.number().positive().withoutDecimals().optional(),
    additionnalInfos: vine.string().trim().nullable().optional(),
    status: vine.enum(cleaningReviewStatuses).optional(),
    aiOutput: vine.any().nullable().optional(),
    localVideoPath: vine.string().trim().nullable().optional(),
    uri: vine.string().trim().nullable().optional(),
    mimeType: vine.string().trim().nullable().optional(),
  })
)
