"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, DrillIcon as Drone, Loader2, MapPin } from "lucide-react";
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

// Updated Zod Schema
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
    return !isNaN(parsedDate.getTime());
  }, { message: "Flight date must be a valid date." }),
  startTime: z.string().min(1, { message: "Start time is required." }),
  endTime: z.string().min(1, { message: "End time is required." }),
  dayNightOperation: z.string().min(1, { message: "Operation time is required." }),
  flightAreaCenter: z.string().min(5, { message: "Center point is required." }),
  flightAreaRadius: z.string().min(1, { message: "Radius is required." }),
  flightAreaMaxHeight: z.string().min(1, { message: "Maximum height is required." }),
});

// Define the props for the FlightDetailsDialog component
interface FlightDetailsDialogProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
}

export default function FlightDetailsDialog({ onSubmit }: FlightDetailsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      flightDate: "",
      dayNightOperation: "day", // Default to day operation
      flightAreaCenter: "",
      flightAreaRadius: "",
      flightAreaMaxHeight: "400", // Default to 400 feet
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    await onSubmit(values); // Call the onSubmit function passed as a prop
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                    <FormLabel>Weight (g)</FormLabel>
                    <FormControl>
                      <Input placeholder="900" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flight Plan</CardTitle>
            <CardDescription>Enter the details of your planned flight</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="survey">Survey/Mapping</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="photography">Photography/Videography</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date.toISOString().split('T')[0]);
                            } else {
                              field.onChange("");
                            }
                          }}
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

            {/* New Day/Night Operation Field */}
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

            {/* New Area-Based Location Fields */}
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
  );
}