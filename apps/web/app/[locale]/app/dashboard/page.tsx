import { getDashboardStats } from "@/services/dashboard.services"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@packages/ui/card"
import { CalendarClock, CheckCircle2, House, Users } from "lucide-react"

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const metrics = [
    {
      title: "Total Housings",
      value: stats?.totalHousings ?? 0,
      icon: House,
      description: "Properties in your workspace",
    },
    {
      title: "Total Employees",
      value: stats?.totalEmployees ?? 0,
      icon: Users,
      description: "Cleaning team members",
    },
    {
      title: "Upcoming Reservations",
      value: stats?.upcomingReservations ?? 0,
      icon: CalendarClock,
      description: "Check-ins from today onwards",
    },
    {
      title: "Succeeded Reviews",
      value: stats?.succeededCleaningReviews ?? 0,
      icon: CheckCircle2,
      description: "Cleaning reviews marked Done",
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your workspace activity
        </p>
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
