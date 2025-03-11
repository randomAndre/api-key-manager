"use client"
import SettingsForm from "@/components/settings-form"
import { useLanguage } from "@/lib/i18n/language-context"

export default function SettingsPage() {
  const { t } = useLanguage()

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold mb-6">{t("settings.title")}</h1>
      <SettingsForm />
    </div>
  )
}

