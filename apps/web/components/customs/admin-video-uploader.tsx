"use client"

import { Transmit } from "@adonisjs/transmit-client"
import { Badge } from "@packages/ui/badge"
import { Button } from "@packages/ui/button"
import { Card, CardContent } from "@packages/ui/card"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useEffect, useRef, useState } from "react"

type AdminVideoUploaderProps = {
  uri: string
  apiUrl: string
  reviewUrl?: string
  onSuccess?: () => void
}

const TRANSMIT_MESSAGES: Record<string, string> = {
  VIDEO_UPLOADED_AND_CONVERTED: "Video converted, uploading to Google AI...",
  VIDEO_UPLOADED_TO_GOOGLE_AI: "Uploaded to Google AI, processing video...",
  VIDEO_PROCESSED_BY_GOOGLE_AI: "Video processed, analysing cleaning...",
  VIDEO_ANALYZED_BY_GOOGLE_AI: "Analysis complete, generating report...",
  AI_ANALYSIS_COMPLETED: "Report ready!",
  AI_ANALYSIS_FAILED: "Analysis failed. Please contact support.",
}

const STATUS_LABEL: Record<string, string> = {
  processing: "Under review",
  completed: "Completed",
  failed: "Failed",
}

export const AdminVideoUploader: FunctionComponent<AdminVideoUploaderProps> = ({
  uri,
  apiUrl,
  reviewUrl,
  onSuccess,
}) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>()
  const [submitted, setSubmitted] = useState(false)
  const [dragging, setDragging] = useState(false)

  const [MESSAGE, setMESSAGE] = useState<string>("Converting the video to mp4...")
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
        throw new Error(json?.message ?? "Upload failed")
      }
      setSubmitted(true)
      onSuccess?.()
    } catch (err: any) {
      setError(err?.message ?? "Upload failed. Please try again.")
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
            <p className="text-sm font-semibold">Video submitted!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI analysis has started.
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
            <Button size="sm" variant="outline" onClick={() => router.push(reviewUrl)}>
              View review
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
        className={`rounded-2xl border-2 border-dashed p-8 text-center space-y-3 transition-colors ${
          dragging ? "border-primary bg-primary/5" : "hover:bg-muted/30 cursor-pointer"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-muted">
          {uploading
            ? <Loader2 className="size-5 text-muted-foreground animate-spin" />
            : <Upload className="size-5 text-muted-foreground" />
          }
        </div>
        <div>
          <p className="text-sm font-medium">{uploading ? "Uploading…" : "Upload a video"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {uploading ? "Please wait" : "MP4, WebM, MOV or AVI · Drag & drop or click"}
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
