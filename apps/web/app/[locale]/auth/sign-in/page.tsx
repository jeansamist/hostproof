import { SignInForm } from "@/components/forms/sign-in.form"
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
    title: t("auth.signIn.meta.title"),
    description: t("auth.signIn.meta.description"),
  }
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  setStaticParamsLocale(locale)
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
