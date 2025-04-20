// app/file-claim/page.tsx
"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, FileText, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FileUploader } from "@/components/file-uploader"
import { ClaimStatusTracker } from "@/components/claim-status-tracker"
import { ethers } from "ethers"; // Import ethers
import { WalletConnect } from "@/components/wallet-connect"; // Import WalletConnect
import { useAccount } from "wagmi"; // Import useAccount from wagmi for wallet connection

const formSchema = z.object({
  droneName: z.string().min(2, {
    message: "Drone name must be at least 2 characters.",
  }),
  droneModel: z.string().min(2, {
    message: "Drone model must be at least 2 characters.",
  }),
  serialNumber: z.string().min(5, {
    message: "Serial number must be at least 5 characters.",
  }),
  incidentDate: z.date({
    required_error: "Incident date is required.",
  }),
  incidentType: z.string({
    required_error: "Please select an incident type.",
  }),
  incidentDescription: z.string().min(20, {
    message: "Incident description must be at least 20 characters.",
  }),
  damageDescription: z.string().min(20, {
    message: "Damage description must be at least 20 characters.",
  }),
  claimAmount: z.string().min(1, {
    message: "Claim amount is required.",
  }),
})

export default function FileClaimPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filesUploaded, setFilesUploaded] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false); // State for wallet connection
  const { isConnected } = useAccount(); // Get wallet connection state

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      droneName: "",
      droneModel: "",
      serialNumber: "",
      incidentDescription: "",
      damageDescription: "",
      claimAmount: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    console.log(values)

    // Check if wallet is connected
    if (!walletConnected) {
      alert("Please connect your wallet first.")
      setIsSubmitting(false)
      return
    }

    const sendToBlockchain = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask!")
        setIsSubmitting(false)
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner() // Get the signer

      // Replace with your smart contract address and ABI
      const contractAddress = "YOUR_CONTRACT_ADDRESS"
      const contractABI = [
        {
          inputs: [
            { internalType: "string", name: "droneName", type: "string" },
            { internalType: "string", name: "droneModel", type: "string" },
            { internalType: "string", name: "serialNumber", type: "string" },
            { internalType: "date", name: "incidentDate", type: "date" },
            { internalType: "string", name: "incidentType", type: "string" },
            { internalType: "string", name: "incidentDescription", type: "string" },
            { internalType: "string", name: "damageDescription", type: "string" },
            { internalType: "string", name: "claimAmount", type: "string" },
          ],
          name: "fileClaim",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ]

      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      try {
        const tx = await contract.fileClaim(
          values.droneName,
          values.droneModel,
          values.serialNumber,
          values.incidentDate.toISOString(), // Format date correctly
          values.incidentType,
          values.incidentDescription,
          values.damageDescription,
          values.claimAmount
        )

        await tx.wait() // Wait for the transaction to be mined
        alert("Claim submitted successfully!") // Success alert
      } catch (error) {
        console.error("Error submitting claim:", error) // Log error
        alert("There was an error submitting the claim.") // Error alert
      } finally {
        setIsSubmitting(false) // Reset loading state
      }
    }

    sendToBlockchain() // Call function to send transaction
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">File a Claim</h1>
        <p className="text-muted-foreground">Submit an insurance claim for your drone incident</p>
      </div>

      <WalletConnect onConnect={() => setWalletConnected(true)} connected={walletConnected} /> {/* WalletConnect component */}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Drone Information
                  </CardTitle>
                  <CardDescription>Enter the details of the drone involved in the incident</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="droneName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drone Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Drone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="droneModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drone Model</FormLabel>
                        <FormControl>
                          <Input placeholder="DJI Mavic 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input placeholder="SN12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Incident Details</CardTitle>
                  <CardDescription>Provide information about the incident</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="incidentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Incident Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incidentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select incident type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="crash">Crash/Collision</SelectItem>
                            <SelectItem value="water">Water Damage</SelectItem>
                            <SelectItem value="theft">Theft/Loss</SelectItem>
                            <SelectItem value="malfunction">Malfunction</SelectItem>
                            <SelectItem value="weather">Weather Damage</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incidentDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what happened during the incident"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include details about location, weather conditions, and circumstances
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="damageDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Damage Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the damage to your drone"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include details about specific parts damaged and the extent of damage
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="claimAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Claim Amount (ETH)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.05" type="number" step="0.001" {...field} />
                        </FormControl>
                        <FormDescription>Enter the amount you are claiming in ETH</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Evidence Upload
                  </CardTitle>
                  <CardDescription>Upload photos, videos, or documents as evidence for your claim</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploader onUploadComplete={() => setFilesUploaded(true)} />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting || !filesUploaded}>
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Submit Claim"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>

        <div className="space-y-6">
          <ClaimStatusTracker />

          <Card>
            <CardHeader>
              <CardTitle>Claim Process Information</CardTitle>
              <CardDescription>How the claim process works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Submit Your Claim</h4>
                <p className="text-sm text-muted-foreground">
                  Fill out the claim form with all required information and upload supporting evidence.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">2. Claim Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Our smart contract will verify your claim against your insurance policy and coverage.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">3. Assessment</h4>
                <p className="text-sm text-muted-foreground">
                  If needed, an adjuster will review your claim and evidence to determine the payout amount.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">4. Payout</h4>
                <p className="text-sm text-muted-foreground">
                  Once approved, the claim amount will be automatically transferred to your connected wallet.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Evidence</CardTitle>
              <CardDescription>Documentation needed for your claim</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                <li>
                  <span className="font-medium">Photos of damage:</span> Clear images showing the extent of damage from
                  multiple angles
                </li>
                <li>
                  <span className="font-medium">Flight logs:</span> Export your flight logs from the drone's app
                </li>
                <li>
                  <span className="font-medium">Video evidence:</span> If available, footage of the incident or its
                  aftermath
                </li>
                <li>
                  <span className="font-medium">Purchase receipts:</span> For replacement parts or repair estimates
                </li>
                <li>
                  <span className="font-medium">Police report:</span> Required for theft claims
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}