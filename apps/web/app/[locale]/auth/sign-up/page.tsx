import { SignUpForm } from "@/components/forms/sign-up.form"
import { getI18n } from "@/lib/i18n/server"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/card"
import type { Metadata } from "next"
import React from "react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n()
  return {
    title: t("auth.signUp.meta.title"),
    description: t("auth.signUp.meta.description"),
  }
}

export default async function Page() {
  const t = await getI18n()
  return (
    <React.Fragment>
      <CardHeader>
        <CardTitle>{t("auth.signUp.page.title")}</CardTitle>
        <CardDescription>{t("auth.signUp.page.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </React.Fragment>
  )
}
