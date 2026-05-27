"use client"

import { cn } from "@packages/functions"
import { Button } from "@packages/ui/button"
import { Checkbox } from "@packages/ui/checkbox"
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Mail,
  Package,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react"
import { FunctionComponent, useState, useTransition } from "react"

type AiOutput = {
  summary?: string
  score?: number
  positiveAspects?: string[]
  negativeAspects?: string[]
  toDo?: string[]
  missingProducts?: string[]
  detectedObjects?: string[]
}

type AiOutputDisplayProps = {
  aiOutput: AiOutput
  /** employee mode: shows todo checklist + notify buttons. admin mode: read-only display. */
  mode?: "employee" | "admin"
  uri?: string
  apiUrl?: string
  /** Link to the admin review page, sent in emails */
  appReviewLink?: string
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.round((score / 10) * 100)
  const color =
    score >= 8
      ? "text-green-500"
      : score >= 5
        ? "text-amber-500"
        : "text-red-500"
  const bg =
    score >= 8
      ? "bg-green-50 dark:bg-green-950/30"
      : score >= 5
        ? "bg-amber-50 dark:bg-amber-950/30"
        : "bg-red-50 dark:bg-red-950/30"

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl p-6",
        bg
      )}
    >
      <div className="relative flex items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            className="text-muted/20"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className={cn("transition-all duration-700", color)}
          />
        </svg>
        <span className={cn("absolute text-2xl font-bold tabular-nums", color)}>
          {score}
        </span>
      </div>
      <p className="text-xs font-medium text-muted-foreground">Score / 10</p>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: typeof CheckCircle2
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-3 rounded-2xl border bg-card p-5", className)}>
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export const AiOutputDisplay: FunctionComponent<AiOutputDisplayProps> = ({
  aiOutput,
  mode = "admin",
  uri,
  apiUrl,
  appReviewLink = "",
}) => {
  const {
    summary,
    score,
    positiveAspects = [],
    negativeAspects = [],
    toDo = [],
    missingProducts = [],
  } = aiOutput

  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [reviewRequested, setReviewRequested] = useState(false)
  const [isPendingReview, startReviewTransition] = useTransition()

  const allChecked = toDo.length > 0 && toDo.every((_, i) => checked[i])

  const toggle = (i: number) =>
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }))

  const handleRequestNewReview = () => {
    if (!uri || !apiUrl) return
    startReviewTransition(async () => {
      await fetch(`${apiUrl}/api/public/reviews/${uri}/request-new-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toDoItems: toDo, appReviewLink }),
      })
      setReviewRequested(true)
    })
  }

  return (
    <div className="space-y-4">
      {/* Score + Summary */}
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-[auto_1fr]">
        {score !== undefined && <ScoreRing score={score} />}
        {toDo.length > 0 && (
          <Section icon={ClipboardList} title="To-do" className="flex-1">
            <ul className="space-y-3">
              {toDo.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  {mode === "employee" ? (
                    <Checkbox
                      id={`todo-${i}`}
                      checked={!!checked[i]}
                      onCheckedChange={() => toggle(i)}
                      className="mt-0.5 shrink-0"
                    />
                  ) : (
                    <div className="mt-0.5 size-4 shrink-0 rounded border border-muted-foreground/30" />
                  )}
                  <label
                    htmlFor={mode === "employee" ? `todo-${i}` : undefined}
                    className={cn(
                      "text-sm leading-snug",
                      mode === "employee" && "cursor-pointer",
                      checked[i] && "text-muted-foreground line-through"
                    )}
                  >
                    {item}
                  </label>
                </li>
              ))}
            </ul>

            {mode === "employee" && (
              <div className="pt-2">
                {reviewRequested ? (
                  <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
                    <CheckCircle2 className="size-4 shrink-0" />
                    New review requested — the manager has been notified.
                  </div>
                ) : (
                  <Button
                    className="w-full gap-2"
                    disabled={!allChecked || isPendingReview}
                    onClick={handleRequestNewReview}
                  >
                    {isPendingReview ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Mail className="size-4" />
                    )}
                    Request a new review
                  </Button>
                )}
                {!allChecked && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Check all tasks above to unlock this button.
                  </p>
                )}
              </div>
            )}
          </Section>
        )}
      </div>

      {/* Positive aspects */}
      {positiveAspects.length > 0 && (
        <Section icon={ThumbsUp} title="Positive aspects">
          <ul className="space-y-2">
            {positiveAspects.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Negative aspects */}
      {negativeAspects.length > 0 && (
        <Section icon={ThumbsDown} title="Points to improve">
          <ul className="space-y-2">
            {negativeAspects.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {summary && (
        <Section icon={Sparkles} title="Summary" className="flex-1">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        </Section>
      )}
      {/* Missing products — admin only (employees use voice messages instead) */}
      {missingProducts.length > 0 && mode === "admin" && (
        <Section icon={Package} title="Missing products">
          <ul className="space-y-2">
            {missingProducts.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-orange-400" />
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}
