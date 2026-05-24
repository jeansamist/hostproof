import {
  type CleaningReviewSchema,
  type EmployeeSchema,
  type HousingSchema,
  type ReservationSchema,
} from '#database/schema'
import { CleaningReviewService } from '#services/cleaning_review_service'
import { type HttpContext } from '@adonisjs/core/http'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

type CleaningReviewWithRelations = CleaningReviewSchema & {
  assignedEmployee: Pick<EmployeeSchema, 'userId'>
  reservation: ReservationSchema & {
    housing: Pick<HousingSchema, 'userId'>
  }
}

type CleaningReviewRepositoryStub = Partial<{
  paginateByUserId: (userId: number, page: number, perPage: number) => Promise<unknown>
  create: (data: Record<string, unknown>) => Promise<unknown>
  findById: (id: number) => Promise<CleaningReviewWithRelations>
  update: (
    cleaningReview: CleaningReviewWithRelations,
    data: Record<string, unknown>
  ) => Promise<unknown>
  delete: (cleaningReview: CleaningReviewWithRelations) => Promise<void>
  findAllByUserId: (userId: number) => Promise<unknown>
}>

type EmployeeRepositoryStub = Partial<{
  findById: (id: number) => Promise<EmployeeSchema>
}>

type ReservationRepositoryStub = Partial<{
  findById: (id: number) => Promise<ReservationSchema & { housing: Pick<HousingSchema, 'userId'> }>
}>

function makeHousing(overrides: Partial<HousingSchema> = {}): HousingSchema {
  return {
    id: 1,
    name: 'Central Loft',
    address: '123 Main Street',
    type: 'apartment',
    capacity: 3,
    userId: 1,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  } as HousingSchema
}

function makeEmployee(overrides: Partial<EmployeeSchema> = {}): EmployeeSchema {
  return {
    id: 1,
    fullName: 'Jean Samist',
    gender: 'male',
    tel: null,
    email: null,
    avatar: null,
    userId: 1,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  } as EmployeeSchema
}

function makeReservation(
  overrides: Partial<ReservationSchema & { housing: Pick<HousingSchema, 'userId'> }> = {}
): ReservationSchema & { housing: Pick<HousingSchema, 'userId'> } {
  return {
    id: 1,
    moveInDate: DateTime.fromISO('2026-06-01'),
    moveOutDate: DateTime.fromISO('2026-06-10'),
    housingId: 1,
    numberOfAdult: 2,
    numberOfChild: 1,
    numberOfBaby: 0,
    specialInfos: null,
    createdAt: null,
    updatedAt: null,
    housing: makeHousing(),
    ...overrides,
  } as ReservationSchema & { housing: Pick<HousingSchema, 'userId'> }
}

function makeCleaningReview(
  overrides: Partial<CleaningReviewWithRelations> = {}
): CleaningReviewWithRelations {
  return {
    id: 1,
    assignedEmployeeId: 1,
    reservationId: 1,
    additionnalInfos: null,
    status: 'Created',
    aiOutput: null,
    localVideoPath: null,
    uri: null,
    mimeType: null,
    createdAt: null,
    updatedAt: null,
    assignedEmployee: makeEmployee(),
    reservation: makeReservation(),
    ...overrides,
  } as CleaningReviewWithRelations
}

