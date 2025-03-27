
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export const ThemeContext = React.createContext<{
  theme?: string;
  toggleTheme?: () => void;
}>({});

export const useTheme = () => React.useContext(ThemeContext);
