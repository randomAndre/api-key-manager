/**
 * 本地存储服务 - 使用localStorage替代数据库
 * 注意：这种方式只适合小型应用和演示项目
 */

// 在文件顶部添加导入
import { encrypt, decrypt } from "@/lib/encryption"

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
  rechargeUrl?: string // 替代原来的 model 字段
  appId?: string
  secretKey?: string
  baseUrl: string
  createdAt: string
  lastUsed: string
}

// 修改 SystemSettings 接口，移除 encryptionLevel
export interface SystemSettings {
  allowRegistration: boolean
  defaultKeyType: "apikey" | "complex"
}

// 更新默认设置
const defaultSettings: SystemSettings = {
  allowRegistration: false,
  defaultKeyType: "apikey",
}

// 初始化默认数据
const defaultUser: User = {
  id: 1,
  username: "admin",
  password: "password", // 实际项目中应该使用加密密码
  email: "admin@example.com",
  created_at: "2024-03-09",
}

// 简化为两个演示密钥
const defaultApiKeys: ApiKey[] = [
  {
    id: 1,
    userId: 1,
    name: "OpenAI API (演示)",
    key: "sk-demo12345678abcdefghijklmnopqrstuvwxyz",
    type: "apikey",
    provider: "OpenAI",
    rechargeUrl: "https://api.example.com",
    baseUrl: "https://api.example.com",
    createdAt: "2024-03-15",
    lastUsed: "-",
  },
  {
    id: 2,
    userId: 1,
    name: "百度文心一言 (演示)",
    key: "demo_api_key_12345678",
    type: "complex",
    provider: "Baidu",
    appId: "demo_app_id_12345",
    secretKey: "demo_secret_key_12345",
    rechargeUrl: "https://console.bce.baidu.com/billing/#/billing/cbm/recharge",
    baseUrl: "https://api.example.com",
    createdAt: "2024-03-15",
    lastUsed: "-",
  },
]

// 存储键名
const STORAGE_KEYS = {
  USERS: "api_key_manager_users",
  API_KEYS: "api_key_manager_api_keys",
  SETTINGS: "api_key_manager_settings",
}

// 修改 initStorage 函数，确保在客户端环境中执行
export function initStorage() {
  if (typeof window === "undefined") return

  // 只在客户端初始化
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([defaultUser]))
  }

  if (!localStorage.getItem(STORAGE_KEYS.API_KEYS)) {
    // 加密默认API密钥
    const encryptedKeys = defaultApiKeys.map((key) => ({
      ...key,
      key: encrypt(key.key),
      appId: key.appId ? encrypt(key.appId) : undefined,
      secretKey: key.secretKey ? encrypt(key.secretKey) : undefined,
    }))
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(encryptedKeys))
  }

  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings))
  }
}

// 用户相关操作
export const userStorage = {
  // 获取所有用户
  getUsers(): User[] {
    if (typeof window === "undefined") return []
    const users = localStorage.getItem(STORAGE_KEYS.USERS)
    return users ? JSON.parse(users) : []
  },

  // 根据用户名获取用户
  getUserByUsername(username: string): User | undefined {
    const users = this.getUsers()
    return users.find((user) => user.username === username)
  },

  // 创建新用户 - 保留但不使用
  createUser(username: string, password: string, email: string): User {
    const users = this.getUsers()
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      username,
      password,
      email,
      created_at: new Date().toISOString().split("T")[0],
    }
    users.push(newUser)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
    return newUser
  },

  // 更新用户信息
  updateUser(userId: number, data: Partial<User>): User | null {
    const users = this.getUsers()
    const userIndex = users.findIndex((user) => user.id === userId)
    if (userIndex === -1) return null

    users[userIndex] = {
      ...users[userIndex],
      ...data,
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
    return users[userIndex]
  },
}

// API 密钥相关操作
export const apiKeyStorage = {
  // 获取用户的所有 API 密钥
  getApiKeysByUserId(userId: number): ApiKey[] {
    if (typeof window === "undefined") return []
    const apiKeys = localStorage.getItem(STORAGE_KEYS.API_KEYS)
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
    const allApiKeys = localStorage.getItem(STORAGE_KEYS.API_KEYS)
    const apiKeys = allApiKeys ? JSON.parse(allApiKeys) : []

    const newKey = {
      id: apiKeys.length > 0 ? Math.max(...apiKeys.map((k: ApiKey) => k.id)) + 1 : 1,
      ...data,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "-",
    }

    apiKeys.push(newKey)
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(apiKeys))
    return newKey
  },

  // 更新 API 密钥
  updateApiKey(id: number, userId: number, data: Partial<ApiKey>): ApiKey | null {
    const allApiKeys = localStorage.getItem(STORAGE_KEYS.API_KEYS)
    const apiKeys = allApiKeys ? JSON.parse(allApiKeys) : []

    const keyIndex = apiKeys.findIndex((key: ApiKey) => key.id === id && key.userId === userId)
    if (keyIndex === -1) return null

    apiKeys[keyIndex] = {
      ...apiKeys[keyIndex],
      ...data,
    }

    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(apiKeys))
    return apiKeys[keyIndex]
  },

  // 删除 API 密钥
  deleteApiKey(id: number, userId: number): boolean {
    const allApiKeys = localStorage.getItem(STORAGE_KEYS.API_KEYS)
    const apiKeys = allApiKeys ? JSON.parse(allApiKeys) : []

    const keyIndex = apiKeys.findIndex((key: ApiKey) => key.id === id && key.userId === userId)
    if (keyIndex === -1) return false

    apiKeys.splice(keyIndex, 1)
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(apiKeys))
    return true
  },
}

// 系统设置相关操作
export const settingsStorage = {
  // 获取系统设置
  getSystemSettings(): SystemSettings {
    if (typeof window === "undefined") return defaultSettings
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return settings ? JSON.parse(settings) : defaultSettings
  },

  // 更新系统设置
  updateSystemSettings(data: Partial<SystemSettings>): SystemSettings {
    const currentSettings = this.getSystemSettings()
    const updatedSettings = {
      ...currentSettings,
      ...data,
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings))
    return updatedSettings
  },
}

