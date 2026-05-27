"use client"

import {
  deleteCleaningReview,
  type CleaningReview,
} from "@/services/cleaning-review.services"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@packages/ui/alert-dialog"
import { Badge } from "@packages/ui/badge"
import { Button } from "@packages/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui/table"
import { Progress } from "@packages/ui/progress"
import { cn } from "@packages/functions"
import { useI18n } from "@/lib/i18n/client"
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
  Video,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState, useTransition } from "react"

type CleaningReviewsTableProps = {
  reviews: CleaningReview[]
  locale: string
  appUrl: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

type VideoDialogProps = {
  review: CleaningReview | null
  open: boolean
  onOpenChange: (v: boolean) => void
  apiUrl: string
}

const VideoDialog: FunctionComponent<VideoDialogProps> = ({ review, open, onOpenChange, apiUrl }) => {
  const t = useI18n()
  const videoUrl = review?.localVideoPath ? `${apiUrl}${review.localVideoPath}` : null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>{t("cleaningReview.table.video.dialog.title")} #{review?.id}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {videoUrl ? (
            <div className="overflow-hidden rounded-xl bg-black aspect-video">
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {t("cleaningReview.table.noVideo")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const CleaningReviewsTable: FunctionComponent<CleaningReviewsTableProps> = ({
  reviews,
  locale,
  appUrl,
}) => {
  const router = useRouter()
  const t = useI18n()

  const STATUS_CONFIG: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 | null }
  > = {
    Created: { label: t("cleaningReview.status.created"), variant: "outline", icon: null },
    "AI Analizing": { label: t("cleaningReview.status.aiAnalysing"), variant: "secondary", icon: Sparkles },
    Analized: { label: t("cleaningReview.status.analysed"), variant: "secondary", icon: Sparkles },
    Done: { label: t("cleaningReview.status.done"), variant: "default", icon: CheckCircle2 },
    Failed: { label: t("cleaningReview.status.failed"), variant: "destructive", icon: XCircle },
  }

  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [videoReview, setVideoReview] = useState<CleaningReview | null>(null)
  const [videoOpen, setVideoOpen] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

  const handleDelete = (id: number) => {
    setDeletingId(id)
    startTransition(async () => {
      await deleteCleaningReview(id)
      setDeletingId(null)
      router.refresh()
    })
  }

  const handleCopy = async (uri: string, id: number) => {
    const link = `${appUrl}/${locale}/review/${uri}`
    await navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const openVideo = (review: CleaningReview) => {
    setVideoReview(review)
    setVideoOpen(true)
  }

  return (
    <>
      <div className="rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("cleaningReview.table.housing")}</TableHead>
              <TableHead>{t("cleaningReview.table.employee")}</TableHead>
              <TableHead>{t("cleaningReview.table.status")}</TableHead>
              <TableHead className="w-36">{t("cleaningReview.table.aiScore")}</TableHead>
              <TableHead>{t("cleaningReview.table.createdAt")}</TableHead>
              <TableHead className="text-right w-12">{t("cleaningReview.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-16 text-center text-muted-foreground"
                >
                  {t("cleaningReview.table.empty")}
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((r) => {
                const cfg = STATUS_CONFIG[r.status] ?? {
                  label: r.status,
                  variant: "secondary" as const,
                  icon: null,
                }
                const Icon = cfg.icon
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.housing?.name ?? `Reservation #${r.reservationId}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.employee?.fullName ?? `Employee #${r.assignedEmployeeId}`}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={cfg.variant}
                        className="flex w-fit items-center gap-1"
                      >
                        {Icon && (
                          <Icon
                            className={cn(
                              "size-3",
                              r.status === "AI Analizing" && "animate-pulse"
                            )}
                          />
                        )}
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const score = (r.aiOutput as { score?: number } | null)?.score
                        if (score === undefined || score === null) {
                          return <span className="text-xs text-muted-foreground">—</span>
                        }
                        const pct = Math.round((score / 10) * 100)
                        const color =
                          score >= 8
                            ? "text-green-600"
                            : score >= 5
                              ? "text-amber-600"
                              : "text-red-600"
                        return (
                          <div className="flex items-center gap-2 min-w-28">
                            <Progress value={pct} className="h-1.5 flex-1" />
                            <span className={cn("text-xs font-medium tabular-nums w-6 text-right", color)}>
                              {score}
                            </span>
                          </div>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(r.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8"
                              disabled={deletingId === r.id && isPending}
                            >
                              {deletingId === r.id && isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="size-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link href={`/${locale}/app/cleaning-review/${r.id}`} className="flex items-center gap-2">
                                <ExternalLink className="size-4" />
                                {t("cleaningReview.action.open")}
                              </Link>
                            </DropdownMenuItem>

                            {r.localVideoPath && (
                              <DropdownMenuItem
                                onClick={() => openVideo(r)}
                                className="flex items-center gap-2"
                              >
                                <Video className="size-4" />
                                {t("cleaningReview.action.watchVideo")}
                              </DropdownMenuItem>
                            )}

                            {r.uri && (
                              <DropdownMenuItem
                                onClick={() => handleCopy(r.uri!, r.id)}
                                className="flex items-center gap-2"
                              >
                                {copiedId === r.id ? (
                                  <Check className="size-4 text-green-500" />
                                ) : (
                                  <Link2 className="size-4" />
                                )}
                                {copiedId === r.id
                                  ? t("cleaningReview.action.linkCopied")
                                  : t("cleaningReview.action.copyLink")}
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem asChild>
                              <Link
                                href={`/${locale}/app/cleaning-review/${r.id}/edit`}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="size-4" />
                                {t("cleaningReview.action.edit")}
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="size-4" />
                                {t("cleaningReview.action.delete")}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("cleaningReview.delete.title")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("cleaningReview.delete.description", {
                                name: r.housing?.name ?? `reservation #${r.reservationId}`,
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cleaningReview.delete.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(r.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t("cleaningReview.delete.confirm")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <VideoDialog
        review={videoReview}
        open={videoOpen}
        onOpenChange={setVideoOpen}
        apiUrl={apiUrl}
      />
    </>
  )
}
