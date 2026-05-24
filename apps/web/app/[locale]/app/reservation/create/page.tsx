import { getI18n } from "@/lib/i18n/server"
import { ReservationForm } from "@/components/forms/reservation.form"
import { getHousings } from "@/services/housing.services"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function CreateReservationPage({ params }: PageProps) {
  const { locale } = await params
  const returnUrl = `/${locale}/app/reservation`

  const [t, housings] = await Promise.all([getI18n(), getHousings()])

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <Link
          href={returnUrl}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {t("reservation.create.back")}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{t("reservation.create.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("reservation.create.description")}</p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <ReservationForm housings={housings} returnUrl={returnUrl} />
      </div>
    </div>
  )
}
