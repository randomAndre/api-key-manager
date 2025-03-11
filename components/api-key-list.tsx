"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Plus, Pencil, Trash2, Copy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/i18n/language-context"
import { apiKeyStorage, type ApiKey } from "@/lib/storage"
import { encrypt } from "@/lib/encryption"
import { settingsStorage } from "@/lib/storage/settings-storage"

// 主流大模型提供商列表
const POPULAR_PROVIDERS = [
  { value: "OpenAI", label: "OpenAI (GPT-4, GPT-3.5)" },
  { value: "Anthropic", label: "Anthropic (Claude)" },
  { value: "Baidu", label: "百度 (文心一言)" },
  { value: "Google", label: "Google (Gemini)" },
  { value: "Meta", label: "Meta (Llama)" },
  { value: "Mistral", label: "Mistral AI" },
  { value: "Cohere", label: "Cohere" },
]

// 默认 API URL 映射
const DEFAULT_API_URLS: Record<string, string> = {
  OpenAI: "https://api.openai.com/v1",
  Anthropic: "https://api.anthropic.com/v1",
  Baidu: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop",
  Google: "https://generativelanguage.googleapis.com/v1",
  Meta: "https://llama-api.meta.com/v1",
  Mistral: "https://api.mistral.ai/v1",
  Cohere: "https://api.cohere.ai/v1",
  Custom: "",
}

// 复制状态类型
type CopyState = {
  [key: string]: boolean
}

const getApiKeyUrl = (provider: string): string => {
  switch (provider) {
    case "OpenAI":
      return "https://platform.openai.com/account/api-keys"
    case "Anthropic":
      return "https://console.anthropic.com/account/api-keys"
    case "Baidu":
      return "https://console.bce.baidu.com/" // Replace with actual Baidu API key URL if available
    case "Google":
      return "https://console.cloud.google.com/apis/credentials"
    case "Meta":
      return "https://developers.facebook.com/docs/messenger-platform/getting-started/access-tokens" // Replace with actual Meta API key URL if available
    case "Mistral":
      return "https://console.mistral.ai/" // Replace with actual Mistral API key URL if available
    case "Cohere":
      return "https://app.cohere.ai/account"
    default:
      return ""
  }
}

