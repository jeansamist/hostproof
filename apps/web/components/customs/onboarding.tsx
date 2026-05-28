"use client"

import { useI18n } from "@/lib/i18n/client"
import type { CreateManyEmployeeSchema } from "@/schemas/employee.schemas"
import type { CreateManyHousingSchema } from "@/schemas/housing.schemas"
import { createManyEmployees } from "@/services/employee.services"
import { createManyHousings } from "@/services/housing.services"
import { cn } from "@packages/functions"
import { Button } from "@packages/ui/button"
import { AnimatePresence, motion } from "framer-motion"
import {
  Check,
  CheckSquare,
  ChevronRight,
  House,
  LucideIcon,
  Sparkles,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useMemo, useState } from "react"
import { OnboardingCreateChecklistForm } from "../forms/onboarding-create-checklist.form"
import { OnboardingCreateEmployeesForm } from "../forms/onboarding-create-employees.form"
import { OnboardingCreateHousingsForm } from "../forms/onboarding-create-housings.form"

export type OnboardingProps = {
  [key: string]: unknown
}

interface Step {
  name: string
  description: string
  icon: LucideIcon
}

type StepItemProps = Step & {
  active: boolean
  completed: boolean
  disabled: boolean
}

const StepItem: FunctionComponent<StepItemProps> = ({
  active,
  completed,
  disabled,
  description,
  icon: Icon,
  name,
}) => {
  return (
    <motion.div
      layout
      className={cn(
        "mx-2 flex items-center gap-4 rounded-2xl bg-transparent p-4 transition-colors",
        !disabled && "cursor-pointer hover:bg-accent",
        disabled && "cursor-not-allowed opacity-60",
        active && "bg-accent"
      )}
      initial={false}
      animate={{ scale: active ? 1.01 : 1 }}
    >
      <Button
        size={"icon-lg"}
        variant={!completed ? "outline" : "default"}
        className={cn(!completed && "bg-background hover:bg-background")}
        disabled={disabled}
      >
        {completed ? <Check /> : <Icon />}
      </Button>
      <div>
        <div className="line-clamp-1 text-lg font-semibold">{name}</div>
        <div className="line-clamp-1 text-sm text-muted-foreground">
          {description}
        </div>
      </div>
    </motion.div>
  )
}

const STEP_COUNT = 4

