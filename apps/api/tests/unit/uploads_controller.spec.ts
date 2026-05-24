import UploadsController from '#controllers/uploads_controller'
import { test } from '@japa/runner'

test.group('UploadsController', () => {
  test('store uploads an employee avatar and returns its metadata', async ({ assert }) => {
    const controller = new UploadsController()
    let movedTo: { location: string; name?: string } | undefined

    const response = {
      ok: (payload: unknown) => payload,
      badRequest: (payload: unknown) => payload,
    }

    const result = await controller.store({
      request: {
        validateUsing: async () => ({ purpose: 'employee-avatar' }),
        file: () => ({
          extname: 'png',
          hasErrors: false,
          size: 1024,
          subtype: 'png',
          type: 'image',
          move: async (location: string, options?: { name?: string }) => {
            movedTo = { location, name: options?.name }
          },
        }),
      },
      response,
    } as never)

    const payload = result as unknown as {
      success: boolean
      data?: { localPath: string }
    }

    assert.isTrue(payload.success)
    assert.exists(movedTo)
    assert.include(payload.data?.localPath ?? '', '/uploads/images/avatars/')
  })

  test('store rejects missing files', async ({ assert }) => {
    const controller = new UploadsController()

    const result = await controller.store({
      request: {
        validateUsing: async () => ({ purpose: 'employee-avatar' }),
        file: () => null,
      },
      response: {
        ok: (payload: unknown) => payload,
        badRequest: (payload: unknown) => payload,
      },
    } as never)

    const payload = result as unknown as {
      success: boolean
      message?: string
    }

    assert.isFalse(payload.success)
    assert.equal(payload.message, 'Please upload a file')
  })
})
