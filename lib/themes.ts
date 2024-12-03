import { Theme } from "./types"

export const themes: Theme[] = [
  {
    name: "blue-dawn",
    label: "Blue Dawn",
    colors: {
      primary: "hsl(217, 91%, 60%)",
      primaryForeground: "hsl(0, 0%, 100%)",
      secondary: "hsl(215, 20%, 65%)",
      accent: "hsl(215, 100%, 96%)",
      background: "hsl(220, 14%, 96%)",
      foreground: "hsl(215, 25%, 27%)",
      destructive: "hsl(0, 84%, 60%)",
    },
  },
  {
    name: "emerald-night",
    label: "Emerald Night",
    colors: {
      primary: "hsl(152, 76%, 40%)",
      primaryForeground: "hsl(0, 0%, 100%)",
      secondary: "hsl(150, 14%, 65%)",
      accent: "hsl(150, 100%, 96%)",
      background: "hsl(155, 14%, 96%)",
      foreground: "hsl(150, 25%, 27%)",
      destructive: "hsl(0, 84%, 60%)",
    },
  },
  {
    name: "purple-dusk",
    label: "Purple Dusk",
    colors: {
      primary: "hsl(262, 83%, 58%)",
      primaryForeground: "hsl(0, 0%, 100%)",
      secondary: "hsl(260, 14%, 65%)",
      accent: "hsl(260, 100%, 96%)",
      background: "hsl(265, 14%, 96%)",
      foreground: "hsl(260, 25%, 27%)",
      destructive: "hsl(0, 84%, 60%)",
    },
  },
  {
    name: "rose-garden",
    label: "Rose Garden",
    colors: {
      primary: "hsl(340, 82%, 52%)",
      primaryForeground: "hsl(0, 0%, 100%)",
      secondary: "hsl(340, 14%, 65%)",
      accent: "hsl(340, 100%, 96%)",
      background: "hsl(345, 14%, 96%)",
      foreground: "hsl(340, 25%, 27%)",
      destructive: "hsl(0, 84%, 60%)",
    },
  },
  {
    name: "sunset-orange",
    label: "Sunset Orange",
    colors: {
      primary: "hsl(24, 95%, 50%)",
      primaryForeground: "hsl(0, 0%, 100%)",
      secondary: "hsl(25, 14%, 65%)",
      accent: "hsl(25, 100%, 96%)",
      background: "hsl(30, 14%, 96%)",
      foreground: "hsl(25, 25%, 27%)",
      destructive: "hsl(0, 84%, 60%)",
    },
  },
]

export function getThemeColors(themeName: string): Theme["colors"] {
  const theme = themes.find((t) => t.name === themeName)
  return theme?.colors || themes[0].colors
}

export function generateThemeCSS(themeName: string): string {
  const colors = getThemeColors(themeName)
  return `
    :root[data-theme="${themeName}"] {
      --primary: ${colors.primary};
      --primary-foreground: ${colors.primaryForeground};
      --secondary: ${colors.secondary};
      --accent: ${colors.accent};
      --background: ${colors.background};
      --foreground: ${colors.foreground};
      --destructive: ${colors.destructive};
    }
  `
} 