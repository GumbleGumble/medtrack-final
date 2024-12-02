import { prisma } from '@/lib/db'
import { type Medication, type MedicationGroup, type DoseRecord } from '@prisma/client'
import { addMinutes, isAfter } from 'date-fns'
import { DoseRecordCreate, MedicationWithDoses } from '@/types/medication'

export async function getMedicationGroups(userId: string) {
  return prisma.medicationGroup.findMany({
    where: { userId },
    include: { medications: true },
    orderBy: { displayOrder: 'asc' },
  })
}

export async function getMedication(id: string, includeRecords = false) {
  return prisma.medication.findUnique({
    where: { id },
    include: {
      doseRecords: includeRecords,
    },
  })
}

export async function createDoseRecord(data: DoseRecordCreate) {
  const medication = await prisma.medication.findUnique({
    where: { id: data.medicationId },
    include: { doseRecords: true },
  })

  if (!medication) {
    throw new Error('Medication not found')
  }

  if (medication.isAsNeeded && medication.minTimeBetweenDoses) {
    const lastDose = medication.doseRecords[0]
    if (lastDose) {
      const nextAvailableTime = addMinutes(lastDose.timestamp, medication.minTimeBetweenDoses)
      if (isAfter(nextAvailableTime, new Date())) {
        throw new Error('Medication is not yet available')
      }
    }
  }

  return prisma.doseRecord.create({
    data,
  })
}

export async function getNextDoseTime(medication: MedicationWithDoses): Promise<Date | null> {
  if (!medication.isAsNeeded) {
    // TODO: Implement scheduled medication logic
    return null
  }

  const lastDose = medication.doseRecords[0]
  if (!lastDose || !medication.minTimeBetweenDoses) {
    return new Date()
  }

  return addMinutes(lastDose.timestamp, medication.minTimeBetweenDoses)
}