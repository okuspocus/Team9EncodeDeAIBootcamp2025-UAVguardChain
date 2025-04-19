// app/register-flight/basic/page.tsx
"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ethers } from "ethers"; // Import ethers
import { useAccount } from "wagmi"; // Import useAccount from wagmi for wallet connection

const formSchema = z.object({
  droneName: z.string().min(1, {
    message: "Drone name is required.",
  }),
})

export default function BasicRegisterFlightPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isConnected, address } = useAccount(); // Get wallet connection state

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      droneName: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    console.log(values) // Log the collected data

    // Check if wallet is connected
    if (!isConnected) {
      alert("Please connect your wallet first.")
      setIsSubmitting(false)
      return
    }

    const sendToBlockchain = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask!")
        setIsSubmitting(false)
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // Get the signer

      // Replace with your smart contract address and ABI
      const contractAddress = "YOUR_CONTRACT_ADDRESS";
      const contractABI = [
        {
          inputs: [
            { internalType: "string", name: "droneName", type: "string" },
          ],
          name: "registerFlight",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      try {
        const tx = await contract.registerFlight(values.droneName);
        await tx.wait(); // Wait for the transaction to be mined
        alert("Flight registered successfully!"); // Success alert
      } catch (error) {
        console.error("Error registering flight:", error); // Log error
        alert("There was an error registering the flight."); // Error alert
      } finally {
        setIsSubmitting(false); // Reset loading state
      }
    }

    sendToBlockchain(); // Call function to send transaction
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Flight Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Input
              placeholder="Drone Name"
              {...form.register("droneName")}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Flight"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}