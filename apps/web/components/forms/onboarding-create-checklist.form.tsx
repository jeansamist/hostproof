"use client"

import { useI18n } from "@/lib/i18n/client"
import { createChecklistItem } from "@/services/checklist-item.services"
import { Button } from "@packages/ui/button"
import { Input } from "@packages/ui/input"
import { Reorder, useDragControls } from "framer-motion"
import {
  CheckSquare,
  GripVertical,
  Loader2,
  Plus,
  X,
} from "lucide-react"
import { FunctionComponent, useState, useTransition } from "react"

type Item = { id: string; label: string }

type OnboardingCreateChecklistFormProps = {
  handleNext: () => void
  handleSkip: () => void
}

const makeItem = (label = ""): Item => ({ id: crypto.randomUUID(), label })

// ─── Draggable row ────────────────────────────────────────────────────────────
function SortableItem({
  item,
  index,
  total,
  onUpdate,
  onRemove,
  onEnter,
}: {
  item: Item
  index: number
  total: number
  onUpdate: (id: string, label: string) => void
  onRemove: (id: string) => void
  onEnter: () => void
}) {
  const t = useI18n()
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2 touch-none"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
        aria-label={t("settings.checklist.aria.dragToReorder")}
      >
        <GripVertical className="size-4" />
      </button>

      <span className="size-5 text-center text-[10px] font-medium text-muted-foreground shrink-0 select-none">
        {index + 1}
      </span>

      <Input
        className="h-9 text-sm flex-1"
        placeholder={t("onboarding.checklist.item.placeholder")}
        value={item.label}
        onChange={(e) => onUpdate(item.id, e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
      />

      {total > 1 && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-9 shrink-0"
          onClick={() => onRemove(item.id)}
        >
          <X className="size-4" />
        </Button>
      )}
    </Reorder.Item>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────
export const OnboardingCreateChecklistForm: FunctionComponent<
  OnboardingCreateChecklistFormProps
> = ({ handleNext, handleSkip }) => {
  const t = useI18n()
  const [items, setItems] = useState<Item[]>(() =>
    [
      t("onboarding.checklist.default.lightBulbs"),
      t("onboarding.checklist.default.refrigerator"),
      t("onboarding.checklist.default.internet"),
      t("onboarding.checklist.default.bathroom"),
      t("onboarding.checklist.default.windows"),
      t("onboarding.checklist.default.kitchen"),
      t("onboarding.checklist.default.linens"),
      t("onboarding.checklist.default.floors"),
      t("onboarding.checklist.default.trash"),
      t("onboarding.checklist.default.alarms"),
    ].map((label) => makeItem(label))
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const addItem = () => setItems((prev) => [...prev, makeItem()])

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id))

  const updateLabel = (id: string, label: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, label } : i)))

  const handleSubmit = () => {
    const validLabels = items.map((i) => i.label.trim()).filter(Boolean)
    if (validLabels.length === 0) {
      setError(t("onboarding.checklist.error.empty"))
      return
    }
    setError(null)
    startTransition(async () => {
      for (const label of validLabels) {
        await createChecklistItem(label)
      }
      handleNext()
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="space-y-5 p-6 md:p-8">
        {/* Hint */}
        <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
          {t("onboarding.checklist.hint.main")}
          <br />
          <span className="text-xs opacity-70">{t("onboarding.checklist.hint.reorder")}</span>
        </div>

        {/* Sortable list */}
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={setItems}
          className="space-y-2"
        >
          {items.map((item, idx) => (
            <SortableItem
              key={item.id}
              item={item}
              index={idx}
              total={items.length}
              onUpdate={updateLabel}
              onRemove={removeItem}
              onEnter={addItem}
            />
          ))}
        </Reorder.Group>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={addItem}
        >
          <Plus className="size-4" />
          {t("onboarding.checklist.action.addItem")}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {t("onboarding.checklist.action.skip")}
          </button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckSquare className="size-4" />
            )}
            {t("onboarding.checklist.action.save")}
          </Button>
        </div>
      </div>
    </div>
  )
}
