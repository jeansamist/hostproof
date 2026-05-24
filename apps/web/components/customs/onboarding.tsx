"use client"

import type { CreateManyHousingSchema } from "@/schemas/housing.schemas"
import { createManyHousings } from "@/services/housing.services"
import { cn } from "@packages/functions"
import { Button } from "@packages/ui/button"
import { Check, House, LucideIcon, Users } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { FunctionComponent, useMemo, useState } from "react"
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
                <OnboardingCreateHousingsForm handleNext={handleCreateHousingsNext} />
              ) : activeStepIndex === 1 ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    You can add employees later from your settings.
                  </p>
                  <div className="flex justify-end">
                    <Button type="button" size="lg" onClick={handleEmployeeNext}>
                      Skip
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Your onboarding is complete. You can start using the app.
                  </p>
                  <div className="flex justify-end">
                    <Button type="button" size="lg" onClick={finishOnboarding}>
                      Go to home
                    </Button>
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
