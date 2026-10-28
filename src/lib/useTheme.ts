import { useCallback, useEffect, useState } from "react"
import { themeStore, type Theme } from "./themeStore"

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(themeStore.get)

  useEffect(() => {
    return themeStore.subscribe(setThemeState)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    themeStore.set(t)
  }, [])

  const resetToSystem = useCallback(() => {
    themeStore.resetToSystem()
  }, [])

  return { theme, setTheme, resetToSystem, isExplicit: themeStore.isExplicit() }
}
