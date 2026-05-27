"use client"

import { useAuth } from "@/contexts/auth.context"
import { useI18n } from "@/lib/i18n/client"
import { cn } from "@packages/functions"
import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui/avatar"
import { Button } from "@packages/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui/dropdown-menu"
import { LayoutDashboard, LogOut, Settings, SparklesIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FunctionComponent } from "react"

export const TopBar: FunctionComponent = () => {
  const { user } = useAuth()
  const pathname = usePathname()
  const t = useI18n()
  const locale = pathname.split("/")[1] ?? "en"

  const navItems = [
    {
      label: t("nav.dashboard"),
      href: `/${locale}/app/dashboard`,
      icon: LayoutDashboard,
    },
    {
      label: t("nav.reviews"),
      href: `/${locale}/app/cleaning-review`,
      icon: SparklesIcon,
    },
  ]

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <header className="pointer-events-auto flex h-12 w-full max-w-2xl items-center gap-2 rounded-2xl border bg-background/80 px-3 shadow-lg shadow-black/5 backdrop-blur-xl">
          {/* Logo */}
          <Link
            href={`/${locale}/app/dashboard`}
            className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              CP
            </div>
            <span className="hidden text-sm sm:inline">Clean Pilot</span>
          </Link>

          <div className="mx-1 hidden h-4 w-px bg-border sm:block" />

          {/* Desktop nav */}
          <nav className="hidden flex-1 items-center gap-0.5 sm:flex">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile nav (icon-only) */}
          <nav className="flex flex-1 items-center gap-0.5 sm:hidden">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </Link>
              )
            })}
          </nav>

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-xl"
              >
                <Avatar className="size-7">
                  {user?.avatar && (
                    <AvatarImage src={user.avatar} alt={user.initials} />
                  )}
                  <AvatarFallback className="text-xs">
                    {user?.initials ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm leading-none font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="mt-1 text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/${locale}/app/settings`}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Settings className="size-4" />
                  {t("nav.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/${locale}/auth/sign-in`}
                  className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  {t("nav.signOut")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
      </div>
    </>
  )
}
