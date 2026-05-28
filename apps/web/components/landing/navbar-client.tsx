"use client"

import { useState } from "react"
import Link from "next/link"
import { LangSwitch } from "./lang-switch"

const BORD  = "oklch(1 0 0 / 8%)"
const BORD2 = "oklch(1 0 0 / 16%)"
const TEXT  = "oklch(0.95  0.008 247)"
const BLUE  = "oklch(0.60  0.19  246)"
const BTN   = `linear-gradient(135deg, ${BLUE} 0%, oklch(0.52 0.22 260) 100%)`

type Props = {
  locale: string
  labels: { howItWorks: string; signIn: string; signUp: string }
}

export function NavbarClient({ locale, labels }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden sm:flex items-center gap-2 sm:gap-3">
        <a
          href="#how-it-works"
          className="text-[13px] font-medium opacity-55 hover:opacity-100 transition-opacity"
          style={{ color: TEXT }}>
          {labels.howItWorks}
        </a>
        <Link
          href={`/${locale}/auth/sign-in`}
          className="text-[13px] font-medium px-4 py-1.5 rounded-full opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: TEXT, border: `1px solid ${BORD2}` }}>
          {labels.signIn}
        </Link>
        <Link
          href={`/${locale}/auth/sign-up`}
          className="text-[13px] font-semibold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity text-white"
          style={{ background: BTN }}>
          {labels.signUp}
        </Link>
        <LangSwitch currentLocale={locale} />
      </div>

      {/* Mobile controls */}
      <div className="flex sm:hidden items-center gap-2">
        <LangSwitch currentLocale={locale} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="p-2 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: TEXT }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round">
            {open ? (
              <>
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="17" y2="6" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="14" x2="17" y2="14" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="sm:hidden absolute top-full left-0 right-0"
          style={{
            background: `oklch(0.085 0.018 244 / 96%)`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: `1px solid ${BORD2}`,
          }}>
          <div className="px-5 py-3 flex flex-col">
            <a
              href="#how-it-works"
              onClick={() => setOpen(false)}
              className="text-[14px] font-medium py-3.5 opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: TEXT, borderBottom: `1px solid ${BORD}` }}>
              {labels.howItWorks}
            </a>
            <Link
              href={`/${locale}/auth/sign-in`}
              className="text-[14px] font-medium py-3.5 opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: TEXT, borderBottom: `1px solid ${BORD}` }}>
              {labels.signIn}
            </Link>
            <Link
              href={`/${locale}/auth/sign-up`}
              className="mt-3 mb-1 block w-full text-center py-3 rounded-full font-semibold text-[14px] text-white hover:opacity-90 transition-opacity"
              style={{ background: BTN }}>
              {labels.signUp}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
