import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@packages/ui/accordion"
import { getI18n } from "@/lib/i18n/server"
import Link from "next/link"
import { AnimateIn } from "./animate-in"
import { NavbarClient } from "./navbar-client"
import { PhoneProto } from "./phone-proto"

/* ─── Design tokens ────────────────────────────────────── */
const BG    = "oklch(0.085 0.018 244)"
const CARD  = "oklch(0.13  0.024 244)"
const CARD2 = "oklch(0.165 0.030 244)"
const BORD  = "oklch(1 0 0 / 8%)"
const BORD2 = "oklch(1 0 0 / 16%)"
const TEXT  = "oklch(0.95  0.008 247)"
const MUT   = "oklch(0.55  0.020 241)"
const MUT2  = "oklch(0.38  0.015 241)"
const BLUE  = "oklch(0.60  0.19  246)"
const BLUEL = "oklch(0.74  0.14  246)"
const BTN   = `linear-gradient(135deg, ${BLUE} 0%, oklch(0.52 0.22 260) 100%)`
const GTEXT = `linear-gradient(120deg, ${BLUEL} 20%, ${BLUE} 100%)`

/* ─── Dashboard proto ──────────────────────────────────── */
function DashboardProto({ locale }: { locale: string }) {
  const isFr = locale === "fr"
  const stats = isFr
    ? [{ v: "12", l: "Logements" }, { v: "4.9★", l: "Note moy.", amber: true }, { v: "0", l: "Alertes", green: true }]
    : [{ v: "12", l: "Properties" }, { v: "4.9★", l: "Avg. rating", amber: true }, { v: "0", l: "Alerts", green: true }]
  const reviews = isFr
    ? [{ n: "Apt. Paris 11e", ok: true }, { n: "Villa Cap-Ferret", ok: true }, { n: "Studio Bordeaux", ok: false }]
    : [{ n: "Apt. Paris 11e", ok: true }, { n: "Villa Nice", ok: true }, { n: "Studio Lyon", ok: false }]
  const doneLabel   = isFr ? "✓ OK" : "✓ Done"
  const aiLabel     = isFr ? "⚡ Analyse" : "⚡ Scanning"
  const recentLabel = isFr ? "Bilans récents" : "Recent reviews"

  return (
    <div className="rounded-2xl overflow-hidden text-xs w-full"
      style={{ background: CARD2, border: `1px solid ${BORD2}` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "oklch(0.20 0.030 244)", borderBottom: `1px solid ${BORD}` }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-bold text-[10px]" style={{ color: BLUE }}>CleanPilot</span>
        </div>
        <span className="text-[9px]" style={{ color: MUT }}>
          {isFr ? "Tableau de bord" : "Dashboard"}
        </span>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 text-center" style={{ borderBottom: `1px solid ${BORD}` }}>
        {stats.map((s, i) => (
          <div key={i} className="py-3 px-2"
            style={{ borderRight: i < 2 ? `1px solid ${BORD}` : undefined }}>
            <div className="text-sm font-bold leading-none mb-0.5"
              style={{ color: s.amber ? "#f59e0b" : s.green ? "#34d399" : TEXT }}>
              {s.v}
            </div>
            <div className="text-[8px]" style={{ color: MUT }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Reviews list */}
      <div className="px-4 py-3">
        <p className="text-[8px] font-semibold uppercase tracking-wider mb-2" style={{ color: MUT2 }}>
          {recentLabel}
        </p>
        <div className="flex flex-col gap-1.5">
          {reviews.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-[10px] truncate" style={{ color: TEXT }}>{r.n}</span>
              <span className="shrink-0 text-[8px] font-medium px-2 py-0.5 rounded-full"
                style={r.ok
                  ? { background: "oklch(0.34 0.10 163 / 25%)", color: "#34d399" }
                  : { background: `oklch(0.45 0.14 246 / 20%)`, color: BLUEL, animation: "lp-pulse-scan 2s ease-in-out infinite" }
                }>
                {r.ok ? doneLabel : aiLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Main landing page ────────────────────────────────── */
type Props = { locale: string }

export async function LandingPage({ locale }: Props) {
  const t = await getI18n()
  const isFr = locale === "fr"

  const steps = [
    { icon: "📹", title: t("landing.how.step1.title"), desc: t("landing.how.step1.desc") },
    { icon: "⚡", title: t("landing.how.step2.title"), desc: t("landing.how.step2.desc") },
    { icon: "✅", title: t("landing.how.step3.title"), desc: t("landing.how.step3.desc") },
    { icon: "📊", title: t("landing.how.step4.title"), desc: t("landing.how.step4.desc") },
  ]

  const benefits = [
    { icon: "⭐", text: t("landing.benefits.item1") },
    { icon: "📈", text: t("landing.benefits.item2") },
    { icon: "📞", text: t("landing.benefits.item3") },
    { icon: "💰", text: t("landing.benefits.item4") },
    { icon: "⏱️", text: t("landing.benefits.item5") },
  ]

  const monthlyFeatures = [
    t("landing.pricing.feature.unlimitedProperties"),
    t("landing.pricing.feature.unlimitedScans"),
    t("landing.pricing.feature.todoList"),
    t("landing.pricing.feature.voice"),
    t("landing.pricing.feature.emailSupport"),
  ]

  const annualFeatures = [
    ...monthlyFeatures.slice(0, -1),
    t("landing.pricing.feature.prioritySupport"),
    t("landing.pricing.feature.advancedDashboard"),
    t("landing.pricing.feature.export"),
  ]

  const faqs = [
    { q: t("landing.faq.1.q"), a: t("landing.faq.1.a") },
    { q: t("landing.faq.2.q"), a: t("landing.faq.2.a") },
    { q: t("landing.faq.3.q"), a: t("landing.faq.3.a") },
    { q: t("landing.faq.4.q"), a: t("landing.faq.4.a") },
  ]

  return (
    /* Force dark mode for all shadcn/tailwind children */
    <div className="dark min-h-screen" style={{ background: BG, color: TEXT }}>

      {/* ── Sticky navbar ─────────────────────────────────── */}
      <header className="sticky top-0 z-50"
        style={{
          background: `oklch(0.085 0.018 244 / 82%)`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${BORD}`,
        }}>
        <div className="max-w-275 mx-auto px-5 sm:px-8 flex items-center justify-between h-14 sm:h-16">
          <span className="text-[1.1rem] font-bold tracking-tight" style={{ color: TEXT }}>
            CleanPilot
          </span>
          <NavbarClient
            locale={locale}
            labels={{
              howItWorks: t("landing.nav.howItWorks"),
              signIn: t("landing.nav.signIn"),
              signUp: t("landing.nav.signUp"),
            }}
          />
        </div>
      </header>

      <div className="max-w-275 mx-auto px-5 sm:px-8">

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="pt-20 sm:pt-28 pb-20 sm:pb-28 text-center relative overflow-hidden">
          {/* Radial glow behind content */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 90% 55% at 50% 0%, oklch(0.58 0.19 246 / 13%) 0%, transparent 70%)` }} />

          <div className="relative flex flex-col items-center gap-6 sm:gap-7">
            {/* Badge */}
            <div style={{ animation: "lp-fade-up 0.5s 0s ease-out both" }}>
              <div className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-medium px-4 py-1.5 rounded-full"
                style={{
                  background: `oklch(0.58 0.19 246 / 12%)`,
                  border: `1px solid oklch(0.58 0.19 246 / 28%)`,
                  color: BLUEL,
                }}>
                {t("landing.hero.badge")}
              </div>
            </div>

            {/* Headline */}
            <div style={{ animation: "lp-fade-up 0.55s 0.07s ease-out both" }}>
              <h1
                className="font-bold tracking-tight leading-[1.05] max-w-3xl mx-auto"
                style={{
                  color: TEXT,
                  fontSize: "clamp(2.6rem, 6vw, 5rem)",
                }}>
                {t("landing.hero.title")}{" "}
                <span style={{
                  background: GTEXT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  {t("landing.hero.titleAccent")}
                </span>
              </h1>
            </div>

            {/* Subtext */}
            <div style={{ animation: "lp-fade-up 0.55s 0.14s ease-out both" }}>
              <p className="text-[16px] sm:text-[18px] leading-relaxed max-w-lg" style={{ color: MUT }}>
                {t("landing.hero.description")}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 items-center"
              style={{ animation: "lp-fade-up 0.55s 0.21s ease-out both" }}>
              <a href={`/${locale}/auth/sign-up`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[15px] text-white hover:opacity-90 transition-opacity"
                style={{ background: BTN }}>
                {t("landing.hero.cta")}
              </a>
              <a href="#how-it-works"
                className="text-[14px] font-medium hover:opacity-80 transition-opacity"
                style={{ color: MUT }}>
                {t("landing.nav.howItWorks")} →
              </a>
            </div>

            {/* Trust */}
            <p className="text-[12px]" style={{ color: MUT2, animation: "lp-fade-up 0.55s 0.28s ease-out both" }}>
              {t("landing.hero.trust")}
            </p>

            {/* Phone proto with glow */}
            <div className="relative mt-2" style={{ animation: "lp-fade-in 0.8s 0.32s ease-out both" }}>
              <div className="absolute -inset-10 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at center, oklch(0.58 0.19 246 / 20%) 0%, transparent 65%)` }} />
              <PhoneProto locale={locale} />
            </div>
          </div>
        </section>

        {/* ── Problem ───────────────────────────────────────── */}
        <section className="py-16 sm:py-24">
          <AnimateIn>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] mb-4" style={{ color: BLUE }}>
              {t("landing.problem.label")}
            </p>
            <h2 className="font-bold tracking-tight leading-tight mb-10 max-w-xl"
              style={{ color: TEXT, fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
              {t("landing.problem.title")}
            </h2>
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {/* Quote */}
            <AnimateIn className="sm:col-span-3" variant="slide-left">
              <div className="h-full rounded-2xl p-7 sm:p-9"
                style={{ background: CARD, border: `1px solid ${BORD}` }}>
                <p className="text-[17px] sm:text-[19px] leading-relaxed"
                  style={{ color: "oklch(0.80 0.010 247)" }}>
                  &ldquo;{t("landing.problem.quote")}&rdquo;
                </p>
              </div>
            </AnimateIn>

            {/* Stats */}
            <div className="sm:col-span-2 flex flex-col gap-4">
              {[
                { num: t("landing.problem.stat1.num"), label: t("landing.problem.stat1.label"), accent: "oklch(0.75 0.19 45)" },
                { num: t("landing.problem.stat2.num"), label: t("landing.problem.stat2.label"), accent: BLUE },
              ].map((s, i) => (
                <AnimateIn key={i} delay={80 + i * 70} variant="slide-right">
                  <div className="flex-1 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 min-h-30"
                    style={{ background: CARD, border: `1px solid ${BORD}` }}>
                    <div className="font-bold leading-none"
                      style={{ color: s.accent, fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}>
                      {s.num}
                    </div>
                    <div className="text-[13px] leading-snug" style={{ color: MUT }}>{s.label}</div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────── */}
        <section id="how-it-works" className="py-16 sm:py-24">
          <AnimateIn>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] mb-4" style={{ color: BLUE }}>
              {t("landing.how.label")}
            </p>
            <h2 className="font-bold tracking-tight leading-tight mb-3 max-w-2xl"
              style={{ color: TEXT, fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
              {t("landing.how.title")}
            </h2>
            <p className="text-[15px] sm:text-[16px] mb-12 max-w-lg" style={{ color: MUT }}>
              {t("landing.how.description")}
            </p>
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.slice(0, 3).map((step, i) => (
              <AnimateIn key={i} delay={i * 60}>
                <div className="rounded-2xl p-6 h-full group hover:border-opacity-30 transition-all"
                  style={{ background: CARD, border: `1px solid ${BORD}` }}>
                  <p className="text-[10px] font-bold tabular-nums mb-4" style={{ color: MUT2 }}>
                    0{i + 1}
                  </p>
                  <div className="text-2xl mb-3">{step.icon}</div>
                  <h3 className="font-semibold text-[15px] mb-2" style={{ color: TEXT }}>{step.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: MUT }}>{step.desc}</p>
                </div>
              </AnimateIn>
            ))}

            {/* Step 4 with live dashboard */}
            <AnimateIn delay={200}>
              <div className="rounded-2xl p-6 h-full flex flex-col gap-5"
                style={{ background: CARD, border: `1px solid oklch(0.58 0.19 246 / 35%)` }}>
                <div>
                  <p className="text-[10px] font-bold tabular-nums mb-4"
                    style={{ color: `oklch(0.58 0.19 246 / 55%)` }}>
                    04
                  </p>
                  <div className="text-2xl mb-3">{steps[3].icon}</div>
                  <h3 className="font-semibold text-[15px] mb-2" style={{ color: TEXT }}>{steps[3].title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: MUT }}>{steps[3].desc}</p>
                </div>
                <DashboardProto locale={locale} />
              </div>
            </AnimateIn>
          </div>
        </section>

        {/* ── Benefits ──────────────────────────────────────── */}
        <section className="py-16 sm:py-24">
          <AnimateIn>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] mb-4" style={{ color: BLUE }}>
              {t("landing.benefits.label")}
            </p>
            <h2 className="font-bold tracking-tight leading-tight mb-12 max-w-xl"
              style={{ color: TEXT, fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
              {t("landing.benefits.title")}
            </h2>
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b, i) => (
              <AnimateIn key={i} delay={i * 55}>
                <div className="rounded-2xl p-5 sm:p-6 h-full"
                  style={{ background: CARD, border: `1px solid ${BORD}` }}>
                  <div className="text-[1.5rem] mb-3">{b.icon}</div>
                  <p className="text-[14px] leading-relaxed" style={{ color: "oklch(0.80 0.010 247)" }}>{b.text}</p>
                </div>
              </AnimateIn>
            ))}
          </div>

          <AnimateIn delay={320}>
            <div className="mt-4 rounded-2xl p-5 sm:p-6 flex items-start gap-3"
              style={{ background: "oklch(0.22 0.06 150 / 25%)", border: `1px solid oklch(0.55 0.13 163 / 35%)` }}>
              <span className="text-xl shrink-0 leading-none mt-0.5">💡</span>
              <p className="text-[14px] leading-relaxed" style={{ color: "oklch(0.75 0.09 163)" }}>
                {t("landing.benefits.bonus")}
              </p>
            </div>
          </AnimateIn>
        </section>

        {/* ── Pricing ───────────────────────────────────────── */}
        <section id="pricing" className="py-16 sm:py-24">
          <AnimateIn>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] mb-4" style={{ color: BLUE }}>
              {t("landing.pricing.label")}
            </p>
            <h2 className="font-bold tracking-tight leading-tight mb-12"
              style={{ color: TEXT, fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
              {t("landing.pricing.title")}
            </h2>
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Monthly */}
            <AnimateIn delay={60} variant="fade-up">
              <div className="flex flex-col rounded-2xl p-7 h-full"
                style={{ background: CARD, border: `1px solid ${BORD}` }}>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="font-bold" style={{ color: TEXT, fontSize: "clamp(2.2rem, 4vw, 2.8rem)" }}>
                      {t("landing.pricing.monthly.price")}
                    </span>
                    <span className="text-[14px]" style={{ color: MUT }}>
                      {t("landing.pricing.monthly.period")}
                    </span>
                  </div>
                  <p className="text-[13px]" style={{ color: MUT }}>{t("landing.pricing.monthly.sub")}</p>
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {monthlyFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[14px]"
                      style={{ color: "oklch(0.80 0.010 247)" }}>
                      <span className="shrink-0 text-[12px]" style={{ color: "#34d399" }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={`/${locale}/auth/sign-up`}
                  className="block w-full text-center py-3 rounded-full font-semibold text-[14px] transition-opacity hover:opacity-80"
                  style={{ background: CARD2, color: TEXT, border: `1px solid ${BORD2}` }}>
                  {t("landing.pricing.monthly.cta")}
                </a>
              </div>
            </AnimateIn>

            {/* Annual — recommended */}
            <AnimateIn delay={130} variant="fade-up">
              <div className="flex flex-col rounded-2xl p-7 h-full relative"
                style={{ background: CARD, border: `1px solid oklch(0.58 0.19 246 / 45%)` }}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-bold px-5 py-1.5 rounded-full whitespace-nowrap text-white"
                  style={{ background: BTN }}>
                  {t("landing.pricing.annual.badge")}
                </div>
                <div className="mt-3 mb-6">
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="font-bold" style={{ color: TEXT, fontSize: "clamp(2.2rem, 4vw, 2.8rem)" }}>
                      {t("landing.pricing.annual.price")}
                    </span>
                    <span className="text-[14px]" style={{ color: MUT }}>
                      {t("landing.pricing.annual.period")}
                    </span>
                  </div>
                  <p className="text-[13px]" style={{ color: MUT }}>{t("landing.pricing.annual.sub")}</p>
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {annualFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[14px]"
                      style={{ color: "oklch(0.80 0.010 247)" }}>
                      <span className="shrink-0 text-[12px]" style={{ color: "#34d399" }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={`/${locale}/auth/sign-up`}
                  className="block w-full text-center py-3 rounded-full font-semibold text-[14px] text-white hover:opacity-90 transition-opacity"
                  style={{ background: BTN }}>
                  {t("landing.pricing.annual.cta")}
                </a>
              </div>
            </AnimateIn>
          </div>

          <AnimateIn delay={220}>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2 text-[12px] font-semibold"
              style={{
                background: "oklch(0.55 0.12 50 / 14%)",
                border: `1px solid oklch(0.65 0.15 50 / 28%)`,
                color: "oklch(0.82 0.13 65)",
              }}>
              {t("landing.pricing.limitedOffer")}
            </div>
          </AnimateIn>
        </section>

        {/* ── Testimonials ──────────────────────────────────── */}
        <section className="py-16 sm:py-24">
          <AnimateIn>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] mb-4" style={{ color: BLUE }}>
              {t("landing.testimonials.label")}
            </p>
            <h2 className="font-bold tracking-tight leading-tight mb-10 max-w-xl"
              style={{ color: TEXT, fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
              {t("landing.testimonials.title")}
            </h2>
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
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
            ].map((te, i) => (
              <AnimateIn key={i} delay={i * 80}>
                <div className="rounded-2xl p-7 flex flex-col gap-5 h-full"
                  style={{ background: CARD, border: `1px solid ${BORD}` }}>
                  <div className="text-amber-400 tracking-wider text-[13px]">★★★★★</div>
                  <p className="text-[16px] sm:text-[17px] leading-relaxed flex-1"
                    style={{ color: "oklch(0.83 0.010 247)" }}>
                    {te.text.replace(/^"|"$/g, "")}
                  </p>
                  <div className="flex items-center gap-3 pt-4"
                    style={{ borderTop: `1px solid ${BORD}` }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                      style={{ background: `oklch(0.58 0.19 246 / 20%)`, color: BLUEL }}>
                      {te.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-[13px]" style={{ color: TEXT }}>{te.name}</div>
                      <div className="text-[11px]" style={{ color: MUT }}>{te.role}</div>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────── */}
        <section id="faq" className="py-16 sm:py-24">
          <AnimateIn>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] mb-8" style={{ color: BLUE }}>
              {t("landing.faq.label")}
            </p>
          </AnimateIn>
          <AnimateIn delay={60}>
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimateIn>
        </section>

        {/* ── Final CTA ─────────────────────────────────────── */}
        <AnimateIn variant="fade-up">
          <section className="rounded-3xl relative overflow-hidden mb-8"
            style={{ background: CARD, border: `1px solid ${BORD}` }}>
            {/* Radial glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse 80% 70% at 50% -10%, oklch(0.58 0.19 246 / 12%) 0%, transparent 65%)` }} />
            <div className="relative text-center px-8 sm:px-16 py-16 sm:py-24">
              <h2 className="font-bold tracking-tight leading-tight mb-4 max-w-2xl mx-auto"
                style={{ color: TEXT, fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
                {t("landing.finalCta.title")}
              </h2>
              <p className="text-[16px] mb-8 max-w-md mx-auto leading-relaxed" style={{ color: MUT }}>
                {t("landing.finalCta.description")}
              </p>
              <a href={`/${locale}/auth/sign-up`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-[15px] text-white hover:opacity-90 transition-opacity"
                style={{ background: BTN }}>
                {t("landing.finalCta.cta")}
              </a>
              <p className="mt-5 text-[12px]" style={{ color: MUT2 }}>
                {t("landing.finalCta.trust")}
              </p>
            </div>
          </section>
        </AnimateIn>

        {/* ── Guarantee ─────────────────────────────────────── */}
        <AnimateIn>
          <div className="rounded-2xl px-5 py-4 flex items-start gap-3 mb-16 text-[14px]"
            style={{ background: "oklch(0.20 0.07 163 / 22%)", border: `1px solid oklch(0.55 0.13 163 / 35%)` }}>
            <span className="shrink-0 text-[15px] leading-none mt-0.5" style={{ color: "#34d399" }}>✓</span>
            <p style={{ color: "oklch(0.78 0.08 163)" }}>{t("landing.guarantee")}</p>
          </div>
        </AnimateIn>

        {/* ── Footer ────────────────────────────────────────── */}
        <footer style={{ borderTop: `1px solid ${BORD}` }}>
          <div className="pt-12 pb-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[1.1rem] font-bold block mb-2.5" style={{ color: TEXT }}>CleanPilot</span>
              <p className="text-[13px] leading-relaxed mb-4 max-w-[18ch]" style={{ color: MUT }}>
                {t("landing.footer.tagline")}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px]" style={{ color: MUT }}>
                  {isFr ? "Tous systèmes OK" : "All systems OK"}
                </span>
              </div>
            </div>

            {[
              {
                title: isFr ? "Produit" : "Product",
                links: [
                  { label: t("landing.nav.howItWorks"), href: "#how-it-works" },
                  { label: isFr ? "Tarifs" : "Pricing", href: "#pricing" },
                  { label: "FAQ", href: "#faq" },
                ],
              },
              {
                title: isFr ? "Entreprise" : "Company",
                links: [
                  { label: t("landing.footer.legal"), href: "#" },
                  { label: t("landing.footer.terms"), href: "#" },
                  { label: t("landing.footer.contact"), href: "mailto:contact@cleanpilot.fr" },
                ],
              },
              {
                title: isFr ? "Compte" : "Account",
                links: [
                  { label: t("landing.nav.signUp"), href: `/${locale}/auth/sign-up` },
                  { label: t("landing.nav.signIn"), href: `/${locale}/auth/sign-in` },
                ],
              },
            ].map((col, i) => (
              <div key={i}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3.5" style={{ color: MUT2 }}>
                  {col.title}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <Link href={l.href}
                        className="text-[13px] hover:opacity-100 opacity-60 transition-opacity"
                        style={{ color: TEXT }}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-1.5"
            style={{ borderTop: `1px solid ${BORD}` }}>
            <p className="text-[11px]" style={{ color: MUT2 }}>{t("landing.footer.copy")}</p>
            <p className="text-[11px]" style={{ color: MUT2 }}>
              {isFr ? "Fait avec ♥ pour les concierges" : "Made with ♥ for concierges"}
            </p>
          </div>
        </footer>

      </div>
    </div>
  )
}
