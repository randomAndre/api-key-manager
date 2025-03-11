"use client"

import LoginForm from "@/components/login-form"
import { useLanguage } from "@/lib/i18n/language-context"
import LanguageSwitcher from "@/components/language-switcher"
import { LanguageProvider } from "@/lib/i18n/language-context"

export default function LoginPage() {
  return (
    <LanguageProvider>
      <LoginContent />
    </LanguageProvider>
  )
}

function LoginContent() {
  const { t } = useLanguage()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 relative">
      {/* 添加语言切换器到右上角 */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">{t("app.title")}</h1>
        <LoginForm />
      </div>
    </main>
  )
}

