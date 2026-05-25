import { PublicVideoUploader } from "./uploader"
import { getCleaningReviewByUri } from "@/services/cleaning-review.services"

type PageProps = {
  params: Promise<{ locale: string; uri: string }>
}

export default async function PublicReviewPage({ params }: PageProps) {
  const { locale, uri } = await params
  const review = await getCleaningReviewByUri(uri)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const appReviewLink = review ? `${appUrl}/${locale}/app/cleaning-review/${review.id}` : ""

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-lg">
            H
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Cleaning Review</h1>
          {review ? (
            <p className="text-sm text-muted-foreground">
              {review.housing?.name
                ? `${review.housing.name} · ${review.housing.address}`
                : "Please upload your cleaning review video below."}
            </p>
          ) : (
            <p className="text-sm text-destructive">
              This review link is invalid or has expired.
            </p>
          )}
        </div>

        {review && (
          <PublicVideoUploader
            uri={uri}
            review={review}
            apiUrl={apiUrl}
            appReviewLink={appReviewLink}
          />
        )}
      </div>
    </div>
  )
}
