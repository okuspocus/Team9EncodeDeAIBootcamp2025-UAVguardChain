"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount } from "wagmi"; // Import useAccount from wagmi for wallet connection

// Define the schema for form validation using Zod
const formSchema = z.object({
  droneName: z.string().min(1, {
    message: "Drone name is required.",
  }),
});

export default function BasicRegisterFlightPage() {
  const [isSubmitting, setIsSubmitting] = useState(false); // State to manage submission status
  const { isConnected } = useAccount(); // Get wallet connection state

  // Initialize the form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // Use Zod for validation
    defaultValues: {
      droneName: "", // Default value for the drone name input
    },
  });

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
      // Step 1: Validate flight data
      const validationResponse = await fetch('/api/validate-flight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values), // Send the form values for validation
      });

      const validationData = await validationResponse.json(); // Parse the JSON response

      // Check if the validation response indicates an error
      if (!validationResponse.ok) {
        throw new Error(validationData.error || 'Error validating flight data'); // Throw an error if validation fails
      }

      // Step 2: Proceed to register the flight if validation is successful
      const response = await fetch('/api/registerFlight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      // Type assertion to treat error as an instance of Error
      const errorMessage = (error as Error).message || "An unknown error occurred.";
      alert("There was an error: " + errorMessage); // Alert user of the error
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