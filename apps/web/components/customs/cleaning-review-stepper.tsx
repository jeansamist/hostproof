"use client"

import { AdminVideoUploader } from "@/components/customs/admin-video-uploader"
import { createReservationSchema, CreateReservationSchema } from "@/schemas/reservation.schemas"
import { createCleaningReview, sendCleaningReviewInvitation } from "@/services/cleaning-review.services"
import type { Employee } from "@/services/employee.services"
import type { Housing } from "@/services/housing.services"
import { createReservation, type Reservation } from "@/services/reservation.services"
import { useI18n } from "@/lib/i18n/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@packages/functions"
import { Alert, AlertDescription } from "@packages/ui/alert"
import { Avatar, AvatarFallback } from "@packages/ui/avatar"
import { Badge } from "@packages/ui/badge"
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
import { AnimatePresence, motion } from "framer-motion"
import {
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  House,
  Link2,
  Loader2,
  Mail,
  Plus,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState } from "react"
import { Controller, useForm } from "react-hook-form"

type StepperProps = {
  reservations: Reservation[]
  housings: Housing[]
  employees: Employee[]
  locale: string
  appUrl: string
  apiUrl: string
}

type StepId = "reservation" | "employee" | "details" | "share"

export const CleaningReviewStepper: FunctionComponent<StepperProps> = ({
  reservations,
  housings,
  employees,
  locale,
  appUrl,
  apiUrl,
}) => {
  const router = useRouter()
  const t = useI18n()
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState<string>()

  const STEPS: { id: StepId; label: string; icon: typeof House }[] = [
    { id: "reservation", label: t("cleaningReview.stepper.step.reservation"), icon: CalendarClock },
    { id: "employee", label: t("cleaningReview.stepper.step.employee"), icon: Users },
    { id: "details", label: t("cleaningReview.stepper.step.details"), icon: House },
    { id: "share", label: t("cleaningReview.stepper.step.share"), icon: Link2 },
  ]

  // Step data
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [creatingReservation, setCreatingReservation] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [additionalInfos, setAdditionalInfos] = useState("")
  const [generatedUri, setGeneratedUri] = useState<string | null>(null)
  const [generatedId, setGeneratedId] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Inline reservation form
  const reservationForm = useForm<CreateReservationSchema>({
    resolver: zodResolver(createReservationSchema),
    mode: "onChange",
    defaultValues: {
      housingId: undefined,
      moveInDate: "",
      moveOutDate: "",
      numberOfAdult: 1,
      numberOfChild: 0,
      numberOfBaby: 0,
      specialInfos: "",
    },
  })

  const handleCreateInlineReservation = async (data: CreateReservationSchema) => {
    const result = await createReservation(data)
    if (!result?.success) throw new Error(result?.message ?? "Failed to create reservation")
    setSelectedReservation(result.data as Reservation)
    setCreatingReservation(false)
    reservationForm.reset()
  }

  const goNext = () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1))
  const goPrev = () => setActiveStep((s) => Math.max(s - 1, 0))

  const handleFinish = async () => {
    if (!selectedReservation || !selectedEmployee) return
    setIsSubmitting(true)
    setError(undefined)
    const result = await createCleaningReview({
      reservationId: selectedReservation.id,
      assignedEmployeeId: selectedEmployee.id,
      additionnalInfos: additionalInfos || null,
      status: "Created",
    })
    setIsSubmitting(false)
    if (!result?.success) {
      setError(result?.message ?? "Something went wrong")
      return
    }
    const uri = (result.data as any)?.uri
    const id = (result.data as any)?.id
    setGeneratedUri(uri ?? null)
    setGeneratedId(id ?? null)
    setActiveStep(3)
  }

  const publicLink = generatedUri ? `${appUrl}/${locale}/review/${generatedUri}` : ""

  const handleCopy = async () => {
    if (!publicLink) return
    await navigator.clipboard.writeText(publicLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleSendEmail = async () => {
    if (!generatedId || !publicLink) return
    setIsSendingEmail(true)
    setError(undefined)
    const result = await sendCleaningReviewInvitation(generatedId, publicLink)
    setIsSendingEmail(false)
    if (!(result as any)?.success) {
      setError((result as any)?.message ?? "Failed to send email")
      return
    }
    setEmailSent(true)
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const isCompleted = i < activeStep
          const isActive = i === activeStep
          const Icon = step.icon
          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 transition-colors",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isActive &&
                      "border-primary bg-background text-primary",
                    !isCompleted &&
                      !isActive &&
                      "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mb-5 h-px flex-1 transition-colors",
                    i < activeStep ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="min-h-64">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            {/* STEP 1: Reservation */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{t("cleaningReview.stepper.reservation.title")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("cleaningReview.stepper.reservation.description")}
                  </p>
                </div>

                {!creatingReservation ? (
                  <>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {reservations.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          {t("cleaningReview.stepper.reservation.empty")}
                        </p>
                      )}
                      {reservations.map((r) => {
                        const isSelected = selectedReservation?.id === r.id
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedReservation(r)}
                            className={cn(
                              "w-full rounded-xl border p-4 text-left transition-colors",
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-accent"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium">
                                  {r.housing?.name ?? `Housing #${r.housingId}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(r.moveInDate).toLocaleDateString()} →{" "}
                                  {new Date(r.moveOutDate).toLocaleDateString()}
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setCreatingReservation(true)}
                    >
                      <Plus className="size-4" />
                      {t("cleaningReview.stepper.reservation.createNew")}
                    </Button>
                  </>
                ) : (
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
                    <p className="text-sm font-medium">{t("cleaningReview.stepper.reservation.newTitle")}</p>
                    <FieldGroup className="gap-4">
                      <Controller
                        control={reservationForm.control}
                        name="housingId"
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>{t("cleaningReview.stepper.reservation.housing.label")}</FieldLabel>
                            <Select
                              value={field.value ? String(field.value) : ""}
                              onValueChange={(v) => field.onChange(Number(v))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t("cleaningReview.stepper.reservation.housing.placeholder")} />
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
                      <div className="grid grid-cols-2 gap-3">
                        <Controller
                          control={reservationForm.control}
                          name="moveInDate"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel>{t("cleaningReview.stepper.reservation.moveIn")}</FieldLabel>
                              <Input type="date" {...field} />
                            </Field>
                          )}
                        />
                        <Controller
                          control={reservationForm.control}
                          name="moveOutDate"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel>{t("cleaningReview.stepper.reservation.moveOut")}</FieldLabel>
                              <Input type="date" {...field} />
                            </Field>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {(
                          [
                            ["numberOfAdult", t("cleaningReview.stepper.reservation.adults")],
                            ["numberOfChild", t("cleaningReview.stepper.reservation.children")],
                            ["numberOfBaby", t("cleaningReview.stepper.reservation.babies")],
                          ] as const
                        ).map(([name, label]) => (
                          <Controller
                            key={name}
                            control={reservationForm.control}
                            name={name}
                            render={({ field }) => (
                              <Field>
                                <FieldLabel>{label}</FieldLabel>
                                <Input
                                  type="number"
                                  min={0}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </Field>
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            !reservationForm.formState.isValid ||
                            reservationForm.formState.isSubmitting
                          }
                          onClick={reservationForm.handleSubmit(
                            handleCreateInlineReservation
                          )}
                        >
                          {reservationForm.formState.isSubmitting && (
                            <Loader2 className="size-4 animate-spin" />
                          )}
                          {t("cleaningReview.stepper.reservation.create")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCreatingReservation(false)
                            reservationForm.reset()
                          }}
                        >
                          {t("cleaningReview.stepper.reservation.cancel")}
                        </Button>
                      </div>
                    </FieldGroup>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    disabled={!selectedReservation}
                    onClick={goNext}
                  >
                    {t("cleaningReview.stepper.next")}
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Employee */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{t("cleaningReview.stepper.employee.title")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("cleaningReview.stepper.employee.description")}
                  </p>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {employees.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      {t("cleaningReview.stepper.employee.empty")}
                    </p>
                  )}
                  {employees.map((e) => {
                    const isSelected = selectedEmployee?.id === e.id
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setSelectedEmployee(e)}
                        className={cn(
                          "w-full rounded-xl border p-4 text-left transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs">
                                {e.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{e.fullName}</p>
                              {e.email && (
                                <p className="text-xs text-muted-foreground">
                                  {e.email}
                                </p>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="size-4 shrink-0 text-primary" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={goPrev}>
                    {t("cleaningReview.stepper.back")}
                  </Button>
                  <Button disabled={!selectedEmployee} onClick={goNext}>
                    {t("cleaningReview.stepper.next")}
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Details */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{t("cleaningReview.stepper.details.title")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("cleaningReview.stepper.details.description")}
                  </p>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 shrink-0">{t("cleaningReview.stepper.details.housing")}</span>
                    <span className="font-medium">
                      {selectedReservation?.housing?.name ??
                        `#${selectedReservation?.housingId}`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 shrink-0">{t("cleaningReview.stepper.details.employee")}</span>
                    <span className="font-medium">{selectedEmployee?.fullName}</span>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Field>
                  <FieldLabel>{t("cleaningReview.stepper.details.notes.label")}</FieldLabel>
                  <Textarea
                    placeholder={t("cleaningReview.stepper.details.notes.placeholder")}
                    rows={4}
                    value={additionalInfos}
                    onChange={(e) => setAdditionalInfos(e.target.value)}
                  />
                </Field>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={goPrev}>
                    {t("cleaningReview.stepper.back")}
                  </Button>
                  <Button onClick={handleFinish} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {t("cleaningReview.stepper.details.submit")}
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Share */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {t("cleaningReview.stepper.share.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Share the link below with{" "}
                      <strong>{selectedEmployee?.fullName}</strong> to let them
                      upload the video.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {t("cleaningReview.stepper.share.linkLabel")}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-lg bg-background border px-3 py-2 text-sm font-mono">
                      {publicLink}
                    </code>
                    <Button
                      size="icon"
                      variant={copied ? "default" : "outline"}
                      onClick={handleCopy}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("cleaningReview.stepper.share.linkDescription")}
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {selectedEmployee?.email && (
                  <Button
                    variant={emailSent ? "default" : "outline"}
                    className="gap-2 w-full"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail || emailSent}
                  >
                    {isSendingEmail ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : emailSent ? (
                      <Check className="size-4" />
                    ) : (
                      <Mail className="size-4" />
                    )}
                    {isSendingEmail
                      ? t("cleaningReview.stepper.share.sending")
                      : emailSent
                      ? t("cleaningReview.stepper.share.sent")
                      : t("cleaningReview.stepper.share.sendEmail")}
                  </Button>
                )}

                {generatedUri && generatedId && (
                  <>
                    <div className="relative flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted-foreground">or submit the video yourself</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <AdminVideoUploader
                      uri={generatedUri}
                      apiUrl={apiUrl}
                      reviewUrl={`/${locale}/app/cleaning-review/${generatedId}`}
                    />
                  </>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/${locale}/app/cleaning-review`)}
                  >
                    {t("cleaningReview.stepper.share.goToReviews")}
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveStep(0)
                      setSelectedReservation(null)
                      setSelectedEmployee(null)
                      setAdditionalInfos("")
                      setGeneratedUri(null)
                      setGeneratedId(null)
                      setCopied(false)
                      setEmailSent(false)
                      setError(undefined)
                    }}
                  >
                    {t("cleaningReview.stepper.share.createAnother")}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