export default function ApiKeyList() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [formErrors, setFormErrors] = useState<{ name?: string; key?: string }>({})

  // 复制状态管理
  const [copiedStates, setCopiedStates] = useState<CopyState>({})

  // 修改 useState 初始化，使用系统设置中的默认密钥类型
  const [newKey, setNewKey] = useState(() => {
    // 获取系统设置中的默认密钥类型
    const settings = settingsStorage.getSystemSettings()
    return {
      name: "",
      key: "",
      type: settings.defaultKeyType, // 使用系统设置中的默认类型
      provider: "",
      rechargeUrl: "",
      appId: "",
      secretKey: "",
      baseUrl: "",
    }
  })

  // 加载API密钥
  useEffect(() => {
    // 模拟用户ID为1
    const userId = 1
    const keys = apiKeyStorage.getApiKeysByUserId(userId)
    setApiKeys(keys)
  }, [])

  // 当提供商变化时更新默认URL
  const updateBaseUrl = (provider: string) => {
    setNewKey((prev) => ({
      ...prev,
      baseUrl: DEFAULT_API_URLS[provider] || "",
    }))
  }

  const toggleKeyVisibility = (id: number) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const validateForm = () => {
    const errors: { name?: string; key?: string } = {}
    let isValid = true

    if (!newKey.name.trim()) {
      errors.name = t("error.required")
      isValid = false
    }

    if (!newKey.key.trim()) {
      errors.key = t("error.required")
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // 修改 handleAddKey 函数，添加充值URL字段
  const handleAddKey = () => {
    // 验证表单
    if (!validateForm()) {
      return
    }

    // 如果 baseUrl 为空，使用默认值
    const baseUrl = newKey.baseUrl.trim() ? newKey.baseUrl : DEFAULT_API_URLS[newKey.provider] || ""

    // 加密密钥 - 使用同步方法
    const encryptedKey = encrypt(newKey.key)
    const encryptedAppId = newKey.appId ? encrypt(newKey.appId) : undefined
    const encryptedSecretKey = newKey.secretKey ? encrypt(newKey.secretKey) : undefined

    // 创建新密钥
    const newKeyObj = apiKeyStorage.createApiKey({
      userId: 1, // 模拟用户ID
      name: newKey.name,
      key: encryptedKey,
      type: newKey.type,
      provider: newKey.provider,
      rechargeUrl: newKey.rechargeUrl, // 使用充值URL替代model字段
      appId: encryptedAppId,
      secretKey: encryptedSecretKey,
      baseUrl,
    })

    // 更新状态
    setApiKeys((prev) => [
      ...prev,
      {
        ...newKeyObj,
        key: newKey.key, // 在UI中显示未加密的密钥
        appId: newKey.appId,
        secretKey: newKey.secretKey,
      },
    ])

    setIsAddDialogOpen(false)
    // 重置表单时使用系统设置中的默认类型
    const settings = settingsStorage.getSystemSettings()
    setNewKey({
      name: "",
      key: "",
      type: settings.defaultKeyType,
      provider: "",
      rechargeUrl: "",
      appId: "",
      secretKey: "",
      baseUrl: "",
    })
    setFormErrors({})

    toast({
      title: t("toast.addSuccess"),
      description: t("toast.addSuccess"),
    })
  }

  const handleEditKey = (key: ApiKey) => {
    setEditingKey(key)
    setIsEditDialogOpen(true)
    setFormErrors({})
  }

  const validateEditForm = () => {
    const errors: { name?: string; key?: string } = {}
    let isValid = true

    if (!editingKey?.name.trim()) {
      errors.name = t("error.required")
      isValid = false
    }

    if (!editingKey?.key.trim()) {
      errors.key = t("error.required")
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // 修改 saveEditedKey 函数，使用同步加密方法
  const saveEditedKey = () => {
    // 验证表单
    if (!validateEditForm() || !editingKey) {
      return
    }

    // 如果 baseUrl 为空，使用默认值
    if (!editingKey.baseUrl || !editingKey.baseUrl.trim()) {
      editingKey.baseUrl = DEFAULT_API_URLS[editingKey.provider] || ""
    }

    // 加密密钥 - 使用同步方法
    const encryptedKey = encrypt(editingKey.key)
    const encryptedAppId = editingKey.appId ? encrypt(editingKey.appId) : undefined
    const encryptedSecretKey = editingKey.secretKey ? encrypt(editingKey.secretKey) : undefined

    // 更新密钥
    apiKeyStorage.updateApiKey(editingKey.id, 1, {
      name: editingKey.name,
      key: encryptedKey,
      provider: editingKey.provider,
      model: editingKey.model,
      appId: encryptedAppId,
      secretKey: encryptedSecretKey,
      baseUrl: editingKey.baseUrl,
      rechargeUrl: editingKey.rechargeUrl,
    })

    // 更新状态
    setApiKeys((prev) => prev.map((key) => (key.id === editingKey.id ? editingKey : key)))

    setIsEditDialogOpen(false)
    setEditingKey(null)
    setFormErrors({})

    toast({
      title: t("toast.editSuccess"),
      description: t("toast.editSuccess"),
    })
  }

  const handleDeleteKey = (id: number) => {
    // 删除密钥
    apiKeyStorage.deleteApiKey(id, 1)

    // 更新状态
    setApiKeys((prev) => prev.filter((key) => key.id !== id))

    toast({
      title: t("toast.deleteSuccess"),
      description: t("deleteSuccess"),
    })
  }

  const maskKey = (key: string) => {
    if (!key) return ""

    // 确保密钥长度足够长，否则使用简单掩码
    if (key.length <= 8) {
      return key.substring(0, 2) + "•".repeat(Math.max(1, key.length - 4)) + key.substring(key.length - 2)
    }

    // 对于足够长的密钥，显示前4位和后4位
    return key.substring(0, 4) + "•".repeat(Math.max(1, Math.min(20, key.length - 8))) + key.substring(key.length - 4)
  }

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text)

    // 设置复制状态为 true
    setCopiedStates((prev) => ({ ...prev, [identifier]: true }))

    // 显示提示
    toast({
      title: t("toast.copied"),
      description: t("toast.copyDescription"),
    })

    // 1.5秒后重置复制状态
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [identifier]: false }))
    }, 1500)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t("apiKeys.list")}</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                {t("apiKeys.add")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("apiKeys.addNew")}</DialogTitle>
                <DialogDescription>{t("apiKeys.addDescription")}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* 类型选择 - 移到顶部 */}
                <div className="grid gap-2">
                  <Label htmlFor="type">{t("common.type")}</Label>
                  <Select
                    value={newKey.type}
                    onValueChange={(value: "apikey" | "complex") => setNewKey({ ...newKey, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.type")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apikey">{t("apiKeys.apiKey")}</SelectItem>
                      <SelectItem value="complex">{t("apiKeys.complexKey")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 两列布局的容器 */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* 左列 */}
                  <div className="space-y-4">
                    {/* 名称字段 */}
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="flex items-center">
                        {t("common.name")} <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder={t("apiKeys.namePlaceholder")}
                        value={newKey.name}
                        onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                        className={formErrors.name ? "border-red-500" : ""}
                      />
                      {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    {/* 提供商 */}
                    <div className="grid gap-2">
                      <Label htmlFor="provider">{t("apiKeys.provider")}</Label>
                      <Input
                        id="provider"
                        placeholder={t("apiKeys.providerPlaceholder")}
                        value={newKey.provider}
                        onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">{t("apiKeys.customProviderDescription")}</p>
                    </div>

                    {/* API密钥 */}
                    <div className="grid gap-2">
                      <Label htmlFor="key" className="flex items-center">
                        {t("common.key")} <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="key"
                        placeholder={t("apiKeys.keyPlaceholder")}
                        value={newKey.key}
                        onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                        className={formErrors.key ? "border-red-500" : ""}
                      />
                      {formErrors.key && <p className="text-red-500 text-xs mt-1">{formErrors.key}</p>}
                    </div>

                    {/* 充值URL */}
                    <div className="grid gap-2">
                      <Label htmlFor="rechargeUrl">{t("apiKeys.rechargeUrl")}</Label>
                      <Input
                        id="rechargeUrl"
                        placeholder="https://example.com"
                        value={newKey.rechargeUrl}
                        onChange={(e) => setNewKey({ ...newKey, rechargeUrl: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">{t("apiKeys.rechargeUrlDescription")}</p>
                    </div>
                  </div>

                  {/* 右列 */}
                  <div className="space-y-4">
                    {/* 复合密钥额外字段 */}
                    {newKey.type === "complex" && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="appId">{t("apiKeys.appId")}</Label>
                          <Input
                            id="appId"
                            placeholder={t("apiKeys.appIdPlaceholder")}
                            value={newKey.appId}
                            onChange={(e) => setNewKey({ ...newKey, appId: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="secretKey">{t("apiKeys.secretKey")}</Label>
                          <Input
                            id="secretKey"
                            placeholder={t("apiKeys.secretKeyPlaceholder")}
                            value={newKey.secretKey}
                            onChange={(e) => setNewKey({ ...newKey, secretKey: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {/* API基础URL */}
                    <div className="grid gap-2">
                      <Label htmlFor="baseUrl">{t("apiKeys.baseUrl")}</Label>
                      <Input
                        id="baseUrl"
                        placeholder="https://api.example.com/v1/models"
                        value={newKey.baseUrl}
                        onChange={(e) => setNewKey({ ...newKey, baseUrl: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        请输入完整的API URL，包括路径。此URL将用于测试连接。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setFormErrors({})
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleAddKey}>{t("common.add")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 编辑密钥对话框 */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) setFormErrors({})
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("apiKeys.edit")}</DialogTitle>
              <DialogDescription>{t("apiKeys.editDescription")}</DialogDescription>
            </DialogHeader>
            {editingKey && (
              <div className="grid gap-4 py-4">
                {/* 类型显示 */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">{t("common.type")}</Label>
                  <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                    {editingKey.type === "apikey" ? t("apiKeys.apiKey") : t("apiKeys.complexKey")}
                  </div>
                </div>

                {/* 两列布局的容器 */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* 左列 */}
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name" className="flex items-center">
                        {t("common.name")} <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="edit-name"
                        value={editingKey.name}
                        onChange={(e) => setEditingKey({ ...editingKey, name: e.target.value })}
                        className={formErrors.name ? "border-red-500" : ""}
                      />
                      {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-provider">{t("apiKeys.provider")}</Label>
                      <Input
                        id="edit-provider"
                        value={editingKey.provider}
                        onChange={(e) => setEditingKey({ ...editingKey, provider: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-key" className="flex items-center">
                        {t("common.key")} <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="edit-key"
                        value={editingKey.key}
                        onChange={(e) => setEditingKey({ ...editingKey, key: e.target.value })}
                        className={formErrors.key ? "border-red-500" : ""}
                      />
                      {formErrors.key && <p className="text-red-500 text-xs mt-1">{formErrors.key}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-rechargeUrl">{t("apiKeys.rechargeUrl")}</Label>
                      <Input
                        id="edit-rechargeUrl"
                        placeholder="https://example.com"
                        value={editingKey.rechargeUrl || ""}
                        onChange={(e) => setEditingKey({ ...editingKey, rechargeUrl: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">{t("apiKeys.rechargeUrlDescription")}</p>
                    </div>
                  </div>

                  {/* 右列 */}
                  <div className="space-y-4">
                    {editingKey.type === "complex" && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-appId">{t("apiKeys.appId")}</Label>
                          <Input
                            id="edit-appId"
                            value={editingKey.appId || ""}
                            onChange={(e) => setEditingKey({ ...editingKey, appId: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-secretKey">{t("apiKeys.secretKey")}</Label>
                          <Input
                            id="edit-secretKey"
                            value={editingKey.secretKey || ""}
                            onChange={(e) => setEditingKey({ ...editingKey, secretKey: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="edit-baseUrl">{t("apiKeys.baseUrl")}</Label>
                      <Input
                        id="edit-baseUrl"
                        placeholder="https://api.example.com/v1/models"
                        value={editingKey.baseUrl || ""}
                        onChange={(e) => setEditingKey({ ...editingKey, baseUrl: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        请输入完整的API URL，包括路径。此URL将用于测试连接。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setFormErrors({})
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={saveEditedKey}>{t("common.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("apiKeys.provider")}</TableHead>
                <TableHead>{t("common.key")}</TableHead>
                <TableHead>{t("apiKeys.baseUrl")}</TableHead>
                <TableHead>{t("common.created")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">
                    {apiKey.name}
                    {apiKey.type === "complex" && (
                      <Badge variant="outline" className="ml-2">
                        {t("apiKeys.complexKey")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{apiKey.provider}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="bg-muted px-1 py-0.5 rounded text-sm">
                        {visibleKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <Button variant="ghost" size="icon" onClick={() => toggleKeyVisibility(apiKey.id)}>
                        {visibleKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(apiKey.key, `key-${apiKey.id}`)}
                        title={t("common.copy")}
                        className={copiedStates[`key-${apiKey.id}`] ? "text-green-500" : ""}
                      >
                        {copiedStates[`key-${apiKey.id}`] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {apiKey.type === "complex" && apiKey.appId && (
                      <div className="mt-1">
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-muted-foreground">{t("apiKeys.appId")}:</div>
                          <code className="bg-muted px-1 py-0.5 rounded text-sm">
                            {visibleKeys[apiKey.id] ? apiKey.appId : maskKey(apiKey.appId)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(apiKey.appId, `appId-${apiKey.id}`)}
                            title={t("common.copy")}
                            className={`h-6 w-6 ${copiedStates[`appId-${apiKey.id}`] ? "text-green-500" : ""}`}
                          >
                            {copiedStates[`appId-${apiKey.id}`] ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        {apiKey.secretKey && (
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="text-xs text-muted-foreground">{t("apiKeys.secretKey")}:</div>
                            <code className="bg-muted px-1 py-0.5 rounded text-sm">
                              {visibleKeys[apiKey.id] ? apiKey.secretKey : maskKey(apiKey.secretKey)}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(apiKey.secretKey, `secretKey-${apiKey.id}`)}
                              title={t("common.copy")}
                              className={`h-6 w-6 ${copiedStates[`secretKey-${apiKey.id}`] ? "text-green-500" : ""}`}
                            >
                              {copiedStates[`secretKey-${apiKey.id}`] ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="bg-muted px-1 py-0.5 rounded text-sm truncate max-w-[150px]">
                        {apiKey.baseUrl}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(apiKey.baseUrl, `url-${apiKey.id}`)}
                        title={t("common.copy")}
                        className={copiedStates[`url-${apiKey.id}`] ? "text-green-500" : ""}
                      >
                        {copiedStates[`url-${apiKey.id}`] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{apiKey.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditKey(apiKey)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteKey(apiKey.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>{t("apiKeys.customUrlTip")}</p>
          <p className="mt-1">
            {t("apiKeys.requestHeader")}{" "}
            <code className="bg-muted px-2 py-1 rounded">Authorization: Bearer YOUR_API_KEY</code>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

