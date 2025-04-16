import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, FileText, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function ClaimStatusTracker() {
  // This would typically come from your API or state management
  const currentStep = 1 // 1: Submitted, 2: Verified, 3: Assessed, 4: Paid

  const steps = [
    {
      id: 1,
      name: "Claim Submitted",
      description: "Your claim has been submitted to the blockchain",
      icon: FileText,
    },
    {
      id: 2,
      name: "Verification",
      description: "Smart contract verifies policy coverage",
      icon: AlertCircle,
    },
    {
      id: 3,
      name: "Assessment",
      description: "Claim is assessed for payout amount",
      icon: Clock,
    },
    {
      id: 4,
      name: "Payment",
      description: "Funds transferred to your wallet",
      icon: CheckCircle2,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claim Status</CardTitle>
        <CardDescription>Track the status of your insurance claim</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = step.id < currentStep
            const isLast = index === steps.length - 1

            return (
              <div key={step.id} className="relative">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full w-8 h-8 mt-0.5",
                      isCompleted
                        ? "bg-green-100 dark:bg-green-900"
                        : isActive
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "bg-muted",
                    )}
                  >
                    <step.icon
                      className={cn(
                        "h-4 w-4",
                        isCompleted
                          ? "text-green-600 dark:text-green-400"
                          : isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-muted-foreground",
                      )}
                    />
                  </div>

                  <div className="space-y-1">
                    <p
                      className={cn(
                        "font-medium",
                        isCompleted
                          ? "text-green-600 dark:text-green-400"
                          : isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-muted-foreground",
                      )}
                    >
                      {step.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {!isLast && (
                  <div className={cn("absolute left-4 top-8 h-full w-px", isCompleted ? "bg-green-500" : "bg-muted")} />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
