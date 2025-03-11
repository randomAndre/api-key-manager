import { userStorage } from "@/lib/storage"
import { cookies, revalidatePath } from "next/headers"
import { userRepository } from "@/lib/repositories/user.repository"
import { activityLogRepository } from "@/lib/repositories/activity-log.repository"

interface UserSession {
  id: string
  username: string
  email: string
}

export async function loginUser(formData: FormData): Promise<{ success: boolean; message?: string }> {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // 验证输入
  if (!username || !password) {
    return { success: false, message: "用户名和密码都是必填的" }
  }

  try {
    // 尝试使用数据库验证
    try {
      // 验证用户凭证
      const user = await userRepository.verifyCredentials(username, password)

      if (user) {
        // 更新最后登录时间
        await userRepository.updateLastLogin(user.id)

        // 记录登录活动
        try {
          await activityLogRepository.logLogin(user.id)
        } catch (error) {
          console.error("记录活动日志失败:", error)
          // 继续执行，不中断登录流程
        }

        // 创建用户会话
        const session: UserSession = {
          id: String(user.id),
          username: user.username,
          email: user.email,
        }

        // 将会话存储在安全的HTTP-only cookie中
        cookies().set("user_session", JSON.stringify(session), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 7天
          path: "/",
        })

        revalidatePath("/", "layout")

        return { success: true }
      }
    } catch (dbError) {
      console.error("数据库验证失败，尝试使用本地存储:", dbError)
      // 继续执行，尝试本地存储
    }

    // 如果数据库验证失败，尝试使用本地存储
    console.log("尝试使用本地存储验证用户")
    const localUser = userStorage.getUserByUsername(username)

    if (!localUser || localUser.password !== password) {
      return { success: false, message: "用户名或密码错误" }
    }

    // 创建用户会话
    const session: UserSession = {
      id: String(localUser.id),
      username: localUser.username,
      email: localUser.email,
    }

    // 将会话存储在安全的HTTP-only cookie中
    cookies().set("user_session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: "/",
    })

    revalidatePath("/", "layout")

    return { success: true }
  } catch (error) {
    console.error("登录失败:", error)
    return { success: false, message: "登录失败，请稍后重试" }
  }
}

export async function getCurrentUser(): Promise<{ id: number; username: string; email: string } | null> {
  const session = cookies().get("user_session")?.value

  if (!session) {
    return null
  }

  try {
    const userSession = JSON.parse(session)
    return {
      id: Number(userSession.id),
      username: userSession.username,
      email: userSession.email,
    }
  } catch (error) {
    console.error("获取当前用户会话失败:", error)
    return null
  }
}

