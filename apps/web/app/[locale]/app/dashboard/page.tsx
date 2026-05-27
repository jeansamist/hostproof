import { RefreshButton } from "@/components/customs/refresh-button"
import { getI18n } from "@/lib/i18n/server"
import { getCleaningReviews } from "@/services/cleaning-review.services"
import { getDashboardStats } from "@/services/dashboard.services"
import { Badge } from "@packages/ui/badge"
import { Button } from "@packages/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@packages/ui/card"
import { cn } from "@packages/functions"
import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  House,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react"
import Link from "next/link"

type PageProps = {
  params: Promise<{ locale: string }>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = await params

  const [t, stats, reviewsResult] = await Promise.all([
    getI18n(),
    getDashboardStats(),
    getCleaningReviews(1, 5),
  ])

  const recentReviews = reviewsResult?.data ?? []

  const STATUS_CONFIG: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 | null }
  > = {
    Created: { label: t("cleaningReview.status.created"), variant: "outline", icon: null },
    "AI Analizing": { label: t("cleaningReview.status.aiAnalysing"), variant: "secondary", icon: Sparkles },
    Analized: { label: t("cleaningReview.status.analysed"), variant: "secondary", icon: Sparkles },
    Done: { label: t("cleaningReview.status.done"), variant: "default", icon: CheckCircle2 },
    Failed: { label: t("cleaningReview.status.failed"), variant: "destructive", icon: XCircle },
  }

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.description")}</p>
        </div>
        <RefreshButton label={t("dashboard.refresh")} />
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

      {/* Recent cleaning reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{t("dashboard.recentReviews.title")}</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${locale}/app/cleaning-review`}>
              <ExternalLink className="size-3.5" />
              {t("dashboard.recentReviews.viewAll")}
            </Link>
          </Button>
        </div>

        <div className="rounded-2xl border overflow-hidden">
          {recentReviews.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {t("dashboard.recentReviews.empty")}
            </p>
          ) : (
            <div className="divide-y">
              {recentReviews.map((r) => {
                const cfg = STATUS_CONFIG[r.status] ?? {
                  label: r.status,
                  variant: "secondary" as const,
                  icon: null,
                }
                const Icon = cfg.icon
                return (
                  <Link
                    key={r.id}
                    href={`/${locale}/app/cleaning-review/${r.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {r.housing?.name ?? `Reservation #${r.reservationId}`}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {r.employee?.fullName ?? t("dashboard.review.noEmployee")} · {formatDate(r.createdAt)}
                      </p>
                    </div>
                    <Badge variant={cfg.variant} className="flex shrink-0 items-center gap-1">
                      {Icon && (
                        <Icon
                          className={cn(
                            "size-3",
                            r.status === "AI Analizing" && "animate-pulse"
                          )}
                        />
                      )}
                      {cfg.label}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
