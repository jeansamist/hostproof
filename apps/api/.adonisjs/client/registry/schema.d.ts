/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'event_stream': {
    methods: ["GET","HEAD"]
    pattern: '/__transmit/events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'subscribe': {
    methods: ["POST"]
    pattern: '/__transmit/subscribe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'unsubscribe': {
    methods: ["POST"]
    pattern: '/__transmit/unsubscribe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'public_reviews.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/public/reviews/:uri'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uri: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_reviews_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_reviews_controller').default['show']>>>
    }
  }
  'public_reviews.submit': {
    methods: ["POST"]
    pattern: '/api/public/reviews/:uri/submit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uri: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_reviews_controller').default['submit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_reviews_controller').default['submit']>>>
    }
  }
  'public_reviews.retry': {
    methods: ["POST"]
    pattern: '/api/public/reviews/:uri/retry'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uri: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_reviews_controller').default['retry']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_reviews_controller').default['retry']>>>
    }
  }
  'public_reviews.request_new_review': {
    methods: ["POST"]
    pattern: '/api/public/reviews/:uri/request-new-review'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uri: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_reviews_controller').default['requestNewReview']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_reviews_controller').default['requestNewReview']>>>
    }
  }
  'public_reviews.notify_missing_products': {
    methods: ["POST"]
    pattern: '/api/public/reviews/:uri/notify-missing-products'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uri: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_reviews_controller').default['notifyMissingProducts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_reviews_controller').default['notifyMissingProducts']>>>
    }
  }
  'auth.sign_up': {
    methods: ["POST"]
    pattern: '/api/auth/sign-up'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').signUpValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').signUpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['signUp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['signUp']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.verify_email': {
    methods: ["POST"]
    pattern: '/api/auth/verify-email'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').verifyEmailValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').verifyEmailValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['verifyEmail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['verifyEmail']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.sign_in': {
    methods: ["POST"]
    pattern: '/api/auth/sign-in'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').signInValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').signInValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['signIn']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['signIn']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.forgot_password': {
    methods: ["POST"]
    pattern: '/api/auth/forgot-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').forgotPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').forgotPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['forgotPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['forgotPassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.reset_password': {
    methods: ["POST"]
    pattern: '/api/auth/reset-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').resetPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['resetPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['resetPassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/api/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
    }
  }
  'auth.delete_account': {
    methods: ["POST"]
    pattern: '/api/auth/delete-account'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['deleteAccount']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['deleteAccount']>>>
    }
  }
  'auth.profile': {
    methods: ["GET","HEAD"]
    pattern: '/api/auth/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['profile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['profile']>>>
    }
  }
  'auth.update_profile': {
    methods: ["PUT"]
    pattern: '/api/auth/update-profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').updateUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').updateUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['updateProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['updateProfile']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'uploads.store': {
    methods: ["POST"]
    pattern: '/api/auth/uploads'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/upload').uploadValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/upload').uploadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'employees.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/auth/employees'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/pagination').paginateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'employees.store': {
    methods: ["POST"]
    pattern: '/api/auth/employees'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/employee').createEmployeeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/employee').createEmployeeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'employees.create_many': {
    methods: ["POST"]
    pattern: '/api/auth/employees/many'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/employee').createManyEmployeeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/employee').createManyEmployeeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['createMany']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['createMany']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'employees.update_many': {
    methods: ["PUT"]
    pattern: '/api/auth/employees/many'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/employee').updateManyEmployeeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/employee').updateManyEmployeeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['updateMany']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['updateMany']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'employees.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/auth/employees/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['show']>>>
    }
  }
  'employees.update': {
    methods: ["PUT"]
    pattern: '/api/auth/employees/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/employee').updateEmployeeValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/employee').updateEmployeeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'employees.destroy': {
    methods: ["DELETE"]
    pattern: '/api/auth/employees/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['destroy']>>>
    }
  }
  'housings.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/auth/housings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/pagination').paginateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'housings.store': {
    methods: ["POST"]
    pattern: '/api/auth/housings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/housing').createHousingValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/housing').createHousingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'housings.create_many': {
    methods: ["POST"]
    pattern: '/api/auth/housings/many'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/housing').createManyHousingValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/housing').createManyHousingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['createMany']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['createMany']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'housings.update_many': {
    methods: ["PUT"]
    pattern: '/api/auth/housings/many'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/housing').updateManyHousingValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/housing').updateManyHousingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['updateMany']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['updateMany']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'housings.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/auth/housings/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['show']>>>
    }
  }
  'housings.update': {
    methods: ["PUT"]
    pattern: '/api/auth/housings/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/housing').updateHousingValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/housing').updateHousingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'housings.destroy': {
    methods: ["DELETE"]
    pattern: '/api/auth/housings/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/housings_controller').default['destroy']>>>
    }
  }
  'reservations.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/auth/reservations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/pagination').paginateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'reservations.store': {
    methods: ["POST"]
    pattern: '/api/auth/reservations'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/reservation').createReservationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/reservation').createReservationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'reservations.create_many': {
    methods: ["POST"]
    pattern: '/api/auth/reservations/many'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/reservation').createManyReservationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/reservation').createManyReservationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['createMany']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['createMany']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'reservations.update_many': {
    methods: ["PUT"]
    pattern: '/api/auth/reservations/many'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/reservation').updateManyReservationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/reservation').updateManyReservationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['updateMany']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['updateMany']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'reservations.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/auth/reservations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['show']>>>
    }
  }
  'reservations.update': {
    methods: ["PUT"]
    pattern: '/api/auth/reservations/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/reservation').updateReservationValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/reservation').updateReservationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'reservations.destroy': {
    methods: ["DELETE"]
    pattern: '/api/auth/reservations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reservations_controller').default['destroy']>>>
    }
  }
  'cleaning_reviews.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/auth/cleaning-reviews'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/pagination').paginateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cleaning_reviews.store': {
    methods: ["POST"]
    pattern: '/api/auth/cleaning-reviews'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/cleaning_review').createCleaningReviewValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/cleaning_review').createCleaningReviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cleaning_reviews.create_many': {
    methods: ["POST"]
    pattern: '/api/auth/cleaning-reviews/many'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/cleaning_review').createManyCleaningReviewValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/cleaning_review').createManyCleaningReviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['createMany']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['createMany']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cleaning_reviews.update_many': {
    methods: ["PUT"]
    pattern: '/api/auth/cleaning-reviews/many'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/cleaning_review').updateManyCleaningReviewValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/cleaning_review').updateManyCleaningReviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['updateMany']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['updateMany']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cleaning_reviews.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/auth/cleaning-reviews/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['show']>>>
    }
  }
  'cleaning_reviews.update': {
    methods: ["PUT"]
    pattern: '/api/auth/cleaning-reviews/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/cleaning_review').updateCleaningReviewValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/cleaning_review').updateCleaningReviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cleaning_reviews.destroy': {
    methods: ["DELETE"]
    pattern: '/api/auth/cleaning-reviews/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['destroy']>>>
    }
  }
  'cleaning_reviews.send_invitation': {
    methods: ["POST"]
    pattern: '/api/auth/cleaning-reviews/:id/send-invitation'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['sendInvitation']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cleaning_reviews_controller').default['sendInvitation']>>>
    }
  }
  'dashboard.stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/auth/dashboard/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['stats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['stats']>>>
    }
  }
}
