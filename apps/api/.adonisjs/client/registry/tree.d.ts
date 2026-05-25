/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  eventStream: typeof routes['event_stream']
  subscribe: typeof routes['subscribe']
  unsubscribe: typeof routes['unsubscribe']
  publicReviews: {
    show: typeof routes['public_reviews.show']
    submit: typeof routes['public_reviews.submit']
    requestNewReview: typeof routes['public_reviews.request_new_review']
    notifyMissingProducts: typeof routes['public_reviews.notify_missing_products']
  }
  auth: {
    signUp: typeof routes['auth.sign_up']
    verifyEmail: typeof routes['auth.verify_email']
    signIn: typeof routes['auth.sign_in']
    forgotPassword: typeof routes['auth.forgot_password']
    resetPassword: typeof routes['auth.reset_password']
    logout: typeof routes['auth.logout']
    deleteAccount: typeof routes['auth.delete_account']
    profile: typeof routes['auth.profile']
    updateProfile: typeof routes['auth.update_profile']
  }
  uploads: {
    store: typeof routes['uploads.store']
  }
  employees: {
    index: typeof routes['employees.index']
    store: typeof routes['employees.store']
    createMany: typeof routes['employees.create_many']
    updateMany: typeof routes['employees.update_many']
    show: typeof routes['employees.show']
    update: typeof routes['employees.update']
    destroy: typeof routes['employees.destroy']
  }
  housings: {
    index: typeof routes['housings.index']
    store: typeof routes['housings.store']
    createMany: typeof routes['housings.create_many']
    updateMany: typeof routes['housings.update_many']
    show: typeof routes['housings.show']
    update: typeof routes['housings.update']
    destroy: typeof routes['housings.destroy']
  }
  reservations: {
    index: typeof routes['reservations.index']
    store: typeof routes['reservations.store']
    createMany: typeof routes['reservations.create_many']
    updateMany: typeof routes['reservations.update_many']
    show: typeof routes['reservations.show']
    update: typeof routes['reservations.update']
    destroy: typeof routes['reservations.destroy']
  }
  cleaningReviews: {
    index: typeof routes['cleaning_reviews.index']
    store: typeof routes['cleaning_reviews.store']
    createMany: typeof routes['cleaning_reviews.create_many']
    updateMany: typeof routes['cleaning_reviews.update_many']
    show: typeof routes['cleaning_reviews.show']
    update: typeof routes['cleaning_reviews.update']
    destroy: typeof routes['cleaning_reviews.destroy']
    sendInvitation: typeof routes['cleaning_reviews.send_invitation']
  }
  dashboard: {
    stats: typeof routes['dashboard.stats']
  }
}
