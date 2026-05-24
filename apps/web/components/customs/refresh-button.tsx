"use client"

import { Button } from "@packages/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useTransition } from "react"

type RefreshButtonProps = {
  label?: string
  className?: string
}

export const RefreshButton: FunctionComponent<RefreshButtonProps> = ({ label, className }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isPending}
      className={className}
    >
      <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
      {label && <span>{label}</span>}
    </Button>
  )
}
