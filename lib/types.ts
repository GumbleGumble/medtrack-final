export interface Theme {
  name: string
  label: string
  colors: {
    primary: string
    primaryForeground: string
    secondary: string
    accent: string
    background: string
    foreground: string
    destructive: string
  }
}

export interface Timezone {
  value: string
  label: string
}

export interface UserPreferences {
  id: string
  userId: string
  theme: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  reminderTime: number
  reminderBuffer: number
  soundEnabled: boolean
  vibrationEnabled: boolean
  colorScheme: string
  fontSize: string
  useHighContrast: boolean
  createdAt: Date
  updatedAt: Date
} 