"use client"

import { MedicationCard } from "./medication-card"
import { MedicationGroupWithMeds } from "@/types/medication"

interface MedicationListProps {
  groups: MedicationGroupWithMeds[]
  onUpdate: () => void
}

export function MedicationList({ groups, onUpdate }: MedicationListProps) {
  if (!groups || groups.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No medications added yet.</p>
        <p className="text-sm mt-2">Click the + button above to add your first medication.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="flex items-center space-x-2 mb-4">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: group.color }}
            />
            <h2 className="text-lg font-medium">{group.name}</h2>
          </div>
          <div className="grid gap-4">
            {group.medications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}