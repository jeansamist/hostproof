import { type EmployeeSchema } from '#database/schema'
import { EmployeeService } from '#services/employee_service'
import { type HttpContext } from '@adonisjs/core/http'
import { test } from '@japa/runner'

type EmployeeRepositoryStub = Partial<{
  paginateByUserId: (userId: number, page: number, perPage: number) => Promise<unknown>
  findByFullNameForUser: (userId: number, fullName: string) => Promise<EmployeeSchema | null>
  create: (data: Record<string, unknown>) => Promise<unknown>
  findById: (id: number) => Promise<EmployeeSchema>
  update: (employee: EmployeeSchema, data: Record<string, unknown>) => Promise<unknown>
  delete: (employee: EmployeeSchema) => Promise<void>
  findAllByUserId: (userId: number) => Promise<unknown>
}>

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

function createEmployeeService({
  repository = {},
  userId = 1,
}: {
  repository?: EmployeeRepositoryStub
  userId?: number
} = {}) {
  const repo = {
    paginateByUserId: async (_ownerId: number, _page: number, _perPage: number) => [],
    findByFullNameForUser: async () => null,
    create: async (data: Record<string, unknown>) => data,
    findById: async (id: number) => makeEmployee({ id, userId }),
    update: async (_employee: EmployeeSchema, data: Record<string, unknown>) => data,
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
    service: new EmployeeService(repo as never, ctx),
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

test.group('EmployeeService', () => {
  test('checkOwnership throws a 403 error when the employee belongs to another user', async ({
    assert,
  }) => {
    const { service } = createEmployeeService({ userId: 1 })

    await expectHttpError(
      assert,
      async () => service.checkOwnership(makeEmployee({ userId: 99 })),
      403,
      'You are not allowed to access this employee'
    )
  })

  test('getPaginatedUserEmployees delegates pagination to the repository with the auth user id', async ({
    assert,
  }) => {
    const paginatedResult = {
      data: [makeEmployee()],
      meta: { total: 1 },
    }
    let paginateArgs: [number, number, number] | undefined
    const { service } = createEmployeeService({
      userId: 7,
      repository: {
        paginateByUserId: async (userId, page, perPage) => {
          paginateArgs = [userId, page, perPage]
          return paginatedResult
        },
      },
    })

    const result = await service.getPaginatedUserEmployees(2, 15)

    assert.strictEqual(result, paginatedResult)
    assert.deepEqual(paginateArgs, [7, 2, 15])
  })

  test('createEmployee stores the new employee for the authenticated user', async ({ assert }) => {
    let createdPayload: Record<string, unknown> | undefined
    const createdEmployee = makeEmployee({ id: 3, userId: 5 })
    const { service } = createEmployeeService({
      userId: 5,
      repository: {
        create: async (data) => {
          createdPayload = data
          return createdEmployee
        },
      },
    })

    const result = await service.createEmployee({
      fullName: 'Marie Doe',
      gender: 'female',
    })

    assert.strictEqual(result, createdEmployee)
    assert.deepEqual(createdPayload, {
      fullName: 'Marie Doe',
      gender: 'female',
      tel: null,
      email: null,
      avatar: null,
      userId: 5,
    })
  })

  test('createEmployee rejects duplicate full names for the same user', async ({ assert }) => {
    const { service } = createEmployeeService({
      userId: 5,
      repository: {
        findByFullNameForUser: async () => makeEmployee({ userId: 5, fullName: 'Marie Doe' }),
      },
    })

    await expectHttpError(
      assert,
      async () =>
        service.createEmployee({
          fullName: 'Marie Doe',
          gender: 'female',
        }),
      400,
      'Employee with the same fullname already exists for this user.'
    )
  })

  test('createManyEmployees creates each employee for the authenticated user', async ({
    assert,
  }) => {
    const createCalls: Record<string, unknown>[] = []
    const { service } = createEmployeeService({
      userId: 9,
      repository: {
        create: async (data) => {
          createCalls.push(data)
          return makeEmployee(data as Partial<EmployeeSchema>)
        },
      },
    })

    const result = await service.createManyEmployees([
      { fullName: 'Alpha Doe', gender: 'female' },
      { fullName: 'Beta Doe', gender: 'male', tel: '+237123' },
    ])

    assert.lengthOf(result, 2)
    assert.deepEqual(createCalls, [
      {
        fullName: 'Alpha Doe',
        gender: 'female',
        tel: null,
        email: null,
        avatar: null,
        userId: 9,
      },
      {
        fullName: 'Beta Doe',
        gender: 'male',
        tel: '+237123',
        email: null,
        avatar: null,
        userId: 9,
      },
    ])
  })

  test('updateEmployee rejects access to employee owned by another user', async ({ assert }) => {
    const { service } = createEmployeeService({
      userId: 1,
      repository: {
        findById: async (id) => makeEmployee({ id, userId: 42 }),
      },
    })

    await expectHttpError(
      assert,
      async () => service.updateEmployee(9, { fullName: 'Updated Name' }),
      403,
      'You are not allowed to access this employee'
    )
  })

  test('updateEmployee rejects duplicate full names owned by the same user', async ({ assert }) => {
    const employee = makeEmployee({ id: 5, userId: 3, fullName: 'Original Name' })
    const duplicate = makeEmployee({ id: 7, userId: 3, fullName: 'Updated Name' })
    const { service } = createEmployeeService({
      userId: 3,
      repository: {
        findById: async () => employee,
        findByFullNameForUser: async () => duplicate,
      },
    })

    await expectHttpError(
      assert,
      async () => service.updateEmployee(5, { fullName: 'Updated Name' }),
      400,
      'Employee with the same fullname already exists for this user.'
    )
  })

  test('updateEmployee allows keeping the same name and normalizes nullable fields', async ({
    assert,
  }) => {
    const employee = makeEmployee({
      id: 8,
      userId: 6,
      fullName: 'City Staff',
      tel: '+2370000000',
      email: 'city@example.com',
    })
    let updateArgs: [EmployeeSchema, Record<string, unknown>] | undefined
    const updatedEmployee = makeEmployee({ ...employee, tel: null, avatar: 'avatar.png' })
    const { service } = createEmployeeService({
      userId: 6,
      repository: {
        findById: async () => employee,
        findByFullNameForUser: async () => employee,
        update: async (currentEmployee, data) => {
          updateArgs = [currentEmployee, data]
          return updatedEmployee
        },
      },
    })

    const result = await service.updateEmployee(8, {
      fullName: 'City Staff',
      tel: null,
      avatar: 'avatar.png',
    })

    assert.strictEqual(result, updatedEmployee)
    assert.deepEqual(updateArgs, [
      employee,
      { fullName: 'City Staff', tel: null, avatar: 'avatar.png' },
    ])
  })

  test('updateManyEmployees delegates each update item', async ({ assert }) => {
    const firstEmployee = makeEmployee({ id: 3, userId: 6, fullName: 'Alpha' })
    const secondEmployee = makeEmployee({ id: 4, userId: 6, fullName: 'Beta' })
    const updateCalls: Array<[EmployeeSchema, Record<string, unknown>]> = []
    const { service } = createEmployeeService({
      userId: 6,
      repository: {
        findById: async (id) => (id === 3 ? firstEmployee : secondEmployee),
        findByFullNameForUser: async () => null,
        update: async (employee, data) => {
          updateCalls.push([employee, data])
          return makeEmployee({
            ...(employee as object),
            ...(data as object),
          } as Partial<EmployeeSchema>)
        },
      },
    })

    const result = await service.updateManyEmployees([
      { id: 3, tel: null },
      { id: 4, avatar: 'avatar.png' },
    ])

    assert.lengthOf(result, 2)
    assert.deepEqual(updateCalls, [
      [firstEmployee, { tel: null }],
      [secondEmployee, { avatar: 'avatar.png' }],
    ])
  })

  test('deleteEmployee loads the employee, checks ownership, and deletes it', async ({
    assert,
  }) => {
    const employee = makeEmployee({ id: 10, userId: 4 })
    let deletedEmployee: EmployeeSchema | undefined
    const { service } = createEmployeeService({
      userId: 4,
      repository: {
        findById: async () => employee,
        delete: async (candidate) => {
          deletedEmployee = candidate
        },
      },
    })

    await service.deleteEmployee(10)

    assert.strictEqual(deletedEmployee, employee)
  })

  test('getEmployeesForUser and getEmployeeById scope access to the authenticated user', async ({
    assert,
  }) => {
    const employees = [
      makeEmployee({ id: 1, userId: 12 }),
      makeEmployee({ id: 2, userId: 12, fullName: 'Marie Doe' }),
    ]
    let listedUserId: number | undefined
    const { service } = createEmployeeService({
      userId: 12,
      repository: {
        findAllByUserId: async (userId) => {
          listedUserId = userId
          return employees
        },
        findById: async () => employees[0],
      },
    })

    const listResult = await service.getEmployeesForUser()
    const singleResult = await service.getEmployeeById(1)

    assert.strictEqual(listResult, employees)
    assert.strictEqual(singleResult, employees[0])
    assert.equal(listedUserId, 12)
  })
})
