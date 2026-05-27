"use client"

import { Button } from "@packages/ui/button"
import { cn } from "@packages/functions"
import {
  CheckCircle2,
  Loader2,
  Mic,
  Send,
  Square,
  Trash2,
} from "lucide-react"
import { FunctionComponent, useCallback, useEffect, useRef, useState } from "react"

type RecorderState = "idle" | "recording" | "preview" | "uploading" | "done"

type VoiceMessageRecorderProps = {
  uri: string
  apiUrl: string
  appReviewLink?: string
  /** Already submitted file URL — shows the player directly */
  existingFileUrl?: string | null
}

export const VoiceMessageRecorder: FunctionComponent<VoiceMessageRecorderProps> = ({
  uri,
  apiUrl,
  appReviewLink = "",
  existingFileUrl,
}) => {
  const [state, setState] = useState<RecorderState>(
    existingFileUrl ? "done" : "idle"
  )
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(existingFileUrl ?? null)
  const [elapsed, setElapsed] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string>()

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl && !existingFileUrl) URL.revokeObjectURL(audioUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  const startRecording = useCallback(async () => {
    setErrorMsg(undefined)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg"

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        setState("preview")
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      recorder.start(250)
      recorderRef.current = recorder

      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
      setState("recording")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not access microphone."
      setErrorMsg(message)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    recorderRef.current?.stop()
  }, [])

  const discard = () => {
    if (audioUrl && !existingFileUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setElapsed(0)
    setErrorMsg(undefined)
    setState("idle")
  }

  const handleSubmit = async () => {
    if (!audioBlob) return
    setState("uploading")
    setErrorMsg(undefined)
    try {
      const formData = new FormData()
      const ext = audioBlob.type.includes("ogg") ? "ogg" : "webm"
      formData.append("audio", audioBlob, `voice-message.${ext}`)
      if (appReviewLink) formData.append("appReviewLink", appReviewLink)

      const res = await fetch(`${apiUrl}/api/public/reviews/${uri}/voice-message`, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.message ?? "Upload failed")
      }
      setState("done")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed. Please try again."
      setErrorMsg(message)
      setState("preview")
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Mic className="size-4 shrink-0 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Voice message</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Noticed something to flag? Leave a quick audio note for the manager.
      </p>

      {errorMsg && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errorMsg}
        </div>
      )}

      {/* IDLE — record button */}
      {state === "idle" && (
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={startRecording}
        >
          <Mic className="size-4" />
          Start recording
        </Button>
      )}

      {/* RECORDING */}
      {state === "recording" && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 rounded-xl border bg-muted/40 py-4">
            <span className="size-2.5 animate-pulse rounded-full bg-red-500" />
            <span className="font-mono text-sm tabular-nums text-foreground">
              {fmt(elapsed)}
            </span>
            <span className="text-xs text-muted-foreground">Recording…</span>
          </div>
          <Button
            type="button"
            variant="destructive"
            className="w-full gap-2"
            onClick={stopRecording}
          >
            <Square className="size-4" />
            Stop recording
          </Button>
        </div>
      )}

      {/* PREVIEW — play back before submitting */}
      {state === "preview" && audioUrl && (
        <div className="space-y-3">
          <audio
            src={audioUrl}
            controls
            className={cn(
              "w-full rounded-lg",
              "[&::-webkit-media-controls-panel]:bg-muted"
            )}
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={discard}
            >
              <Trash2 className="size-4" />
              Discard
            </Button>
            <Button type="button" className="gap-2" onClick={handleSubmit}>
              <Send className="size-4" />
              Send to manager
            </Button>
          </div>
        </div>
      )}

      {/* UPLOADING */}
      {state === "uploading" && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Sending voice message…
        </div>
      )}

      {/* DONE */}
      {state === "done" && (
        <div className="space-y-3">
          {audioUrl && (
            <audio
              src={audioUrl}
              controls
              className="w-full rounded-lg"
            />
          )}
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle2 className="size-4 shrink-0" />
            Voice message sent — the manager has been notified.
          </div>
        </div>
      )}
    </div>
  )
}
