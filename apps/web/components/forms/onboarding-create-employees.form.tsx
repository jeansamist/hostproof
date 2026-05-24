"use client"

import { createManyEmployeeSchema, type CreateManyEmployeeSchema } from "@/schemas/employee.schemas"
import { uploadFile } from "@/services/upload.services"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@packages/functions"
import { Alert, AlertDescription } from "@packages/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui/avatar"
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
import { Camera, LoaderCircle, Plus, Trash, Upload } from "lucide-react"
import { type ChangeEvent, type FunctionComponent, useEffect, useState } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod/v3"

type OnboardingCreateEmployeeItem = CreateManyEmployeeSchema["employees"][number] & {
  avatarFile?: File | null
}

type OnboardingCreateEmployeesFormValues = {
  employees: OnboardingCreateEmployeeItem[]
}

const onboardingCreateManyEmployeeSchema = z.object({
  employees: z.array(
    createManyEmployeeSchema.shape.employees.element.extend({
      avatarFile: z.instanceof(File).nullable().optional(),
    })
  ),
})

export type OnboardingCreateEmployeesFormProps = {
  handleNext: (data: CreateManyEmployeeSchema) => Promise<void> | void
  handleSkip: () => void
  [key: string]: unknown
}

export const OnboardingCreateEmployeesForm: FunctionComponent<
  OnboardingCreateEmployeesFormProps
> = ({ handleNext, handleSkip }) => {
  const form = useForm<OnboardingCreateEmployeesFormValues>({
    resolver: zodResolver(onboardingCreateManyEmployeeSchema),
    mode: "onChange",
    defaultValues: {
      employees: [
        {
          email: null,
          fullName: "",
          gender: "male",
          tel: null,
          avatar: null,
          avatarFile: null,
        },
      ],
    },
  })
  const [errorMessage, setErrorMessage] = useState<string>()
  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: "employees",
  })
  const employees = useWatch({
    control: form.control,
    name: "employees",
  })
  const [avatarPreviews, setAvatarPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = (employees ?? []).map((employee) =>
      employee?.avatarFile ? URL.createObjectURL(employee.avatarFile) : ""
    )

    setAvatarPreviews(urls)

    return () => {
      for (const url of urls) {
        if (url) {
          URL.revokeObjectURL(url)
        }
      }
    }
  }, [employees])

  async function onSubmit(data: OnboardingCreateEmployeesFormValues) {
    try {
      setErrorMessage(undefined)

      const employees: CreateManyEmployeeSchema["employees"] = []

      for (const employee of data.employees) {
        let avatar = employee.avatar ?? null

        if (employee.avatarFile) {
          const uploadResult = await uploadFile({
            file: employee.avatarFile,
            purpose: "employee-avatar",
          })

          if (!uploadResult.success || !uploadResult.data) {
            throw new Error(uploadResult.message ?? "Unable to upload avatar")
          }

          avatar =
            (uploadResult.data as { uri?: string; localPath?: string }).uri ??
            (uploadResult.data as { localPath?: string }).localPath ??
            null
        }

        employees.push({
          avatar,
          email: employee.email ?? null,
          fullName: employee.fullName,
          gender: employee.gender,
          tel: employee.tel ?? null,
        })
      }

      await handleNext({ employees })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error")
    }
  }

  const onAvatarChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    form.setValue(`employees.${index}.avatarFile`, file, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const clearAvatar = (index: number) => {
    form.setValue(`employees.${index}.avatarFile`, null, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <form
      id="onboarding-create-employees-form"
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
              <CardContent className="space-y-4">
                <Field className="flex-1">
                  <FieldLabel>Avatar</FieldLabel>
                  <label
                    htmlFor={`employee-avatar-${field.id}`}
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 rounded-3xl border border-dashed border-border/80 bg-muted/20 p-3 transition-all hover:border-primary/40 hover:bg-accent/30",
                      "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40"
                    )}
                  >
                    <Input
                      id={`employee-avatar-${field.id}`}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(event) => onAvatarChange(index, event)}
                      className="sr-only"
                    />
                    <div className="relative shrink-0">
                      <Avatar className="size-14 ring-2 ring-background shadow-sm">
                        {avatarPreviews[index] ? (
                          <AvatarImage src={avatarPreviews[index]} />
                        ) : null}
                        <AvatarFallback>
                          {employees?.[index]?.fullName?.slice(0, 1) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -right-1 -bottom-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm">
                        {avatarPreviews[index] ? (
                          <Camera className="size-3" />
                        ) : (
                          <Upload className="size-3" />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-medium">
                        {employees?.[index]?.avatarFile?.name ?? "Choose an avatar"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG or WEBP. Optional.
                      </p>
                    </div>
                    {avatarPreviews[index] ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={(event) => {
                          event.preventDefault()
                          clearAvatar(index)
                        }}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </label>
                </Field>

                <FieldGroup className="flex-row gap-3">
                  <Field
                    data-invalid={
                      !!form.formState.errors.employees?.[index]?.fullName
                    }
                    className="w-full flex-1"
                  >
                    <FieldLabel className="block w-full">Full name</FieldLabel>
                    <Input {...form.register(`employees.${index}.fullName`)} />
                    <FieldError
                      errors={[
                        form.formState.errors.employees?.[index]?.fullName,
                      ]}
                    />
                  </Field>
                  <Field
                    data-invalid={!!form.formState.errors.employees?.[index]?.gender}
                    className="w-full max-w-44"
                  >
                    <FieldLabel className="block w-full">Gender</FieldLabel>
                    <Controller
                      control={form.control}
                      name={`employees.${index}.gender`}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a gender" />
                          </SelectTrigger>
                          <SelectContent position="item-aligned">
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError
                      errors={[form.formState.errors.employees?.[index]?.gender]}
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup className="flex-row gap-3">
                  <Field className="w-full flex-1">
                    <FieldLabel className="block w-full">Email</FieldLabel>
                    <Input
                      type="email"
                      {...form.register(`employees.${index}.email`, {
                        setValueAs: (value) => value || null,
                      })}
                    />
                    <FieldError
                      errors={[form.formState.errors.employees?.[index]?.email]}
                    />
                  </Field>
                  <Field className="w-full flex-1">
                    <FieldLabel className="block w-full">Phone</FieldLabel>
                    <Input
                      {...form.register(`employees.${index}.tel`, {
                        setValueAs: (value) => value || null,
                      })}
                    />
                    <FieldError
                      errors={[form.formState.errors.employees?.[index]?.tel]}
                    />
                  </Field>
                </FieldGroup>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        variant="ghost"
        type="button"
        onClick={() =>
          append({
            email: null,
            fullName: "",
            gender: "male",
            tel: null,
            avatar: null,
            avatarFile: null,
          })
        }
        className="w-full"
        size="lg"
      >
        <Plus />
        Add an employee
      </Button>

      <div className="flex gap-3 pt-2">
        <Button type="button" size="lg" variant="outline" onClick={handleSkip}>
          Skip for now
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
          form="onboarding-create-employees-form"
          className="flex-1"
        >
          Next
          {form.formState.isSubmitting && (
            <LoaderCircle className="animate-spin" />
          )}
        </Button>
      </div>
    </form>
  )
}
