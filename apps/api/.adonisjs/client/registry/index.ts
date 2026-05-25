/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'event_stream': {
    methods: ["GET","HEAD"],
    pattern: '/__transmit/events',
    tokens: [{"old":"/__transmit/events","type":0,"val":"__transmit","end":""},{"old":"/__transmit/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['event_stream']['types'],
  },
  'subscribe': {
    methods: ["POST"],
    pattern: '/__transmit/subscribe',
    tokens: [{"old":"/__transmit/subscribe","type":0,"val":"__transmit","end":""},{"old":"/__transmit/subscribe","type":0,"val":"subscribe","end":""}],
    types: placeholder as Registry['subscribe']['types'],
  },
  'unsubscribe': {
    methods: ["POST"],
    pattern: '/__transmit/unsubscribe',
    tokens: [{"old":"/__transmit/unsubscribe","type":0,"val":"__transmit","end":""},{"old":"/__transmit/unsubscribe","type":0,"val":"unsubscribe","end":""}],
    types: placeholder as Registry['unsubscribe']['types'],
  },
  'public_reviews.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/public/reviews/:uri',
    tokens: [{"old":"/api/public/reviews/:uri","type":0,"val":"api","end":""},{"old":"/api/public/reviews/:uri","type":0,"val":"public","end":""},{"old":"/api/public/reviews/:uri","type":0,"val":"reviews","end":""},{"old":"/api/public/reviews/:uri","type":1,"val":"uri","end":""}],
    types: placeholder as Registry['public_reviews.show']['types'],
  },
  'public_reviews.submit': {
    methods: ["POST"],
    pattern: '/api/public/reviews/:uri/submit',
    tokens: [{"old":"/api/public/reviews/:uri/submit","type":0,"val":"api","end":""},{"old":"/api/public/reviews/:uri/submit","type":0,"val":"public","end":""},{"old":"/api/public/reviews/:uri/submit","type":0,"val":"reviews","end":""},{"old":"/api/public/reviews/:uri/submit","type":1,"val":"uri","end":""},{"old":"/api/public/reviews/:uri/submit","type":0,"val":"submit","end":""}],
    types: placeholder as Registry['public_reviews.submit']['types'],
  },
  'public_reviews.request_new_review': {
    methods: ["POST"],
    pattern: '/api/public/reviews/:uri/request-new-review',
    tokens: [{"old":"/api/public/reviews/:uri/request-new-review","type":0,"val":"api","end":""},{"old":"/api/public/reviews/:uri/request-new-review","type":0,"val":"public","end":""},{"old":"/api/public/reviews/:uri/request-new-review","type":0,"val":"reviews","end":""},{"old":"/api/public/reviews/:uri/request-new-review","type":1,"val":"uri","end":""},{"old":"/api/public/reviews/:uri/request-new-review","type":0,"val":"request-new-review","end":""}],
    types: placeholder as Registry['public_reviews.request_new_review']['types'],
  },
  'public_reviews.notify_missing_products': {
    methods: ["POST"],
    pattern: '/api/public/reviews/:uri/notify-missing-products',
    tokens: [{"old":"/api/public/reviews/:uri/notify-missing-products","type":0,"val":"api","end":""},{"old":"/api/public/reviews/:uri/notify-missing-products","type":0,"val":"public","end":""},{"old":"/api/public/reviews/:uri/notify-missing-products","type":0,"val":"reviews","end":""},{"old":"/api/public/reviews/:uri/notify-missing-products","type":1,"val":"uri","end":""},{"old":"/api/public/reviews/:uri/notify-missing-products","type":0,"val":"notify-missing-products","end":""}],
    types: placeholder as Registry['public_reviews.notify_missing_products']['types'],
  },
  'auth.sign_up': {
    methods: ["POST"],
    pattern: '/api/auth/sign-up',
    tokens: [{"old":"/api/auth/sign-up","type":0,"val":"api","end":""},{"old":"/api/auth/sign-up","type":0,"val":"auth","end":""},{"old":"/api/auth/sign-up","type":0,"val":"sign-up","end":""}],
    types: placeholder as Registry['auth.sign_up']['types'],
  },
  'auth.verify_email': {
    methods: ["POST"],
    pattern: '/api/auth/verify-email',
    tokens: [{"old":"/api/auth/verify-email","type":0,"val":"api","end":""},{"old":"/api/auth/verify-email","type":0,"val":"auth","end":""},{"old":"/api/auth/verify-email","type":0,"val":"verify-email","end":""}],
    types: placeholder as Registry['auth.verify_email']['types'],
  },
  'auth.sign_in': {
    methods: ["POST"],
    pattern: '/api/auth/sign-in',
    tokens: [{"old":"/api/auth/sign-in","type":0,"val":"api","end":""},{"old":"/api/auth/sign-in","type":0,"val":"auth","end":""},{"old":"/api/auth/sign-in","type":0,"val":"sign-in","end":""}],
    types: placeholder as Registry['auth.sign_in']['types'],
  },
  'auth.forgot_password': {
    methods: ["POST"],
    pattern: '/api/auth/forgot-password',
    tokens: [{"old":"/api/auth/forgot-password","type":0,"val":"api","end":""},{"old":"/api/auth/forgot-password","type":0,"val":"auth","end":""},{"old":"/api/auth/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['auth.forgot_password']['types'],
  },
  'auth.reset_password': {
    methods: ["POST"],
    pattern: '/api/auth/reset-password',
    tokens: [{"old":"/api/auth/reset-password","type":0,"val":"api","end":""},{"old":"/api/auth/reset-password","type":0,"val":"auth","end":""},{"old":"/api/auth/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['auth.reset_password']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/api/auth/logout',
    tokens: [{"old":"/api/auth/logout","type":0,"val":"api","end":""},{"old":"/api/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'auth.delete_account': {
    methods: ["POST"],
    pattern: '/api/auth/delete-account',
    tokens: [{"old":"/api/auth/delete-account","type":0,"val":"api","end":""},{"old":"/api/auth/delete-account","type":0,"val":"auth","end":""},{"old":"/api/auth/delete-account","type":0,"val":"delete-account","end":""}],
    types: placeholder as Registry['auth.delete_account']['types'],
  },
  'auth.profile': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/profile',
    tokens: [{"old":"/api/auth/profile","type":0,"val":"api","end":""},{"old":"/api/auth/profile","type":0,"val":"auth","end":""},{"old":"/api/auth/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['auth.profile']['types'],
  },
  'auth.update_profile': {
    methods: ["PUT"],
    pattern: '/api/auth/update-profile',
    tokens: [{"old":"/api/auth/update-profile","type":0,"val":"api","end":""},{"old":"/api/auth/update-profile","type":0,"val":"auth","end":""},{"old":"/api/auth/update-profile","type":0,"val":"update-profile","end":""}],
    types: placeholder as Registry['auth.update_profile']['types'],
  },
  'uploads.store': {
    methods: ["POST"],
    pattern: '/api/auth/uploads',
    tokens: [{"old":"/api/auth/uploads","type":0,"val":"api","end":""},{"old":"/api/auth/uploads","type":0,"val":"auth","end":""},{"old":"/api/auth/uploads","type":0,"val":"uploads","end":""}],
    types: placeholder as Registry['uploads.store']['types'],
  },
  'employees.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/employees',
    tokens: [{"old":"/api/auth/employees","type":0,"val":"api","end":""},{"old":"/api/auth/employees","type":0,"val":"auth","end":""},{"old":"/api/auth/employees","type":0,"val":"employees","end":""}],
    types: placeholder as Registry['employees.index']['types'],
  },
  'employees.store': {
    methods: ["POST"],
    pattern: '/api/auth/employees',
    tokens: [{"old":"/api/auth/employees","type":0,"val":"api","end":""},{"old":"/api/auth/employees","type":0,"val":"auth","end":""},{"old":"/api/auth/employees","type":0,"val":"employees","end":""}],
    types: placeholder as Registry['employees.store']['types'],
  },
  'employees.create_many': {
    methods: ["POST"],
    pattern: '/api/auth/employees/many',
    tokens: [{"old":"/api/auth/employees/many","type":0,"val":"api","end":""},{"old":"/api/auth/employees/many","type":0,"val":"auth","end":""},{"old":"/api/auth/employees/many","type":0,"val":"employees","end":""},{"old":"/api/auth/employees/many","type":0,"val":"many","end":""}],
    types: placeholder as Registry['employees.create_many']['types'],
  },
  'employees.update_many': {
    methods: ["PUT"],
    pattern: '/api/auth/employees/many',
    tokens: [{"old":"/api/auth/employees/many","type":0,"val":"api","end":""},{"old":"/api/auth/employees/many","type":0,"val":"auth","end":""},{"old":"/api/auth/employees/many","type":0,"val":"employees","end":""},{"old":"/api/auth/employees/many","type":0,"val":"many","end":""}],
    types: placeholder as Registry['employees.update_many']['types'],
  },
  'employees.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/employees/:id',
    tokens: [{"old":"/api/auth/employees/:id","type":0,"val":"api","end":""},{"old":"/api/auth/employees/:id","type":0,"val":"auth","end":""},{"old":"/api/auth/employees/:id","type":0,"val":"employees","end":""},{"old":"/api/auth/employees/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['employees.show']['types'],
  },
  'employees.update': {
    methods: ["PUT"],
    pattern: '/api/auth/employees/:id',
    tokens: [{"old":"/api/auth/employees/:id","type":0,"val":"api","end":""},{"old":"/api/auth/employees/:id","type":0,"val":"auth","end":""},{"old":"/api/auth/employees/:id","type":0,"val":"employees","end":""},{"old":"/api/auth/employees/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['employees.update']['types'],
  },
  'employees.destroy': {
    methods: ["DELETE"],
    pattern: '/api/auth/employees/:id',
    tokens: [{"old":"/api/auth/employees/:id","type":0,"val":"api","end":""},{"old":"/api/auth/employees/:id","type":0,"val":"auth","end":""},{"old":"/api/auth/employees/:id","type":0,"val":"employees","end":""},{"old":"/api/auth/employees/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['employees.destroy']['types'],
  },
  'housings.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/housings',
    tokens: [{"old":"/api/auth/housings","type":0,"val":"api","end":""},{"old":"/api/auth/housings","type":0,"val":"auth","end":""},{"old":"/api/auth/housings","type":0,"val":"housings","end":""}],
    types: placeholder as Registry['housings.index']['types'],
  },
  'housings.store': {
    methods: ["POST"],
    pattern: '/api/auth/housings',
    tokens: [{"old":"/api/auth/housings","type":0,"val":"api","end":""},{"old":"/api/auth/housings","type":0,"val":"auth","end":""},{"old":"/api/auth/housings","type":0,"val":"housings","end":""}],
    types: placeholder as Registry['housings.store']['types'],
  },
  'housings.create_many': {
    methods: ["POST"],
    pattern: '/api/auth/housings/many',
    tokens: [{"old":"/api/auth/housings/many","type":0,"val":"api","end":""},{"old":"/api/auth/housings/many","type":0,"val":"auth","end":""},{"old":"/api/auth/housings/many","type":0,"val":"housings","end":""},{"old":"/api/auth/housings/many","type":0,"val":"many","end":""}],
    types: placeholder as Registry['housings.create_many']['types'],
  },
  'housings.update_many': {
    methods: ["PUT"],
    pattern: '/api/auth/housings/many',
    tokens: [{"old":"/api/auth/housings/many","type":0,"val":"api","end":""},{"old":"/api/auth/housings/many","type":0,"val":"auth","end":""},{"old":"/api/auth/housings/many","type":0,"val":"housings","end":""},{"old":"/api/auth/housings/many","type":0,"val":"many","end":""}],
    types: placeholder as Registry['housings.update_many']['types'],
  },
  'housings.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/housings/:id',
    tokens: [{"old":"/api/auth/housings/:id","type":0,"val":"api","end":""},{"old":"/api/auth/housings/:id","type":0,"val":"auth","end":""},{"old":"/api/auth/housings/:id","type":0,"val":"housings","end":""},{"old":"/api/auth/housings/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['housings.show']['types'],
  },
  'housings.update': {
    methods: ["PUT"],
    pattern: '/api/auth/housings/:id',
    tokens: [{"old":"/api/auth/housings/:id","type":0,"val":"api","end":""},{"old":"/api/auth/housings/:id","type":0,"val":"auth","end":""},{"old":"/api/auth/housings/:id","type":0,"val":"housings","end":""},{"old":"/api/auth/housings/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['housings.update']['types'],
  },
  'housings.destroy': {
    methods: ["DELETE"],
    pattern: '/api/auth/housings/:id',
    tokens: [{"old":"/api/auth/housings/:id","type":0,"val":"api","end":""},{"old":"/api/auth/housings/:id","type":0,"val":"auth","end":""},{"old":"/api/auth/housings/:id","type":0,"val":"housings","end":""},{"old":"/api/auth/housings/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['housings.destroy']['types'],
  },
  'reservations.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/reservations',
    tokens: [{"old":"/api/auth/reservations","type":0,"val":"api","end":""},{"old":"/api/auth/reservations","type":0,"val":"auth","end":""},{"old":"/api/auth/reservations","type":0,"val":"reservations","end":""}],
    types: placeholder as Registry['reservations.index']['types'],
  },
  'reservations.store': {
    methods: ["POST"],
    pattern: '/api/auth/reservations',
    tokens: [{"old":"/api/auth/reservations","type":0,"val":"api","end":""},{"old":"/api/auth/reservations","type":0,"val":"auth","end":""},{"old":"/api/auth/reservations","type":0,"val":"reservations","end":""}],
    types: placeholder as Registry['reservations.store']['types'],
  },
  'reservations.create_many': {
    methods: ["POST"],
    pattern: '/api/auth/reservations/many',
    tokens: [{"old":"/api/auth/reservations/many","type":0,"val":"api","end":""},{"old":"/api/auth/reservations/many","type":0,"val":"auth","end":""},{"old":"/api/auth/reservations/many","type":0,"val":"reservations","end":""},{"old":"/api/auth/reservations/many","type":0,"val":"many","end":""}],
    types: placeholder as Registry['reservations.create_many']['types'],
  },
  'reservations.update_many': {
    methods: ["PUT"],
    pattern: '/api/auth/reservations/many',
    tokens: [{"old":"/api/auth/reservations/many","type":0,"val":"api","end":""},{"old":"/api/auth/reservations/many","type":0,"val":"auth","end":""},{"old":"/api/auth/reservations/many","type":0,"val":"reservations","end":""},{"old":"/api/auth/reservations/many","type":0,"val":"many","end":""}],
    types: placeholder as Registry['reservations.update_many']['types'],
  },
  'reservations.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/reservations/:id',
    tokens: [{"old":"/api/auth/reservations/:id","type":0,"val":"api","end":""},{"old":"/api/auth/reservations/:id","type":0,"val":"auth","end":""},{"old":"/api/auth/reservations/:id","type":0,"val":"reservations","end":""},{"old":"/api/auth/reservations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['reservations.show']['types'],
  },
  'reservations.update': {
    methods: ["PUT"],
    pattern: '/api/auth/reservations/:id',
    tokens: [{"old":"/api/auth/reservations/:id","type":0,"val":"api","end":""},{"old":"/api/auth/reservations/:id","type":0,"val":"auth","end":""},{"old":"/api/auth/reservations/:id","type":0,"val":"reservations","end":""},{"old":"/api/auth/reservations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['reservations.update']['types'],
  },
  'reservations.destroy': {
    methods: ["DELETE"],
    pattern: '/api/auth/reservations/:id',
    tokens: [{"old":"/api/auth/reservations/:id","type":0,"val":"api","end":""},{"old":"/api/auth/reservations/:id","type":0,"val":"auth","end":""},{"old":"/api/auth/reservations/:id","type":0,"val":"reservations","end":""},{"old":"/api/auth/reservations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['reservations.destroy']['types'],
  },
  'cleaning_reviews.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/cleaning-reviews',
    tokens: [{"old":"/api/auth/cleaning-reviews","type":0,"val":"api","end":""},{"old":"/api/auth/cleaning-reviews","type":0,"val":"auth","end":""},{"old":"/api/auth/cleaning-reviews","type":0,"val":"cleaning-reviews","end":""}],
    types: placeholder as Registry['cleaning_reviews.index']['types'],
  },
  'cleaning_reviews.store': {
    methods: ["POST"],
    pattern: '/api/auth/cleaning-reviews',
    tokens: [{"old":"/api/auth/cleaning-reviews","type":0,"val":"api","end":""},{"old":"/api/auth/cleaning-reviews","type":0,"val":"auth","end":""},{"old":"/api/auth/cleaning-reviews","type":0,"val":"cleaning-reviews","end":""}],
    types: placeholder as Registry['cleaning_reviews.store']['types'],
  },
  'cleaning_reviews.create_many': {
    methods: ["POST"],
    pattern: '/api/auth/cleaning-reviews/many',
    tokens: [{"old":"/api/auth/cleaning-reviews/many","type":0,"val":"api","end":""},{"old":"/api/auth/cleaning-reviews/many","type":0,"val":"auth","end":""},{"old":"/api/auth/cleaning-reviews/many","type":0,"val":"cleaning-reviews","end":""},{"old":"/api/auth/cleaning-reviews/many","type":0,"val":"many","end":""}],
    types: placeholder as Registry['cleaning_reviews.create_many']['types'],
  },
  'cleaning_reviews.update_many': {
    methods: ["PUT"],
    pattern: '/api/auth/cleaning-reviews/many',
    tokens: [{"old":"/api/auth/cleaning-reviews/many","type":0,"val":"api","end":""},{"old":"/api/auth/cleaning-reviews/many","type":0,"val":"auth","end":""},{"old":"/api/auth/cleaning-reviews/many","type":0,"val":"cleaning-reviews","end":""},{"old":"/api/auth/cleaning-reviews/many","type":0,"val":"many","end":""}],
    types: placeholder as Registry['cleaning_reviews.update_many']['types'],
  },
  'cleaning_reviews.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/cleaning-reviews/:id',
    tokens: [{"old":"/api/auth/cleaning-reviews/:id","type":0,"val":"api","end":""},{"old":"/api/auth/cleaning-reviews/:id","type":0,"val":"auth","end":""},{"old":"/api/auth/cleaning-reviews/:id","type":0,"val":"cleaning-reviews","end":""},{"old":"/api/auth/cleaning-reviews/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['cleaning_reviews.show']['types'],
  },
  'cleaning_reviews.update': {
    methods: ["PUT"],
    pattern: '/api/auth/cleaning-reviews/:id',
    tokens: [{"old":"/api/auth/cleaning-reviews/:id","type":0,"val":"api","end":""},{"old":"/api/auth/cleaning-reviews/:id","type":0,"val":"auth","end":""},{"old":"/api/auth/cleaning-reviews/:id","type":0,"val":"cleaning-reviews","end":""},{"old":"/api/auth/cleaning-reviews/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['cleaning_reviews.update']['types'],
  },
  'cleaning_reviews.destroy': {
    methods: ["DELETE"],
    pattern: '/api/auth/cleaning-reviews/:id',
    tokens: [{"old":"/api/auth/cleaning-reviews/:id","type":0,"val":"api","end":""},{"old":"/api/auth/cleaning-reviews/:id","type":0,"val":"auth","end":""},{"old":"/api/auth/cleaning-reviews/:id","type":0,"val":"cleaning-reviews","end":""},{"old":"/api/auth/cleaning-reviews/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['cleaning_reviews.destroy']['types'],
  },
  'cleaning_reviews.send_invitation': {
    methods: ["POST"],
    pattern: '/api/auth/cleaning-reviews/:id/send-invitation',
    tokens: [{"old":"/api/auth/cleaning-reviews/:id/send-invitation","type":0,"val":"api","end":""},{"old":"/api/auth/cleaning-reviews/:id/send-invitation","type":0,"val":"auth","end":""},{"old":"/api/auth/cleaning-reviews/:id/send-invitation","type":0,"val":"cleaning-reviews","end":""},{"old":"/api/auth/cleaning-reviews/:id/send-invitation","type":1,"val":"id","end":""},{"old":"/api/auth/cleaning-reviews/:id/send-invitation","type":0,"val":"send-invitation","end":""}],
    types: placeholder as Registry['cleaning_reviews.send_invitation']['types'],
  },
  'dashboard.stats': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/dashboard/stats',
    tokens: [{"old":"/api/auth/dashboard/stats","type":0,"val":"api","end":""},{"old":"/api/auth/dashboard/stats","type":0,"val":"auth","end":""},{"old":"/api/auth/dashboard/stats","type":0,"val":"dashboard","end":""},{"old":"/api/auth/dashboard/stats","type":0,"val":"stats","end":""}],
    types: placeholder as Registry['dashboard.stats']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
