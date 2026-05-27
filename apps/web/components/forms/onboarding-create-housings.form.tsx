"use client"

import { useI18n } from "@/lib/i18n/client"
import {
  createManyHousingSchema,
  CreateManyHousingSchema,
} from "@/schemas/housing.schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription } from "@packages/ui/alert"
import { Button } from "@packages/ui/button"
import { Card, CardContent } from "@packages/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@packages/ui/field"
import { Input } from "@packages/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/select"
import { AnimatePresence, motion } from "framer-motion"
import { LoaderCircle, Plus, Trash } from "lucide-react"
import { FunctionComponent, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"

export type OnboardingCreateHousingsFormProps = {
  handleNext: (data: CreateManyHousingSchema) => Promise<void> | void
  [key: string]: unknown
}

export const OnboardingCreateHousingsForm: FunctionComponent<
  OnboardingCreateHousingsFormProps
> = ({ handleNext }) => {
  const t = useI18n()
  const form = useForm<CreateManyHousingSchema>({
    resolver: zodResolver(createManyHousingSchema),
    mode: "onChange",
    defaultValues: {
      housings: [
        {
          address: "",
          capacity: 1,
          name: "",
          type: "apartment",
        },
      ],
    },
  })
  const [errorMessage, setErrorMessage] = useState<string>()
  // const router = useRouter()

  async function onSubmit(data: CreateManyHousingSchema) {
    try {
      setErrorMessage(undefined)
      await handleNext(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("onboarding.error.unknown"))
    }
  }
  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: "housings",
  })
  return (
    <form
      id="onboarding-create-housings-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <AnimatePresence initial={false}>
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            <Card>
              <CardContent className="space-y-3">
                <FieldGroup className="flex-row gap-3">
                  <Field
                    data-invalid={
                      !!form.formState.errors.housings?.[index]?.name
                    }
                    className="w-full flex-1"
                  >
                    <FieldLabel className="block w-full">
                      {t("onboarding.housings.field.name")}
                    </FieldLabel>
                    <Input {...form.register(`housings.${index}.name`)} />
                    <FieldError
                      errors={[form.formState.errors.housings?.[index]?.name]}
                    />
                  </Field>
                  <Field
                    data-invalid={
                      !!form.formState.errors.housings?.[index]?.capacity
                    }
                    className="w-full max-w-20"
                  >
                    <FieldLabel className="block w-full">
                      {t("onboarding.housings.field.capacity")}
                    </FieldLabel>
                    <Input
                      {...form.register(`housings.${index}.capacity`, {
                        valueAsNumber: true,
                      })}
                      type="number"
                      min={1}
                    />
                    <FieldError
                      errors={[
                        form.formState.errors.housings?.[index]?.capacity,
                      ]}
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup className="flex-row gap-3">
                  <Field
                    data-invalid={
                      !!form.formState.errors.housings?.[index]?.type
                    }
                    className="w-full max-w-40"
                  >
                    <FieldLabel className="block w-full">
                      {t("onboarding.housings.field.type")}
                    </FieldLabel>
                    <Controller
                      control={form.control}
                      name={`housings.${index}.type`}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("onboarding.housings.type.placeholder")}
                            />
                          </SelectTrigger>
                          <SelectContent position="item-aligned">
                            <SelectItem value="apartment">
                              {t("onboarding.housings.type.apartment")}
                            </SelectItem>
                            <SelectItem value="house">
                              {t("onboarding.housings.type.house")}
                            </SelectItem>
                            <SelectItem value="villa">
                              {t("onboarding.housings.type.villa")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError
                      errors={[form.formState.errors.housings?.[index]?.type]}
                    />
                  </Field>
                  <Field
                    data-invalid={
                      !!form.formState.errors.housings?.[index]?.address
                    }
                    className="w-full flex-1"
                  >
                    <FieldLabel className="block w-full">
                      {t("onboarding.housings.field.address")}
                    </FieldLabel>
                    <Input {...form.register(`housings.${index}.address`)} />
                    <FieldError
                      errors={[
                        form.formState.errors.housings?.[index]?.address,
                      ]}
                    />
                  </Field>
                </FieldGroup>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant={"destructive"}
                    onClick={() => remove(index)}
                  >
                    <Trash />
                    {t("onboarding.housings.action.delete")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
      <Button
        variant={"ghost"}
        type="button"
        onClick={() =>
          append({
            address: "",
            capacity: 1,
            name: "",
            type: "villa",
          })
        }
        className="w-full"
        size={"lg"}
      >
        <Plus /> {t("onboarding.housings.action.add")}
      </Button>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
          form="onboarding-create-housings-form"
          className="w-full"
        >
          {t("onboarding.housings.action.next")}
          {form.formState.isSubmitting && (
            <LoaderCircle className="animate-spin" />
          )}
        </Button>
      </div>
    </form>
  )
}