function createCleaningReviewService({
  cleaningReviewRepository = {},
  employeeRepository = {},
  reservationRepository = {},
  userId = 1,
}: {
  cleaningReviewRepository?: CleaningReviewRepositoryStub
  employeeRepository?: EmployeeRepositoryStub
  reservationRepository?: ReservationRepositoryStub
  userId?: number
} = {}) {
  const cleaningReviews = {
    paginateByUserId: async (_ownerId: number, _page: number, _perPage: number) => [],
    create: async (data: Record<string, unknown>) => data,
    findById: async (id: number) =>
      makeCleaningReview({
        id,
        assignedEmployee: makeEmployee({ userId }),
        reservation: makeReservation({ housing: makeHousing({ userId }) }),
      }),
    update: async (_cleaningReview: CleaningReviewWithRelations, data: Record<string, unknown>) =>
      data,
    delete: async () => {},
    findAllByUserId: async () => [],
    ...cleaningReviewRepository,
  }

  const employees = {
    findById: async (id: number) => makeEmployee({ id, userId }),
    ...employeeRepository,
  }

  const reservations = {
    findById: async (id: number) => makeReservation({ id, housing: makeHousing({ userId }) }),
    ...reservationRepository,
  }

  const ctx = {
    auth: {
      user: {
        id: userId,
      },
    },
  } as HttpContext

  return {
    service: new CleaningReviewService(
      cleaningReviews as never,
      employees as never,
      reservations as never,
      ctx
    ),
  }
}

async function expectHttpError(
  assert: {
    fail: (message?: string) => never
    instanceOf: (actual: unknown, expected: typeof Error, message?: string) => void
    propertyVal: (obj: unknown, prop: string, value: unknown, message?: string) => void
    equal: (actual: unknown, expected: unknown, message?: string) => void
  },
  action: () => Promise<unknown>,
  status: number,
  message: string
) {
  try {
    await action()
    assert.fail(`Expected an HTTP ${status} error`)
  } catch (error) {
    assert.instanceOf(error, Error)
    assert.propertyVal(error, 'status', status)
    assert.equal((error as Error).message, message)
  }
}

