"use client"

import {
  createHousing,
  deleteHousing,
  updateHousing,
  type Housing,
} from "@/services/housing.services"
import { useI18n } from "@/lib/i18n/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@packages/ui/alert-dialog"
import { Button } from "@packages/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@packages/ui/dialog"
import { Input } from "@packages/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/select"
import { cn } from "@packages/functions"
import { House, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState, useTransition } from "react"

type HousingType = "apartment" | "house" | "villa"

type HousingFormState = {
  name: string
  address: string
  type: HousingType | ""
  capacity: string
}

const emptyForm = (): HousingFormState => ({
  name: "",
  address: "",
  type: "",
  capacity: "",
})

type SettingsHousingsProps = {
  initialHousings: Housing[]
}

export const SettingsHousings: FunctionComponent<SettingsHousingsProps> = ({ initialHousings }) => {
  const t = useI18n()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Housing | null>(null)
  const [form, setForm] = useState<HousingFormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Housing | null>(null)
  const [error, setError] = useState<string>()

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setError(undefined)
    setDialogOpen(true)
  }

  const openEdit = (h: Housing) => {
    setEditing(h)
    setForm({ name: h.name, address: h.address, type: h.type, capacity: String(h.capacity) })
    setError(undefined)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.address || !form.type || !form.capacity) {
      setError("All fields are required.")
      return
    }
    setSaving(true)
    setError(undefined)
    const payload = {
      name: form.name,
      address: form.address,
      type: form.type as HousingType,
      capacity: Number(form.capacity),
    }
    const res = editing
      ? await updateHousing({ ...payload, id: editing.id })
      : await createHousing(payload)
    setSaving(false)
    if (res?.success) {
      setDialogOpen(false)
      startTransition(() => router.refresh())
    } else {
      setError(res?.message ?? t("unknownError"))
    }
  }

  const handleDelete = (h: Housing) => {
    setDeleteTarget(h)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteHousing(deleteTarget.id)
      setDeleteTarget(null)
      router.refresh()
    })
  }

  const typeOptions = [
    { value: "apartment", label: t("settings.housings.type.apartment") },
    { value: "house", label: t("settings.housings.type.house") },
    { value: "villa", label: t("settings.housings.type.villa") },
  ]

  return (
    <>
      <div className="rounded-2xl border bg-card divide-y">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold">{t("settings.housings.title")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("settings.housings.description")}</p>
          </div>
          <Button size="sm" variant="outline" onClick={openCreate}>
            <Plus className="size-4" />
            {t("settings.housings.add")}
          </Button>
        </div>

        {initialHousings.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            {t("settings.housings.empty")}
          </div>
        ) : (
          <div className="divide-y">
            {initialHousings.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <House className="size-4 text-accent-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{h.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{h.address} · {h.capacity} guests</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(h)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(h)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("settings.housings.edit.title") : t("settings.housings.create.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("settings.housings.form.name")}</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Apartment Paris 11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("settings.housings.form.address")}</label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="e.g. 12 Rue de Rivoli, Paris"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("settings.housings.form.type")}</label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v as HousingType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("settings.housings.form.capacity")}</label>
                <Input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  placeholder="4"
                />
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("settings.housings.form.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                {editing ? t("settings.housings.form.save") : t("settings.housings.form.create")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete housing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("settings.housings.form.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
