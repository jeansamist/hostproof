import { getI18n } from "@/lib/i18n/server"
import { getDashboardStats } from "@/services/dashboard.services"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@packages/ui/card"
import { CalendarClock, CheckCircle2, House, Users } from "lucide-react"

export default async function DashboardPage() {
  const [t, stats] = await Promise.all([getI18n(), getDashboardStats()])

  const metrics = [
    {
      title: t("dashboard.metric.totalHousings"),
      value: stats?.totalHousings ?? 0,
      icon: House,
      description: t("dashboard.metric.totalHousings.description"),
    },
    {
      title: t("dashboard.metric.totalEmployees"),
      value: stats?.totalEmployees ?? 0,
      icon: Users,
      description: t("dashboard.metric.totalEmployees.description"),
    },
    {
      title: t("dashboard.metric.upcomingReservations"),
      value: stats?.upcomingReservations ?? 0,
      icon: CalendarClock,
      description: t("dashboard.metric.upcomingReservations.description"),
    },
    {
      title: t("dashboard.metric.succeededReviews"),
      value: stats?.succeededCleaningReviews ?? 0,
      icon: CheckCircle2,
      description: t("dashboard.metric.succeededReviews.description"),
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.description")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ title, value, icon: Icon, description }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <CardAction>
                <div className="flex size-8 items-center justify-center rounded-xl bg-accent">
                  <Icon className="size-4 text-accent-foreground" />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
