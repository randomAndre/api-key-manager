/**
 * API连接测试工具
 * 用于测试不同提供商的API连接状态
 */

import type { ApiKey } from "@/lib/storage"

// 连接测试结果类型
export interface ConnectionTestResult {
  status: number
  message: string
  testedAt: string
  latency: number // 延迟字段，单位ms
}

// 缓存键名
const CONNECTION_TEST_CACHE = "api_connection_test_results"

// 缓存过期时间（毫秒）- 1天
const CACHE_EXPIRY = 24 * 60 * 60 * 1000

/**
 * 获取认证头部
 */
function getAuthHeaders(apiKey: ApiKey): Record<string, string> {
  switch (apiKey.provider) {
    case "OpenAI":
      return { Authorization: `Bearer ${apiKey.key}` }
    case "Anthropic":
      return { "x-api-key": apiKey.key }
    case "Baidu":
      // 百度需要特殊处理，这里简化处理
      return { Authorization: `Bearer ${apiKey.key}` }
    case "Google":
      return { Authorization: `Bearer ${apiKey.key}` }
    case "Meta":
      return { Authorization: `Bearer ${apiKey.key}` }
    case "Mistral":
      return { Authorization: `Bearer ${apiKey.key}` }
    case "Cohere":
      return { Authorization: `Bearer ${apiKey.key}` }
    default:
      return { Authorization: `Bearer ${apiKey.key}` }
  }
}

/**
 * 处理响应状态
 */
function processResponse(status: number): ConnectionTestResult {
  let message = ""

  if (status >= 200 && status < 300) {
    message = "连接正常"
  } else if (status === 401 || status === 403) {
    message = "认证失败"
  } else if (status === 429) {
    message = "请求频率限制"
  } else {
    message = `连接异常 (${status})`
  }

  return {
    status,
    message,
    testedAt: new Date().toISOString(),
    latency: 0, // 默认值，会被实际测量值覆盖
  }
}

/**
 * 测试API连接
 */
export async function testApiConnection(apiKey: ApiKey): Promise<ConnectionTestResult> {
  try {
    // 直接使用用户提供的baseUrl
    const url = apiKey.baseUrl

    // 如果URL为空，返回错误
    if (!url || url.trim() === "") {
      return {
        status: 0,
        message: "URL不能为空",
        testedAt: new Date().toISOString(),
        latency: 0,
      }
    }

    const headers = getAuthHeaders(apiKey)

    // 记录开始时间
    const startTime = performance.now()

    const response = await fetch(url, {
      method: "GET",
      headers,
      // 设置较短的超时时间，避免长时间等待
      signal: AbortSignal.timeout(10000),
    })

    // 计算延迟时间（毫秒）
    const latency = Math.round(performance.now() - startTime)

    // 将延迟添加到结果中
    return {
      ...processResponse(response.status),
      latency,
    }
  } catch (error) {
    console.error(`测试API连接失败:`, error)

    // 处理不同类型的错误
    let errorMessage = "未知错误"
    if (error instanceof TypeError && error.message.includes("NetworkError")) {
      errorMessage = "网络错误"
    } else if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      errorMessage = "无法连接到服务器"
    } else if (error instanceof DOMException && error.name === "AbortError") {
      errorMessage = "连接超时"
    } else if (error instanceof TypeError && error.message.includes("Invalid URL")) {
      errorMessage = "无效的URL格式"
    }

    return {
      status: 0,
      message: errorMessage,
      testedAt: new Date().toISOString(),
      latency: 0, // 连接失败时延迟为0
    }
  }
}

/**
 * 从缓存获取测试结果
 */
export function getCachedTestResult(apiKeyId: number): ConnectionTestResult | null {
  if (typeof window === "undefined") return null

  try {
    const cacheJson = localStorage.getItem(CONNECTION_TEST_CACHE)
    if (!cacheJson) return null

    const cache = JSON.parse(cacheJson)
    const result = cache[apiKeyId]

    if (!result) return null

    // 检查缓存是否过期
    const testedAt = new Date(result.testedAt).getTime()
    const now = new Date().getTime()
    if (now - testedAt > CACHE_EXPIRY) {
      return null // 缓存已过期
    }

    return result
  } catch (error) {
    console.error("获取缓存测试结果失败:", error)
    return null
  }
}

/**
 * 缓存测试结果
 */
export function cacheTestResult(apiKeyId: number, result: ConnectionTestResult): void {
  if (typeof window === "undefined") return

  try {
    const cacheJson = localStorage.getItem(CONNECTION_TEST_CACHE)
    const cache = cacheJson ? JSON.parse(cacheJson) : {}

    cache[apiKeyId] = result
    localStorage.setItem(CONNECTION_TEST_CACHE, JSON.stringify(cache))
  } catch (error) {
    console.error("缓存测试结果失败:", error)
  }
}

/**
 * 测试API连接并缓存结果
 */
export async function testAndCacheConnection(apiKey: ApiKey): Promise<ConnectionTestResult> {
  const result = await testApiConnection(apiKey)
  cacheTestResult(apiKey.id, result)
  return result
}

/**
 * 获取充值URL
 */
export function getRechargeUrl(provider: string): string {
  switch (provider) {
    case "OpenAI":
      return "https://platform.openai.com/account/billing/overview"
    case "Anthropic":
      return "https://console.anthropic.com/account/billing"
    case "Baidu":
      return "https://console.bce.baidu.com/billing/#/billing/cbm/recharge"
    case "Google":
      return "https://console.cloud.google.com/billing"
    case "Meta":
      return "https://llama-api.meta.com/billing"
    case "Mistral":
      return "https://console.mistral.ai/billing/"
    case "Cohere":
      return "https://dashboard.cohere.com/account/billing"
    default:
      return "#"
  }
}

