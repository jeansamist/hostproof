import { getI18n } from "@/lib/i18n/server"
import { CleaningReviewForm } from "@/components/forms/cleaning-review.form"
import { getCleaningReviews } from "@/services/cleaning-review.services"
import { getEmployees } from "@/services/employee.services"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ locale: string; cleaningReviewId: string }>
}

export default async function EditCleaningReviewPage({ params }: PageProps) {
  const { locale, cleaningReviewId } = await params
  const returnUrl = `/${locale}/app/cleaning-review`

  const [t, reviewsResult, employees] = await Promise.all([
    getI18n(),
    getCleaningReviews(1, 200),
    getEmployees(),
  ])

  const review = reviewsResult?.data.find(
    (r) => r.id === Number(cleaningReviewId)
  )

  if (!review) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <Link
          href={returnUrl}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {t("cleaningReview.edit.back")}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{t("cleaningReview.edit.title")}</h1>
        <p className="text-sm text-muted-foreground">
          Update the details for review #{review.id}.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <CleaningReviewForm
          review={review}
          employees={employees}
          returnUrl={returnUrl}
        />
      </div>
    </div>
  )
}
