"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Key, Settings, LogOut, Menu, X } from "lucide-react"
import LanguageSwitcher from "@/components/language-switcher"
import { useLanguage } from "@/lib/i18n/language-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useLanguage()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const navItems = [
    { href: "/dashboard", label: t("common.dashboard"), icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
    { href: "/dashboard/keys", label: t("common.apiKeys"), icon: <Key className="mr-2 h-4 w-4" /> },
    { href: "/dashboard/settings", label: t("common.settings"), icon: <Settings className="mr-2 h-4 w-4" /> },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 移动端菜单按钮 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* 语言切换器 - 移动端 */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* 侧边栏 - 减小宽度和间距 */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-40 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-2 border-b flex justify-between items-center">
            <h2 className="text-base font-bold">{t("app.title")}</h2>
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
          </div>
          <nav className="flex-1 py-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-2 py-1.5 mx-1 rounded-md text-xs
                  ${pathname === item.href ? "bg-primary text-primary-foreground" : "text-gray-700 hover:bg-gray-100"}
                `}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-2 border-t">
            <Button variant="outline" className="w-full flex items-center justify-center text-xs py-1" asChild>
              <Link href="/">
                <LogOut className="mr-1 h-3 w-3" />
                {t("common.logout")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容区 - 调整左边距并居中内容 */}
      <div className="flex-1 ml-0 lg:ml-40 transition-all duration-300 flex justify-center">
        <main className="h-full overflow-auto w-full max-w-6xl px-4">{children}</main>
      </div>
    </div>
  )
}

