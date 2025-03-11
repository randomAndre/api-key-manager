"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/lib/i18n/language-context"
import { useToast } from "@/hooks/use-toast"

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: "zh-CN", name: "中文简体" },
    { code: "en-US", name: "English" },
  ]

  const handleLanguageChange = (langCode: "zh-CN" | "en-US") => {
    setLanguage(langCode)
    setIsOpen(false)

    toast({
      title: t("settings.languageChanged"),
      description: langCode === "zh-CN" ? "已切换到中文" : "Switched to English",
    })
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t("settings.selectLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as "zh-CN" | "en-US")}
            className="flex items-center justify-between"
          >
            <span>{lang.name}</span>
            {language === lang.code && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

