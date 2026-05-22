import { VerifyEmailForm } from "@/components/forms/verify-email.form"
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
    title: t("auth.verifyEmail.meta.title"),
    description: t("auth.verifyEmail.meta.description"),
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
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
