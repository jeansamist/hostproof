import { VerifyEmailForm } from "@/components/forms/verify-email.form"
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

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ email?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  return {
    title: t("auth.verifyEmail.meta.title"),
    description: t("auth.verifyEmail.meta.description"),
  }
}

export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const { email } = await searchParams
  const t = await getI18n()
  return (
    <React.Fragment>
      <CardHeader>
        <CardTitle>{t("auth.verifyEmail.page.title")}</CardTitle>
        {email && (
          <CardDescription>
            {t("auth.verifyEmail.sent")}{" "}
            <strong className="font-semibold text-foreground underline">
              {email}
            </strong>
            {t("auth.verifyEmail.checkInbox")}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <VerifyEmailForm email={email ?? ""} />
      </CardContent>
    </React.Fragment>
  )
}
