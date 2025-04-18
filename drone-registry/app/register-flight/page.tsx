"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, DrillIcon as Drone, Loader2, MapPin, FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { ComplianceSuggestions } from "@/components/compliance-suggestions"
import { ethers } from "ethers"; // Import ethers

// ORIGINAL CODE:
// const formSchema = z.object({
//   droneName: z.string().min(2, {
//     message: "Drone name must be at least 2 characters.",
//   }),
//   droneModel: z.string().min(2, {
//     message: "Drone model must be at least 2 characters.",
//   }),
//   droneType: z.string({
//     required_error: "Please select a drone type.",
//   }),
//   serialNumber: z.string().min(5, {
//     message: "Serial number must be at least 5 characters.",
//   }),
//   weight: z.string().min(1, {
//     message: "Weight is required.",
//   }),
//   flightPurpose: z.string({
//     required_error: "Please select a flight purpose.",
//   }),
//   flightDescription: z.string().min(10, {
//     message: "Flight description must be at least 10 characters.",
//   }),
//   flightDate: z.date({
//     required_error: "Flight date is required.",
//   }),
//   startTime: z.string().min(1, {
//     message: "Start time is required.",
//   }),
//   endTime: z.string().min(1, {
//     message: "End time is required.",
//   }),
//   location: z.string().min(5, {
//     message: "Location must be at least 5 characters.",
//   }),
//   altitude: z.string().min(1, {
//     message: "Maximum altitude is required.",
//   }),
// })

// MODIFIED CODE WITH AREA-BASED LOCATION AND REFINED SCHEMA:
const formSchema = z.object({
  // Drone Information - Keeping original fields with slight modifications
  droneName: z.string().min(2, {
    message: "Drone name must be at least 2 characters.",
  }),
  droneModel: z.string().min(2, {
    message: "Drone model must be at least 2 characters.",
  }),
  droneType: z.string({
    required_error: "Please select a drone type.",
  }),
  serialNumber: z.string().min(5, {
    message: "Serial number must be at least 5 characters.",
  }),
  weight: z.string().min(1, {
    message: "Weight in kilograms is required.",
  }),
  
  // Flight Information - Keeping original fields
  flightPurpose: z.string({
    required_error: "Please select a flight purpose.",
  }),
  flightDescription: z.string().min(10, {
    message: "Flight description must be at least 10 characters.",
  }),
  flightDate: z.date({
    required_error: "Flight date is required.",
  }),
  startTime: z.string().min(1, {
    message: "Start time is required.",
  }),
  endTime: z.string().min(1, {
    message: "End time is required.",
  }),
  
  // New field for day/night operation
  dayNightOperation: z.string({
    required_error: "Please specify day or night operation.",
  }),
  
  // Replacing location and altitude with area-based approach
  flightAreaCenter: z.string().min(5, {
    message: "Center coordinates must be at least 5 characters.",
  }),
  flightAreaRadius: z.string().min(1, {
    message: "Flight area radius in meters is required.",
  }),
  flightAreaMaxHeight: z.string().min(1, {
    message: "Maximum flight height in feet is required.",
  }),
})

