import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "南梦API秘钥管理",
  description: "安全管理各种 AI 模型的 API 密钥",
  icons: {
    icon: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/75cda7542df94f9e8534d82f9e31cae3_3-1flDTgHIuogz0ioIUPjC3BE9xbsIdP.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/75cda7542df94f9e8534d82f9e31cae3_3-1flDTgHIuogz0ioIUPjC3BE9xbsIdP.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/75cda7542df94f9e8534d82f9e31cae3_3-1flDTgHIuogz0ioIUPjC3BE9xbsIdP.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'