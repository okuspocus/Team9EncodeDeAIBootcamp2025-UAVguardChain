"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, DrillIcon as Drone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import FlightDetailsDialog from "@/components/flight-details-dialog"; // Import flight-details-dialog component
import { ComplianceSuggestions } from "@/components/compliance-suggestions"; // Import ComplianceSuggestions component
import { useAccount } from "wagmi"; // Import useAccount from wagmi for wallet connection

// Define the schema for form validation using Zod
const formSchema = z.object({
  droneName: z.string().min(2, { message: "Drone name must be at least 2 characters." }),
  droneModel: z.string().min(2, { message: "Drone model must be at least 2 characters." }),
  droneType: z.string({ required_error: "Please select a drone type." }),
  serialNumber: z.string().min(5, { message: "Serial number must be at least 5 characters." }),
  weight: z.string().min(1, { message: "Weight is required." }),
  flightPurpose: z.string({ required_error: "Please select a flight purpose." }),
  flightDescription: z.string().min(10, { message: "Flight description must be at least 10 characters." }),
  flightDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()); // Ensure it's a valid date
  }, { message: "Flight date must be a valid date." }),
  startTime: z.string().min(1, { message: "Start time is required." }),
  endTime: z.string().min(1, { message: "End time is required." }),
});

export default function RegisterFlightPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationSuggestions, setValidationSuggestions] = useState<string | null>(null); // State for validation suggestions
  const { isConnected } = useAccount(); // Get wallet connection state

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      droneName: "",
      droneModel: "",
      serialNumber: "",
      weight: "",
      flightDescription: "",
      startTime: "",
      endTime: "",
      flightDate: "", // Ensure flightDate is included
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log("Form Values:", values); // Log the collected data

    // Check if wallet is connected
    if (!isConnected) {
      alert("Please connect your wallet first.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Validate flight data using the validation API
      const validationResponse = await fetch('/api/validate-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const validationData = await validationResponse.json();

      // Check if validation returned any errors
      console.log("Validation Data:", validationData); // Log validation response
      if (!validationResponse.ok) {
        throw new Error(validationData.error || 'Validation failed');
      }

      // Set validation suggestions if provided
      if (validationData.result) {
        setValidationSuggestions(validationData.result); // Assuming result contains suggestions
        setShowSuggestions(true);
      } else {
        setValidationSuggestions(null);
        setShowSuggestions(false);
      }

      // Proceed to register the flight if validation is successful
      const response = await fetch('/api/registerFlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error registering flight');
      }

      alert(data.message); // Show success alert
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error processing your request."); // Alert user of the error
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Register Flight</h1>
        <p className="text-muted-foreground">
          Register your drone flight details for compliance and insurance purposes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <FlightDetailsDialog onSubmit={onSubmit} /> {/* Use the FlightDetailsDialog component */}
        </div>

        <div className="space-y-6">
          {showSuggestions && validationSuggestions && ( // Conditionally render suggestions
            <ComplianceSuggestions suggestions={validationSuggestions} />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Registration Requirements</CardTitle>
              <CardDescription>Important information about flight registration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Registration is required for drones over 250g</AlertTitle>
                <AlertDescription>
                  All drones weighing more than 250g must be registered with aviation authorities before flight.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Required Documents</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Proof of drone ownership</li>
                  <li>Pilot certification (for drones over 250g)</li>
                  <li>Insurance documentation (recommended)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Flight Restrictions</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Maximum altitude of 400 feet (120 meters) above ground level</li>
                  <li>Minimum distance of 5 miles from airports without authorization</li>
                  <li>No flying over crowds or populated areas without special permission</li>
                  <li>Always maintain visual line of sight with your drone</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}