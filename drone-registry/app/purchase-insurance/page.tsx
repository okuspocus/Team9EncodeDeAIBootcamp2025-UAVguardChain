// app/purchase-insurance/page.tsx
"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { InsurancePlanCard } from "@/components/insurance-plan-card"
import { WalletConnect } from "@/components/wallet-connect"
import { ethers } from "ethers"; // Import ethers
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
  insurancePlan: z.string({
    required_error: "Please select an insurance plan.",
  }),
  coverageStartDate: z.date({
    required_error: "Coverage start date is required.",
  }),
  coverageDuration: z.string({
    required_error: "Please select a coverage duration.",
  }),
  paymentMethod: z.string({
    required_error: "Please select a payment method.",
  }),
})

export default function PurchaseInsurancePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const { isConnected } = useAccount(); // Get wallet connection state

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      droneName: "",
      droneModel: "",
      serialNumber: "",
      paymentMethod: "crypto",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    console.log(values)

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
            { internalType: "string", name: "insurancePlan", type: "string" },
            { internalType: "date", name: "coverageStartDate", type: "date" },
            { internalType: "string", name: "coverageDuration", type: "string" },
          ],
          name: "purchaseInsurance",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ]

      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      try {
        const tx = await contract.purchaseInsurance(
          values.droneName,
          values.droneModel,
          values.serialNumber,
          values.insurancePlan,
          values.coverageStartDate.toISOString(), // Convert date to string
          values.coverageDuration
        )

        await tx.wait() // Wait for the transaction to be mined
        alert("Insurance purchased successfully!")
      } catch (error) {
        console.error("Error purchasing insurance:", error)
        alert("There was an error purchasing the insurance.")
      } finally {
        setIsSubmitting(false)
      }
    }

    sendToBlockchain()
  }

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    form.setValue("insurancePlan", planId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchase Insurance</h1>
        <p className="text-muted-foreground">Protect your drone with comprehensive insurance coverage</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Drone Details
                </CardTitle>
                <CardDescription>Enter the details of the drone you want to insure</CardDescription>
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
                <CardTitle>Coverage Details</CardTitle>
                <CardDescription>Select your coverage period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="coverageStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Coverage Start Date</FormLabel>
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
                            disabled={(date) => date < new Date()}
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
                  name="coverageDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coverage Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select coverage duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily (24 hours)</SelectItem>
                          <SelectItem value="weekly">Weekly (7 days)</SelectItem>
                          <SelectItem value="monthly">Monthly (30 days)</SelectItem>
                          <SelectItem value="quarterly">Quarterly (90 days)</SelectItem>
                          <SelectItem value="annual">Annual (365 days)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Insurance Plan</CardTitle>
              <CardDescription>Choose the insurance plan that best fits your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="insurancePlan"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-4 md:grid-cols-3">
                      <InsurancePlanCard
                        id="basic"
                        title="Basic Coverage"
                        price="0.005 ETH"
                        description="Essential coverage for recreational flights"
                        features={["Liability coverage up to $10,000", "Accidental damage", "24/7 support"]}
                        selected={selectedPlan === "basic"}
                        onSelect={() => handlePlanSelect("basic")}
                      />

                      <InsurancePlanCard
                        id="standard"
                        title="Standard Coverage"
                        price="0.015 ETH"
                        description="Comprehensive coverage for regular pilots"
                        features={[
                          "Liability coverage up to $50,000",
                          "Accidental damage",
                          "Theft protection",
                          "Weather damage",
                          "24/7 priority support",
                        ]}
                        selected={selectedPlan === "standard"}
                        onSelect={() => handlePlanSelect("standard")}
                        recommended
                      />

                      <InsurancePlanCard
                        id="premium"
                        title="Premium Coverage"
                        price="0.03 ETH"
                        description="Complete protection for professional pilots"
                        features={[
                          "Liability coverage up to $100,000",
                          "Full replacement value",
                          "Theft protection",
                          "Weather damage",
                          "Commercial use coverage",
                          "24/7 VIP support",
                        ]}
                        selected={selectedPlan === "premium"}
                        onSelect={() => handlePlanSelect("premium")}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="crypto" onValueChange={(value) => form.setValue("paymentMethod", value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
                  <TabsTrigger value="card">Credit Card</TabsTrigger>
                </TabsList>
                <TabsContent value="crypto" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Cryptocurrency</FormLabel>
                        <Select onValueChange={(value) => field.onChange("crypto-" + value)} defaultValue="eth">
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cryptocurrency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                            <SelectItem value="usdc">USD Coin (USDC)</SelectItem>
                            <SelectItem value="usdt">Tether (USDT)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Connect your wallet to complete the payment</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <WalletConnect onConnect={() => setWalletConnected(true)} connected={walletConnected} />
                </TabsContent>
                <TabsContent value="card" className="space-y-4 pt-4">
                  <div className="grid gap-4">
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234 5678 9012 3456" />
                      </FormControl>
                    </FormItem>

                    <div className="grid grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/YY" />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel>CVC</FormLabel>
                        <FormControl>
                          <Input placeholder="123" />
                        </FormControl>
                      </FormItem>
                    </div>

                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" />
                      </FormControl>
                    </FormItem>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || (form.watch("paymentMethod").startsWith("crypto") && !walletConnected)}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Processing..." : "Purchase Insurance"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}