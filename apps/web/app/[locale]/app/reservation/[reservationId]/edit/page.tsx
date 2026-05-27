import { getI18n } from "@/lib/i18n/server"
import { setStaticParamsLocale } from "next-international/server"
import { ReservationForm } from "@/components/forms/reservation.form"
import { getHousings } from "@/services/housing.services"
import { getReservationById } from "@/services/reservation.services"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ locale: string; reservationId: string }>
}

export default async function EditReservationPage({ params }: PageProps) {
  const { locale, reservationId } = await params
  setStaticParamsLocale(locale)
  const returnUrl = `/${locale}/app/reservation`

  const [t, reservation, housings] = await Promise.all([
    getI18n(),
    getReservationById(Number(reservationId)),
    getHousings(),
  ])

  if (!reservation) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <Link
          href={returnUrl}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {t("reservation.edit.back")}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{t("reservation.edit.title")}</h1>
        <p className="text-sm text-muted-foreground">
          Update the details for reservation #{reservation.id}.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <ReservationForm housings={housings} reservation={reservation} returnUrl={returnUrl} />
      </div>
    </div>
  )
}
