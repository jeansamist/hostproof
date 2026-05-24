"use client"

import type { PublicReviewInfo } from "@/services/cleaning-review.services"
import { cn } from "@packages/functions"
import { Badge } from "@packages/ui/badge"
import { Button } from "@packages/ui/button"
import {
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  Square,
  Upload,
  Video,
  VideoOff,
} from "lucide-react"
import { FunctionComponent, useCallback, useEffect, useRef, useState } from "react"

type UploaderProps = {
  uri: string
  review: PublicReviewInfo
  apiUrl: string
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
}) => {
  const [mode, setMode] = useState<Mode>(
    review.hasVideo || review.status === "AI Analizing" || review.status === "Done" || review.status === "Analized"
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
      <div className="rounded-2xl border bg-card p-8 text-center space-y-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="size-7 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-lg font-semibold">Video submitted!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Thank you. The cleaning review is now being processed.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {STATUS_LABEL["AI Analizing"]}
        </Badge>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="rounded-xl border bg-muted/30 px-4 py-3 flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium">Current status</span>
        </div>
        <Badge variant="outline">{STATUS_LABEL[review.status] ?? review.status}</Badge>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Recording mode: live preview */}
      {mode === "recording" && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
            <video
              ref={liveRef}
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-white text-xs font-mono">
              <span className="size-2 rounded-full bg-red-500 animate-pulse" />
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
          <div className="overflow-hidden rounded-2xl bg-black aspect-video">
            <video
              ref={previewRef}
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
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
        <div className="rounded-2xl border bg-card p-8 text-center space-y-3">
          <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Uploading your video…</p>
        </div>
      )}

      {/* Idle: record or upload */}
      {mode === "idle" && (
        <div className="space-y-3">
          <div
            className={cn(
              "rounded-2xl border-2 border-dashed p-10 text-center space-y-4 cursor-pointer transition-colors hover:bg-muted/30",
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Upload a video</p>
              <p className="text-xs text-muted-foreground mt-1">
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
          </div>

          <div className="space-y-2">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={startRecording}
            >
              <Video className="size-4" />
              Record with camera
            </Button>
            <button
              type="button"
              className="flex items-center gap-2 text-xs text-muted-foreground mx-auto hover:text-foreground transition-colors"
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