export default function RegisterFlightPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // ORIGINAL CODE
  // const form = useForm<z.infer<typeof formSchema>>({
  //   resolver: zodResolver(formSchema),
  //   defaultValues: {
  //     droneName: "",
  //     droneModel: "",
  //     serialNumber: "",
  //     weight: "",
  //     flightDescription: "",
  //     startTime: "",
  //     endTime: "",
  //     location: "",
  //     altitude: "",
  //   },
  // })

  // MODIFIED CODE WITH AREA-BASED LOCATION AND REFINED SCHEMA:
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
      dayNightOperation: "day", // Default to day operation
      flightAreaCenter: "",
      flightAreaRadius: "",
      flightAreaMaxHeight: "400", // Default to 400 feet (standard maximum)
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log(values); // Log the collected data
  
    const sendToBlockchain = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        setIsSubmitting(false);
        return;
      }
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // Get the signer
  
     // Replace with your smart contract address
    const contractAddress = "YOUR_CONTRACT_ADDRESS";

    // Define the contract ABI
    const contractABI: Array<{ 
      inputs: any[]; 
      name: string; 
      outputs: any[]; 
      stateMutability: string; 
      type: string; 
    }> = [
      // Your contract ABI here
      {
        inputs: [
          { internalType: "string", name: "droneName", type: "string" },
          { internalType: "string", name: "droneModel", type: "string" },
          { internalType: "string", name: "serialNumber", type: "string" },
          { internalType: "string", name: "weight", type: "string" },
          { internalType: "string", name: "flightPurpose", type: "string" },
          { internalType: "string", name: "flightDescription", type: "string" },
          { internalType: "date", name: "flightDate", type: "date" },
          { internalType: "string", name: "startTime", type: "string" },
          { internalType: "string", name: "endTime", type: "string" },
          { internalType: "string", name: "location", type: "string" },
          { internalType: "string", name: "altitude", type: "string" },
        ],
        name: "registerFlight",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      // Add other functions/events as needed
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
      try {
        const tx = await contract.registerFlight(
          values.droneName,
          values.droneModel,
          values.serialNumber,
          values.weight,
          values.flightPurpose,
          values.flightDescription,
          values.flightDate,
          values.startTime,
          values.endTime,
          values.location,
          values.altitude
        );
  
        await tx.wait(); // Wait for the transaction to be mined
        alert("Flight registered successfully!");
      } catch (error) {
        console.error("Error registering flight:", error);
        alert("There was an error registering the flight.");
      } finally {
        setIsSubmitting(false);
      }
    };
  
    sendToBlockchain();
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* ORIGINAL CODE  - Drone Specifications Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Drone className="h-5 w-5" />
                    Drone Specifications
                  </CardTitle>
                  <CardDescription>Enter the details of your drone</CardDescription>
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
                    name="droneType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drone Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select drone type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="quadcopter">Quadcopter</SelectItem>
                            <SelectItem value="hexacopter">Hexacopter</SelectItem>
                            <SelectItem value="octocopter">Octocopter</SelectItem>
                            <SelectItem value="fixed-wing">Fixed Wing</SelectItem>
                            <SelectItem value="hybrid">Hybrid VTOL</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
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

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input placeholder="0.9" type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ORIGINAL CODE - Flight Plan Card (First Part) */}
              <Card>
                <CardHeader>
                  <CardTitle>Flight Plan</CardTitle>
                  <CardDescription>Enter the details of your planned flight</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* MODIFIED CODE - Updated Flight Purpose with refined legal categories */}
                  <FormField
                    control={form.control}
                    name="flightPurpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flight Purpose</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select flight purpose" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="recreational">Recreational</SelectItem>
                            <SelectItem value="commercial-photography">Commercial - Photography/Videography</SelectItem>
                            <SelectItem value="commercial-inspection">Commercial - Inspection</SelectItem>
                            <SelectItem value="commercial-survey">Commercial - Survey/Mapping</SelectItem>
                            <SelectItem value="commercial-agricultural">Commercial - Agricultural</SelectItem>
                            <SelectItem value="commercial-safety">Commercial - Public Safety</SelectItem>
                            <SelectItem value="commercial-delivery">Commercial - Delivery</SelectItem>
                            <SelectItem value="commercial-other">Commercial - Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Purpose affects insurance requirements</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ORIGINAL CODE  - Flight Description */}
                  <FormField
                    control={form.control}
                    name="flightDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flight Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your flight plan and objectives"
                            className="min-h-[100px]"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              if (e.target.value.length > 20 && !showSuggestions) {
                                setShowSuggestions(true)
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ORIGINAL CODE  - Flight Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="flightDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Flight Date</FormLabel>
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

                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* NEW CODE - Day/Night Operation */}
                  <FormField
                    control={form.control}
                    name="dayNightOperation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operation Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select operation time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="day">Day Operation</SelectItem>
                            <SelectItem value="night">Night Operation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Night operations have additional requirements</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* REPLACED CODE - Area-Based Location instead of single location field */}
                  {/* ORIGINAL CODE :
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Address or coordinates" {...field} />
                        </FormControl>
                        <FormDescription>Enter an address or GPS coordinates</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="altitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Altitude (m)</FormLabel>
                        <FormControl>
                          <Input placeholder="120" type="number" {...field} />
                        </FormControl>
                        <FormDescription>Maximum legal altitude is typically 120m (400ft)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  {/* NEW CODE - Area-Based Location Fields */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Flight Area
                    </h4>
                    
                    <FormField
                      control={form.control}
                      name="flightAreaCenter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Center Point</FormLabel>
                          <FormControl>
                            <Input placeholder="Latitude, Longitude (e.g., 51.5074, -0.1278)" {...field} />
                          </FormControl>
                          <FormDescription>Enter the center coordinates of your flight area</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="flightAreaRadius"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Radius (meters)</FormLabel>
                            <FormControl>
                              <Input placeholder="500" type="number" {...field} />
                            </FormControl>
                            <FormDescription>Maximum distance from center point</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="flightAreaMaxHeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Height (feet)</FormLabel>
                            <FormControl>
                              <Input placeholder="400" type="number" {...field} />
                            </FormControl>
                            <FormDescription>Maximum legal altitude is typically 400ft</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Register Flight"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>

        <div className="space-y-6">
          {showSuggestions && <ComplianceSuggestions />}

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
  )
}

