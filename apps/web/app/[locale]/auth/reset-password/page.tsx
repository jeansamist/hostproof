import { ResetPasswordForm } from "@/components/forms/reset-password.form"
import { getI18n } from "@/lib/i18n/server"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/card"
import type { Metadata } from "next"
import { setStaticParamsLocale } from "next-international/server"
import { redirect } from "next/navigation"
import React from "react"

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ email?: string; resetPasswordToken?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  return {
    title: t("auth.resetPassword.meta.title"),
    description: t("auth.resetPassword.meta.description"),
  }
}

export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const { email, resetPasswordToken } = await searchParams

  if (!email || !resetPasswordToken) {
    redirect("/auth/sign-in")
  }

  const t = await getI18n()
  return (
    <React.Fragment>
      <CardHeader>
        <CardTitle>{t("auth.resetPassword.page.title")}</CardTitle>
        <CardDescription>
          {t("auth.resetPassword.page.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm
          email={email}
          resetPasswordToken={resetPasswordToken}
        />
      </CardContent>
    </React.Fragment>
  )
}
