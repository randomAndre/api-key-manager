"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n/language-context"
import LanguageSwitcher from "@/components/language-switcher"
import { LanguageProvider } from "@/lib/i18n/language-context"
import Link from "next/link"
import { Mail, Key, Shield, BarChart, Settings, Github } from "lucide-react"

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  )
}

function HomeContent() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 导航栏 */}
      <nav className="bg-white dark:bg-gray-950 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{t("app.title")}</span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link href="/login">
                <Button>{t("common.login")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t("app.title")}
        </h1>
        <p className="mt-6 text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">{t("home.hero.subtitle")}</p>
        <div className="mt-10">
          <Link href="/login">
            <Button size="lg" className="px-8 py-3 text-lg">
              {t("home.hero.cta")}
            </Button>
          </Link>
        </div>
      </div>

      {/* 功能特点 */}
      <div className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              {t("home.features.title")}
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Key className="h-8 w-8 text-primary" />}
              title={t("home.features.keyManagement.title")}
              description={t("home.features.keyManagement.description")}
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary" />}
              title={t("home.features.security.title")}
              description={t("home.features.security.description")}
            />
            <FeatureCard
              icon={<BarChart className="h-8 w-8 text-primary" />}
              title={t("home.features.monitoring.title")}
              description={t("home.features.monitoring.description")}
            />
            <FeatureCard
              icon={<Settings className="h-8 w-8 text-primary" />}
              title={t("home.features.settings.title")}
              description={t("home.features.settings.description")}
            />
          </div>
        </div>
      </div>

      {/* 联系方式 */}
      <div className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("home.contact.title")}</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">{t("home.contact.subtitle")}</p>
          <div className="mt-6 inline-flex items-center justify-center space-x-2 text-primary">
            <Mail className="h-5 w-5" />
            <span>nanmeng@nanmengtech.com</span>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <a
              href="https://github.com/randomAndre/api-key-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              <Github className="h-5 w-5 mr-2" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      </CardContent>
    </Card>
  )
}

