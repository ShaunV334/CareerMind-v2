"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const defaults = {
    attribute: "class",
    defaultTheme: "system",
    enableSystem: true,
    storageKey: "career-mind-theme",
  }

  return (
    <NextThemesProvider {...defaults} {...props}>
      {children}
    </NextThemesProvider>
  )
}