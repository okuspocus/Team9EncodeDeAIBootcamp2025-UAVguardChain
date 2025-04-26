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
  const [formattedSuggestions, setFormattedSuggestions] = useState<string[]>([]); // State for formatted suggestions

  useEffect(() => {
    // Process the suggestions string to create an array of formatted suggestions
    const processSuggestions = (suggestions: string) => {
      // Split the suggestions by newlines or numbered patterns
      const splitSuggestions = suggestions.split(/\n|(?=\d+\.\s)/).map(s => s.trim()).filter(Boolean);
      setFormattedSuggestions(splitSuggestions);
    };

    processSuggestions(suggestions); // Call the processing function
  }, [suggestions]);

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
            <ul>
              {formattedSuggestions.map((suggestion, index) => (
                <li key={index} className="mb-2">
                  {/* Render each suggestion, applying any necessary formatting */}
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-red-500">Please connect your wallet to see compliance suggestions.</p>
        )}
      </CardContent>
    </Card>
  );
}