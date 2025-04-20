"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ethers } from "ethers"; // Import ethers for blockchain interaction
import { useAccount } from "wagmi"; // Import useAccount from wagmi for wallet connection

// Define the schema for form validation using Zod
const formSchema = z.object({
  droneName: z.string().min(1, {
    message: "Drone name is required.",
  }),
})

export default function BasicRegisterFlightPage() {
  const [isSubmitting, setIsSubmitting] = useState(false) // State to manage submission status
  const { isConnected, address } = useAccount(); // Get wallet connection state

  // Initialize the form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // Use Zod for validation
    defaultValues: {
      droneName: "", // Default value for the drone name input
    },
  })

  // Function to handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true); // Set submitting state to true
    console.log(values); // Log the collected data for debugging
  
    // Check if wallet is connected before proceeding
    if (!isConnected) {
      alert("Please connect your wallet first."); // Alert user if wallet is not connected
      setIsSubmitting(false); // Reset submitting state
      return;
    }
  
    try {
      // Make a POST request to the API route to register the flight
      const response = await fetch('/api/registerFlight', {
        method: 'POST', // Specify the request method
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
        },
        body: JSON.stringify(values), // Send the form values as JSON
      });
  
      const data = await response.json(); // Parse the JSON response
  
      // Check if the response indicates an error
      if (!response.ok) {
        throw new Error(data.error || 'Error registering flight'); // Throw an error if the response is not OK
      }
  
      alert(data.message); // Show success alert with the message from the response
    } catch (error) {
      console.error("Error:", error); // Log any errors that occur
      alert("There was an error registering the flight."); // Alert user of the error
    } finally {
      setIsSubmitting(false); // Reset submitting state after the operation
    }
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
              {...form.register("droneName")} // Register the input with react-hook-form
            />
            <Button type="submit" disabled={isSubmitting}> {/* Disable button while submitting */}
              {isSubmitting ? "Registering..." : "Register Flight"} {/* Show loading text if submitting */}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}