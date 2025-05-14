"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ComplianceSuggestions } from "@/components/compliance-suggestions"; 
import { useAccount } from "wagmi"; 
import { flightFormSchema, type FlightFormData } from "@/lib/schemas"; 
import FlightDetailsDialog from "@/components/flight-details-dialog"; // Import the dialog component

// Define the expected structure of the successful validation response result
interface ValidationResult {
    complianceMessages: string[]; 
    dataHash: string;
    ipfsCid: string;
}

export default function RegisterFlightPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [validationResultData, setValidationResultData] = useState<ValidationResult | null>(null); 
    const [validationError, setValidationError] = useState<string | null>(null); 

    const { isConnected } = useAccount(); 

    const form = useForm<FlightFormData>({
        resolver: zodResolver(flightFormSchema), 
        defaultValues: { 
            droneName: "",
            droneModel: "",
            serialNumber: "",
            weight: 0,
            flightDescription: "",
            startTime: "",
            endTime: "",
            flightDate: "",
            dayNightOperation: "day",
            flightAreaCenter: "",
            flightAreaRadius: 0,
            flightAreaMaxHeight: 0,
            flightPurpose: "Recreational" 
        },
    });

    async function onSubmit(values: FlightFormData) {
        setIsSubmitting(true);
        setValidationError(null); 
        setValidationResultData(null); 
        setShowSuggestions(false); 

        console.log("Form Values:", values); 

        if (!isConnected) {
            alert("Please connect your wallet first."); 
            setIsSubmitting(false);
            return;
        }

        try {
            // Step 1: Call validation endpoint
            const validationResponse = await fetch('/api/validate-flight', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(values), 
            });

            const validationData = await validationResponse.json(); 
            console.log("Validation Data:", validationData); 

            if (!validationResponse.ok) {
                const errorMessage = validationData.error || 'Validation failed with server error.';
                setValidationError(errorMessage); 
                throw new Error(errorMessage); 
            }

            // Handle successful validation response structure
            if (validationData.result && Array.isArray(validationData.result.complianceMessages)) {
                setValidationResultData(validationData.result); 
                setShowSuggestions(true); 
                setValidationError(null); 

                // Step 2: If validation is successful, proceed to register flight
                const registrationResponse = await fetch('/api/registerFlight', {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({
                        dataHash: validationData.result.dataHash 
                    }),
                });

                const registrationData = await registrationResponse.json(); 

                if (!registrationResponse.ok) {
                    const errorMessage = registrationData.error || 'Error registering flight';
                    setValidationError(errorMessage); 
                    throw new Error(errorMessage); 
                }

                alert(registrationData.message); 
                form.reset(); 
                setValidationResultData(null); 
                setShowSuggestions(false);

            } else if (validationData.error) {
                setValidationError(validationData.error); 
                throw new Error(validationData.error); 
            } else {
                const errorMessage = "Received unexpected response format from validation API.";
                setValidationError(errorMessage); 
                console.error(errorMessage, validationData);
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error("Error:", error); 
        } finally {
            setIsSubmitting(false); 
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto"> 
            <CardHeader>
                <CardTitle>Register Flight</CardTitle>
                <CardDescription>Register your drone flight details for compliance and insurance purposes</CardDescription>
            </CardHeader>
            <CardContent>
                {validationError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Validation Error</AlertTitle>
                        <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                )}
                <FlightDetailsDialog onSubmit={onSubmit} /> {/* Use the dialog for flight details */}
            </CardContent>
            <CardFooter>
                {/* Additional footer content if needed */}
            </CardFooter>

            {showSuggestions && validationResultData?.complianceMessages && validationResultData.complianceMessages.length > 0 && (
                <ComplianceSuggestions suggestions={validationResultData.complianceMessages} />
            )}
        </Card>
    );
}