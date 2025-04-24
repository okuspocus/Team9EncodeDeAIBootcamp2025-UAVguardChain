// components/compliance-suggestions.tsx

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useAccount } from "wagmi"; // Import useAccount from wagmi

interface ComplianceSuggestionsProps {
  suggestions: string; // Expecting suggestions to be a string
}

export function ComplianceSuggestions({ suggestions }: ComplianceSuggestionsProps) {
  const { isConnected } = useAccount(); // Get wallet connection state

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
          <div className="text-sm text-muted-foreground">
            {suggestions} {/* Display the suggestions */}
          </div>
        ) : (
          <p className="text-red-500">Please connect your wallet to see compliance suggestions.</p>
        )}
      </CardContent>
    </Card>
  );
}