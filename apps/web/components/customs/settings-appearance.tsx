"use client"

import { useI18n } from "@/lib/i18n/client"
import { cn } from "@packages/functions"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { FunctionComponent } from "react"

export const SettingsAppearance: FunctionComponent = () => {
  const t = useI18n()
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: "light", label: t("settings.appearance.theme.light"), icon: Sun },
    { value: "dark", label: t("settings.appearance.theme.dark"), icon: Moon },
    { value: "system", label: t("settings.appearance.theme.system"), icon: Monitor },
  ] as const

  return (
    <div className="rounded-2xl border bg-card divide-y h-full">
      <div className="px-5 py-4">
        <p className="text-sm font-semibold">{t("settings.appearance.title")}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("settings.appearance.description")}</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{t("settings.appearance.theme")}</p>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-colors",
                  theme === value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{t("settings.appearance.language")}</p>
          <div
            className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm opacity-60 cursor-not-allowed"
          >
            <span>{t("settings.appearance.language.english")}</span>
            <span className="text-xs text-muted-foreground rounded-md bg-muted px-2 py-0.5">
              en
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
