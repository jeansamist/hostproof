"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback } from "react"

type Props = {
  currentLocale: string
}

export function LangSwitch({ currentLocale }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = useCallback(
    (locale: string) => {
      const segments = pathname.split("/")
      segments[1] = locale
      router.push(segments.join("/"))
    },
    [pathname, router],
  )

  return (
    <div className="flex gap-1 bg-secondary border border-border rounded-full px-1.5 py-1">
      {(["fr", "en"] as const).map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`cursor-pointer text-xs font-medium px-3 py-1 rounded-full transition-colors ${
            currentLocale === locale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
