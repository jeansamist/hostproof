import { getI18n } from "@/lib/i18n/server"
import { CleaningReviewStepper } from "@/components/customs/cleaning-review-stepper"
import { getEmployees } from "@/services/employee.services"
import { getHousings } from "@/services/housing.services"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function CreateCleaningReviewPage({ params }: PageProps) {
  const { locale } = await params
  const returnUrl = `/${locale}/app/cleaning-review`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

  const [t, employees, housings] = await Promise.all([
    getI18n(),
    getEmployees(),
    getHousings(),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <Link
          href={returnUrl}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {t("cleaningReview.create.back")}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{t("cleaningReview.create.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("cleaningReview.create.description")}</p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <CleaningReviewStepper
          housings={housings}
          employees={employees}
          locale={locale}
          appUrl={appUrl}
          apiUrl={apiUrl}
        />
      </div>
    </div>
  )
}
