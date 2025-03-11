"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Language, type TranslationKey, getTranslations } from "./translations"

// 定义语言上下文类型
interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 语言提供者组件
interface LanguageProviderProps {
  children: ReactNode
  defaultLanguage?: Language
}

export function LanguageProvider({ children, defaultLanguage = "zh-CN" }: LanguageProviderProps) {
  // 尝试从本地存储获取语言设置，如果没有则使用默认语言
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("language") as Language
      return savedLanguage || defaultLanguage
    }
    return defaultLanguage
  })

  // 设置语言并保存到本地存储
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage)
    }
  }

  // 翻译函数
  const t = (key: TranslationKey): string => {
    const translations = getTranslations(language)
    return translations[key] || key
  }

  // 当语言变化时，更新文档的语言属性
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = language
    }
  }, [language])

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

// 使用语言的钩子
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

