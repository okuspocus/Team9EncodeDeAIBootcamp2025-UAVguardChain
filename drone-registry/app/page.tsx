import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DrillIcon as Drone, Shield, FileText, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { StatusCard } from "@/components/status-card"
import { RecentFlights } from "@/components/recent-flights"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Manage your drone flights, insurance, and claims</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Active Flights"
          value="2"
          description="Currently registered flights"
          icon={Drone}
          trend="+1 from last week"
        />
        <StatusCard
          title="Insurance Coverage"
          value="3"
          description="Drones with active insurance"
          icon={Shield}
          trend="All drones covered"
        />
        <StatusCard
          title="Pending Claims"
          value="1"
          description="Claims awaiting processing"
          icon={FileText}
          trend="No change"
        />
        <StatusCard
          title="Flight Hours"
          value="26.5"
          description="Total flight hours this month"
          icon={Clock}
          trend="+4.5 from last month"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Flight Registration Status</CardTitle>
            <CardDescription>Overview of your current flight registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Drone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">DJI Mavic 3</p>
                    <p className="text-sm text-muted-foreground">Downtown Area Survey</p>
                  </div>
                </div>
                <Badge className="bg-green-500">Active</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Drone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Autel Evo II</p>
                    <p className="text-sm text-muted-foreground">Construction Site Monitoring</p>
                  </div>
                </div>
                <Badge className="bg-green-500">Active</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Drone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">DJI Mini 3</p>
                    <p className="text-sm text-muted-foreground">Recreational Flight</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-amber-500 border-amber-500">
                  Pending
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Skydio 2+</p>
                    <p className="text-sm text-muted-foreground">Expired Registration</p>
                  </div>
                </div>
                <Badge variant="destructive">Expired</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/register-flight">Register New Flight</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent flights and insurance activity</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentFlights />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/flight-history">View Flight History</Link>
            </Button>
            <Button asChild>
              <Link href="/file-claim">File a Claim</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
