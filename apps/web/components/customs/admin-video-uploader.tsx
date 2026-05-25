"use client"

import { Button } from "@packages/ui/button"
import { CheckCircle2, Loader2, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useRef, useState } from "react"

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
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>()
  const [submitted, setSubmitted] = useState(false)
  const [dragging, setDragging] = useState(false)

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
      if (reviewUrl) router.push(reviewUrl)
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
      <div className="rounded-2xl border bg-card p-6 text-center space-y-3">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-sm font-semibold">Video submitted!</p>
          <p className="text-xs text-muted-foreground mt-0.5">AI analysis has started.</p>
        </div>
        {reviewUrl && (
          <Button size="sm" variant="outline" onClick={() => router.push(reviewUrl)}>
            View review
          </Button>
        )}
      </div>
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
