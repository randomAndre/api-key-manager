"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ApiStatusCard from "@/components/api-balance-card"
import { useLanguage } from "@/lib/i18n/language-context"
import { useState, useEffect } from "react"
import { apiKeyStorage } from "@/lib/storage"
import { Progress } from "@/components/ui/progress"
import { Activity } from "lucide-react"

export default function DashboardPage() {
  const { t } = useLanguage()
  const [activeKeys, setActiveKeys] = useState(0)
  const [apiAvailability, setApiAvailability] = useState(0)

  useEffect(() => {
    const calculateApiStats = () => {
      // Get all API keys
      const keys = apiKeyStorage.getApiKeysByUserId(1)

      // Set the active keys count (total number of keys)
      setActiveKeys(keys.length)

      // Get connection test results from cache
      const cacheJson = localStorage.getItem("api_connection_test_results")
      if (!cacheJson) {
        setApiAvailability(0)
        return
      }

      const cache = JSON.parse(cacheJson)

      // Count available APIs (status 200-299)
      let availableCount = 0
      let totalTestedCount = 0

      keys.forEach((key) => {
        // Skip custom APIs for availability calculation
        if (key.provider === "Custom") return

        const testResult = cache[key.id]
        if (testResult) {
          totalTestedCount++
          if (testResult.status >= 200 && testResult.status < 300) {
            availableCount++
          }
        }
      })

      // Calculate availability percentage
      const availability = totalTestedCount > 0 ? Math.round((availableCount / totalTestedCount) * 100) : 0

      setApiAvailability(availability)
    }

    calculateApiStats()
  }, [])

  // Add an event listener to update stats when API statuses are refreshed
  useEffect(() => {
    const handleApiStatusUpdate = () => {
      // Recalculate API stats when statuses are updated
      const calculateApiStats = () => {
        // Get all API keys
        const keys = apiKeyStorage.getApiKeysByUserId(1)

        // Set the active keys count (total number of keys)
        setActiveKeys(keys.length)

        // Get connection test results from cache
        const cacheJson = localStorage.getItem("api_connection_test_results")
        if (!cacheJson) {
          setApiAvailability(0)
          return
        }

        const cache = JSON.parse(cacheJson)

        // Count available APIs (status 200-299)
        let availableCount = 0
        let totalTestedCount = 0

        keys.forEach((key) => {
          // Skip custom APIs for availability calculation
          if (key.provider === "Custom") return

          const testResult = cache[key.id]
          if (testResult) {
            totalTestedCount++
            if (testResult.status >= 200 && testResult.status < 300) {
              availableCount++
            }
          }
        })

        // Calculate availability percentage
        const availability = totalTestedCount > 0 ? Math.round((availableCount / totalTestedCount) * 100) : 0

        setApiAvailability(availability)
      }

      calculateApiStats()
    }

    // Add event listener for API status updates
    window.addEventListener("api-status-updated", handleApiStatusUpdate)

    // Clean up event listener
    return () => {
      window.removeEventListener("api-status-updated", handleApiStatusUpdate)
    }
  }, [])

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold mb-6">{t("dashboard.title")}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.activeKeys")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeKeys}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.comparedToLastMonth")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.encryptedKeys")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.allKeysEncrypted")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.apiAvailability")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiAvailability}%</div>
            <div className="mt-2">
              <Progress value={apiAvailability} className="h-1.5" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {apiAvailability >= 90
                ? t("dashboard.apiAvailabilityNormal")
                : apiAvailability >= 70
                  ? t("dashboard.apiAvailabilityDelayed")
                  : t("dashboard.apiAvailabilityIssues")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API状态卡片 */}
      <div className="mb-6">
        <ApiStatusCard />
      </div>
    </div>
  )
}

