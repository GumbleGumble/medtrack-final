import { Theme } from "./types"

export const themes: Theme[] = [
  {
    name: "light",
    label: "Light Mode",
    colors: {
      primary: "hsl(222.2 47.4% 11.2%)",
      primaryForeground: "hsl(210 40% 98%)",
      secondary: "hsl(210 40% 96.1%)",
      accent: "hsl(210 40% 96.1%)",
      background: "hsl(0 0% 100%)",
      foreground: "hsl(222.2 47.4% 11.2%)",
      destructive: "hsl(0 84.2% 60.2%)",
    },
  },
  {
    name: "dark",
    label: "Dark Mode",
    colors: {
      primary: "hsl(210 40% 98%)",
      primaryForeground: "hsl(222.2 47.4% 11.2%)",
      secondary: "hsl(217.2 32.6% 17.5%)",
      accent: "hsl(217.2 32.6% 17.5%)",
      background: "hsl(222.2 84% 4.9%)",
      foreground: "hsl(210 40% 98%)",
      destructive: "hsl(0 62.8% 30.6%)",
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