"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DrillIcon as Drone, MapPin, Clock, FileText, Calendar, Download } from "lucide-react"

interface FlightDetailsDialogProps {
  flight: {
    id: string
    droneName: string
    date: string
    location: string
    duration: string
    purpose: string
    status: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FlightDetailsDialog({ flight, open, onOpenChange }: FlightDetailsDialogProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "scheduled":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            Scheduled
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Drone className="h-5 w-5" />
            Flight Details
          </DialogTitle>
          <DialogDescription>Detailed information about flight {flight.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{flight.droneName}</h3>
            {getStatusBadge(flight.status)}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </p>
              <p className="font-medium">{flight.date}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration
              </p>
              <p className="font-medium">{flight.duration}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </p>
              <p className="font-medium">{flight.location}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Purpose
              </p>
              <p className="font-medium">{flight.purpose}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Flight Path</h4>
            <div className="bg-muted rounded-md h-[150px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Flight path visualization</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Additional Information</h4>
            <ul className="text-sm space-y-1">
              <li>
                <span className="text-muted-foreground">Pilot:</span> John Doe
              </li>
              <li>
                <span className="text-muted-foreground">Weather:</span> Clear, 15°C, Wind 5mph
              </li>
              <li>
                <span className="text-muted-foreground">Max Altitude:</span> 120m
              </li>
              <li>
                <span className="text-muted-foreground">Insurance:</span> Active (Policy #INS-2025-0042)
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Log
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
