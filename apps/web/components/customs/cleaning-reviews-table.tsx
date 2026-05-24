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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui/table"
import { cn } from "@packages/functions"
import {
  CheckCircle2,
  Copy,
  Edit,
  Loader2,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react"
import { useI18n } from "@/lib/i18n/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState, useTransition } from "react"

type CleaningReviewsTableProps = {
  reviews: CleaningReview[]
  locale: string
  appUrl: string
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 | null }
> = {
  Created: { label: "Created", variant: "outline", icon: null },
  "AI Analizing": { label: "AI Analysing", variant: "secondary", icon: Sparkles },
  Analized: { label: "Analysed", variant: "secondary", icon: Sparkles },
  Done: { label: "Done", variant: "default", icon: CheckCircle2 },
  Failed: { label: "Failed", variant: "destructive", icon: XCircle },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export const CleaningReviewsTable: FunctionComponent<CleaningReviewsTableProps> = ({
  reviews,
  locale,
  appUrl,
}) => {
  const router = useRouter()
  const t = useI18n()
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

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

  return (
    <div className="rounded-2xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("cleaningReview.table.housing")}</TableHead>
            <TableHead>{t("cleaningReview.table.employee")}</TableHead>
            <TableHead>{t("cleaningReview.table.status")}</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">{t("cleaningReview.table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
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
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(r.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {r.uri && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          title="Copy public link"
                          onClick={() => handleCopy(r.uri!, r.id)}
                        >
                          <Copy
                            className={cn(
                              "size-4",
                              copiedId === r.id && "text-green-500"
                            )}
                          />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        asChild
                      >
                        <Link
                          href={`/${locale}/app/cleaning-review/${r.id}/edit`}
                        >
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
                            <AlertDialogTitle>
                              {t("cleaningReview.delete.title")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the review for{" "}
                              <strong>
                                {r.housing?.name ??
                                  `reservation #${r.reservationId}`}
                              </strong>
                              . This action cannot be undone.
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
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
