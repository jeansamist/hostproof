import User from '#models/user'
import { AuthService } from '#services/auth_service'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

type UserUpdatePayload = Record<string, unknown>

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    firstName: 'Jean',
    lastName: 'Samist',
    email: 'jean@example.com',
    password: 'secret',
    avatar: null,
    emailVerificationCode: null,
    emailVerificationCodeExpiresAt: null,
    emailVerified: true,
    emailVerifiedAt: DateTime.now(),
    resetPasswordToken: null,
    resetPasswordTokenExpiresAt: null,
    createdAt: DateTime.now(),
    updatedAt: DateTime.now(),
    ...overrides,
  } as User
}

function createAuthService(
  overrides: {
    repository?: Partial<{
      findByEmail: (email: string) => Promise<User | null>
      create: (data: UserUpdatePayload) => Promise<User>
      update: (user: User, data: UserUpdatePayload) => Promise<User>
      delete: (user: User) => Promise<void>
      findByEmailAndResetPasswordToken: (email: string, token: string) => Promise<User | null>
      findByEmailAndEmailVerificationCode: (email: string, code: string) => Promise<User | null>
    }>
  } = {}
) {
  const repository = {
    findByEmail: async () => null,
    create: async (data: UserUpdatePayload) => makeUser(data as Partial<User>),
    update: async (user: User, data: UserUpdatePayload) =>
      makeUser({ ...(user as object), ...(data as object) } as Partial<User>),
    delete: async () => {},
    findByEmailAndResetPasswordToken: async () => null,
    findByEmailAndEmailVerificationCode: async () => null,
    ...overrides.repository,
  }

  const cronManager = {
    addQueueJob: () => {},
  }

  const logger = {
    info: () => {},
  }

  return {
    service: new AuthService(repository as never, cronManager as never, logger as never),
    repository,
  }
}

async function withPatchedProperty<T extends object, K extends keyof T, R>(
  target: T,
  key: K,
  replacement: T[K],
  callback: () => Promise<R>
) {
  const original = target[key]
  target[key] = replacement

  try {
    return await callback()
  } finally {
    target[key] = original
  }
}

