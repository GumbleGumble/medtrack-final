import { prisma } from '@/lib/db'

export async function scheduleNotifications(userId: string) {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    console.warn('Notification permission not granted')
    return
  }

  // TODO: Implement proper notification scheduling
  console.log('Notifications scheduled for user:', userId)
}

export async function sendMedicationReminder(medicationId: string) {
  const medication = await prisma.medication.findUnique({
    where: { id: medicationId },
    include: { group: true },
  })

  if (!medication) return

  new Notification(`Time to take ${medication.name}`, {
    body: `${medication.dosage} ${medication.unit}`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: `medication-${medication.id}`,
    renotify: true,
  })
}