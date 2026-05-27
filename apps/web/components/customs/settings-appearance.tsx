"use client"

import { useChangeLocale, useCurrentLocale, useI18n } from "@/lib/i18n/client"
import { cn } from "@packages/functions"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { FunctionComponent } from "react"

export const SettingsAppearance: FunctionComponent = () => {
  const t = useI18n()
  const { theme, setTheme } = useTheme()
  const changeLocale = useChangeLocale()
  const currentLocale = useCurrentLocale()

  const themes = [
    { value: "light", label: t("settings.appearance.theme.light"), icon: Sun },
    { value: "dark", label: t("settings.appearance.theme.dark"), icon: Moon },
    { value: "system", label: t("settings.appearance.theme.system"), icon: Monitor },
  ] as const

  const languages = [
    { value: "fr", label: t("settings.appearance.language.french") },
    { value: "en", label: t("settings.appearance.language.english") },
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
          <div className="grid grid-cols-2 gap-2">
            {languages.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => changeLocale(value)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                  currentLocale === value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span>{label}</span>
                <span className="text-xs rounded-md bg-muted px-2 py-0.5 font-mono">
                  {value}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
