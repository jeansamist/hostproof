import { getI18n } from "@/lib/i18n/server"
import { setStaticParamsLocale } from "next-international/server"
import { ReservationsTable } from "@/components/customs/reservations-table"
import { getReservations } from "@/services/reservation.services"
import { Button } from "@packages/ui/button"
import { Input } from "@packages/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@packages/ui/pagination"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function ReservationPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const { page: pageParam, search } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))

  const [t, result] = await Promise.all([getI18n(), getReservations(page, 15, search)])
  const reservations = result?.data ?? []
  const meta = result?.meta

  const totalPages = meta?.lastPage ?? 1
  const baseUrl = `/${locale}/app/reservation`

  const buildUrl = (p: number) => {
    const q = new URLSearchParams({ page: String(p), ...(search ? { search } : {}) })
    return `${baseUrl}?${q}`
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("reservation.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} reservation${meta.total !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/app/reservation/create`}>
            <Plus className="size-4" />
            {t("reservation.action.new")}
          </Link>
        </Button>
      </div>

      <form method="GET" action={baseUrl} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={search}
            placeholder={t("reservation.search.placeholder")}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          {t("reservation.search.submit")}
        </Button>
        {search && (
          <Button type="button" variant="ghost" asChild>
            <Link href={baseUrl}>{t("reservation.search.clear")}</Link>
          </Button>
        )}
      </form>

      <ReservationsTable reservations={reservations} locale={locale} />

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={buildUrl(page - 1)} />
              </PaginationItem>
            )}
            {pageNumbers.map((p, i) => {
              const prev = pageNumbers[i - 1]
              return (
                <>
                  {prev && p - prev > 1 && (
                    <PaginationItem key={`ellipsis-${p}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem key={p}>
                    <PaginationLink href={buildUrl(p)} isActive={p === page}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )
            })}
            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={buildUrl(page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
