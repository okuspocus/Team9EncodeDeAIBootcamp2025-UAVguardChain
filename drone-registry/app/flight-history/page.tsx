"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DrillIcon as Drone, Search, Filter, Download, Eye } from "lucide-react"
import { FlightDetailsDialog } from "@/components/flight-details-dialog"

// Sample flight data
const flightData = [
  {
    id: "FL-001",
    droneName: "DJI Mavic 3",
    date: "Apr 12, 2025",
    location: "Downtown Area",
    duration: "45 min",
    purpose: "Survey",
    status: "Completed",
  },
  {
    id: "FL-002",
    droneName: "Autel Evo II",
    date: "Apr 10, 2025",
    location: "Construction Site",
    duration: "30 min",
    purpose: "Inspection",
    status: "Completed",
  },
  {
    id: "FL-003",
    droneName: "DJI Mini 3",
    date: "Apr 8, 2025",
    location: "City Park",
    duration: "20 min",
    purpose: "Recreational",
    status: "Completed",
  },
  {
    id: "FL-004",
    droneName: "Skydio 2+",
    date: "Apr 5, 2025",
    location: "Residential Area",
    duration: "15 min",
    purpose: "Photography",
    status: "Cancelled",
  },
  {
    id: "FL-005",
    droneName: "DJI Mavic 3",
    date: "Apr 15, 2025",
    location: "Beach Area",
    duration: "60 min",
    purpose: "Videography",
    status: "Scheduled",
  },
  {
    id: "FL-006",
    droneName: "Autel Evo II",
    date: "Apr 14, 2025",
    location: "Industrial Zone",
    duration: "40 min",
    purpose: "Inspection",
    status: "Scheduled",
  },
  {
    id: "FL-007",
    droneName: "DJI Mini 3",
    date: "Mar 30, 2025",
    location: "Mountain Trail",
    duration: "25 min",
    purpose: "Recreational",
    status: "Completed",
  },
  {
    id: "FL-008",
    droneName: "Skydio 2+",
    date: "Mar 25, 2025",
    location: "River Valley",
    duration: "35 min",
    purpose: "Survey",
    status: "Completed",
  },
]

export default function FlightHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedFlight, setSelectedFlight] = useState<(typeof flightData)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredFlights = flightData.filter((flight) => {
    const matchesSearch =
      flight.droneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || flight.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (flight: (typeof flightData)[0]) => {
    setSelectedFlight(flight)
    setIsDialogOpen(true)
  }

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Flight History</h1>
        <p className="text-muted-foreground">View and manage your past and upcoming drone flights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Drone className="h-5 w-5" />
            Flight Records
          </CardTitle>
          <CardDescription>A comprehensive history of all your registered drone flights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search flights..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select defaultValue="all" onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flight ID</TableHead>
                    <TableHead>Drone</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead className="hidden md:table-cell">Duration</TableHead>
                    <TableHead className="hidden md:table-cell">Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFlights.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No flights found matching your search criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFlights.map((flight) => (
                      <TableRow key={flight.id}>
                        <TableCell className="font-medium">{flight.id}</TableCell>
                        <TableCell>{flight.droneName}</TableCell>
                        <TableCell>{flight.date}</TableCell>
                        <TableCell className="hidden md:table-cell">{flight.location}</TableCell>
                        <TableCell className="hidden md:table-cell">{flight.duration}</TableCell>
                        <TableCell className="hidden md:table-cell">{flight.purpose}</TableCell>
                        <TableCell>{getStatusBadge(flight.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(flight)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedFlight && (
        <FlightDetailsDialog flight={selectedFlight} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      )}
    </div>
  )
}
