"use client"

import {
  createChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
  type ChecklistItem,
} from "@/services/checklist-item.services"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@packages/ui/alert-dialog"
import { Button } from "@packages/ui/button"
import { Input } from "@packages/ui/input"
import { Reorder, useDragControls } from "framer-motion"
import {
  Check,
  CheckSquare,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { FunctionComponent, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

// ─── Draggable row ─────────────────────────────────────────────────────────────
function SortableRow({
  item,
  index,
  editingId,
  editLabel,
  isSaving,
  deletingId,
  isDeleting,
  onStartEdit,
  onCancelEdit,
  onChangeEditLabel,
  onSave,
  onDelete,
}: {
  item: ChecklistItem
  index: number
  editingId: number | null
  editLabel: string
  isSaving: boolean
  deletingId: number | null
  isDeleting: boolean
  onStartEdit: (item: ChecklistItem) => void
  onCancelEdit: () => void
  onChangeEditLabel: (v: string) => void
  onSave: (id: number) => void
  onDelete: (id: number) => void
}) {
  const controls = useDragControls()
  const isEditing = editingId === item.id

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 px-5 py-3 touch-none bg-card"
    >
      {/* drag handle — disabled while editing */}
      <button
        type="button"
        onPointerDown={(e) => !isEditing && controls.start(e)}
        className={
          isEditing
            ? "cursor-not-allowed text-muted-foreground/20 shrink-0"
            : "cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
        }
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      <span className="size-5 flex items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground shrink-0 select-none">
        {index + 1}
      </span>

      {isEditing ? (
        <div className="flex flex-1 items-center gap-2">
          <Input
            className="h-8 text-sm flex-1"
            value={editLabel}
            autoFocus
            onChange={(e) => onChangeEditLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave(item.id)
              if (e.key === "Escape") onCancelEdit()
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-green-600 hover:text-green-700"
            disabled={isSaving}
            onClick={() => onSave(item.id)}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={onCancelEdit}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm">{item.label}</span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => onStartEdit(item)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-destructive hover:text-destructive"
                  disabled={deletingId === item.id && isDeleting}
                >
                  {deletingId === item.id && isDeleting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete checklist item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "<strong>{item.label}</strong>" will be removed from your default checklist.
                    This won't affect past analyses.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onDelete(item.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </Reorder.Item>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
type SettingsChecklistProps = {
  initialItems: ChecklistItem[]
}

export const SettingsChecklist: FunctionComponent<SettingsChecklistProps> = ({
  initialItems,
}) => {
  const router = useRouter()
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)
  const [newLabel, setNewLabel] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isAdding, startAddTransition] = useTransition()
  const [isSaving, startSaveTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isReordering, startReorderTransition] = useTransition()

  // ── Drag reorder ──────────────────────────────────────────────────────────
  const handleReorder = (newOrder: ChecklistItem[]) => {
    setItems(newOrder)
    // Persist new positions after the animation frame
    startReorderTransition(async () => {
      await Promise.all(
        newOrder.map((item, idx) =>
          item.position !== idx
            ? updateChecklistItem(item.id, { position: idx })
            : Promise.resolve()
        )
      )
      // Update local positions to match what was saved
      setItems(newOrder.map((item, idx) => ({ ...item, position: idx })))
    })
  }

  // ── Add ──────────────────────────────────────────────────────────────────
  const handleAdd = () => {
    const label = newLabel.trim()
    if (!label) return
    startAddTransition(async () => {
      const res = await createChecklistItem(label)
      setNewLabel("")
      if (res?.data) {
        setItems((prev) => [...prev, res.data as ChecklistItem])
      } else {
        router.refresh()
      }
    })
  }

  // ── Edit ─────────────────────────────────────────────────────────────────
  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id)
    setEditLabel(item.label)
  }
  const cancelEdit = () => {
    setEditingId(null)
    setEditLabel("")
  }
  const handleSave = (id: number) => {
    const label = editLabel.trim()
    if (!label) return
    startSaveTransition(async () => {
      await updateChecklistItem(id, { label })
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, label } : i)))
      setEditingId(null)
      setEditLabel("")
    })
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (id: number) => {
    setDeletingId(id)
    startDeleteTransition(async () => {
      await deleteChecklistItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      setDeletingId(null)
    })
  }

  return (
    <div className="rounded-2xl border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b">
        <CheckSquare className="size-4 text-muted-foreground shrink-0" />
        <div>
          <p className="text-sm font-semibold">Default cleaning checklist</p>
          <p className="text-xs text-muted-foreground">
            These points are sent to the AI for every video analysis — it will flag any that are
            missing. Drag the handle to reorder.
            {isReordering && (
              <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground/60">
                <Loader2 className="size-3 animate-spin" />
                Saving order…
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Sortable list */}
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          No checklist items yet. Add your first one below.
        </p>
      ) : (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={handleReorder}
          className="divide-y"
        >
          {items.map((item, idx) => (
            <SortableRow
              key={item.id}
              item={item}
              index={idx}
              editingId={editingId}
              editLabel={editLabel}
              isSaving={isSaving}
              deletingId={deletingId}
              isDeleting={isDeleting}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
              onChangeEditLabel={setEditLabel}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </Reorder.Group>
      )}

      {/* Add row */}
      <div className="flex items-center gap-2 px-5 py-4 border-t">
        <Input
          className="h-9 text-sm flex-1"
          placeholder="e.g. Check all light bulbs are working…"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          disabled={!newLabel.trim() || isAdding}
          onClick={handleAdd}
        >
          {isAdding ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Add
        </Button>
      </div>
    </div>
  )
}
