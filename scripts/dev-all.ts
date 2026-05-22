/**
 * Run all apps (web + admin + api) in parallel.
 * Usage: pnpm dev
 */
import { runParallel } from "./utils/process.js"

await runParallel([
  { name: "web", cmd: "pnpm", args: ["--filter", "web", "dev"] },
  { name: "admin", cmd: "pnpm", args: ["--filter", "admin", "dev"] },
  { name: "api", cmd: "pnpm", args: ["--filter", "api", "dev"] },
])
