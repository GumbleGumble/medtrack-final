"use client"

import { MedicationGroupWithMeds } from "@/types/medication"
import { MedicationGroup } from "./medication-group"
import { AddGroupButton } from "./add-group-button"

interface MedicationListProps {
  groups: MedicationGroupWithMeds[]
  onUpdate: () => void
}

export function MedicationList({ groups, onUpdate }: MedicationListProps) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No medication groups yet.</p>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Create a group to start adding medications.
        </p>
        <AddGroupButton onSuccess={onUpdate} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <MedicationGroup
          key={group.id}
          group={group}
          onUpdate={onUpdate}
        />
      ))}
      <AddGroupButton onSuccess={onUpdate} />
    </div>
  )
}