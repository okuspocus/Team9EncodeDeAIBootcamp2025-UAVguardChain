"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useAccount } from "wagmi"; // Import useAccount from wagmi

export function ComplianceSuggestions() {
  const [loading, setLoading] = useState(true)
  const { isConnected, address } = useAccount(); // Get wallet connection state

  useEffect(() => {
    // Simulate AI suggestions loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="bg-muted h-6 w-3/4 rounded"></CardTitle>
          <CardDescription className="bg-muted h-4 w-1/2 rounded"></CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="bg-muted h-4 w-full rounded"></div>
          <div className="bg-muted h-4 w-full rounded"></div>
          <div className="bg-muted h-4 w-3/4 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          AI Compliance Suggestions
        </CardTitle>
        <CardDescription>Based on your flight details, here are some compliance recommendations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Restricted Airspace Alert
              </h4>
              <p className="text-sm text-muted-foreground">
                Your flight location may be near a restricted airspace. Consider checking the local airspace restrictions
                using the B4UFLY app or a similar service before flying.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Documentation Recommendation
              </h4>
              <p className="text-sm text-muted-foreground">
                For commercial flights, remember to carry your Remote Pilot Certificate and have your drone registration
                visible on the aircraft.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Weather Considerations
              </h4>
              <p className="text-sm text-muted-foreground">
                Based on your flight date, check weather conditions before flying. Avoid flying in winds exceeding 20mph or
                during precipitation.
              </p>
            </div>
          </>
        ) : (
          <p className="text-red-500">Please connect your wallet to see compliance suggestions.</p>
        )}
      </CardContent>
    </Card>
  )
}