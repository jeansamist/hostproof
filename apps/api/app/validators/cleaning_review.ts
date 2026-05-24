import vine from '@vinejs/vine'

const cleaningReviewStatuses = ['Created', 'AI Analizing', 'Analized', 'Done', 'Failed'] as const

const cleaningReviewPayload = vine.object({
  assignedEmployeeId: vine.number().positive().withoutDecimals(),
  reservationId: vine.number().positive().withoutDecimals(),
  additionnalInfos: vine.string().trim().nullable().optional(),
  status: vine.enum(cleaningReviewStatuses),
  aiOutput: vine.any().nullable().optional(),
  localVideoPath: vine.string().trim().nullable().optional(),
  uri: vine.string().trim().nullable().optional(),
  mimeType: vine.string().trim().nullable().optional(),
})

const updateCleaningReviewPayload = vine.object({
  assignedEmployeeId: vine.number().positive().withoutDecimals().optional(),
  reservationId: vine.number().positive().withoutDecimals().optional(),
  additionnalInfos: vine.string().trim().nullable().optional(),
  status: vine.enum(cleaningReviewStatuses).optional(),
  aiOutput: vine.any().nullable().optional(),
  localVideoPath: vine.string().trim().nullable().optional(),
  uri: vine.string().trim().nullable().optional(),
  mimeType: vine.string().trim().nullable().optional(),
})

export const createCleaningReviewValidator = vine.create(cleaningReviewPayload)

export const createManyCleaningReviewValidator = vine.create(
  vine.object({
    cleaningReviews: vine.array(cleaningReviewPayload),
  })
)

export const updateCleaningReviewValidator = vine.create(updateCleaningReviewPayload)

export const updateManyCleaningReviewValidator = vine.create(
  vine.object({
    cleaningReviews: vine.array(
      vine.object({
        id: vine.number().positive().withoutDecimals(),
        assignedEmployeeId: vine.number().positive().withoutDecimals().optional(),
        reservationId: vine.number().positive().withoutDecimals().optional(),
        additionnalInfos: vine.string().trim().nullable().optional(),
        status: vine.enum(cleaningReviewStatuses).optional(),
        aiOutput: vine.any().nullable().optional(),
        localVideoPath: vine.string().trim().nullable().optional(),
        uri: vine.string().trim().nullable().optional(),
        mimeType: vine.string().trim().nullable().optional(),
      })
    ),
  })
)
