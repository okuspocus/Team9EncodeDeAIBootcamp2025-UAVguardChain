"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import FlightDetailsDialog from "@/components/flight-details-dialog";
import { ComplianceSuggestions } from "@/components/compliance-suggestions";
import { useAccount } from "wagmi";
import { flightFormSchema, type FlightFormData } from "@/lib/schemas"; // Import shared schema

export default function RegisterFlightPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationSuggestions, setValidationSuggestions] = useState<string | null>(null);
  const { isConnected } = useAccount();

  const form = useForm<FlightFormData>({
    resolver: zodResolver(flightFormSchema),
    defaultValues: {
      droneName: "",
      droneModel: "",
      serialNumber: "",
      weight: "",
      flightDescription: "",
      startTime: "",
      endTime: "",
      flightDate: "",
      dayNightOperation: "day",
      flightAreaCenter: "",
      flightAreaRadius: "",
      flightAreaMaxHeight: "400",
    },
  });

  async function onSubmit(values: FlightFormData) {
    setIsSubmitting(true);
    console.log("Form Values:", values);

    if (!isConnected) {
      alert("Please connect your wallet first.");
      setIsSubmitting(false);
      return;
    }

    try {
      const validationResponse = await fetch('/api/validate-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const validationData = await validationResponse.json();

      console.log("Validation Data:", validationData);
      if (!validationResponse.ok) {
        throw new Error(validationData.error || 'Validation failed');
      }

      if (validationData.result) {
        setValidationSuggestions(validationData.result);
        setShowSuggestions(true);
      } else {
        setValidationSuggestions(null);
        setShowSuggestions(false);
      }

      const response = await fetch('/api/registerFlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error registering flight');
      }

      alert(data.message);
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error processing your request.");
    } finally {
      setIsSubmitting(false);
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
          <FlightDetailsDialog onSubmit={onSubmit} />
        </div>

        <div className="space-y-6">
          {showSuggestions && validationSuggestions && (
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