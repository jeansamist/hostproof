"use client"

import {
  createEmployee,
  deleteEmployee,
  updateEmployee,
  type Employee,
} from "@/services/employee.services"
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
import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui/avatar"
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
import { Loader2, Pencil, Plus, Trash2, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState, useTransition } from "react"

type Gender = "male" | "female" | "other"

type EmployeeFormState = {
  fullName: string
  email: string
  tel: string
  gender: Gender | ""
}

const emptyForm = (): EmployeeFormState => ({
  fullName: "",
  email: "",
  tel: "",
  gender: "",
})

type SettingsEmployeesProps = {
  initialEmployees: Employee[]
}

export const SettingsEmployees: FunctionComponent<SettingsEmployeesProps> = ({ initialEmployees }) => {
  const t = useI18n()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState<EmployeeFormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [error, setError] = useState<string>()

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setError(undefined)
    setDialogOpen(true)
  }

  const openEdit = (e: Employee) => {
    setEditing(e)
    setForm({
      fullName: e.fullName,
      email: e.email ?? "",
      tel: e.tel ?? "",
      gender: (e.gender as Gender) ?? "",
    })
    setError(undefined)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.fullName || !form.gender) {
      setError(t("settings.employees.error.required"))
      return
    }
    setSaving(true)
    setError(undefined)
    const payload = {
      fullName: form.fullName,
      gender: form.gender as Gender,
      email: form.email || null,
      tel: form.tel || null,
    }
    const res = editing
      ? await updateEmployee({ ...payload, id: editing.id })
      : await createEmployee(payload)
    setSaving(false)
    if (res?.success) {
      setDialogOpen(false)
      startTransition(() => router.refresh())
    } else {
      setError(res?.message ?? t("unknownError"))
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteEmployee(deleteTarget.id)
      setDeleteTarget(null)
      router.refresh()
    })
  }

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

  const genderOptions = [
    { value: "male", label: t("settings.employees.gender.male") },
    { value: "female", label: t("settings.employees.gender.female") },
    { value: "other", label: t("settings.employees.gender.other") },
  ]

  return (
    <>
      <div className="rounded-2xl border bg-card divide-y">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold">{t("settings.employees.title")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("settings.employees.description")}</p>
          </div>
          <Button size="sm" variant="outline" onClick={openCreate}>
            <Plus className="size-4" />
            {t("settings.employees.add")}
          </Button>
        </div>

        {initialEmployees.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            {t("settings.employees.empty")}
          </div>
        ) : (
          <div className="divide-y">
            {initialEmployees.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-8 shrink-0">
                    {e.avatar && <AvatarImage src={e.avatar} alt={e.fullName} />}
                    <AvatarFallback className="text-xs">{initials(e.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{e.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {e.email ?? e.tel ?? t("settings.employees.noContact")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(e)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(e)}
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
              {editing ? t("settings.employees.edit.title") : t("settings.employees.create.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("settings.employees.form.fullName")}</label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder={t("settings.employees.placeholder.fullName")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("settings.employees.form.gender")}</label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm((f) => ({ ...f, gender: v as Gender }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.employees.gender.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("settings.employees.form.email")}</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder={t("settings.employees.placeholder.email")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("settings.employees.form.phone")}</label>
                <Input
                  value={form.tel}
                  onChange={(e) => setForm((f) => ({ ...f, tel: e.target.value }))}
                  placeholder={t("settings.employees.placeholder.phone")}
                />
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("settings.employees.form.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                {editing ? t("settings.employees.form.save") : t("settings.employees.form.create")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.employees.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.employees.delete.description", { name: deleteTarget?.fullName ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("settings.employees.form.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {t("settings.employees.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
