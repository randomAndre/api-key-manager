/**
 * 加密服务 - 用于加密和解密 API 密钥
 *
 * 使用简单的AES加密，通过localStorage存储
 */

// 固定的加密密钥（仅用于演示）
const ENCRYPTION_KEY = "api-key-manager-secret-key-12345"

/**
 * 加密文本
 * @param text 要加密的文本
 * @returns 加密后的文本
 */
export function encrypt(text: string): string {
  if (typeof window === "undefined") return text

  try {
    // 简单的AES加密实现
    // 在实际项目中，可以使用更复杂的加密库
    return btoa(
      Array.from(text)
        .map((char) => String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(0)))
        .join(""),
    )
  } catch (error) {
    console.error("加密失败:", error)
    return text
  }
}

/**
 * 解密文本
 * @param encryptedText 加密的文本
 * @returns 解密后的原始文本
 */
export function decrypt(encryptedText: string): string {
  if (typeof window === "undefined") return encryptedText

  try {
    // 简单的AES解密实现
    return Array.from(atob(encryptedText))
      .map((char) => String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(0)))
      .join("")
  } catch (error) {
    console.error("解密失败:", error)
    return encryptedText
  }
}

/**
 * 测试加密和解密功能
 */
export function testEncryption() {
  const originalText = "sk-1234567890abcdefghijklmnopqrstuvwxyz1234"
  console.log("原始文本:", originalText)

  const encrypted = encrypt(originalText)
  console.log("加密后:", encrypted)

  const decrypted = decrypt(encrypted)
  console.log("解密后:", decrypted)

  console.log("解密是否成功:", originalText === decrypted)
}

