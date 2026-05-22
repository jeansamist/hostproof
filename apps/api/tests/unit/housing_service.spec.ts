import { type HousingSchema } from '#database/schema'
import { HousingService } from '#services/housing_service'
import { type HttpContext } from '@adonisjs/core/http'
import { test } from '@japa/runner'

type HousingRepositoryStub = Partial<{
  paginateByUserId: (userId: number, page: number, perPage: number) => Promise<unknown>
  findByNameForUser: (userId: number, name: string) => Promise<HousingSchema | null>
  create: (data: Record<string, unknown>) => Promise<unknown>
  findById: (id: number) => Promise<HousingSchema>
  update: (housing: HousingSchema, data: Record<string, unknown>) => Promise<unknown>
  delete: (housing: HousingSchema) => Promise<void>
  findAllByUserId: (userId: number) => Promise<unknown>
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

function createHousingService({
  repository = {},
  userId = 1,
}: {
  repository?: HousingRepositoryStub
  userId?: number
} = {}) {
  const repo = {
    paginateByUserId: async (_ownerId: number, _page: number, _perPage: number) => [],
    findByNameForUser: async () => null,
    create: async (data: Record<string, unknown>) => data,
    findById: async (id: number) => makeHousing({ id, userId }),
    update: async (_housing: HousingSchema, data: Record<string, unknown>) => data,
    delete: async () => {},
    findAllByUserId: async () => [],
    ...repository,
  }

  const ctx = {
    auth: {
      user: {
        id: userId,
      },
    },
  } as HttpContext

  return {
    repository: repo,
    service: new HousingService(repo as never, ctx),
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

test.group('HousingService', () => {
  test('checkOwnership throws a 403 error when the housing belongs to another user', async ({
    assert,
  }) => {
    const { service } = createHousingService({ userId: 1 })

    await expectHttpError(
      assert,
      async () => service.checkOwnership(makeHousing({ userId: 99 })),
      403,
      'You are not allowed to access this housing'
    )
  })

  test('getPaginatedUserHousings delegates pagination to the repository with the auth user id', async ({
    assert,
  }) => {
    const paginatedResult = {
      data: [makeHousing()],
      meta: { total: 1 },
    }
    let paginateArgs: [number, number, number] | undefined
    const { service } = createHousingService({
      userId: 7,
      repository: {
        paginateByUserId: async (userId, page, perPage) => {
          paginateArgs = [userId, page, perPage]
          return paginatedResult
        },
      },
    })

    const result = await service.getPaginatedUserHousings(2, 15)

    assert.strictEqual(result, paginatedResult)
    assert.deepEqual(paginateArgs, [7, 2, 15])
  })

  test('createHousing stores the new housing for the authenticated user', async ({ assert }) => {
    let createdPayload: Record<string, unknown> | undefined
    const createdHousing = makeHousing({ id: 3, userId: 5 })
    const { service } = createHousingService({
      userId: 5,
      repository: {
        create: async (data) => {
          createdPayload = data
          return createdHousing
        },
      },
    })

    const result = await service.createHousing({
      name: 'Sea View',
      address: '456 Ocean Avenue',
      type: 'villa',
      capacity: 8,
    })

    assert.strictEqual(result, createdHousing)
    assert.deepEqual(createdPayload, {
      name: 'Sea View',
      address: '456 Ocean Avenue',
      type: 'villa',
      capacity: 8,
      userId: 5,
    })
  })

  test('createHousing rejects duplicate names for the same user', async ({ assert }) => {
    const { service } = createHousingService({
      userId: 5,
      repository: {
        findByNameForUser: async () => makeHousing({ userId: 5, name: 'Sea View' }),
      },
    })

    await expectHttpError(
      assert,
      async () =>
        service.createHousing({
          name: 'Sea View',
          address: '456 Ocean Avenue',
          type: 'villa',
          capacity: 8,
        }),
      400,
      'Housing with the same name already exists for this user.'
    )
  })

  test('updateHousing rejects access to housing owned by another user', async ({ assert }) => {
    const { service } = createHousingService({
      userId: 1,
      repository: {
        findById: async (id) => makeHousing({ id, userId: 42 }),
      },
    })

    await expectHttpError(
      assert,
      async () => service.updateHousing(9, { name: 'Updated Name' }),
      403,
      'You are not allowed to access this housing'
    )
  })

  test('updateHousing rejects duplicate names owned by the same user', async ({ assert }) => {
    const housing = makeHousing({ id: 5, userId: 3, name: 'Original Name' })
    const duplicate = makeHousing({ id: 7, userId: 3, name: 'Updated Name' })
    const { service } = createHousingService({
      userId: 3,
      repository: {
        findById: async () => housing,
        findByNameForUser: async () => duplicate,
      },
    })

    await expectHttpError(
      assert,
      async () => service.updateHousing(5, { name: 'Updated Name' }),
      400,
      'Housing with the same name already exists for this user.'
    )
  })

  test('updateHousing allows keeping the same name and delegates the update', async ({
    assert,
  }) => {
    const housing = makeHousing({ id: 8, userId: 6, name: 'City Stay' })
    let updateArgs: [HousingSchema, Record<string, unknown>] | undefined
    const updatedHousing = makeHousing({ ...housing, capacity: 10 })
    const { service } = createHousingService({
      userId: 6,
      repository: {
        findById: async () => housing,
        findByNameForUser: async () => housing,
        update: async (currentHousing, data) => {
          updateArgs = [currentHousing, data]
          return updatedHousing
        },
      },
    })

    const result = await service.updateHousing(8, { name: 'City Stay', capacity: 10 })

    assert.strictEqual(result, updatedHousing)
    assert.deepEqual(updateArgs, [housing, { name: 'City Stay', capacity: 10 }])
  })

  test('deleteHousing loads the housing, checks ownership, and deletes it', async ({ assert }) => {
    const housing = makeHousing({ id: 10, userId: 4 })
    let deletedHousing: HousingSchema | undefined
    const { service } = createHousingService({
      userId: 4,
      repository: {
        findById: async () => housing,
        delete: async (candidate) => {
          deletedHousing = candidate
        },
      },
    })

    await service.deleteHousing(10)

    assert.strictEqual(deletedHousing, housing)
  })

  test('getHousingsForUser and getHousingById scope access to the authenticated user', async ({
    assert,
  }) => {
    const housings = [makeHousing({ id: 1, userId: 12 }), makeHousing({ id: 2, userId: 12 })]
    let listedUserId: number | undefined
    const { service } = createHousingService({
      userId: 12,
      repository: {
        findAllByUserId: async (userId) => {
          listedUserId = userId
          return housings
        },
        findById: async () => housings[0],
      },
    })

    const listResult = await service.getHousingsForUser()
    const singleResult = await service.getHousingById(1)

    assert.strictEqual(listResult, housings)
    assert.strictEqual(singleResult, housings[0])
    assert.equal(listedUserId, 12)
  })
})
