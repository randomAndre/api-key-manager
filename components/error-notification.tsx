"use client"

import { useEffect, useState } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorEvent extends CustomEvent {
  detail: {
    title: string
    message: string
  }
}

export default function ErrorNotification() {
  const [error, setError] = useState<{ title: string; message: string } | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleError = (event: Event) => {
      const errorEvent = event as ErrorEvent
      setError(errorEvent.detail)
      setVisible(true)

      // 自动5秒后隐藏
      setTimeout(() => {
        setVisible(false)
      }, 5000)
    }

    window.addEventListener("app-error", handleError)

    return () => {
      window.removeEventListener("app-error", handleError)
    }
  }, [])

  if (!error || !visible) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-96 max-w-full">
      <Alert variant="destructive" className="shadow-lg border-red-400">
        <div className="flex justify-between items-start">
          <div>
            <AlertTitle>{error.title}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-1 text-red-800"
            onClick={() => setVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  )
}

