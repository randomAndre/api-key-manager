"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/lib/i18n/language-context"
import { userStorage, initStorage } from "@/lib/storage"

export default function LoginForm() {
  const { t } = useLanguage()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // 初始化本地存储
  useEffect(() => {
    initStorage()
  }, [])

  // 登录功能
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 800))

      // 验证用户
      const user = userStorage.getUserByUsername(username)

      if (user && user.password === password) {
        // 存储会话信息
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
          }),
        )

        router.push("/dashboard")
      } else {
        setError(t("login.error"))
      }
    } catch (err) {
      setError(t("error.loginFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("login.title")}</CardTitle>
        <CardDescription>{t("login.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t("common.username")}</Label>
            <Input
              id="username"
              type="text"
              placeholder={t("common.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("common.password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("common.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full" onClick={handleLogin} disabled={loading}>
          {loading ? t("common.loading") : t("login.button")}
        </Button>
        <div className="text-sm text-center mt-2">
          <p className="text-muted-foreground"></p>
        </div>
      </CardFooter>
    </Card>
  )
}

