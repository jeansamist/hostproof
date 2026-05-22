/**
 * Build the monorepo in the correct order:
 * 1. packages/* (functions, hooks — no build step needed since they export TS directly)
 * 2. apps/* in parallel
 *
 * Usage: pnpm build
 *        pnpm build -- web          (specific app)
 *        pnpm build -- web admin    (multiple apps)
 */
import { runSequential, runParallel, type Task } from "./utils/process.js"

const ALL_APPS: Task[] = [
  { name: "build:web", cmd: "pnpm", args: ["--filter", "web", "build"] },
  { name: "build:admin", cmd: "pnpm", args: ["--filter", "admin", "build"] },
  { name: "build:api", cmd: "pnpm", args: ["--filter", "api", "build"] },
]

const APP_NAMES = ["web", "admin", "api"]

const args = process.argv.slice(2)
const appFilter = args.filter((a) => APP_NAMES.includes(a))

const tasks =
  appFilter.length > 0
    ? ALL_APPS.filter((t) => appFilter.some((a) => t.name.includes(a)))
    : ALL_APPS

if (tasks.length === 0) {
  console.error(`Unknown app(s): ${args.join(", ")}. Available: ${APP_NAMES.join(", ")}`)
  process.exit(1)
}

// Build apps in parallel (packages export TS directly, no build step)
await runParallel(tasks)
