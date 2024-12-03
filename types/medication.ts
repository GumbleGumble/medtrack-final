import { Medication, MedicationGroup, DoseRecord } from '@prisma/client'

export interface MedicationWithDoses extends Medication {
  doseRecords?: DoseRecord[]
}

export interface MedicationGroupWithMeds extends MedicationGroup {
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

export interface PaginationParams {
  page: number
  limit: number
}

export interface SortParams {
  field: 'timestamp' | 'medicationName' | 'dosage' | 'status'
  direction: 'asc' | 'desc'
}

export interface HistoryFilters {
  startDate: Date
  endDate: Date
  medicationIds: string[]
  groupIds: string[]
  includeSkipped: boolean
  status: 'taken' | 'skipped' | 'all'
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'all'
  search: string
  page: number
  limit: number
  sortField: 'timestamp' | 'medicationName' | 'dosage' | 'status'
  sortDirection: 'asc' | 'desc'
}

export interface HistoryResponse {
  doses: DoseWithMedication[]
  total: number
  page: number
  totalPages: number
}

export interface DoseWithMedication extends DoseRecord {
  medication: {
    name: string
    dosage: string
    unit: string
    group: {
      name: string
      color: string
    }
  }
}