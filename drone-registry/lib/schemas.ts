import { z } from "zod";

// Shared form schema for flight registration
export const flightFormSchema = z.object({
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

// Export type for TypeScript usage
export type FlightFormData = z.infer<typeof flightFormSchema>;