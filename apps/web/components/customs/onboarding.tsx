"use client"

import type { CreateManyEmployeeSchema } from "@/schemas/employee.schemas"
import type { CreateManyHousingSchema } from "@/schemas/housing.schemas"
import { createManyEmployees } from "@/services/employee.services"
import { createManyHousings } from "@/services/housing.services"
import { cn } from "@packages/functions"
import { Button } from "@packages/ui/button"
import { AnimatePresence, motion } from "framer-motion"
import {
  Check,
  ChevronRight,
  House,
  LucideIcon,
  Sparkles,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useMemo, useState } from "react"
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
      animate={{
        scale: active ? 1.01 : 1,
      }}
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

const onboardingSteps: Step[] = [
  {
    name: "Create your Housings",
    description: "Add all your actual Housings in the app",
    icon: House,
  },
  {
    name: "Add your employee",
    description: "If you have some employee for cleaning add them there",
    icon: Users,
  },
  {
    name: "Completed",
    description: "Start reviewing your housing",
    icon: Check,
  },
]

export const Onboarding: FunctionComponent<OnboardingProps> = () => {
  const router = useRouter()
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(() =>
    onboardingSteps.map(() => false)
  )

  const currentStep = useMemo(() => {
    return onboardingSteps[activeStepIndex] || onboardingSteps[0]
  }, [activeStepIndex])

  const completeStep = (stepIndex: number) => {
    setCompletedSteps((prev) => {
      const next = [...prev]
      next[stepIndex] = true
      return next
    })
  }

  const canNavigateToStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= onboardingSteps.length) return false
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
    setActiveStepIndex((current) =>
      Math.min(current + 1, onboardingSteps.length - 1)
    )
  }

  const handleCreateHousingsNext = async (data: CreateManyHousingSchema) => {
    const result = await createManyHousings(data)
    if (!result?.success) {
      throw new Error(result?.message ?? "Unable to create housings")
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
      throw new Error(result?.message ?? "Unable to create employees")
    }
    completeStep(1)
    goToNextStep()
  }

  const finishOnboarding = () => {
    router.push("/")
  }

  return (
    <div className="relative z-10 mx-auto flex h-screen w-full items-center gap-2 p-2">
      <div className="h-full w-full max-w-lg space-y-6 rounded-xl border bg-sidebar">
        <div className="space-y-4 p-6 pb-0">
          <h1 className="text-2xl font-bold">Welcome to the Onboarding!</h1>
          <p className="text-muted-foreground">
            This is a placeholder for the onboarding process. You can customize
            this component to fit your needs.
          </p>
        </div>

        <div className="space-y-2">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.name}
              onClick={() => switchStep(index)}
              className="select-none"
            >
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
      <div className="h-full flex-1 overflow-y-auto">
        <div className="mx-auto mt-36 w-full max-w-2xl space-y-6 px-4">
          <div>
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
                <OnboardingCreateHousingsForm
                  handleNext={handleCreateHousingsNext}
                />
              ) : activeStepIndex === 1 ? (
                <OnboardingCreateEmployeesForm
                  handleNext={handleCreateEmployeesNext}
                  handleSkip={handleEmployeeNext}
                />
              ) : (
                <div className="overflow-hidden rounded-2xl border bg-card">
                  <div className="space-y-6 p-8 md:p-10">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                        <Sparkles className="size-5" />
                      </div>
                      <div className="rounded-full border bg-background/80 px-3 py-1 text-sm font-medium text-foreground/80">
                        Setup complete
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h2 className="max-w-xl text-3xl font-semibold tracking-tight">
                        Your workspace is ready for the first cleaning review.
                      </h2>
                      <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                        Your housings and team setup are in place. From here,
                        you can start managing reservations and run reviews with
                        a cleaner workflow.
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border bg-background/80 p-4">
                        <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-accent">
                          <House className="size-4" />
                        </div>
                        <p className="text-sm font-medium">Housings added</p>
                        <p className="text-sm text-muted-foreground">
                          Your properties are ready to receive bookings.
                        </p>
                      </div>
                      <div className="rounded-2xl border bg-background/80 p-4">
                        <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-accent">
                          <Users className="size-4" />
                        </div>
                        <p className="text-sm font-medium">Team prepared</p>
                        <p className="text-sm text-muted-foreground">
                          Employee profiles are available for assignment.
                        </p>
                      </div>
                      <div className="rounded-2xl border bg-background/80 p-4">
                        <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-accent">
                          <Check className="size-4" />
                        </div>
                        <p className="text-sm font-medium">You are ready</p>
                        <p className="text-sm text-muted-foreground">
                          Jump into the dashboard and keep the momentum going.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="lg"
                        onClick={finishOnboarding}
                      >
                        Enter workspace
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
