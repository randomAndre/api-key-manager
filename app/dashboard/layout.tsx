"use client"

import type React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { LanguageProvider } from "@/lib/i18n/language-context"
import ErrorNotification from "@/components/error-notification"

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      <ErrorNotification />
      <DashboardLayout>{children}</DashboardLayout>
    </LanguageProvider>
  )
}

