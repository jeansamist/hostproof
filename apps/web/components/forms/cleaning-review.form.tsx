"use client"

import { updateCleaningReviewSchema, UpdateCleaningReviewSchema } from "@/schemas/cleaning-review.schemas"
import type { Employee } from "@/services/employee.services"
import type { CleaningReview } from "@/services/cleaning-review.services"
import { updateCleaningReview } from "@/services/cleaning-review.services"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription } from "@packages/ui/alert"
import { Button } from "@packages/ui/button"
import { Field, FieldGroup, FieldLabel } from "@packages/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/select"
import { Textarea } from "@packages/ui/textarea"
import { LoaderCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n/client"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState } from "react"
import { Controller, useForm } from "react-hook-form"

const STATUSES = [
  { value: "Created", label: "Created" },
  { value: "AI Analizing", label: "AI Analysing" },
  { value: "Analized", label: "Analysed" },
  { value: "Done", label: "Done" },
  { value: "Failed", label: "Failed" },
]

type CleaningReviewFormProps = {
  review: CleaningReview
  employees: Employee[]
  returnUrl: string
}

export const CleaningReviewForm: FunctionComponent<CleaningReviewFormProps> = ({
  review,
  employees,
  returnUrl,
}) => {
  const router = useRouter()
  const t = useI18n()
  const [errorMessage, setErrorMessage] = useState<string>()

  const form = useForm<UpdateCleaningReviewSchema>({
    resolver: zodResolver(updateCleaningReviewSchema),
    mode: "onChange",
    defaultValues: {
      assignedEmployeeId: review.assignedEmployeeId ?? undefined,
      additionnalInfos: review.additionnalInfos ?? "",
      status: (review.status as any) ?? "Created",
    },
  })

  async function onSubmit(data: UpdateCleaningReviewSchema) {
    setErrorMessage(undefined)
    const result = await updateCleaningReview({ ...data, id: review.id })
    if (!result?.success) {
      setErrorMessage(result?.message ?? "Something went wrong")
      return
    }
    router.push(returnUrl)
    router.refresh()
  }

  return (
    <form id="cleaning-review-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-xl border bg-muted/30 p-4 text-sm space-y-1">
          <p className="text-muted-foreground">
            Review #{review.id} · {review.housing?.name ?? `Reservation #${review.reservationId}`}
          </p>
          {review.uri && (
            <p className="text-xs text-muted-foreground font-mono truncate">
              URI: {review.uri}
            </p>
          )}
        </div>

        <Controller
          control={form.control}
          name="assignedEmployeeId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t("cleaningReview.form.employee.label")}</FieldLabel>
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("cleaningReview.form.employee.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("cleaningReview.form.status.label")}</FieldLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="additionnalInfos"
          render={({ field }) => (
            <Field>
              <FieldLabel>{t("cleaningReview.form.notes.label")}</FieldLabel>
              <Textarea
                placeholder={t("cleaningReview.form.notes.placeholder")}
                rows={3}
                {...field}
                value={field.value ?? ""}
              />
            </Field>
          )}
        />

        <Field orientation="horizontal">
          <Button
            type="submit"
            form="cleaning-review-form"
            disabled={form.formState.isSubmitting}
          >
            {t("cleaningReview.form.submit")}
            {form.formState.isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(returnUrl)}
          >
            {t("cleaningReview.form.cancel")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
