import { AdminVideoUploader } from "@/components/customs/admin-video-uploader"
import { AiOutputDisplay } from "@/components/customs/ai-output-display"
import { getI18n } from "@/lib/i18n/server"
import { getCleaningReviewById } from "@/services/cleaning-review.services"
import { Badge } from "@packages/ui/badge"
import { Button } from "@packages/ui/button"
import { Separator } from "@packages/ui/separator"
import { ChevronLeft, Edit, Plus, Sparkles, User, House, FileText, Link2, Video } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ locale: string; cleaningReviewId: string }>
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  Created: { label: "Created", variant: "outline" },
  "AI Analizing": { label: "AI Analysing", variant: "secondary" },
  Analized: { label: "Analysed", variant: "secondary" },
  Done: { label: "Done", variant: "default" },
  Failed: { label: "Failed", variant: "destructive" },
}

export default async function CleaningReviewDetailPage({ params }: PageProps) {
  const { locale, cleaningReviewId } = await params
  const returnUrl = `/${locale}/app/cleaning-review`
  const editUrl = `/${locale}/app/cleaning-review/${cleaningReviewId}/edit`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

  const [t, review] = await Promise.all([getI18n(), getCleaningReviewById(Number(cleaningReviewId))])

  if (!review) notFound()

  const statusCfg = STATUS_CONFIG[review.status] ?? { label: review.status, variant: "secondary" as const }
  const publicLink = review.uri ? `${appUrl}/${locale}/review/${review.uri}` : null
  const videoUrl = review.localVideoPath ? `${apiUrl}${review.localVideoPath}` : null

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Header */}
      <div>
        <Link
          href={returnUrl}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {t("cleaningReview.detail.back")}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("cleaningReview.detail.title")} #{review.id}
            </h1>
            <div className="mt-2">
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={editUrl}>
              <Edit className="size-4" />
              {t("cleaningReview.detail.edit")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-2xl border bg-card divide-y">
        {review.housing && (
          <div className="flex items-start gap-3 px-5 py-4">
            <House className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("cleaningReview.detail.housing")}</p>
              <p className="text-sm font-medium">{review.housing.name}</p>
            </div>
          </div>
        )}

        {review.employee && (
          <div className="flex items-start gap-3 px-5 py-4">
            <User className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("cleaningReview.detail.employee")}</p>
              <p className="text-sm font-medium">{review.employee.fullName}</p>
              {review.employee.email && (
                <p className="text-xs text-muted-foreground">{review.employee.email}</p>
              )}
            </div>
          </div>
        )}

        {review.additionnalInfos && (
          <div className="flex items-start gap-3 px-5 py-4">
            <FileText className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("cleaningReview.detail.notes")}</p>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{review.additionnalInfos}</p>
            </div>
          </div>
        )}

        {publicLink && (
          <div className="flex items-start gap-3 px-5 py-4">
            <Link2 className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-0.5">{t("cleaningReview.detail.publicLink")}</p>
              <a
                href={publicLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-primary hover:underline break-all"
              >
                {publicLink}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Video section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Video className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">{t("cleaningReview.detail.video")}</h2>
        </div>
        <Separator />
        {videoUrl ? (
          <div className="overflow-hidden rounded-2xl bg-black aspect-video">
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>
        ) : (review.status === "Created" || review.status === "Failed") && review.uri ? (
          <AdminVideoUploader
            uri={review.uri}
            apiUrl={apiUrl}
            reviewUrl={`/${locale}/app/cleaning-review/${review.id}`}
          />
        ) : (
          <p className="text-sm text-muted-foreground py-6 text-center rounded-2xl border border-dashed">
            {t("cleaningReview.detail.noVideo")}
          </p>
        )}
      </div>

      {/* AI analysis output */}
      {!!review.aiOutput && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">AI Analysis</h2>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/${locale}/app/cleaning-review/new`}>
                <Plus className="size-4" />
                New cleaning review
              </Link>
            </Button>
          </div>
          <Separator />
          <AiOutputDisplay
            aiOutput={review.aiOutput as Record<string, unknown>}
            mode="admin"
          />
        </div>
      )}

      {/* Create new review CTA when no AI output yet */}
      {!review.aiOutput && (review.status === "Analized" || review.status === "Done") && (
        <Button asChild variant="outline" className="w-full gap-2">
          <Link href={`/${locale}/app/cleaning-review/new`}>
            <Plus className="size-4" />
            Create a new cleaning review
          </Link>
        </Button>
      )}
    </div>
  )
}
