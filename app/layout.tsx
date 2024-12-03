import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Script from 'next/script'
import { themes } from "@/lib/themes"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MedTracker',
  description: 'Track your medications with ease',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ 
          __html: themes.map((theme) => `
            [data-theme="${theme.name}"] {
              --primary: ${theme.colors.primary};
              --primary-foreground: ${theme.colors.primaryForeground};
              --secondary: ${theme.colors.secondary};
              --accent: ${theme.colors.accent};
              --background: ${theme.colors.background};
              --foreground: ${theme.colors.foreground};
              --destructive: ${theme.colors.destructive};
            }
          `).join("\n")
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                })
              }
            `,
          }}
        />
      </body>
    </html>
  )
}