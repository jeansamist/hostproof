import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/cors'
import env from '#start/env'

const corsConfig = defineConfig({
  enabled: true,

  /**
   * In development allow every origin.
   * In production read CORS_ORIGIN (comma-separated list of allowed origins).
   * Example: CORS_ORIGIN=https://clean-pilot.online,https://www.clean-pilot.online
   */
  origin: app.inDev
    ? true
    : (env.get('CORS_ORIGIN', '') as string)
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),

  /**
   * HTTP methods accepted for cross-origin requests.
   */
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],

  /**
   * Reflect request headers by default. Use a string array to restrict
   * allowed headers.
   */
  headers: true,

  /**
   * Response headers exposed to the browser.
   */
  exposeHeaders: [],

  /**
   * Allow cookies/authorization headers on cross-origin requests.
   */
  credentials: true,

  /**
   * Cache CORS preflight response for N seconds.
   */
  maxAge: 90,
})

export default corsConfig
