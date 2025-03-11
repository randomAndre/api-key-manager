"use client"
import ApiKeyList from "@/components/api-key-list"
import { useLanguage } from "@/lib/i18n/language-context"

export default function ApiKeysPage() {
  const { t } = useLanguage()

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold mb-6">{t("apiKeys.title")}</h1>
      <ApiKeyList />
    </div>
  )
}

