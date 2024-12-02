import { Medication, MedicationGroup, DoseRecord } from '@prisma/client'

export type MedicationWithDoses = Medication & {
  doseRecords: DoseRecord[]
}

export type MedicationGroupWithMeds = MedicationGroup & {
  medications: MedicationWithDoses[]
}

export type DoseStatus = 'PENDING' | 'TAKEN' | 'SKIPPED' | 'UNAVAILABLE'

export interface MedicationDoseTime {
  medication: Medication
  scheduledTime: Date
  status: DoseStatus
}

export interface DoseRecordCreate {
  medicationId: string
  timestamp: Date
  notes?: string
  skipped: boolean
  recordedByUserId: string
}