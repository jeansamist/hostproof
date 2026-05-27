/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

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

const STATUS_LABEL: Record<string, string> = {
  Created: "Pending video",
  "AI Analizing": "Under review",
  Analized: "Analysed",
  Done: "Completed",
  Failed: "Failed",
}

export const PublicVideoUploader: FunctionComponent<UploaderProps> = ({
  uri,
  review,
  apiUrl,
  appReviewLink = "",
}) => {
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
  const [elapsed, setElapsed] = useState(0)

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const previewRef = useRef<HTMLVideoElement>(null)
  const liveRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const TRANSMIT_MESSAGES: Record<string, string> = {
    VIDEO_UPLOADED_AND_CONVERTED: "Video converted, uploading to Google AI...",
    VIDEO_UPLOADED_TO_GOOGLE_AI: "Uploaded to Google AI, processing video...",
    VIDEO_PROCESSED_BY_GOOGLE_AI: "Video processed, analysing cleaning...",
    VIDEO_ANALYZED_BY_GOOGLE_AI: "Analysis complete, generating report...",
    AI_ANALYSIS_COMPLETED: "Report ready!",
    AI_ANALYSIS_FAILED: "Analysis failed. Please contact support.",
  }

  const terminalKey =
    review.status === "Analized" || review.status === "Done"
      ? "AI_ANALYSIS_COMPLETED"
      : review.status === "Failed"
        ? "AI_ANALYSIS_FAILED"
        : null

  const [MESSAGE, setMESSAGE] = useState<string>(
    terminalKey === "AI_ANALYSIS_COMPLETED"
      ? "Report ready!"
      : terminalKey === "AI_ANALYSIS_FAILED"
        ? "Analysis failed. Please contact support."
        : "Converting the video to mp4..."
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

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (timerRef.current) clearInterval(timerRef.current)
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: hasMic,
      })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
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
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      recorder.start(250)
      recorderRef.current = recorder
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
      setMode("recording")
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Could not access camera/microphone.")
    }
  }, [hasMic])

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    recorderRef.current?.stop()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setVideoBlob(file)
    setVideoUrl(url)
    setMode("preview")
  }

  const handleSubmit = async () => {
    if (!videoBlob) return
    setMode("uploading")
    setErrorMsg(undefined)
    try {
      const formData = new FormData()
      const ext = videoBlob.type.includes("webm")
        ? "webm"
        : videoBlob.type.includes("mp4")
          ? "mp4"
          : "video"
      formData.append("video", videoBlob, `recording.${ext}`)

      const res = await fetch(`${apiUrl}/api/public/reviews/${uri}/submit`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.message ?? "Upload failed")
      }

      setMode("done")
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Upload failed. Please try again.")
      setMode("preview")
    }
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    setMessageKey(null)
    setMESSAGE("Retrying analysis…")
    try {
      await fetch(`${apiUrl}/api/public/reviews/${uri}/retry`, {
        method: "POST",
      })
    } catch {
      setMessageKey("AI_ANALYSIS_FAILED")
      setMESSAGE("Analysis failed. Please contact support.")
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
            <p className="text-lg font-semibold">Video submitted!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Thank you. The cleaning review is now being processed.
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
                Retry analysis
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
          <span className="font-medium">Current status</span>
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
            Stop recording
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
              Re-record
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Upload className="size-4" />
              Submit video
            </Button>
          </div>
        </div>
      )}

      {/* Uploading */}
      {mode === "uploading" && (
        <div className="space-y-3 rounded-2xl border bg-card p-8 text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Uploading your video…</p>
        </div>
      )}

      {/* Idle: record or upload */}
      {mode === "idle" && (
        <div className="space-y-3">
          {/* <div
            className={cn(
              "cursor-pointer space-y-4 rounded-2xl border-2 border-dashed p-10 text-center transition-colors hover:bg-muted/30"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Upload a video</p>
              <p className="mt-1 text-xs text-muted-foreground">
                MP4, WebM, MOV or AVI · max 500 MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div> */}

          <div className="space-y-2">
            <Button size="lg" className="w-full gap-2" onClick={startRecording}>
              <Video className="size-4" />
              Record with camera
            </Button>
            <button
              type="button"
              className="mx-auto flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setHasMic((v) => !v)}
            >
              {hasMic ? (
                <Mic className="size-3.5" />
              ) : (
                <MicOff className="size-3.5" />
              )}
              {hasMic ? "Microphone on" : "Microphone off"} — click to toggle
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
