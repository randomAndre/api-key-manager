"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/i18n/language-context"
import { userStorage, settingsStorage, initStorage } from "@/lib/storage"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function SettingsForm() {
  const { toast } = useToast()
  const { t, language, setLanguage } = useLanguage()

  // 系统设置
  const [defaultKeyType, setDefaultKeyType] = useState("apikey")
  const [systemSaving, setSystemSaving] = useState(false)
  const [systemSuccess, setSystemSuccess] = useState(false)

  // 个人设置
  const [username, setUsername] = useState("admin")
  const [email, setEmail] = useState("admin@example.com")
  const [userSaving, setUserSaving] = useState(false)
  const [userSuccess, setUserSuccess] = useState(false)

  // 安全设置
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  // 初始化设置
  useEffect(() => {
    initStorage()

    // 加载系统设置
    const settings = settingsStorage.getSystemSettings()
    setDefaultKeyType(settings.defaultKeyType)

    // 加载用户设置
    const userJson = localStorage.getItem("user")
    if (userJson) {
      const user = JSON.parse(userJson)
      setUsername(user.username)
      setEmail(user.email)
    }
  }, [])

  // 重置成功状态
  useEffect(() => {
    if (systemSuccess) {
      const timer = setTimeout(() => setSystemSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [systemSuccess])

  useEffect(() => {
    if (userSuccess) {
      const timer = setTimeout(() => setUserSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [userSuccess])

  useEffect(() => {
    if (passwordSuccess) {
      const timer = setTimeout(() => setPasswordSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [passwordSuccess])

  // 保存系统设置
  const saveSystemSettings = async () => {
    setSystemSaving(true)
    try {
      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 600))

      // 保存系统设置
      settingsStorage.updateSystemSettings({
        allowRegistration: false, // 始终保持注册功能关闭
        defaultKeyType: defaultKeyType as "apikey" | "complex",
      })

      // 显示成功提示
      setSystemSuccess(true)
      toast({
        title: t("settings.settingsSaved"),
        description: t("settings.systemDescription"),
      })
    } catch (error) {
      console.error("保存系统设置失败:", error)
      toast({
        title: t("common.error"),
        description: "保存系统设置失败，请重试",
        variant: "destructive",
      })
    } finally {
      setSystemSaving(false)
    }
  }

  // 保存用户设置
  const saveUserSettings = async () => {
    setUserSaving(true)
    try {
      // 验证邮箱格式
      if (email && !validateEmail(email)) {
        toast({
          title: t("common.error"),
          description: "请输入有效的电子邮箱地址",
          variant: "destructive",
        })
        return
      }

      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 600))

      // 获取当前用户
      const userJson = localStorage.getItem("user")
      if (userJson) {
        const user = JSON.parse(userJson)

        // 更新用户信息
        userStorage.updateUser(user.id, {
          username,
          email,
        })

        // 更新本地存储的用户信息
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            username,
            email,
          }),
        )
      }

      // 显示成功提示
      setUserSuccess(true)
      toast({
        title: t("settings.settingsSaved"),
        description: t("settings.userDescription"),
      })
    } catch (error) {
      console.error("保存用户设置失败:", error)
      toast({
        title: t("common.error"),
        description: "保存用户设置失败，请重试",
        variant: "destructive",
      })
    } finally {
      setUserSaving(false)
    }
  }

  // 更改密码
  const saveSecuritySettings = async () => {
    setPasswordSaving(true)
    setPasswordError("")

    try {
      // 验证当前密码
      if (!currentPassword) {
        setPasswordError("请输入当前密码")
        return
      }

      // 验证新密码
      if (!newPassword) {
        setPasswordError("请输入新密码")
        return
      }

      // 验证确认密码
      if (newPassword !== confirmPassword) {
        setPasswordError("两次输入的密码不一致")
        return
      }

      // 验证密码长度
      if (newPassword.length < 6) {
        setPasswordError("新密码长度不能少于6个字符")
        return
      }

      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 800))

      // 获取当前用户
      const userJson = localStorage.getItem("user")
      if (userJson) {
        const user = JSON.parse(userJson)
        const userObj = userStorage.getUserByUsername(user.username)

        // 验证当前密码是否正确
        if (!userObj || userObj.password !== currentPassword) {
          setPasswordError("当前密码不正确")
          return
        }

        // 更新密码
        userStorage.updateUser(user.id, {
          password: newPassword,
        })

        // 清空密码字段
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")

        // 显示成功提示
        setPasswordSuccess(true)
        toast({
          title: t("settings.passwordChanged"),
          description: "密码已成功更新",
        })
      }
    } catch (error) {
      console.error("更改密码失败:", error)
      toast({
        title: t("common.error"),
        description: "更改密码失败，请重试",
        variant: "destructive",
      })
    } finally {
      setPasswordSaving(false)
    }
  }

  // 语言切换
  const handleLanguageChange = (newLanguage: "zh-CN" | "en-US") => {
    setLanguage(newLanguage)

    toast({
      title: t("settings.languageChanged"),
      description: newLanguage === "zh-CN" ? "已切换到中文" : "Switched to English",
    })
  }

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  return (
    <Tabs defaultValue="system" className="w-full max-w-4xl">
      <TabsList className="mb-4">
        <TabsTrigger value="system">{t("common.system")}</TabsTrigger>
        <TabsTrigger value="user">{t("common.user")}</TabsTrigger>
        <TabsTrigger value="security">{t("common.security")}</TabsTrigger>
        <TabsTrigger value="language">{t("common.language")}</TabsTrigger>
      </TabsList>

      <TabsContent value="system">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.systemSettings")}</CardTitle>
            <CardDescription>{t("settings.systemDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {systemSuccess && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>系统设置已成功保存</AlertDescription>
              </Alert>
            )}

            {/* 默认密钥类型设置 - 这个设置会被API密钥添加功能使用 */}
            <div className="space-y-2">
              <Label htmlFor="defaultKeyType">{t("settings.defaultKeyType")}</Label>
              <Select value={defaultKeyType} onValueChange={setDefaultKeyType}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.defaultKeyType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apikey">{t("apiKeys.apiKey")}</SelectItem>
                  <SelectItem value="complex">{t("apiKeys.complexKey")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">{t("settings.defaultKeyTypeDescription")}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveSystemSettings} disabled={systemSaving}>
              {systemSaving ? "保存中..." : t("settings.saveSystemSettings")}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="user">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.userSettings")}</CardTitle>
            <CardDescription>{t("settings.userDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {userSuccess && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>个人设置已成功保存</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">{t("common.username")}</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveUserSettings} disabled={userSaving}>
              {userSaving ? "保存中..." : t("settings.saveUserSettings")}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.securitySettings")}</CardTitle>
            <CardDescription>{t("settings.securityDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {passwordSuccess && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>密码已成功更新</AlertDescription>
              </Alert>
            )}

            {passwordError && (
              <Alert className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder={t("settings.currentPassword")}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder={t("settings.newPassword")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">{t("settings.passwordLengthHint")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("settings.confirmNewPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("settings.confirmNewPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveSecuritySettings} disabled={passwordSaving}>
              {passwordSaving ? "更新中..." : t("settings.changePassword")}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="language">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.languageSettings")}</CardTitle>
            <CardDescription>{t("settings.languageDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">{t("settings.selectLanguage")}</Label>
              <Select value={language} onValueChange={(value) => handleLanguageChange(value as "zh-CN" | "en-US")}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">中文简体</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

