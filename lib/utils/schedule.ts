import { parseISO, addHours, addDays, startOfDay, endOfDay } from 'date-fns'
import { prisma } from '@/lib/db'
import { MedicationDoseTime } from '@/types/medication'

export async function getDailySchedule(userId: string, date: Date): Promise<MedicationDoseTime[]> {
  const start = startOfDay(date)
  const end = endOfDay(date)

  const medications = await prisma.medication.findMany({
    where: {
      group: {
        userId,
      },
      isAsNeeded: false,
    },
    include: {
      doseRecords: {
        where: {
          timestamp: {
            gte: start,
            lte: end,
          },
        },
      },
    },
  })

  const schedule: MedicationDoseTime[] = []

  medications.forEach((medication) => {
    const times = parseScheduleTimes(medication.frequency)
    times.forEach((time) => {
      const scheduledTime = new Date(date)
      scheduledTime.setHours(time.hours)
      scheduledTime.setMinutes(time.minutes)

      const status = getDoseStatus(medication, scheduledTime)
      schedule.push({
        medication,
        scheduledTime,
        status,
      })
    })
  })

  return schedule.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
}

interface TimePoint {
  hours: number
  minutes: number
}

function parseScheduleTimes(frequency: string): TimePoint[] {
  // TODO: Implement proper frequency parsing
  // For now, return a simple morning schedule
  return [{ hours: 8, minutes: 0 }]
}

function getDoseStatus(medication: any, scheduledTime: Date): 'PENDING' | 'TAKEN' | 'SKIPPED' {
  const dose = medication.doseRecords.find((record: any) => {
    const recordTime = new Date(record.timestamp)
    return recordTime.getHours() === scheduledTime.getHours() &&
           recordTime.getMinutes() === scheduledTime.getMinutes()
  })

  if (!dose) return 'PENDING'
  return dose.skipped ? 'SKIPPED' : 'TAKEN'
}