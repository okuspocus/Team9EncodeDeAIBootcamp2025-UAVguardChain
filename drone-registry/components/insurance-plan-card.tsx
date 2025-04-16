"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface InsurancePlanCardProps {
  id: string
  title: string
  price: string
  description: string
  features: string[]
  recommended?: boolean
  selected?: boolean
  onSelect: () => void
}

export function InsurancePlanCard({
  id,
  title,
  price,
  description,
  features,
  recommended = false,
  selected = false,
  onSelect,
}: InsurancePlanCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all",
        selected && "border-primary ring-2 ring-primary ring-offset-2",
        recommended && "shadow-lg",
      )}
    >
      {recommended && <Badge className="absolute right-2 top-2 z-10">Recommended</Badge>}

      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground"> /period</span>
        </div>

        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant={selected ? "default" : "outline"} className="w-full" onClick={onSelect}>
          {selected ? "Selected" : "Select Plan"}
        </Button>
      </CardFooter>
    </Card>
  )
}
