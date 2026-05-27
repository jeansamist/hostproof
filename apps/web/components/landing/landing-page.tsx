import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@packages/ui/accordion"
import { getI18n } from "@/lib/i18n/server"
import Link from "next/link"
import { LangSwitch } from "./lang-switch"

type Props = {
  locale: string
}

export async function LandingPage({ locale }: Props) {
  const t = await getI18n()

  const steps = [
    { title: t("landing.how.step1.title"), desc: t("landing.how.step1.desc") },
    { title: t("landing.how.step2.title"), desc: t("landing.how.step2.desc") },
    { title: t("landing.how.step3.title"), desc: t("landing.how.step3.desc") },
    { title: t("landing.how.step4.title"), desc: t("landing.how.step4.desc") },
  ]

  const benefits = [
    t("landing.benefits.item1"),
    t("landing.benefits.item2"),
    t("landing.benefits.item3"),
    t("landing.benefits.item4"),
    t("landing.benefits.item5"),
  ]

  const monthlyFeatures = [
    t("landing.pricing.feature.unlimitedProperties"),
    t("landing.pricing.feature.unlimitedScans"),
    t("landing.pricing.feature.todoList"),
    t("landing.pricing.feature.voice"),
    t("landing.pricing.feature.emailSupport"),
  ]

  const annualFeatures = [
    t("landing.pricing.feature.unlimitedProperties"),
    t("landing.pricing.feature.unlimitedScans"),
    t("landing.pricing.feature.todoList"),
    t("landing.pricing.feature.voice"),
    t("landing.pricing.feature.prioritySupport"),
    t("landing.pricing.feature.advancedDashboard"),
    t("landing.pricing.feature.export"),
  ]

  const testimonials = [
    {
      text: t("landing.testimonials.1.text"),
      name: t("landing.testimonials.1.name"),
      role: t("landing.testimonials.1.role"),
      initials: "SL",
    },
    {
      text: t("landing.testimonials.2.text"),
      name: t("landing.testimonials.2.name"),
      role: t("landing.testimonials.2.role"),
      initials: "MD",
    },
  ]

  const faqs = [
    { q: t("landing.faq.1.q"), a: t("landing.faq.1.a") },
    { q: t("landing.faq.2.q"), a: t("landing.faq.2.a") },
    { q: t("landing.faq.3.q"), a: t("landing.faq.3.a") },
    { q: t("landing.faq.4.q"), a: t("landing.faq.4.a") },
  ]

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-[880px] mx-auto px-4 py-4">

        {/* ─── Navbar ─── */}
        <nav className="flex items-center justify-between flex-wrap gap-4 py-3 mb-6">
          <span className="text-2xl font-bold tracking-tight text-primary">
            CleanPilot
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {t("landing.nav.howItWorks")}
            </a>
            <div className="flex gap-2 items-center">
              <Link
                href={`/${locale}/auth/sign-up`}
                className="text-sm font-medium border border-primary text-primary px-4 py-1.5 rounded-full hover:bg-accent transition-colors"
              >
                {t("landing.nav.signUp")}
              </Link>
              <Link
                href={`/${locale}/auth/sign-in`}
                className="text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:bg-primary/80 transition-colors"
              >
                {t("landing.nav.signIn")}
              </Link>
            </div>
            <LangSwitch currentLocale={locale} />
          </div>
        </nav>

        {/* ─── Hero ─── */}
        <section className="bg-secondary border border-border rounded-2xl p-8 mb-8 text-center">
          <span className="inline-block bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400 text-xs font-medium px-4 py-1 rounded-full mb-4">
            {t("landing.hero.badge")}
          </span>
          <h1 className="text-[1.9rem] sm:text-[2.2rem] font-semibold tracking-tight leading-tight mb-4">
            {t("landing.hero.title")}{" "}
            <span className="text-primary">{t("landing.hero.titleAccent")}</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            {t("landing.hero.description")}
          </p>
          <a
            href="#"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold text-base hover:bg-primary/80 transition-colors mb-2"
          >
            {t("landing.hero.cta")}
          </a>
          <p className="text-xs text-muted-foreground">{t("landing.hero.trust")}</p>

          {/* Phone mockup */}
          <div className="bg-card border border-border rounded-2xl p-4 mt-6 max-w-[280px] mx-auto text-left">
            <div className="bg-muted rounded-xl h-20 flex items-center justify-center text-xs text-muted-foreground mb-3">
              📹 {t("landing.hero.phone.room")}
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-400 px-3 py-2 rounded-lg text-sm font-medium mb-2">
              {t("landing.hero.phone.checkOk")}
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium">
              {t("landing.hero.phone.checkFail")}
            </div>
          </div>
        </section>

        {/* ─── Problem ─── */}
        <section className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {t("landing.problem.label")}
          </p>
          <h2 className="text-[1.8rem] font-semibold tracking-tight mb-4">
            {t("landing.problem.title")}
          </h2>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5">
            <p className="font-medium text-foreground mb-4 leading-relaxed">
              {t("landing.problem.quote")}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {t("landing.problem.stat1.num")}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {t("landing.problem.stat1.label")}
                </div>
              </div>
              <div className="bg-card border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {t("landing.problem.stat2.num")}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {t("landing.problem.stat2.label")}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section id="how-it-works" className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {t("landing.how.label")}
          </p>
          <h2 className="text-[1.8rem] font-semibold tracking-tight mb-2">
            {t("landing.how.title")}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {t("landing.how.description")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-primary text-sm mb-3">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Benefits ─── */}
        <section className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {t("landing.benefits.label")}
          </p>
          <h2 className="text-[1.8rem] font-semibold tracking-tight mb-4">
            {t("landing.benefits.title")}
          </h2>
          <ul className="flex flex-col gap-3 mb-4">
            {benefits.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-amber-500 mt-0.5 shrink-0">★</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-xl p-3 flex gap-2 text-sm">
            <span className="shrink-0">💡</span>
            <p>{t("landing.benefits.bonus")}</p>
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {t("landing.pricing.label")}
          </p>
          <h2 className="text-[1.8rem] font-semibold tracking-tight mb-6">
            {t("landing.pricing.title")}
          </h2>
          <div className="flex gap-6 flex-wrap">
            {/* Monthly */}
            <div className="flex-1 min-w-[220px] bg-card border border-border rounded-2xl p-6 text-center flex flex-col">
              <div className="text-[2.2rem] font-bold mb-1">
                {t("landing.pricing.monthly.price")}
                <span className="text-base font-normal text-muted-foreground">
                  {t("landing.pricing.monthly.period")}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                {t("landing.pricing.monthly.sub")}
              </p>
              <ul className="text-left text-sm space-y-2 mb-6 flex-1">
                {monthlyFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="block w-full bg-primary text-primary-foreground text-center py-2.5 rounded-full font-semibold hover:bg-primary/80 transition-colors text-sm"
              >
                {t("landing.pricing.monthly.cta")}
              </a>
            </div>

            {/* Annual — recommended */}
            <div className="flex-1 min-w-[220px] bg-card border-2 border-primary rounded-2xl p-6 text-center relative shadow-md flex flex-col">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                {t("landing.pricing.annual.badge")}
              </div>
              <div className="text-[2.2rem] font-bold mb-1">
                {t("landing.pricing.annual.price")}
                <span className="text-base font-normal text-muted-foreground">
                  {t("landing.pricing.annual.period")}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                {t("landing.pricing.annual.sub")}
              </p>
              <ul className="text-left text-sm space-y-2 mb-6 flex-1">
                {annualFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="block w-full bg-primary text-primary-foreground text-center py-2.5 rounded-full font-semibold hover:bg-primary/80 transition-colors text-sm"
              >
                {t("landing.pricing.annual.cta")}
              </a>
            </div>
          </div>
          <div className="mt-4 inline-block bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-full px-4 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
            {t("landing.pricing.limitedOffer")}
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {t("landing.testimonials.label")}
          </p>
          <h2 className="text-[1.8rem] font-semibold tracking-tight mb-4">
            {t("landing.testimonials.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testimonials.map((testi, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4">
                <div className="text-amber-400 mb-2 tracking-wide">★★★★★</div>
                <p className="italic text-sm mb-4 text-foreground/80">{testi.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {testi.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testi.name}</p>
                    <p className="text-xs text-muted-foreground">{testi.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            {t("landing.faq.label")}
          </p>
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="bg-primary rounded-2xl p-8 text-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-primary-foreground mb-3">
            {t("landing.finalCta.title")}
          </h2>
          <p className="text-primary-foreground/80 mb-6">
            {t("landing.finalCta.description")}
          </p>
          <a
            href="#"
            className="inline-block bg-card text-primary px-6 py-3 rounded-full font-semibold hover:bg-card/90 transition-colors"
          >
            {t("landing.finalCta.cta")}
          </a>
          <p className="mt-3 text-xs text-primary-foreground/60">
            {t("landing.finalCta.trust")}
          </p>
        </section>

        {/* ─── Guarantee ─── */}
        <div className="bg-secondary border border-border rounded-xl p-4 flex items-start gap-3 mb-8 text-sm">
          <span className="text-green-600 dark:text-green-400 text-lg shrink-0 mt-0.5">✓</span>
          <p>{t("landing.guarantee")}</p>
        </div>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border pt-6 pb-4 flex flex-col gap-1.5">
          <div className="flex gap-6 flex-wrap mb-1">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t("landing.footer.legal")}
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t("landing.footer.terms")}
            </a>
            <a
              href="mailto:contact@cleanpilot.fr"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("landing.footer.contact")}
            </a>
          </div>
          <p className="text-xs text-muted-foreground">{t("landing.footer.copy")}</p>
          <p className="text-xs text-muted-foreground">{t("landing.footer.tagline")}</p>
        </footer>

      </div>
    </div>
  )
}
