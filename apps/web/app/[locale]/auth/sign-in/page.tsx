import { SignInForm } from "@/components/forms/sign-in.form"
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
    title: t("auth.signIn.meta.title"),
    description: t("auth.signIn.meta.description"),
  }
}

export default async function Page() {
  const t = await getI18n()
  return (
    <React.Fragment>
      <CardHeader>
        <CardTitle>{t("auth.signIn.page.title")}</CardTitle>
        <CardDescription>{t("auth.signIn.page.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
    </React.Fragment>
  )
}
