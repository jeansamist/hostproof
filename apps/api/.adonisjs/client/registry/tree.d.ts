/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
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
}
