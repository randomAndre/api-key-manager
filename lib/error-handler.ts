/**
 * 全局错误处理器
 * 用于在应用中统一处理和显示错误信息
 */

/**
 * 显示应用错误提示
 * @param title 错误标题
 * @param message 错误详细信息
 */
export function showAppError(title: string, message: string): void {
  if (typeof window === "undefined") return

  // 创建自定义错误事件
  const errorEvent = new CustomEvent("app-error", {
    detail: {
      title,
      message,
    },
  })

  // 触发错误事件
  window.dispatchEvent(errorEvent)
}

/**
 * 处理API密钥相关的错误
 * @param error 捕获的错误对象
 * @param operation 正在执行的操作
 */
export function handleApiKeyError(error: unknown, operation: string): void {
  console.error(`API密钥操作失败 (${operation}):`, error)

  // 判断错误类型并提供相应的错误信息
  let title = "API密钥操作失败"
  let message = `在${operation}过程中发生错误`

  if (error instanceof Error) {
    if (error.message.includes("decrypt") || error.message.includes("encrypt")) {
      title = "加密/解密错误"
      message = "API密钥包含不支持的字符（如中文字符），请仅使用ASCII字符"
    } else if (error.message.includes("URL")) {
      title = "URL错误"
      message = "提供的URL格式不正确，请检查充值URL或API基础URL"
    } else if (error.message.includes("network") || error.message.includes("connect")) {
      title = "网络连接错误"
      message = "无法连接到API服务器，请检查网络连接或API地址"
    } else {
      message = error.message
    }
  }

  showAppError(title, message)
}

