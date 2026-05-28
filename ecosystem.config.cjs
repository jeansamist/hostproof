/**
 * PM2 Ecosystem — Hostproof Production
 *
 * Ports are read from environment variables so the deploy script (or your
 * shell) can override them without touching this file:
 *
 *   HOSTPROOF_API_PORT   — AdonisJS API        (default: 3333)
 *   HOSTPROOF_WEB_PORT   — Next.js web app     (default: 3000)
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 reload ecosystem.config.cjs --env production   # zero-downtime reload
 *   pm2 stop  ecosystem.config.cjs
 *   pm2 delete ecosystem.config.cjs
 */

"use strict";

const API_PORT = process.env.HOSTPROOF_API_PORT || "1234";
const WEB_PORT = process.env.HOSTPROOF_WEB_PORT || "5050";

module.exports = {
  apps: [
    // ─── AdonisJS API ─────────────────────────────────────────────────────────
    {
      name: "hostproof-api",
      script: "bin/server.js",
      cwd: "./apps/api/build",

      // Single process — AdonisJS is not cluster-safe out of the box.
      instances: 1,
      exec_mode: "fork",

      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 3000,

      // Logging
      out_file: "./logs/api-out.log",
      error_file: "./logs/api-err.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      env_production: {
        NODE_ENV: "production",
        PORT: API_PORT,
        TZ: "UTC",
      },
    },

    // ─── Next.js Web App ──────────────────────────────────────────────────────
    {
      name: "hostproof-web",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "./apps/web",

      // Next.js supports cluster mode via its own internal worker pool.
      // Keep fork mode here; scale horizontally via a reverse proxy if needed.
      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 3000,

      out_file: "./logs/web-out.log",
      error_file: "./logs/web-err.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      env_production: {
        NODE_ENV: "production",
        PORT: WEB_PORT,
        // Set in your .env or pass to the deploy script:
        // NEXT_PUBLIC_API_URL: 'https://api.yourdomain.com',
        // NEXT_PUBLIC_APP_URL: 'https://app.yourdomain.com',
      },
    },
  ],
};
