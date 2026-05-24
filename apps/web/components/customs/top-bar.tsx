"use client"

import { useAuth } from "@/contexts/auth.context"
import { useI18n } from "@/lib/i18n/client"
import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui/avatar"
import { Button } from "@packages/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui/dropdown-menu"
import { cn } from "@packages/functions"
import { CalendarClock, LayoutDashboard, LogOut, SparklesIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FunctionComponent } from "react"

export const TopBar: FunctionComponent = () => {
  const { user } = useAuth()
  const pathname = usePathname()
  const t = useI18n()

  const locale = pathname.split("/")[1] ?? "en"

  const navItems = [
    { label: t("nav.dashboard"), href: `/${locale}/app/dashboard`, icon: LayoutDashboard },
    { label: t("nav.reservations"), href: `/${locale}/app/reservation`, icon: CalendarClock },
    { label: t("nav.reviews"), href: `/${locale}/app/cleaning-review`, icon: SparklesIcon },
  ]

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <header
        className={cn(
          "pointer-events-auto flex h-12 w-full max-w-2xl items-center gap-2 rounded-2xl border bg-background/80 px-3 shadow-lg shadow-black/5 backdrop-blur-xl"
        )}
      >
        <Link
          href={`/${locale}/app/dashboard`}
          className="mr-2 flex shrink-0 items-center gap-2 font-semibold tracking-tight"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            H
          </div>
          <span className="text-sm">Hostproof</span>
        </Link>

        <div className="h-4 w-px bg-border" />

        <nav className="flex flex-1 items-center gap-0.5">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 rounded-xl">
              <Avatar className="size-7">
                {user?.avatar && <AvatarImage src={user.avatar} alt={user.initials} />}
                <AvatarFallback className="text-xs">{user?.initials ?? "?"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium leading-none">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-none">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/auth/sign-in`} className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive">
                <LogOut className="size-4" />
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </div>
  )
}
