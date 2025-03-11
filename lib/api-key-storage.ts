// lib/api-key-storage.ts
/**
 * 本地存储服务 - 使用localStorage替代数据库
 * 注意：这种方式只适合小型应用和演示项目
 */

import { decrypt } from "@/lib/encryption"

// 用户类型
export interface User {
  id: number
  username: string
  password: string
  email: string
  created_at: string
}

// API密钥类型
export interface ApiKey {
  id: number
  userId: number
  name: string
  key: string
  type: "apikey" | "complex"
  provider: string
  model?: string
  appId?: string
  secretKey?: string
  baseUrl: string
  createdAt: string
  lastUsed: string
}

export const apiKeyStorage = {
  // 获取用户的所有 API 密钥
  getApiKeysByUserId(userId: number): ApiKey[] {
    if (typeof window === "undefined") return []
    const apiKeys = localStorage.getItem("api_key_manager_api_keys")
    const keys = apiKeys ? JSON.parse(apiKeys) : []
    const userKeys = keys.filter((key: ApiKey) => key.userId === userId)

    // 返回解密后的密钥
    return userKeys.map((key: ApiKey) => ({
      ...key,
      key: key.key ? decrypt(key.key) : "",
      appId: key.appId ? decrypt(key.appId) : undefined,
      secretKey: key.secretKey ? decrypt(key.secretKey) : undefined,
    }))
  },

  // 获取单个 API 密钥
  getApiKeyById(id: number, userId: number): ApiKey | undefined {
    const apiKeys = this.getApiKeysByUserId(userId)
    return apiKeys.find((key) => key.id === id)
  },

  // 创建新的 API 密钥
  createApiKey(data: Omit<ApiKey, "id" | "createdAt" | "lastUsed">): ApiKey {
    const allApiKeys = localStorage.getItem("api_key_manager_api_keys")
    const apiKeys = allApiKeys ? JSON.parse(allApiKeys) : []

    const newKey = {
      id: apiKeys.length > 0 ? Math.max(...apiKeys.map((k: ApiKey) => k.id)) + 1 : 1,
      ...data,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "-",
    }

    apiKeys.push(newKey)
    localStorage.setItem("api_key_manager_api_keys", JSON.stringify(apiKeys))
    return newKey
  },

  // 更新 API 密钥
  updateApiKey(id: number, userId: number, data: Partial<ApiKey>): ApiKey | null {
    const allApiKeys = localStorage.getItem("api_key_manager_api_keys")
    const apiKeys = allApiKeys ? JSON.parse(allApiKeys) : []

    const keyIndex = apiKeys.findIndex((key: ApiKey) => key.id === id && key.userId === userId)
    if (keyIndex === -1) return null

    apiKeys[keyIndex] = {
      ...apiKeys[keyIndex],
      ...data,
    }

    localStorage.setItem("api_key_manager_api_keys", JSON.stringify(apiKeys))
    return apiKeys[keyIndex]
  },

  // 删除 API 密钥
  deleteApiKey(id: number, userId: number): boolean {
    const allApiKeys = localStorage.getItem("api_key_manager_api_keys")
    const apiKeys = allApiKeys ? JSON.parse(allApiKeys) : []

    const keyIndex = apiKeys.findIndex((key: ApiKey) => key.id === id && key.userId === userId)
    if (keyIndex === -1) return false

    apiKeys.splice(keyIndex, 1)
    localStorage.setItem("api_key_manager_api_keys", JSON.stringify(apiKeys))
    return true
  },
}

