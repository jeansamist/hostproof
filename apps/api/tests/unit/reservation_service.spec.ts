import { type HousingSchema, type ReservationSchema } from '#database/schema'
import { ReservationService } from '#services/reservation_service'
import { type HttpContext } from '@adonisjs/core/http'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

type ReservationWithHousing = ReservationSchema & {
  housing: Pick<HousingSchema, 'userId'>
}

type ReservationRepositoryStub = Partial<{
  paginateByUserId: (userId: number, page: number, perPage: number) => Promise<unknown>
  create: (data: Record<string, unknown>) => Promise<unknown>
  findById: (id: number) => Promise<ReservationWithHousing>
  update: (reservation: ReservationWithHousing, data: Record<string, unknown>) => Promise<unknown>
  delete: (reservation: ReservationWithHousing) => Promise<void>
  findAllByUserId: (userId: number) => Promise<unknown>
}>

type HousingRepositoryStub = Partial<{
  findById: (id: number) => Promise<HousingSchema>
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

function makeReservation(overrides: Partial<ReservationWithHousing> = {}): ReservationWithHousing {
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
  } as ReservationWithHousing
}

function createReservationService({
  reservationRepository = {},
  housingRepository = {},
  userId = 1,
}: {
  reservationRepository?: ReservationRepositoryStub
  housingRepository?: HousingRepositoryStub
  userId?: number
} = {}) {
  const reservations = {
    paginateByUserId: async (_ownerId: number, _page: number, _perPage: number) => [],
    create: async (data: Record<string, unknown>) => data,
    findById: async (id: number) => makeReservation({ id, housing: makeHousing({ userId }) }),
    update: async (_reservation: ReservationWithHousing, data: Record<string, unknown>) => data,
    delete: async () => {},
    findAllByUserId: async () => [],
    ...reservationRepository,
  }

  const housings = {
    findById: async (id: number) => makeHousing({ id, userId }),
    ...housingRepository,
  }

  const ctx = {
    auth: {
      user: {
        id: userId,
      },
    },
  } as HttpContext

  return {
    reservationRepository: reservations,
    housingRepository: housings,
    service: new ReservationService(reservations as never, housings as never, ctx),
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

test.group('ReservationService', () => {
  test('checkOwnership throws a 403 error when the reservation belongs to another user', async ({
    assert,
  }) => {
    const { service } = createReservationService({ userId: 1 })

    await expectHttpError(
      assert,
      async () => service.checkOwnership(makeReservation({ housing: makeHousing({ userId: 99 }) })),
      403,
      'You are not allowed to access this reservation'
    )
  })

  test('getPaginatedUserReservations delegates pagination to the repository with the auth user id', async ({
    assert,
  }) => {
    const paginatedResult = {
      data: [makeReservation()],
      meta: { total: 1 },
    }
    let paginateArgs: [number, number, number] | undefined
    const { service } = createReservationService({
      userId: 7,
      reservationRepository: {
        paginateByUserId: async (userId, page, perPage) => {
          paginateArgs = [userId, page, perPage]
          return paginatedResult
        },
      },
    })

    const result = await service.getPaginatedUserReservations(2, 15)

    assert.strictEqual(result, paginatedResult)
    assert.deepEqual(paginateArgs, [7, 2, 15])
  })

  test('createReservation stores the reservation for an owned housing with normalized dates', async ({
    assert,
  }) => {
    let createdPayload: Record<string, unknown> | undefined
    const createdReservation = makeReservation({
      id: 3,
      housingId: 5,
      housing: makeHousing({ id: 5, userId: 5 }),
    })
    const { service } = createReservationService({
      userId: 5,
      reservationRepository: {
        create: async (data) => {
          createdPayload = data
          return createdReservation
        },
      },
    })

    const result = await service.createReservation({
      moveInDate: DateTime.fromISO('2026-07-01'),
      moveOutDate: DateTime.fromISO('2026-07-10'),
      housingId: 5,
      numberOfAdult: 2,
      numberOfChild: 1,
      numberOfBaby: 0,
    })

    assert.strictEqual(result, createdReservation)
    assert.isTrue(DateTime.isDateTime(createdPayload!.moveInDate))
    assert.isTrue(DateTime.isDateTime(createdPayload!.moveOutDate))
    assert.equal((createdPayload!.moveInDate as DateTime).toISODate(), '2026-07-01')
    assert.equal((createdPayload!.moveOutDate as DateTime).toISODate(), '2026-07-10')
    assert.deepEqual(
      {
        housingId: createdPayload!.housingId,
        numberOfAdult: createdPayload!.numberOfAdult,
        numberOfChild: createdPayload!.numberOfChild,
        numberOfBaby: createdPayload!.numberOfBaby,
        specialInfos: createdPayload!.specialInfos,
      },
      {
        housingId: 5,
        numberOfAdult: 2,
        numberOfChild: 1,
        numberOfBaby: 0,
        specialInfos: null,
      }
    )
  })

  test('createReservation rejects housings owned by another user', async ({ assert }) => {
    const { service } = createReservationService({
      userId: 5,
      housingRepository: {
        findById: async () => makeHousing({ userId: 7 }),
      },
    })

    await expectHttpError(
      assert,
      async () =>
        service.createReservation({
          moveInDate: DateTime.fromISO('2026-07-01'),
          moveOutDate: DateTime.fromISO('2026-07-10'),
          housingId: 5,
          numberOfAdult: 2,
          numberOfChild: 1,
          numberOfBaby: 0,
        }),
      403,
      'You are not allowed to access this housing'
    )
  })

  test('updateReservation rejects access to reservations owned by another user', async ({
    assert,
  }) => {
    const { service } = createReservationService({
      userId: 1,
      reservationRepository: {
        findById: async (id) => makeReservation({ id, housing: makeHousing({ userId: 42 }) }),
      },
    })

    await expectHttpError(
      assert,
      async () => service.updateReservation(9, { numberOfAdult: 3 }),
      403,
      'You are not allowed to access this reservation'
    )
  })

  test('updateReservation rejects invalid move-out dates after merging with existing values', async ({
    assert,
  }) => {
    const reservation = makeReservation({
      id: 8,
      housing: makeHousing({ userId: 6 }),
      moveInDate: DateTime.fromISO('2026-08-10'),
      moveOutDate: DateTime.fromISO('2026-08-15'),
    })
    const { service } = createReservationService({
      userId: 6,
      reservationRepository: {
        findById: async () => reservation,
      },
    })

    await expectHttpError(
      assert,
      async () => service.updateReservation(8, { moveOutDate: DateTime.fromISO('2026-08-05') }),
      400,
      'Move out date must be after move in date.'
    )
  })

  test('updateReservation validates a new housing and delegates the update', async ({ assert }) => {
    const reservation = makeReservation({
      id: 8,
      housingId: 6,
      housing: makeHousing({ id: 6, userId: 6 }),
      moveInDate: DateTime.fromISO('2026-08-10'),
      moveOutDate: DateTime.fromISO('2026-08-15'),
    })
    let updateArgs: [ReservationWithHousing, Record<string, unknown>] | undefined
    const updatedReservation = makeReservation({
      ...reservation,
      housingId: 9,
      housing: makeHousing({ id: 9, userId: 6 }),
      specialInfos: 'Late arrival',
    })
    const { service } = createReservationService({
      userId: 6,
      reservationRepository: {
        findById: async () => reservation,
        update: async (currentReservation, data) => {
          updateArgs = [currentReservation, data]
          return updatedReservation
        },
      },
      housingRepository: {
        findById: async (id) => makeHousing({ id, userId: 6 }),
      },
    })

    const result = await service.updateReservation(8, {
      housingId: 9,
      moveOutDate: DateTime.fromISO('2026-08-18'),
      specialInfos: 'Late arrival',
    })

    assert.strictEqual(result, updatedReservation)
    assert.strictEqual(updateArgs?.[0], reservation)
    assert.equal(updateArgs?.[1].housingId, 9)
    assert.equal(updateArgs?.[1].specialInfos, 'Late arrival')
    assert.isTrue(DateTime.isDateTime(updateArgs?.[1].moveOutDate))
    assert.equal((updateArgs?.[1].moveOutDate as DateTime).toISODate(), '2026-08-18')
  })

  test('deleteReservation loads the reservation, checks ownership, and deletes it', async ({
    assert,
  }) => {
    const reservation = makeReservation({ id: 10, housing: makeHousing({ userId: 4 }) })
    let deletedReservation: ReservationWithHousing | undefined
    const { service } = createReservationService({
      userId: 4,
      reservationRepository: {
        findById: async () => reservation,
        delete: async (candidate) => {
          deletedReservation = candidate
        },
      },
    })

    await service.deleteReservation(10)

    assert.strictEqual(deletedReservation, reservation)
  })

  test('getReservationsForUser and getReservationById scope access to the authenticated user', async ({
    assert,
  }) => {
    const reservations = [
      makeReservation({ id: 1, housing: makeHousing({ userId: 12 }) }),
      makeReservation({ id: 2, housing: makeHousing({ userId: 12 }) }),
    ]
    let listedUserId: number | undefined
    const { service } = createReservationService({
      userId: 12,
      reservationRepository: {
        findAllByUserId: async (userId) => {
          listedUserId = userId
          return reservations
        },
        findById: async () => reservations[0],
      },
    })

    const listResult = await service.getReservationsForUser()
    const singleResult = await service.getReservationById(1)

    assert.strictEqual(listResult, reservations)
    assert.strictEqual(singleResult, reservations[0])
    assert.equal(listedUserId, 12)
  })
})
