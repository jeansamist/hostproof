/**
 * Run web + api in parallel (default dev workflow).
 * Usage: pnpm dev:app
 *        pnpm dev:app -- web        (web only)
 *        pnpm dev:app -- api        (api only)
 */
import { runParallel, type Task } from "./utils/process.js"

const ALL_APPS: Task[] = [
  { name: "web", cmd: "pnpm", args: ["--filter", "web", "dev"] },
  { name: "api", cmd: "pnpm", args: ["--filter", "api", "dev"] },
]

const args = process.argv.slice(2)
const tasks = args.length > 0 ? ALL_APPS.filter((t) => args.includes(t.name)) : ALL_APPS

if (tasks.length === 0) {
  console.error(`Unknown app(s): ${args.join(", ")}. Available: ${ALL_APPS.map((t) => t.name).join(", ")}`)
  process.exit(1)
}

await runParallel(tasks)
