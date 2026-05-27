"use client"

import {
  getCleaningReviewsByReservation,
  type CleaningReview,
} from "@/services/cleaning-review.services"
import { deleteReservation, type Reservation } from "@/services/reservation.services"
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
import { Separator } from "@packages/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui/table"
import { CheckCircle2, Edit, Eye, House, Loader2, Trash2, Users, XCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState, useTransition } from "react"

type ReservationsTableProps = {
  reservations: Reservation[]
  locale: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function isUpcoming(moveInDate: string) {
  return new Date(moveInDate) >= new Date()
}

type DetailModalProps = {
  reservation: Reservation | null
  open: boolean
  onOpenChange: (v: boolean) => void
}

const DetailModal: FunctionComponent<DetailModalProps> = ({
  reservation,
  open,
  onOpenChange,
}) => {
  const [reviews, setReviews] = useState<CleaningReview[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  const handleOpen = async (v: boolean) => {
    onOpenChange(v)
    if (v && reservation) {
      setLoadingReviews(true)
      const data = await getCleaningReviewsByReservation(reservation.id)
      setReviews(data)
      setLoadingReviews(false)
    } else {
      setReviews([])
    }
  }

  const t = useI18n()

  const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    Created: { label: t("reservation.review.status.created"), variant: "secondary" },
    "AI Analizing": { label: t("reservation.review.status.analysing"), variant: "outline" },
    Analized: { label: t("reservation.review.status.analysed"), variant: "outline" },
    Done: { label: t("reservation.review.status.done"), variant: "default" },
    Failed: { label: t("reservation.review.status.failed"), variant: "destructive" },
  }

  if (!reservation) return null

  const totalGuests =
    reservation.numberOfAdult + reservation.numberOfChild + reservation.numberOfBaby

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("reservation.detail.modal.title")} #{reservation.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <House className="size-4 text-muted-foreground" />
              {reservation.housing?.name ?? `Housing #${reservation.housingId}`}
              {reservation.housing?.type && (
                <Badge variant="outline" className="capitalize text-xs">
                  {reservation.housing.type}
                </Badge>
              )}
            </div>
            {reservation.housing?.address && (
              <p className="text-xs text-muted-foreground">{reservation.housing.address}</p>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">{t("reservation.detail.moveIn")}</p>
                <p className="font-medium">{formatDate(reservation.moveInDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("reservation.detail.moveOut")}</p>
                <p className="font-medium">{formatDate(reservation.moveOutDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="size-4 text-muted-foreground" />
              <span>{totalGuests} {totalGuests !== 1 ? t("reservation.detail.guests") : t("reservation.detail.guest")}</span>
              <span className="text-muted-foreground text-xs">
                ({reservation.numberOfAdult}A · {reservation.numberOfChild}C · {reservation.numberOfBaby}B)
              </span>
            </div>
            {reservation.specialInfos && (
              <div className="text-sm">
                <p className="text-xs text-muted-foreground mb-1">{t("reservation.detail.notes")}</p>
                <p className="text-foreground/80">{reservation.specialInfos}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">{t("reservation.detail.cleaningReviews")}</p>
            {loadingReviews ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="size-4 animate-spin" /> {t("reservation.detail.loading")}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {t("reservation.detail.noReviews")}
              </p>
            ) : (
              <div className="space-y-2">
                {reviews.map((r) => {
                  const badge = STATUS_BADGE[r.status] ?? { label: r.status, variant: "secondary" as const }
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        {r.status === "Done" ? (
                          <CheckCircle2 className="size-4 text-green-500" />
                        ) : r.status === "Failed" ? (
                          <XCircle className="size-4 text-destructive" />
                        ) : (
                          <div className="size-4 rounded-full border-2 border-muted-foreground/40" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{t("reservation.detail.review")} #{r.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(r.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const ReservationsTable: FunctionComponent<ReservationsTableProps> = ({
  reservations,
  locale,
}) => {
  const router = useRouter()
  const t = useI18n()
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleDelete = (id: number) => {
    setDeletingId(id)
    startTransition(async () => {
      await deleteReservation(id)
      setDeletingId(null)
      router.refresh()
    })
  }

  const openDetail = (r: Reservation) => {
    setSelectedReservation(r)
    setDetailOpen(true)
  }

  return (
    <>
      <div className="rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("reservation.table.housing")}</TableHead>
              <TableHead>{t("reservation.table.moveIn")}</TableHead>
              <TableHead>{t("reservation.table.moveOut")}</TableHead>
              <TableHead>{t("reservation.table.guests")}</TableHead>
              <TableHead>{t("reservation.table.status")}</TableHead>
              <TableHead className="text-right">{t("reservation.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center text-muted-foreground">
                  {t("reservation.table.empty")}
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.housing?.name ?? `#${r.housingId}`}
                  </TableCell>
                  <TableCell>{formatDate(r.moveInDate)}</TableCell>
                  <TableCell>{formatDate(r.moveOutDate)}</TableCell>
                  <TableCell>
                    {r.numberOfAdult + r.numberOfChild + r.numberOfBaby}
                  </TableCell>
                  <TableCell>
                    {isUpcoming(r.moveInDate) ? (
                      <Badge variant="outline">{t("reservation.status.upcoming")}</Badge>
                    ) : (
                      <Badge variant="secondary">{t("reservation.status.past")}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => openDetail(r)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-8" asChild>
                        <Link href={`/${locale}/app/reservation/${r.id}/edit`}>
                          <Edit className="size-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-destructive hover:text-destructive"
                            disabled={deletingId === r.id && isPending}
                          >
                            {deletingId === r.id && isPending ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("reservation.delete.title")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("reservation.delete.description", {
                                name: r.housing?.name ?? `housing #${r.housingId}`,
                                date: formatDate(r.moveInDate),
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("reservation.delete.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(r.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t("reservation.delete.confirm")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DetailModal
        reservation={selectedReservation}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  )
}
