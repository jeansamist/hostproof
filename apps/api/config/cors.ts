import { defineConfig } from '@adonisjs/cors'

const corsConfig = defineConfig({
  enabled: true,

  /**
   * In development allow every origin.
   * In production read CORS_ORIGIN (comma-separated list of allowed origins).
   * Example: CORS_ORIGIN=https://clean-pilot.online,https://www.clean-pilot.online
   */
  origin: true,

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
