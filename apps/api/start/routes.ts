/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.ts'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('/sign-up', [controllers.Auth, 'signUp'])
        router.post('/verify-email', [controllers.Auth, 'verifyEmail'])
        router.post('/sign-in', [controllers.Auth, 'signIn'])
        router.post('/forgot-password', [controllers.Auth, 'forgotPassword'])
        router.post('/reset-password', [controllers.Auth, 'resetPassword'])
        router
          .group(() => {
            router.post('/logout', [controllers.Auth, 'logout'])
            router.post('/delete-account', [controllers.Auth, 'deleteAccount'])
            router.get('/profile', [controllers.Auth, 'profile'])
            router.put('/update-profile', [controllers.Auth, 'updateProfile'])
          })
          .use([middleware.auth()])
        router
          .group(() => {
            router.get('/employees', [controllers.Employees, 'index'])
            router.post('/employees', [controllers.Employees, 'store'])
            router.get('/employees/:id', [controllers.Employees, 'show'])
            router.put('/employees/:id', [controllers.Employees, 'update'])
            router.delete('/employees/:id', [controllers.Employees, 'destroy'])
          })
          .use([middleware.auth()])
        router
          .group(() => {
            router.get('/housings', [controllers.Housings, 'index'])
            router.post('/housings', [controllers.Housings, 'store'])
            router.get('/housings/:id', [controllers.Housings, 'show'])
            router.put('/housings/:id', [controllers.Housings, 'update'])
            router.delete('/housings/:id', [controllers.Housings, 'destroy'])
          })
          .use([middleware.auth()])
      })
      .prefix('/auth')
  })
  .prefix('/api')
