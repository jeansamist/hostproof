"use client"

import { useI18n } from "@/lib/i18n/client"
import {
  createReservationSchema,
  CreateReservationSchema,
} from "@/schemas/reservation.schemas"
import type { Housing } from "@/services/housing.services"
import type { Reservation } from "@/services/reservation.services"
import {
  createReservation,
  updateReservation,
} from "@/services/reservation.services"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription } from "@packages/ui/alert"
import { Button } from "@packages/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@packages/ui/field"
import { Input } from "@packages/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/select"
import { Textarea } from "@packages/ui/textarea"
import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState } from "react"
import { Controller, useForm } from "react-hook-form"

type ReservationFormProps = {
  housings: Housing[]
  reservation?: Reservation
  returnUrl: string
}

export const ReservationForm: FunctionComponent<ReservationFormProps> = ({
  housings,
  reservation,
  returnUrl,
}) => {
  const router = useRouter()
  const t = useI18n()
  const [errorMessage, setErrorMessage] = useState<string>()

  const form = useForm<CreateReservationSchema>({
    resolver: zodResolver(createReservationSchema),
    mode: "onChange",
    defaultValues: {
      moveInDate: reservation?.moveInDate
        ? reservation.moveInDate.slice(0, 10)
        : "",
      moveOutDate: reservation?.moveOutDate
        ? reservation.moveOutDate.slice(0, 10)
        : "",
      housingId: reservation?.housingId ?? undefined,
      numberOfAdult: reservation?.numberOfAdult ?? 1,
      numberOfChild: reservation?.numberOfChild ?? 0,
      numberOfBaby: reservation?.numberOfBaby ?? 0,
      specialInfos: reservation?.specialInfos ?? "",
    },
  })

  async function onSubmit(data: CreateReservationSchema) {
    setErrorMessage(undefined)
    const result = reservation
      ? await updateReservation({ ...data, id: reservation.id })
      : await createReservation(data)

    if (!result?.success) {
      setErrorMessage(result?.message ?? "Something went wrong")
      return
    }
    router.push(returnUrl)
  }

  return (
    <form id="reservation-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Controller
          control={form.control}
          name="housingId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t("reservation.form.housing.label")}</FieldLabel>
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("reservation.form.housing.placeholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {housings.map((h) => (
                    <SelectItem key={h.id} value={String(h.id)}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={form.control}
            name="moveInDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  {t("reservation.form.moveInDate.label")}
                </FieldLabel>
                <Input type="date" {...field} />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="moveOutDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  {t("reservation.form.moveOutDate.label")}
                </FieldLabel>
                <Input type="date" {...field} />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Controller
            control={form.control}
            name="numberOfAdult"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("reservation.form.adults.label")}</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="numberOfChild"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("reservation.form.children.label")}</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="numberOfBaby"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t("reservation.form.babies.label")}</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="specialInfos"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                {t("reservation.form.specialNotes.label")}
              </FieldLabel>
              <Textarea
                placeholder={t("reservation.form.specialNotes.placeholder")}
                rows={3}
                {...field}
                value={field.value ?? ""}
              />
              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Field orientation="horizontal">
          <Button
            type="submit"
            form="reservation-form"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {reservation
              ? t("reservation.form.submit.update")
              : t("reservation.form.submit.create")}
            {form.formState.isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(returnUrl)}
          >
            {t("reservation.form.cancel")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
