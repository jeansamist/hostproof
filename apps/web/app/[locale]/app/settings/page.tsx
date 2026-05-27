import { SettingsAppearance } from "@/components/customs/settings-appearance"
import { SettingsChecklist } from "@/components/customs/settings-checklist"
import { SettingsEmployees } from "@/components/customs/settings-employees"
import { SettingsHousings } from "@/components/customs/settings-housings"
import { SettingsProfile } from "@/components/customs/settings-profile"
import { getI18n } from "@/lib/i18n/server"
import { getProfile } from "@/services/auth.services"
import { getChecklistItems } from "@/services/checklist-item.services"
import { getEmployees } from "@/services/employee.services"
import { getHousings } from "@/services/housing.services"
import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function SettingsPage({ params }: PageProps) {
  const { locale } = await params

  const [t, user, housings, employees, checklistItems] = await Promise.all([
    getI18n(),
    getProfile(),
    getHousings(),
    getEmployees(),
    getChecklistItems(),
  ])

  if (!user) redirect(`/${locale}/auth/sign-in`)

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.description")}</p>
      </div>

      {/* Profile + Appearance bento row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SettingsProfile user={user} locale={locale} />
        </div>
        <div>
          <SettingsAppearance />
        </div>
      </div>

      {/* Housings */}
      <SettingsHousings initialHousings={housings} />

      {/* Employees */}
      <SettingsEmployees initialEmployees={employees} />

      {/* Default cleaning checklist */}
      <SettingsChecklist initialItems={checklistItems} />
    </div>
  )
}
