"use client"

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
import { FunctionComponent, useRef, useState, useTransition } from "react"

type Item = { id: string; label: string }

type OnboardingCreateChecklistFormProps = {
  handleNext: () => void
  handleSkip: () => void
}

const DEFAULT_LABELS = [
  "Check all light bulbs are working",
  "Verify the refrigerator is clean and empty",
  "Check internet connection and router",
  "Inspect all bathroom fixtures (shower, toilet, sink)",
  "Confirm windows and shutters open and close properly",
  "Wipe down all kitchen surfaces and appliances",
  "Check that all towels and bed linen are clean and in place",
  "Vacuum and mop all floors",
  "Empty all trash bins and replace bin bags",
  "Check the smoke detectors and CO₂ alarms are functional",
]

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
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      <span className="size-5 text-center text-[10px] font-medium text-muted-foreground shrink-0 select-none">
        {index + 1}
      </span>

      <Input
        className="h-9 text-sm flex-1"
        placeholder="Add a checklist item…"
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
  const [items, setItems] = useState<Item[]>(() =>
    DEFAULT_LABELS.map((label) => makeItem(label))
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
      setError("Add at least one checklist item, or skip this step.")
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
          These tasks will be sent to the AI for every cleaning video analysis — it will check that
          each point is clearly shown in the video and flag any that are missing.
          <br />
          <span className="text-xs opacity-70">Drag the handle to reorder.</span>
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
          Add item
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Skip for now
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
            Save & continue
          </Button>
        </div>
      </div>
    </div>
  )
}
