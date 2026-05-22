import { spawn, type ChildProcess } from "node:child_process"

const COLORS: Record<string, string> = {
  web: "\x1b[36m",
  admin: "\x1b[35m",
  api: "\x1b[33m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
}

function prefix(name: string): string {
  const color = COLORS[name] ?? "\x1b[37m"
  return `${color}${COLORS["bold"]}[${name}]${COLORS["reset"]} `
}

function prefixLines(label: string, data: Buffer): string {
  const p = prefix(label)
  return data
    .toString()
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => p + line)
    .join("\n") + "\n"
}

export interface Task {
  name: string
  cmd: string
  args?: string[]
}

export async function runParallel(tasks: Task[]): Promise<void> {
  const processes: ChildProcess[] = []

  for (const task of tasks) {
    const child = spawn(task.cmd, task.args ?? [], {
      stdio: ["inherit", "pipe", "pipe"],
      shell: process.platform === "win32",
    })

    child.stdout?.on("data", (data: Buffer) => process.stdout.write(prefixLines(task.name, data)))
    child.stderr?.on("data", (data: Buffer) => process.stderr.write(prefixLines(task.name, data)))

    child.on("close", (code) => {
      if (code !== 0 && code !== null) {
        console.error(`${COLORS["red"]}[${task.name}] exited with code ${code}${COLORS["reset"]}`)
      }
    })

    processes.push(child)
  }

  const cleanup = () => {
    processes.forEach((p) => p.kill("SIGINT"))
  }

  process.on("SIGINT", cleanup)
  process.on("SIGTERM", cleanup)

  await Promise.all(
    processes.map(
      (p) =>
        new Promise<void>((resolve) => {
          p.on("close", () => resolve())
        })
    )
  )
}

export async function runSequential(tasks: Task[]): Promise<void> {
  for (const task of tasks) {
    console.log(`${COLORS["green"]}${COLORS["bold"]}→ ${task.name}${COLORS["reset"]}`)

    await new Promise<void>((resolve, reject) => {
      const child = spawn(task.cmd, task.args ?? [], {
        stdio: "inherit",
        shell: process.platform === "win32",
      })

      child.on("close", (code) => {
        if (code === 0) resolve()
        else reject(new Error(`"${task.name}" failed with exit code ${code}`))
      })
    })
  }
}
