import { Badge } from "@/components/ui/badge"
import { DrillIcon as Drone, Shield, FileText } from "lucide-react"

export function RecentFlights() {
  const activities = [
    {
      id: 1,
      type: "flight",
      title: "DJI Mavic 3",
      description: "Flight registered successfully",
      date: "Today, 10:30 AM",
      icon: Drone,
      status: "success",
    },
    {
      id: 2,
      type: "insurance",
      title: "Autel Evo II",
      description: "Insurance purchased",
      date: "Yesterday, 2:15 PM",
      icon: Shield,
      status: "success",
    },
    {
      id: 3,
      type: "claim",
      title: "Skydio 2+",
      description: "Claim submitted for processing",
      date: "Mar 15, 2025",
      icon: FileText,
      status: "pending",
    },
    {
      id: 4,
      type: "flight",
      title: "DJI Mini 3",
      description: "Flight registration pending approval",
      date: "Mar 14, 2025",
      icon: Drone,
      status: "pending",
    },
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
          <div className="mt-0.5">
            <activity.icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{activity.title}</p>
              {activity.status === "success" ? (
                <Badge className="bg-green-500">Completed</Badge>
              ) : (
                <Badge variant="outline" className="text-amber-500 border-amber-500">
                  Pending
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground">{activity.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