test.group('CleaningReviewService', () => {
  test('checkOwnership throws a 403 error when the cleaning review belongs to another user', async ({
    assert,
  }) => {
    const { service } = createCleaningReviewService({ userId: 1 })

    await expectHttpError(
      assert,
      async () =>
        service.checkOwnership(
          makeCleaningReview({
            assignedEmployee: makeEmployee({ userId: 99 }),
          })
        ),
      403,
      'You are not allowed to access this cleaning review'
    )
  })

  test('getPaginatedUserCleaningReviews delegates pagination to the repository with the auth user id', async ({
    assert,
  }) => {
    const paginatedResult = {
      data: [makeCleaningReview()],
      meta: { total: 1 },
    }
    let paginateArgs: [number, number, number] | undefined
    const { service } = createCleaningReviewService({
      userId: 7,
      cleaningReviewRepository: {
        paginateByUserId: async (userId, page, perPage) => {
          paginateArgs = [userId, page, perPage]
          return paginatedResult
        },
      },
    })

    const result = await service.getPaginatedUserCleaningReviews(2, 15)

    assert.strictEqual(result, paginatedResult)
    assert.deepEqual(paginateArgs, [7, 2, 15])
  })

  test('createCleaningReview stores a cleaning review for owned employee and reservation', async ({
    assert,
  }) => {
    let createdPayload: Record<string, unknown> | undefined
    const createdReview = makeCleaningReview({ id: 3, assignedEmployeeId: 5, reservationId: 8 })
    const aiOutput = { score: 92, notes: ['dust'] }
    const { service } = createCleaningReviewService({
      userId: 5,
      cleaningReviewRepository: {
        create: async (data) => {
          createdPayload = data
          return createdReview
        },
      },
      employeeRepository: {
        findById: async (id) => makeEmployee({ id, userId: 5 }),
      },
      reservationRepository: {
        findById: async (id) => makeReservation({ id, housing: makeHousing({ userId: 5 }) }),
      },
    })

    const result = await service.createCleaningReview({
      assignedEmployeeId: 5,
      reservationId: 8,
      status: 'AI Analizing',
      aiOutput,
    })

    assert.strictEqual(result, createdReview)
    assert.deepEqual(createdPayload, {
      assignedEmployeeId: 5,
      reservationId: 8,
      status: 'AI Analizing',
      aiOutput,
      additionnalInfos: null,
      localVideoPath: null,
      uri: null,
      mimeType: null,
    })
  })

  test('createCleaningReview rejects employees owned by another user', async ({ assert }) => {
    const { service } = createCleaningReviewService({
      userId: 5,
      employeeRepository: {
        findById: async () => makeEmployee({ userId: 9 }),
      },
    })

    await expectHttpError(
      assert,
      async () =>
        service.createCleaningReview({
          assignedEmployeeId: 5,
          reservationId: 8,
          status: 'Created',
        }),
      403,
      'You are not allowed to access this employee'
    )
  })

  test('createCleaningReview rejects reservations owned by another user', async ({ assert }) => {
    const { service } = createCleaningReviewService({
      userId: 5,
      reservationRepository: {
        findById: async () => makeReservation({ housing: makeHousing({ userId: 7 }) }),
      },
    })

    await expectHttpError(
      assert,
      async () =>
        service.createCleaningReview({
          assignedEmployeeId: 5,
          reservationId: 8,
          status: 'Created',
        }),
      403,
      'You are not allowed to access this reservation'
    )
  })

  test('createManyCleaningReviews creates each review for owned employee and reservation', async ({
    assert,
  }) => {
    const createCalls: Record<string, unknown>[] = []
    const { service } = createCleaningReviewService({
      userId: 5,
      cleaningReviewRepository: {
        create: async (data) => {
          createCalls.push(data)
          return makeCleaningReview(data as Partial<CleaningReviewWithRelations>)
        },
      },
    })

    const result = await service.createManyCleaningReviews([
      {
        assignedEmployeeId: 5,
        reservationId: 8,
        status: 'Created',
      },
      {
        assignedEmployeeId: 5,
        reservationId: 8,
        status: 'AI Analizing',
        localVideoPath: 'video.mp4',
      },
    ])

    assert.lengthOf(result, 2)
    assert.deepEqual(createCalls, [
      {
        assignedEmployeeId: 5,
        reservationId: 8,
        status: 'Created',
        additionnalInfos: null,
        aiOutput: null,
        localVideoPath: null,
        uri: null,
        mimeType: null,
      },
      {
        assignedEmployeeId: 5,
        reservationId: 8,
        status: 'AI Analizing',
        additionnalInfos: null,
        aiOutput: null,
        localVideoPath: 'video.mp4',
        uri: null,
        mimeType: null,
      },
    ])
  })

  test('updateCleaningReview rejects access to reviews owned by another user', async ({
    assert,
  }) => {
    const { service } = createCleaningReviewService({
      userId: 1,
      cleaningReviewRepository: {
        findById: async (id) =>
          makeCleaningReview({
            id,
            reservation: makeReservation({ housing: makeHousing({ userId: 42 }) }),
          }),
      },
    })

    await expectHttpError(
      assert,
      async () => service.updateCleaningReview(9, { status: 'Done' }),
      403,
      'You are not allowed to access this cleaning review'
    )
  })

  test('updateCleaningReview validates new employee and reservation then delegates update', async ({
    assert,
  }) => {
    const cleaningReview = makeCleaningReview({
      id: 8,
      assignedEmployeeId: 6,
      reservationId: 12,
      assignedEmployee: makeEmployee({ id: 6, userId: 6 }),
      reservation: makeReservation({ id: 12, housing: makeHousing({ userId: 6 }) }),
    })
    let updateArgs: [CleaningReviewWithRelations, Record<string, unknown>] | undefined
    const updatedReview = makeCleaningReview({
      ...cleaningReview,
      assignedEmployeeId: 9,
      reservationId: 13,
      status: 'Done',
      aiOutput: { score: 100 },
    })
    const { service } = createCleaningReviewService({
      userId: 6,
      cleaningReviewRepository: {
        findById: async () => cleaningReview,
        update: async (currentReview, data) => {
          updateArgs = [currentReview, data]
          return updatedReview
        },
      },
      employeeRepository: {
        findById: async (id) => makeEmployee({ id, userId: 6 }),
      },
      reservationRepository: {
        findById: async (id) => makeReservation({ id, housing: makeHousing({ userId: 6 }) }),
      },
    })

    const result = await service.updateCleaningReview(8, {
      assignedEmployeeId: 9,
      reservationId: 13,
      status: 'Done',
      aiOutput: { score: 100 },
      localVideoPath: 'video.mp4',
    })

    assert.strictEqual(result, updatedReview)
    assert.strictEqual(updateArgs?.[0], cleaningReview)
    assert.deepEqual(updateArgs?.[1], {
      assignedEmployeeId: 9,
      reservationId: 13,
      status: 'Done',
      aiOutput: { score: 100 },
      localVideoPath: 'video.mp4',
    })
  })

  test('updateManyCleaningReviews delegates each update item', async ({ assert }) => {
    const firstReview = makeCleaningReview({
      id: 3,
      assignedEmployee: makeEmployee({ userId: 6 }),
      reservation: makeReservation({ housing: makeHousing({ userId: 6 }) }),
    })
    const secondReview = makeCleaningReview({
      id: 4,
      assignedEmployee: makeEmployee({ userId: 6 }),
      reservation: makeReservation({ housing: makeHousing({ userId: 6 }) }),
    })
    const updateCalls: Array<[CleaningReviewWithRelations, Record<string, unknown>]> = []
    const { service } = createCleaningReviewService({
      userId: 6,
      cleaningReviewRepository: {
        findById: async (id) => (id === 3 ? firstReview : secondReview),
        update: async (review, data) => {
          updateCalls.push([review, data])
          return makeCleaningReview({
            ...(review as object),
            ...(data as object),
          } as Partial<CleaningReviewWithRelations>)
        },
      },
    })

    const result = await service.updateManyCleaningReviews([
      { id: 3, status: 'Done' },
      { id: 4, uri: 'https://example.com/video.mp4' },
    ])

    assert.lengthOf(result, 2)
    assert.deepEqual(updateCalls, [
      [firstReview, { status: 'Done' }],
      [secondReview, { uri: 'https://example.com/video.mp4' }],
    ])
  })

  test('deleteCleaningReview loads the cleaning review, checks ownership, and deletes it', async ({
    assert,
  }) => {
    const cleaningReview = makeCleaningReview({
      id: 10,
      assignedEmployee: makeEmployee({ userId: 4 }),
      reservation: makeReservation({ housing: makeHousing({ userId: 4 }) }),
    })
    let deletedReview: CleaningReviewWithRelations | undefined
    const { service } = createCleaningReviewService({
      userId: 4,
      cleaningReviewRepository: {
        findById: async () => cleaningReview,
        delete: async (candidate) => {
          deletedReview = candidate
        },
      },
    })

    await service.deleteCleaningReview(10)

    assert.strictEqual(deletedReview, cleaningReview)
  })

  test('getCleaningReviewsForUser and getCleaningReviewById scope access to the authenticated user', async ({
    assert,
  }) => {
    const cleaningReviews = [
      makeCleaningReview({
        id: 1,
        assignedEmployee: makeEmployee({ userId: 12 }),
        reservation: makeReservation({ housing: makeHousing({ userId: 12 }) }),
      }),
      makeCleaningReview({
        id: 2,
        assignedEmployee: makeEmployee({ userId: 12 }),
        reservation: makeReservation({ housing: makeHousing({ userId: 12 }) }),
      }),
    ]
    let listedUserId: number | undefined
    const { service } = createCleaningReviewService({
      userId: 12,
      cleaningReviewRepository: {
        findAllByUserId: async (userId) => {
          listedUserId = userId
          return cleaningReviews
        },
        findById: async () => cleaningReviews[0],
      },
    })

    const listResult = await service.getCleaningReviewsForUser()
    const singleResult = await service.getCleaningReviewById(1)

    assert.strictEqual(listResult, cleaningReviews)
    assert.strictEqual(singleResult, cleaningReviews[0])
    assert.equal(listedUserId, 12)
  })
})
