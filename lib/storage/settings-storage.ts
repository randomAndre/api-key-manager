// lib/storage/settings-storage.ts

import type { SystemSettings } from "@/lib/storage"

// 存储键名
const STORAGE_KEYS = {
  SETTINGS: "api_key_manager_settings",
}

// 系统设置相关操作
export const settingsStorage = {
  // 获取系统设置
  getSystemSettings(): SystemSettings {
    if (typeof window === "undefined") return { allowRegistration: false, defaultKeyType: "apikey" }
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return settings ? JSON.parse(settings) : { allowRegistration: false, defaultKeyType: "apikey" }
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

