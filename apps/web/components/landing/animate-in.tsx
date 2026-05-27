"use client"

import { cn } from "@packages/functions"
import { useEffect, useRef, useState } from "react"

type Variant = "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale-up"

const FROM: Record<Variant, string> = {
  "fade-up":    "opacity-0 translate-y-6",
  "fade-in":    "opacity-0",
  "slide-left": "opacity-0 -translate-x-8",
  "slide-right":"opacity-0 translate-x-8",
  "scale-up":   "opacity-0 scale-95",
}
const TO: Record<Variant, string> = {
  "fade-up":    "opacity-100 translate-y-0",
  "fade-in":    "opacity-100",
  "slide-left": "opacity-100 translate-x-0",
  "slide-right":"opacity-100 translate-x-0",
  "scale-up":   "opacity-100 scale-100",
}

type Props = {
  children: React.ReactNode
  className?: string
  delay?: number
  variant?: Variant
  threshold?: number
}

export function AnimateIn({
  children,
  className,
  delay = 0,
  variant = "fade-up",
  threshold = 0.1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          obs.disconnect()
        }
      },
      { threshold, rootMargin: "0px 0px -32px 0px" },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out",
        show ? TO[variant] : FROM[variant],
        className,
      )}
    >
      {children}
    </div>
  )
}
