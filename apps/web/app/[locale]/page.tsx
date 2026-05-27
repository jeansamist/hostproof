import { LandingPage } from "@/components/landing/landing-page"
import { setStaticParamsLocale } from "next-international/server"

type PageProps = { params: Promise<{ locale: string }> }

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  return <LandingPage locale={locale} />
}
