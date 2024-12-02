"use client"

import { Card } from "@/components/ui/card"
import { MedicationGroupWithMeds } from "@/types/medication"
import { MedicationItem } from "./medication-item"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getColorClasses } from "@/lib/utils/color"
import { getIconComponent } from "@/lib/utils/icons"

interface MedicationGroupProps {
  group: MedicationGroupWithMeds
  onUpdate: () => void
}

export function MedicationGroup({ group, onUpdate }: MedicationGroupProps) {
  const Icon = getIconComponent(group.icon)
  const colorClasses = getColorClasses(group.color)

  return (
    <Card className={cn("p-4", "border-l-4", colorClasses[0])}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            colorClasses[1]
          )}>
            <Icon className={cn("h-5 w-5", colorClasses[2])} />
          </div>
          <h3 className="font-medium text-lg">{group.name}</h3>
        </div>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {group.medications.map((medication) => (
          <MedicationItem
            key={medication.id}
            medication={medication}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </Card>
  )
}