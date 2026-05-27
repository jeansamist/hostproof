"use client"

import { cn } from "@packages/functions"
import { useEffect, useState } from "react"

const CONTENT = {
  fr: {
    videoLabel: "Analyse IA en cours…",
    aiLabel: "Vérification IA",
    items: [
      { label: "Serviettes", ok: true },
      { label: "Savon & shampoing", ok: true },
      { label: "Eau en bouteille", ok: true },
      { label: "Rouleaux PQ", ok: false },
    ],
    missingBadge: "Manquant !",
    scoreLabel: "Score",
  },
  en: {
    videoLabel: "AI scanning…",
    aiLabel: "AI Check",
    items: [
      { label: "Towels", ok: true },
      { label: "Soap & shampoo", ok: true },
      { label: "Bottled water", ok: true },
      { label: "Toilet paper", ok: false },
    ],
    missingBadge: "Missing!",
    scoreLabel: "Score",
  },
} as const

type Props = { locale: string }

export function PhoneProto({ locale }: Props) {
  const [cycle, setCycle] = useState(0)
  const [scanDone, setScanDone] = useState(false)
  const [itemsVisible, setItemsVisible] = useState(0)

  const content = CONTENT[(locale as keyof typeof CONTENT)] ?? CONTENT.fr

  useEffect(() => {
    setScanDone(false)
    setItemsVisible(0)

    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setScanDone(true), 1900))
    content.items.forEach((_, i) => {
      timers.push(setTimeout(() => setItemsVisible(i + 1), 2400 + i * 480))
    })
    timers.push(setTimeout(() => setCycle((c) => c + 1), 9000))

    return () => timers.forEach(clearTimeout)
  }, [cycle]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    /* Phone shell */
    <div className="relative w-[196px] shrink-0 select-none">
      <div className="bg-card border-2 border-border rounded-[2.8rem] px-2.5 pt-3 pb-4">
        {/* Top notch */}
        <div className="w-16 h-5 bg-secondary border border-border/60 rounded-b-2xl mx-auto mb-2 flex items-center justify-center gap-1.5">
          <div className="w-4 h-1 rounded-full bg-border" />
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
        </div>

        {/* Screen */}
        <div className="bg-background rounded-2xl overflow-hidden border border-border/40">

          {/* Video area */}
          <div className="relative h-[72px] overflow-hidden bg-muted">
            {/* Room illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-2 opacity-30">
                <div className="w-8 h-10 bg-foreground/40 rounded-sm" />
                <div className="w-14 h-10 bg-foreground/20 rounded-sm" />
                <div className="w-8 h-8 bg-foreground/30 rounded-sm self-end" />
              </div>
            </div>

            {/* Scanning bar */}
            {!scanDone && (
              <div
                className="absolute bottom-0 left-0 h-[2px] bg-primary"
                style={{ animation: "lp-scan-grow 1.9s ease-in-out forwards" }}
              />
            )}

            {/* Scan label */}
            {!scanDone && (
              <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between">
                <span
                  className="text-[9px] font-medium text-primary"
                  style={{ animation: "lp-pulse-scan 1.1s ease-in-out infinite" }}
                >
                  {content.videoLabel}
                </span>
                <span className="text-[8px] text-muted-foreground bg-background/60 px-1 py-0.5 rounded">
                  📹
                </span>
              </div>
            )}

            {/* Done overlay */}
            {scanDone && (
              <div
                className="absolute inset-0 bg-primary/6 flex items-center justify-center"
                style={{ animation: "lp-fade-in 0.3s ease-out both" }}
              >
                <span className="text-xs">✓</span>
              </div>
            )}
          </div>

          {/* AI label row */}
          {scanDone && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent/60 border-b border-border/40"
              style={{ animation: "lp-fade-up 0.25s ease-out both" }}
            >
              <span className="text-primary text-[10px]">⚡</span>
              <span className="text-[9px] font-semibold text-primary uppercase tracking-wide">
                {content.aiLabel}
              </span>
              <span className="ml-auto text-[9px] font-bold text-primary">
                9/10
              </span>
            </div>
          )}

          {/* Checklist items */}
          <div className="px-2 py-2 flex flex-col gap-1">
            {content.items.map((item, i) =>
              i < itemsVisible ? (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2 py-1.5",
                    item.ok
                      ? "bg-green-50 dark:bg-green-950/30"
                      : "bg-red-50 dark:bg-red-950/30",
                  )}
                  style={{ animation: "lp-fade-up 0.28s ease-out both" }}
                >
                  <span
                    className={cn(
                      "flex items-center gap-1 text-[9.5px] font-medium",
                      item.ok
                        ? "text-green-800 dark:text-green-400"
                        : "text-red-800 dark:text-red-400",
                    )}
                  >
                    <span>{item.ok ? "✓" : "⚠"}</span>
                    {item.label}
                  </span>
                  {!item.ok && (
                    <span className="text-[8px] font-bold text-red-600 dark:text-red-400 shrink-0">
                      {content.missingBadge}
                    </span>
                  )}
                </div>
              ) : (
                <div
                  key={i}
                  className="h-6 rounded-lg bg-muted animate-pulse"
                />
              ),
            )}
          </div>
        </div>

        {/* Home indicator */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2.5" />
      </div>

      {/* Side buttons */}
      <div className="absolute left-[-4px] top-20 w-[3px] h-7 bg-border rounded-l-sm" />
      <div className="absolute left-[-4px] top-[118px] w-[3px] h-10 bg-border rounded-l-sm" />
      <div className="absolute right-[-4px] top-[108px] w-[3px] h-12 bg-border rounded-r-sm" />
    </div>
  )
}
