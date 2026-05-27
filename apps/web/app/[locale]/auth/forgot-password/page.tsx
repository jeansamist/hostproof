import { ForgotPasswordForm } from "@/components/forms/forgot-password.form"
import { getI18n } from "@/lib/i18n/server"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/card"
import type { Metadata } from "next"
import { setStaticParamsLocale } from "next-international/server"
import React from "react"

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  return {
    title: t("auth.forgotPassword.meta.title"),
    description: t("auth.forgotPassword.meta.description"),
  }
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  return (
    <React.Fragment>
      <CardHeader>
        <CardTitle>{t("auth.forgotPassword.page.title")}</CardTitle>
        <CardDescription>
          {t("auth.forgotPassword.page.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </React.Fragment>
  )
}
