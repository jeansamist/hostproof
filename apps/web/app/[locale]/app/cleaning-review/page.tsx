import { getI18n } from "@/lib/i18n/server"
import { setStaticParamsLocale } from "next-international/server"
import { CleaningReviewsTable } from "@/components/customs/cleaning-reviews-table"
import { RefreshButton } from "@/components/customs/refresh-button"
import { getCleaningReviews } from "@/services/cleaning-review.services"
import { Button } from "@packages/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@packages/ui/pagination"
import { Plus } from "lucide-react"
import Link from "next/link"

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function CleaningReviewPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))

  const [t, result] = await Promise.all([getI18n(), getCleaningReviews(page, 15)])
  const reviews = result?.data ?? []
  const meta = result?.meta

  const totalPages = meta?.lastPage ?? 1
  const baseUrl = `/${locale}/app/cleaning-review`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const buildUrl = (p: number) => `${baseUrl}?page=${p}`

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("cleaningReview.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} review${meta.total !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <Button asChild>
            <Link href={`/${locale}/app/cleaning-review/create`}>
              <Plus className="size-4" />
              {t("cleaningReview.action.new")}
            </Link>
          </Button>
        </div>
      </div>

      <CleaningReviewsTable reviews={reviews} locale={locale} appUrl={appUrl} />

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
