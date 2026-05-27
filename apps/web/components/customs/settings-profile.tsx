"use client"

import { deleteAccount, updateProfile } from "@/services/auth.services"
import type { User } from "@/types"
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
import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui/avatar"
import { Button } from "@packages/ui/button"
import { Input } from "@packages/ui/input"
import { useI18n } from "@/lib/i18n/client"
import { Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState } from "react"

type SettingsProfileProps = {
  user: User
  locale: string
}

export const SettingsProfile: FunctionComponent<SettingsProfileProps> = ({ user, locale }) => {
  const t = useI18n()
  const router = useRouter()
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const [error, setError] = useState<string>()

  const handleSave = async () => {
    setSaving(true)
    setError(undefined)
    const res = await updateProfile({ firstName, lastName })
    setSaving(false)
    if (res?.success) {
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2500)
      router.refresh()
    } else {
      setError(res?.message ?? t("unknownError"))
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteAccount()
    router.push(`/${locale}/auth/sign-in`)
  }

  return (
    <div className="rounded-2xl border bg-card divide-y">
      {/* Avatar + name */}
      <div className="flex items-center gap-4 px-6 py-5">
        <Avatar className="size-14">
          {user.avatar && <AvatarImage src={user.avatar} alt={user.initials} />}
          <AvatarFallback className="text-lg font-semibold">{user.initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("settings.profile.firstName")}
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t("settings.profile.firstName")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("settings.profile.lastName")}
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t("settings.profile.lastName")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("settings.profile.email")}
          </label>
          <Input value={user.email} disabled className="opacity-60" />
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? t("settings.profile.saving") : savedMsg ? t("settings.profile.saved") : t("settings.profile.save")}
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="px-6 py-5 space-y-2">
        <p className="text-xs font-semibold text-destructive">{t("settings.profile.delete.title")}</p>
        <p className="text-xs text-muted-foreground">{t("settings.profile.delete.description")}</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={deleting}>
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {t("settings.profile.delete.button")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("settings.profile.delete.confirm.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("settings.profile.delete.confirm.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("settings.profile.delete.confirm.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("settings.profile.delete.confirm.action")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
