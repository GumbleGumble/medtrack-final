export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours()
  
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

export function formatTimeRange(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case 'morning':
      return '5:00 AM - 11:59 AM'
    case 'afternoon':
      return '12:00 PM - 4:59 PM'
    case 'evening':
      return '5:00 PM - 8:59 PM'
    case 'night':
      return '9:00 PM - 4:59 AM'
  }
} 