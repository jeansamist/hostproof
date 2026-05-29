/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useI18n } from "@/lib/i18n/client"
import { AiOutputDisplay } from "@/components/customs/ai-output-display"
import { VoiceMessageRecorder } from "@/components/customs/voice-message-recorder"
import type { PublicReviewInfo } from "@/services/cleaning-review.services"
import { Transmit } from "@adonisjs/transmit-client"
import { Badge } from "@packages/ui/badge"
import { Button } from "@packages/ui/button"
import { Card, CardContent } from "@packages/ui/card"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  RefreshCw,
  Square,
  SwitchCamera,
  Upload,
  Video,
} from "lucide-react"
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

type UploaderProps = {
  uri: string
  review: PublicReviewInfo
  apiUrl: string
  appReviewLink?: string
}

type Mode = "idle" | "recording" | "preview" | "uploading" | "done" | "error"

const getSupportedMimeType = () => {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ]
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? ""
}

export const PublicVideoUploader: FunctionComponent<UploaderProps> = ({
  uri,
  review,
  apiUrl,
  appReviewLink = "",
}) => {
  const t = useI18n()

  const STATUS_LABEL: Record<string, string> = {
    Created: t("publicReview.status.pendingVideo"),
    "AI Analizing": t("publicReview.status.underReview"),
    Analized: t("publicReview.status.analysed"),
    Done: t("publicReview.status.completed"),
    Failed: t("publicReview.status.failed"),
  }

  const TRANSMIT_MESSAGES: Record<string, string> = {
    VIDEO_UPLOADED_AND_CONVERTED: t("ai.progress.uploadedAndConverted"),
    VIDEO_UPLOADED_TO_GOOGLE_AI: t("ai.progress.uploadedToGoogleAI"),
    VIDEO_PROCESSED_BY_GOOGLE_AI: t("ai.progress.processedByGoogle"),
    VIDEO_ANALYZED_BY_GOOGLE_AI: t("ai.progress.analyzedByGoogle"),
    AI_ANALYSIS_COMPLETED: t("ai.progress.completed"),
    AI_ANALYSIS_FAILED: t("ai.progress.failed"),
  }

  const [mode, setMode] = useState<Mode>(
    review.hasVideo ||
      review.status === "AI Analizing" ||
      review.status === "Done" ||
      review.status === "Analized"
      ? "done"
      : "idle"
  )
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>()
  const [hasMic, setHasMic] = useState(true)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [elapsed, setElapsed] = useState(0)

  const AI_CYCLING_MESSAGES = [
    t("ai.progress.watching"),
    t("ai.progress.checkingList"),
    t("ai.progress.evaluating"),
    t("ai.progress.checkingItems"),
    t("ai.progress.generatingReport"),
  ]

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const previewRef = useRef<HTMLVideoElement>(null)
  const liveRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cyclingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cyclingIndexRef = useRef(0)

  const terminalKey =
    review.status === "Analized" || review.status === "Done"
      ? "AI_ANALYSIS_COMPLETED"
      : review.status === "Failed"
        ? "AI_ANALYSIS_FAILED"
        : null

  const [MESSAGE, setMESSAGE] = useState<string>(
    terminalKey === "AI_ANALYSIS_COMPLETED"
      ? t("ai.progress.completed")
      : terminalKey === "AI_ANALYSIS_FAILED"
        ? t("ai.progress.failed")
        : t("ai.progress.converting")
  )
  const [messageKey, setMessageKey] = useState<string | null>(terminalKey)
  const [aiOutput, setAiOutput] = useState<any | null>(review.aiOutput ?? null)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const transmit = new Transmit({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
    })
    const subscription = transmit.subscription(`cleaning-reviews/${uri}`)

    subscription.create().then(() => {
      subscription.onMessage((data: { message: string }) => {
        if (data.message === "VIDEO_PROCESSED_BY_GOOGLE_AI") {
          if (cyclingIntervalRef.current) clearInterval(cyclingIntervalRef.current)
          cyclingIndexRef.current = 0
          setMESSAGE(AI_CYCLING_MESSAGES[0])
          setMessageKey(data.message)
          cyclingIntervalRef.current = setInterval(() => {
            cyclingIndexRef.current = (cyclingIndexRef.current + 1) % AI_CYCLING_MESSAGES.length
            setMESSAGE(AI_CYCLING_MESSAGES[cyclingIndexRef.current])
          }, 3_000)
          return
        }

        if (data.message === "AI_ANALYSIS_COMPLETED" || data.message === "AI_ANALYSIS_FAILED") {
          if (cyclingIntervalRef.current) {
            clearInterval(cyclingIntervalRef.current)
            cyclingIntervalRef.current = null
          }
        }

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
  }, [uri])

  // Release the camera stream only on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (timerRef.current) clearInterval(timerRef.current)
      if (cyclingIntervalRef.current) clearInterval(cyclingIntervalRef.current)
    }
  }, [])

  // Revoke the previous object URL when a new one is created
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl)
    }
  }, [videoUrl])

  useEffect(() => {
    if (mode === "recording" && liveRef.current && streamRef.current) {
      liveRef.current.srcObject = streamRef.current
      liveRef.current.play().catch(() => {})
    }
  }, [mode])

  const startRecording = useCallback(async () => {
    setErrorMsg(undefined)
    try {
      // Reuse the existing stream when possible to avoid re-requesting permission
      let stream = streamRef.current
      if (!stream || stream.getTracks().some((t) => t.readyState === "ended")) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 854, max: 854 },
            height: { ideal: 480, max: 480 },
          },
          audio: hasMic,
        })
        streamRef.current = stream
      }

      const mimeType = getSupportedMimeType()
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 1_200_000,
      })
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        const url = URL.createObjectURL(blob)
        setVideoBlob(blob)
        setVideoUrl(url)
        setMode("preview")
        // Keep the stream alive — no track.stop() here — so re-recording skips the permission prompt
      }
      recorder.start(250)
      recorderRef.current = recorder
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
      setMode("recording")
    } catch (err: any) {
      setErrorMsg(err?.message ?? t("publicReview.error.cameraAccess"))
    }
  }, [facingMode, hasMic, t])

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    recorderRef.current?.stop()
  }, [])

  const handleSwitchCamera = useCallback(() => {
    const next = facingMode === "environment" ? "user" : "environment"
    setFacingMode(next)
    // Stop the current stream so the next startRecording acquires a fresh one with the new facingMode
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [facingMode])

  const handleSubmit = async () => {
    if (!videoBlob) return
    setMode("uploading")
    setErrorMsg(undefined)
    try {
      const formData = new FormData()
      const type = videoBlob.type || ""
      const ext = type.includes("mp4") ? "mp4" : "webm"
      formData.append("video", videoBlob, `recording.${ext}`)

      const res = await fetch(`${apiUrl}/api/public/reviews/${uri}/submit`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.message ?? t("publicReview.error.uploadFailed"))
      }

      // Release the camera after a successful submit
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setMode("done")
    } catch (err: any) {
      setErrorMsg(err?.message ?? t("publicReview.error.uploadFailed"))
      setMode("preview")
    }
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    setMessageKey(null)
    setMESSAGE(t("ai.progress.retrying"))
    try {
      await fetch(`${apiUrl}/api/public/reviews/${uri}/retry`, {
        method: "POST",
      })
    } catch {
      setMessageKey("AI_ANALYSIS_FAILED")
      setMESSAGE(t("ai.progress.failed"))
    } finally {
      setIsRetrying(false)
    }
  }

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setVideoBlob(null)
    setVideoUrl(null)
    setMode("idle")
    setErrorMsg(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ""
    // Stream stays alive for re-recording
  }

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  if (mode === "done") {
    return (
      <>
        <div className="space-y-4 rounded-2xl border bg-card p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="size-7 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-lg font-semibold">{t("publicReview.submitted.title")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("publicReview.submitted.description")}
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
              ? STATUS_LABEL["Done"]
              : messageKey === "AI_ANALYSIS_FAILED"
                ? STATUS_LABEL["Failed"]
                : STATUS_LABEL["AI Analizing"]}
          </Badge>
        </div>
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              {messageKey === "AI_ANALYSIS_COMPLETED" ? (
                <CheckCircle2 className="size-4 shrink-0 text-green-500" />
              ) : messageKey === "AI_ANALYSIS_FAILED" ? (
                <AlertCircle className="size-4 shrink-0 text-destructive" />
              ) : (
                <Loader2 className="size-4 shrink-0 animate-spin" />
              )}
              {messageKey === "AI_ANALYSIS_COMPLETED" ||
              messageKey === "AI_ANALYSIS_FAILED" ? (
                <span>{MESSAGE}</span>
              ) : (
                <AnimatePresence initial={false} mode="wait">
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    key={MESSAGE}
                  >
                    {MESSAGE}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
            {messageKey === "AI_ANALYSIS_FAILED" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                {t("publicReview.action.retryAnalysis")}
              </Button>
            )}
          </CardContent>
        </Card>
        {aiOutput && (
          <AiOutputDisplay
            aiOutput={aiOutput}
            mode="employee"
            uri={uri}
            apiUrl={apiUrl}
            appReviewLink={appReviewLink}
          />
        )}
        {messageKey === "AI_ANALYSIS_COMPLETED" && (
          <VoiceMessageRecorder
            uri={uri}
            apiUrl={apiUrl}
            appReviewLink={appReviewLink}
            existingFileUrl={review.voiceMessageFile}
          />
        )}
      </>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
        <div className="text-sm">
          <span className="font-medium">{t("publicReview.currentStatus")}</span>
        </div>
        <Badge variant="outline">
          {STATUS_LABEL[review.status] ?? review.status}
        </Badge>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Recording mode: live preview */}
      {mode === "recording" && (
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
            <video
              ref={liveRef}
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 font-mono text-xs text-white">
              <span className="size-2 animate-pulse rounded-full bg-red-500" />
              {fmt(elapsed)}
            </div>
          </div>
          <Button
            size="lg"
            variant="destructive"
            className="w-full gap-2"
            onClick={stopRecording}
          >
            <Square className="size-4" />
            {t("publicReview.action.stopRecording")}
          </Button>
        </div>
      )}

      {/* Preview mode */}
      {mode === "preview" && videoUrl && (
        <div className="space-y-4">
          <div className="aspect-video overflow-hidden rounded-2xl bg-black">
            <video
              ref={previewRef}
              src={videoUrl}
              controls
              className="h-full w-full object-contain"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={reset}>
              {t("publicReview.action.reRecord")}
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Upload className="size-4" />
              {t("publicReview.action.submitVideo")}
            </Button>
          </div>
        </div>
      )}

      {/* Uploading */}
      {mode === "uploading" && (
        <div className="space-y-3 rounded-2xl border bg-card p-8 text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("publicReview.uploading")}</p>
        </div>
      )}

      {/* Idle: record or upload */}
      {mode === "idle" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Button size="lg" className="w-full gap-2" onClick={startRecording}>
              <Video className="size-4" />
              {t("publicReview.action.recordWithCamera")}
            </Button>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setHasMic((v) => !v)}
              >
                {hasMic ? (
                  <Mic className="size-3.5" />
                ) : (
                  <MicOff className="size-3.5" />
                )}
                {hasMic ? t("publicReview.action.micOn") : t("publicReview.action.micOff")}{" "}
                {t("publicReview.action.micToggle")}
              </button>
              <span className="text-xs text-muted-foreground">·</span>
              <button
                type="button"
                className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                onClick={handleSwitchCamera}
              >
                <SwitchCamera className="size-3.5" />
                {t("publicReview.action.switchCamera")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
