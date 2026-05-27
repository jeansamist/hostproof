"use client"

import {
  createChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
  type ChecklistItem,
} from "@/services/checklist-item.services"
import { Button } from "@packages/ui/button"
import { Input } from "@packages/ui/input"
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
import { cn } from "@packages/functions"
import {
  CheckSquare,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
  Check,
} from "lucide-react"
import { FunctionComponent, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

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

  const handleAdd = () => {
    const label = newLabel.trim()
    if (!label) return
    startAddTransition(async () => {
      await createChecklistItem(label)
      setNewLabel("")
      router.refresh()
      // optimistic update
      setItems((prev) => [
        ...prev,
        { id: Date.now(), label, position: prev.length, userId: 0, createdAt: "", updatedAt: null },
      ])
    })
  }

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
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <CheckSquare className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold">Default cleaning checklist</p>
            <p className="text-xs text-muted-foreground">
              These points are sent to the AI for every video analysis — it will flag any that are missing.
            </p>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="divide-y">
        {items.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No checklist items yet. Add your first one below.
          </p>
        )}

        {items.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-3 px-5 py-3">
            <GripVertical className="size-4 text-muted-foreground/40 shrink-0" />
            <span className="size-5 flex items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground shrink-0">
              {idx + 1}
            </span>

            {editingId === item.id ? (
              <div className="flex flex-1 items-center gap-2">
                <Input
                  className="h-8 text-sm flex-1"
                  value={editLabel}
                  autoFocus
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave(item.id)
                    if (e.key === "Escape") cancelEdit()
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-green-600 hover:text-green-700"
                  disabled={isSaving}
                  onClick={() => handleSave(item.id)}
                >
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={cancelEdit}
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
                    onClick={() => startEdit(item)}
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
                          "<strong>{item.label}</strong>" will be removed from your default checklist. This won't affect past analyses.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add row */}
      <div className={cn("flex items-center gap-2 px-5 py-4", items.length > 0 && "border-t")}>
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
