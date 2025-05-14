"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import { useAccount } from "wagmi"; 

interface ComplianceSuggestionsProps {
    suggestions: string[]; // Expecting an array of strings
}

export function ComplianceSuggestions({ suggestions }: ComplianceSuggestionsProps) {
    const { isConnected } = useAccount(); 

    return (
        <Alert className="mt-4"> 
            <AlertTitle>AI Compliance Suggestions</AlertTitle> 
            <AlertDescription>
                Based on your flight details, here are some compliance recommendations 
                {isConnected ? (
                    <ul className="list-disc list-inside mt-2"> 
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="mb-1"> 
                                {suggestion} 
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Please connect your wallet to see compliance suggestions.</p> 
                )}
            </AlertDescription>
        </Alert>
    );
}