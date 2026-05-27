/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useI18n } from "@/lib/i18n/client"
import { Transmit } from "@adonisjs/transmit-client"
import { Badge } from "@packages/ui/badge"
import { Button } from "@packages/ui/button"
import { Card, CardContent } from "@packages/ui/card"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useEffect, useRef, useState } from "react"

type AdminVideoUploaderProps = {
  uri: string
  apiUrl: string
  reviewUrl?: string
  onSuccess?: () => void
}

export const AdminVideoUploader: FunctionComponent<AdminVideoUploaderProps> = ({
  uri,
  apiUrl,
  reviewUrl,
  onSuccess,
}) => {
  const t = useI18n()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>()
  const [submitted, setSubmitted] = useState(false)
  const [dragging, setDragging] = useState(false)

  const TRANSMIT_MESSAGES: Record<string, string> = {
    VIDEO_UPLOADED_AND_CONVERTED: t("ai.progress.uploadedAndConverted"),
    VIDEO_UPLOADED_TO_GOOGLE_AI: t("ai.progress.uploadedToGoogleAI"),
    VIDEO_PROCESSED_BY_GOOGLE_AI: t("ai.progress.processedByGoogle"),
    VIDEO_ANALYZED_BY_GOOGLE_AI: t("ai.progress.analyzedByGoogle"),
    AI_ANALYSIS_COMPLETED: t("ai.progress.completed"),
    AI_ANALYSIS_FAILED: t("ai.progress.failed"),
  }

  const STATUS_LABEL: Record<string, string> = {
    processing: t("adminVideoUploader.status.processing"),
    completed: t("adminVideoUploader.status.completed"),
    failed: t("adminVideoUploader.status.failed"),
  }

  const [MESSAGE, setMESSAGE] = useState<string>(t("ai.progress.converting"))
  const [messageKey, setMessageKey] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiOutput, setAiOutput] = useState<any | null>(null)

  useEffect(() => {
    if (!submitted) return
    const transmit = new Transmit({
      baseUrl: apiUrl,
    })
    const subscription = transmit.subscription(`cleaning-reviews/${uri}`)

    subscription.create().then(() => {
      subscription.onMessage((data: { message: string }) => {
        const label = TRANSMIT_MESSAGES[data.message]
        if (label) {
          setMESSAGE(label)
          setMessageKey(data.message)
        }
        if (data.message === "AI_ANALYSIS_COMPLETED") {
          fetch(`${apiUrl}/api/public/reviews/${uri}`)
            .then((r) => r.json())
            .then((json) => setAiOutput(json?.data?.aiOutput ?? null))
            .catch(() => {})
        }
      })
    })

    return () => {
      subscription.delete().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted])

  const submit = async (file: File) => {
    setUploading(true)
    setError(undefined)
    try {
      const formData = new FormData()
      formData.append("video", file, file.name)
      const res = await fetch(`${apiUrl}/api/public/reviews/${uri}/submit`, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.message ?? t("adminVideoUploader.error.uploadFailed"))
      }
      setSubmitted(true)
      onSuccess?.()
    } catch (err: any) {
      setError(err?.message ?? t("adminVideoUploader.error.uploadFailed"))
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) submit(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) submit(file)
  }

  if (submitted) {
    return (
      <>
        <div className="space-y-4 rounded-2xl border bg-card p-6 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">{t("adminVideoUploader.submitted.title")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("adminVideoUploader.submitted.description")}
            </p>
          </div>
          <Badge
            variant={
              messageKey === "AI_ANALYSIS_COMPLETED"
                ? "default"
                : messageKey === "AI_ANALYSIS_FAILED"
                  ? "destructive"
                  : "secondary"
            }
            className="text-xs"
          >
            {messageKey === "AI_ANALYSIS_COMPLETED"
              ? STATUS_LABEL["completed"]
              : messageKey === "AI_ANALYSIS_FAILED"
                ? STATUS_LABEL["failed"]
                : STATUS_LABEL["processing"]}
          </Badge>
          {reviewUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(reviewUrl)}
            >
              {t("adminVideoUploader.action.viewReview")}
            </Button>
          )}
        </div>
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              {messageKey === "AI_ANALYSIS_COMPLETED" ? (
                <CheckCircle2 className="size-4 text-green-500" />
              ) : messageKey === "AI_ANALYSIS_FAILED" ? (
                <AlertCircle className="size-4 text-destructive" />
              ) : (
                <Loader2 className="size-4 animate-spin" />
              )}
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  key={MESSAGE}
                  className="text-sm"
                >
                  {MESSAGE}
                </motion.span>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
        {aiOutput && (
          <Card>
            <CardContent>
              <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
                {JSON.stringify(aiOutput, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div
        className={`space-y-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "cursor-pointer hover:bg-muted/30"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-muted">
          {uploading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="size-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">
            {uploading ? t("adminVideoUploader.uploading.title") : t("adminVideoUploader.upload.title")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {uploading
              ? t("adminVideoUploader.uploading.hint")
              : t("adminVideoUploader.upload.hint")}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </div>
  )
}
