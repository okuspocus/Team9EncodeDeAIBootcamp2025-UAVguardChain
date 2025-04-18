// components/wallet-connect.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, Loader2, CheckCircle2 } from "lucide-react"
import { ethers } from "ethers"

interface WalletConnectProps {
  onConnect: (account: string) => void; // Ensure this accepts a string argument
  connected: boolean;
}

export function WalletConnect({ onConnect, connected }: WalletConnectProps) {
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum) // Correct provider initialization
      try {
        const accounts = await provider.send("eth_requestAccounts", [])
        onConnect(accounts[0]); // Pass the connected account to the parent
      } catch (error) {
        console.error("Error connecting to wallet:", error) // Error handling
      }
    } else {
      alert("Please install MetaMask!")
    }
    setConnecting(false)
  }

  if (connected) {
    return (
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">Wallet Connected</p>
              <p className="text-sm text-muted-foreground">Connected Account</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
        <div className="bg-primary/10 rounded-full p-4">
          <Wallet className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="font-medium text-lg">Connect Your Wallet</h3>
        </div>
        <Button className="w-full mt-2" onClick={handleConnect} disabled={connecting}>
          {connecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}