test.group('AuthService', () => {
  test('generateVerificationCode returns a 6 digit code', ({ assert }) => {
    const { service } = createAuthService()

    const code = service.generateVerificationCode()

    assert.match(code, /^\d{6}$/)
  })

  test('generateResetPasswordToken returns a 32 character alphanumeric token', ({ assert }) => {
    const { service } = createAuthService()

    const token = service.generateResetPasswordToken()

    assert.lengthOf(token, 32)
    assert.match(token, /^[A-Za-z0-9]+$/)
  })

  test('signUp creates a new unverified user and sends a verification notification', async ({
    assert,
  }) => {
    let createdPayload: UserUpdatePayload | undefined
    const createdUser = makeUser({ id: 2, emailVerified: false, emailVerifiedAt: null })
    const { service } = createAuthService({
      repository: {
        create: async (data) => {
          createdPayload = data
          return createdUser
        },
      },
    })
    const notificationCalls: User[] = []
    service.sendEmailVerificationCodeNotification = ((user: User) => {
      notificationCalls.push(user)
    }) as AuthService['sendEmailVerificationCodeNotification']

    const result = await service.signUp({
      firstName: 'Jean',
      lastName: 'Samist',
      email: 'jean@example.com',
      password: 'secret',
    })

    assert.strictEqual(result, createdUser)
    assert.exists(createdPayload)
    assert.containsSubset(createdPayload!, {
      firstName: 'Jean',
      lastName: 'Samist',
      email: 'jean@example.com',
      password: 'secret',
      avatar: null,
      emailVerified: false,
      emailVerifiedAt: null,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    })
    assert.match(createdPayload!.emailVerificationCode as string, /^\d{6}$/)
    assert.isTrue(DateTime.isDateTime(createdPayload!.emailVerificationCodeExpiresAt))
    assert.isTrue(
      (createdPayload!.emailVerificationCodeExpiresAt as DateTime).toMillis() >
        DateTime.now().toMillis()
    )
    assert.deepEqual(notificationCalls, [createdUser])
  })

  test('signUp updates an existing unverified user instead of creating a duplicate', async ({
    assert,
  }) => {
    const existingUser = makeUser({ id: 4, emailVerified: false, emailVerifiedAt: null })
    let createCalls = 0
    let updateArgs: [User, UserUpdatePayload] | undefined
    const { service } = createAuthService({
      repository: {
        findByEmail: async () => existingUser,
        create: async () => {
          createCalls += 1
          return existingUser
        },
        update: async (user, data) => {
          updateArgs = [user, data]
          return user
        },
      },
    })

    const result = await service.signUp({
      firstName: 'Updated',
      lastName: 'User',
      email: existingUser.email,
      password: 'new-secret',
    })

    assert.strictEqual(result, existingUser)
    assert.exists(updateArgs)
    assert.strictEqual(updateArgs![0], existingUser)
    assert.equal(createCalls, 0)
    assert.containsSubset(updateArgs![1], {
      firstName: 'Updated',
      lastName: 'User',
      email: existingUser.email,
      password: 'new-secret',
      avatar: null,
      emailVerified: false,
      emailVerifiedAt: null,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    })
    assert.match(updateArgs![1].emailVerificationCode as string, /^\d{6}$/)
    assert.isTrue(DateTime.isDateTime(updateArgs![1].emailVerificationCodeExpiresAt))
  })

  test('signUp rejects when the email already belongs to a verified user', async ({ assert }) => {
    const { service } = createAuthService({
      repository: {
        findByEmail: async () => makeUser({ emailVerified: true }),
      },
    })

    await assert.rejects(
      () =>
        service.signUp({
          firstName: 'Jean',
          lastName: 'Samist',
          email: 'jean@example.com',
          password: 'secret',
        }),
      /Email has already been taken/
    )
  })

  test('signIn rejects when the user email is not verified', async ({ assert }) => {
    const { service } = createAuthService()

    await withPatchedProperty(
      User,
      'verifyCredentials',
      (async () =>
        makeUser({ emailVerified: false, emailVerifiedAt: null })) as typeof User.verifyCredentials,
      async () => {
        await assert.rejects(
          () => service.signIn({ email: 'jean@example.com', password: 'secret' }),
          /Please verify your email address before signing in/
        )
      }
    )
  })

  test('signIn returns the verified user and sends a login alert notification', async ({
    assert,
  }) => {
    const verifiedUser = makeUser()
    const { service } = createAuthService()
    const loginAlertCalls: User[] = []
    service.sendLoginAlertNotification = ((user: User) => {
      loginAlertCalls.push(user)
    }) as AuthService['sendLoginAlertNotification']

    await withPatchedProperty(
      User,
      'verifyCredentials',
      (async () => verifiedUser) as typeof User.verifyCredentials,
      async () => {
        const result = await service.signIn({ email: verifiedUser.email, password: 'secret' })

        assert.strictEqual(result, verifiedUser)
        assert.deepEqual(loginAlertCalls, [verifiedUser])
      }
    )
  })

  test('forgotPassword normalizes the email, stores a reset token, and sends the email', async ({
    assert,
  }) => {
    const user = makeUser({ email: 'jean@example.com' })
    let findByArgs: [string, string] | undefined
    let updatedPayload: UserUpdatePayload | undefined
    const updatedUser = makeUser({ ...user, resetPasswordToken: 'preset-token' })
    const { service } = createAuthService({
      repository: {
        update: async (_user, data) => {
          updatedPayload = data
          return makeUser({ ...updatedUser, ...(data as Partial<User>) })
        },
      },
    })
    const passwordResetEmails: User[] = []
    service.sendPasswordResetEmail = ((candidate: User) => {
      passwordResetEmails.push(candidate)
    }) as AuthService['sendPasswordResetEmail']

    await withPatchedProperty(
      User,
      'findBy',
      (async (column: string, value: string) => {
        findByArgs = [column, value]
        return user
      }) as typeof User.findBy,
      async () => {
        await service.forgotPassword(' JEAN@Example.com ')
      }
    )

    assert.deepEqual(findByArgs, ['email', 'jean@example.com'])
    assert.exists(updatedPayload)
    assert.lengthOf(updatedPayload!.resetPasswordToken as string, 32)
    assert.match(updatedPayload!.resetPasswordToken as string, /^[A-Za-z0-9]+$/)
    assert.isTrue(DateTime.isDateTime(updatedPayload!.resetPasswordTokenExpiresAt))
    assert.isTrue(
      (updatedPayload!.resetPasswordTokenExpiresAt as DateTime).toMillis() >
        DateTime.now().toMillis()
    )
    assert.lengthOf(passwordResetEmails, 1)
    assert.equal(passwordResetEmails[0].resetPasswordToken, updatedPayload!.resetPasswordToken)
  })

  test('forgotPassword rejects when the user does not exist', async ({ assert }) => {
    const { service } = createAuthService()

    await withPatchedProperty(
      User,
      'findBy',
      (async () => null) as typeof User.findBy,
      async () => {
        await assert.rejects(
          () => service.forgotPassword('missing@example.com'),
          /User does not exist/
        )
      }
    )
  })

  test('resetPassword returns false when the token lookup fails', async ({ assert }) => {
    const { service } = createAuthService()

    const result = await service.resetPassword({
      email: 'jean@example.com',
      resetPasswordToken: 'missing-token',
      newPassword: 'new-secret',
    })

    assert.isFalse(result)
  })

  test('resetPassword returns false when the token is expired', async ({ assert }) => {
    const expiredUser = makeUser({
      resetPasswordToken: 'expired-token',
      resetPasswordTokenExpiresAt: DateTime.now().minus({ minutes: 1 }),
    })
    const { service } = createAuthService({
      repository: {
        findByEmailAndResetPasswordToken: async () => expiredUser,
      },
    })

    const result = await service.resetPassword({
      email: expiredUser.email,
      resetPasswordToken: 'expired-token',
      newPassword: 'new-secret',
    })

    assert.isFalse(result)
  })

  test('resetPassword updates the password, clears the token, and sends an alert', async ({
    assert,
  }) => {
    const user = makeUser({
      resetPasswordToken: 'active-token',
      resetPasswordTokenExpiresAt: DateTime.now().plus({ minutes: 30 }),
    })
    const updateCalls: Array<[User, UserUpdatePayload]> = []
    const { service } = createAuthService({
      repository: {
        findByEmailAndResetPasswordToken: async () => user,
        update: async (target, data) => {
          updateCalls.push([target, data])
          return makeUser({ ...target, ...(data as Partial<User>) })
        },
      },
    })
    const alertCalls: User[] = []
    service.sendPasswordResetAlertNotification = ((candidate: User) => {
      alertCalls.push(candidate)
    }) as AuthService['sendPasswordResetAlertNotification']

    const result = await service.resetPassword({
      email: user.email,
      resetPasswordToken: 'active-token',
      newPassword: 'new-secret',
    })

    assert.isTrue(result)
    assert.lengthOf(updateCalls, 2)
    assert.deepEqual(updateCalls[0], [user, { password: 'new-secret' }])
    assert.deepEqual(updateCalls[1], [
      user,
      {
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
      },
    ])
    assert.deepEqual(alertCalls, [user])
  })

  test('generateAccessToken and deleteAccessToken delegate to the api guard', async ({
    assert,
  }) => {
    const { service } = createAuthService()
    const user = makeUser()
    const createdToken = { token: 'access-token' }
    let createTokenArgs: unknown[] | undefined
    let invalidateCalled = false

    const auth = {
      use: (guard: string) => {
        assert.equal(guard, 'api')
        return {
          createToken: async (...args: unknown[]) => {
            createTokenArgs = args
            return createdToken
          },
          invalidateToken: async () => {
            invalidateCalled = true
          },
        }
      },
    }

    const result = await service.generateAccessToken(user, auth as never)
    await service.deleteAccessToken(auth as never)

    assert.strictEqual(result, createdToken)
    assert.deepEqual(createTokenArgs, [user, ['*'], { expiresIn: '30d' }])
    assert.isTrue(invalidateCalled)
  })

  test('verifyEmail returns false when the verification code lookup fails', async ({ assert }) => {
    const { service } = createAuthService()

    const result = await service.verifyEmail('jean@example.com', 'missing-code')

    assert.isFalse(result)
  })

  test('verifyEmail returns false when the verification code is expired', async ({ assert }) => {
    const user = makeUser({
      emailVerificationCode: '123456',
      emailVerificationCodeExpiresAt: DateTime.now().minus({ minutes: 1 }),
      emailVerified: false,
      emailVerifiedAt: null,
    })
    const { service } = createAuthService({
      repository: {
        findByEmailAndEmailVerificationCode: async () => user,
      },
    })

    const result = await service.verifyEmail(user.email, '123456')

    assert.isFalse(result)
  })

  test('verifyEmail marks the user as verified, clears the code, and sends welcome email', async ({
    assert,
  }) => {
    const user = makeUser({
      emailVerificationCode: '123456',
      emailVerificationCodeExpiresAt: DateTime.now().plus({ minutes: 30 }),
      emailVerified: false,
      emailVerifiedAt: null,
    })
    const updateCalls: Array<[User, UserUpdatePayload]> = []
    const { service } = createAuthService({
      repository: {
        findByEmailAndEmailVerificationCode: async () => user,
        update: async (target, data) => {
          updateCalls.push([target, data])
          return makeUser({ ...target, ...(data as Partial<User>) })
        },
      },
    })
    const welcomeCalls: User[] = []
    service.sendWelcomeNotification = ((candidate: User) => {
      welcomeCalls.push(candidate)
    }) as AuthService['sendWelcomeNotification']

    const result = await service.verifyEmail(user.email, '123456')

    assert.strictEqual(result, user)
    assert.lengthOf(updateCalls, 2)
    assert.containsSubset(updateCalls[0][1], { emailVerified: true })
    assert.isTrue(DateTime.isDateTime(updateCalls[0][1].emailVerifiedAt))
    assert.deepEqual(updateCalls[1], [
      user,
      {
        emailVerificationCode: null,
        emailVerificationCodeExpiresAt: null,
      },
    ])
    assert.deepEqual(welcomeCalls, [user])
  })
})
