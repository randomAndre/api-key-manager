"use client"

import type React from "react"

import { LanguageProvider } from "@/lib/i18n/language-context"

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LanguageProvider>{children}</LanguageProvider>
}