export const Onboarding: FunctionComponent<OnboardingProps> = () => {
  const t = useI18n()
  const router = useRouter()
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(() =>
    Array<boolean>(STEP_COUNT).fill(false)
  )

  const localizedSteps: Step[] = [
    {
      name: t("onboarding.step.housings.name"),
      description: t("onboarding.step.housings.description"),
      icon: House,
    },
    {
      name: t("onboarding.step.employees.name"),
      description: t("onboarding.step.employees.description"),
      icon: Users,
    },
    {
      name: t("onboarding.step.checklist.name"),
      description: t("onboarding.step.checklist.description"),
      icon: CheckSquare,
    },
    {
      name: t("onboarding.step.completed.name"),
      description: t("onboarding.step.completed.description"),
      icon: Check,
    },
  ]

  const currentStep = useMemo(
    () => localizedSteps[activeStepIndex] || localizedSteps[0],
    [activeStepIndex, localizedSteps]
  )

  const completeStep = (stepIndex: number) => {
    setCompletedSteps((prev) => {
      const next = [...prev]
      next[stepIndex] = true
      return next
    })
  }

  const canNavigateToStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= STEP_COUNT) return false
    if (stepIndex < activeStepIndex) return false
    for (let i = 0; i < stepIndex; i++) {
      if (!completedSteps[i]) return false
    }
    return true
  }

  const switchStep = (stepIndex: number) => {
    if (!canNavigateToStep(stepIndex)) return
    setActiveStepIndex(stepIndex)
  }

  const goToNextStep = () => {
    setActiveStepIndex((current) => Math.min(current + 1, STEP_COUNT - 1))
  }

  const handleCreateHousingsNext = async (data: CreateManyHousingSchema) => {
    const result = await createManyHousings(data)
    if (!result?.success) {
      throw new Error(result?.message ?? t("onboarding.error.createHousings"))
    }
    completeStep(0)
    goToNextStep()
  }

  const handleEmployeeNext = () => {
    completeStep(1)
    goToNextStep()
  }

  const handleCreateEmployeesNext = async (data: CreateManyEmployeeSchema) => {
    const result = await createManyEmployees(data)
    if (!result?.success) {
      throw new Error(result?.message ?? t("onboarding.error.createEmployees"))
    }
    completeStep(1)
    goToNextStep()
  }

  const handleChecklistNext = () => {
    completeStep(2)
    goToNextStep()
  }

  const finishOnboarding = () => {
    router.push("/")
  }

  const progressPercent = Math.round((activeStepIndex / STEP_COUNT) * 100)

  return (
    <div className="relative z-10 mx-auto flex h-screen w-full flex-col lg:flex-row lg:items-center lg:gap-2 lg:p-2">

      {/* ── Desktop sidebar ──────────────────────────── */}
      <div className="hidden lg:flex h-full w-full max-w-lg shrink-0 flex-col space-y-6 rounded-xl border bg-sidebar">
        <div className="space-y-4 p-6 pb-0">
          <h1 className="text-2xl font-bold">{t("onboarding.sidebar.title")}</h1>
          <p className="text-muted-foreground">{t("onboarding.sidebar.description")}</p>
        </div>
        <div className="space-y-2">
          {localizedSteps.map((step, index) => (
            <div key={step.name} onClick={() => switchStep(index)} className="select-none">
              <StepItem
                {...step}
                active={index === activeStepIndex}
                completed={completedSteps[index]}
                disabled={!canNavigateToStep(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile progress header ───────────────────── */}
      <div className="lg:hidden shrink-0 border-b bg-sidebar px-5 pb-4 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t("onboarding.sidebar.title")}
          </span>
          <span className="tabular-nums text-sm font-medium">
            {activeStepIndex + 1} / {STEP_COUNT}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="mt-3">
          <p className="font-semibold">{currentStep.name}</p>
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>
        </div>
      </div>

      {/* ── Content area ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto mt-8 w-full max-w-2xl space-y-6 px-4 pb-8 lg:mt-36">
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold">{currentStep.name}</h1>
            <p className="text-muted-foreground">{currentStep.description}</p>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeStepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeStepIndex === 0 ? (
                <OnboardingCreateHousingsForm handleNext={handleCreateHousingsNext} />
              ) : activeStepIndex === 1 ? (
                <OnboardingCreateEmployeesForm
                  handleNext={handleCreateEmployeesNext}
                  handleSkip={handleEmployeeNext}
                />
              ) : activeStepIndex === 2 ? (
                <OnboardingCreateChecklistForm
                  handleNext={handleChecklistNext}
                  handleSkip={handleChecklistNext}
                />
              ) : (
                <div className="overflow-hidden rounded-2xl border bg-card">
                  <div className="space-y-6 p-8 md:p-10">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                        <Sparkles className="size-5" />
                      </div>
                      <div className="rounded-full border bg-background/80 px-3 py-1 text-sm font-medium text-foreground/80">
                        {t("onboarding.completed.badge")}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h2 className="max-w-xl text-3xl font-semibold tracking-tight">
                        {t("onboarding.completed.title")}
                      </h2>
                      <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                        {t("onboarding.completed.description")}
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border bg-background/80 p-4">
                        <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-accent">
                          <House className="size-4" />
                        </div>
                        <p className="text-sm font-medium">
                          {t("onboarding.completed.card.housings.title")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("onboarding.completed.card.housings.description")}
                        </p>
                      </div>
                      <div className="rounded-2xl border bg-background/80 p-4">
                        <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-accent">
                          <Users className="size-4" />
                        </div>
                        <p className="text-sm font-medium">
                          {t("onboarding.completed.card.employees.title")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("onboarding.completed.card.employees.description")}
                        </p>
                      </div>
                      <div className="rounded-2xl border bg-background/80 p-4">
                        <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-accent">
                          <Check className="size-4" />
                        </div>
                        <p className="text-sm font-medium">
                          {t("onboarding.completed.card.ready.title")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("onboarding.completed.card.ready.description")}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="button" size="lg" onClick={finishOnboarding}>
                        {t("onboarding.completed.action.enter")}
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
