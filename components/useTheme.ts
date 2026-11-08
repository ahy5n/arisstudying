'use client'

import { useEffect, useState } from 'react'
import {
  applyTheme,
  DEFAULT_THEME,
  type Mode,
  type Palette,
  readSavedTheme,
  saveThemeLocally,
  setThemeColor,
  type ThemeChoice,
} from '@/lib/theme'
import { useApp } from './AppProvider'

/** Reads, applies and saves the colour theme (this device, plus the profile when signed in). */
export function useTheme() {
  const { data, saveProfile } = useApp()
  const [theme, setTheme] = useState<ThemeChoice>(DEFAULT_THEME)
  useEffect(() => setTheme(readSavedTheme()), [])

  function choose(patch: Partial<ThemeChoice>) {
    const next = { ...theme, ...patch }
    setTheme(next)
    applyTheme(next, true)
    saveThemeLocally(next)
    if (data) saveProfile({ palette: next.palette, colorMode: next.mode }).catch(() => {})
  }

  return {
    theme,
    setPalette: (palette: Palette) => choose({ palette }),
    setMode: (mode: Mode) => choose({ mode }),
  }
}

/**
 * Keeps the theme in step: adopts the one saved on the profile (so it
 * follows the student to a new device) and keeps the browser's
 * theme-color right when the device switches light/dark.
 */
export function ThemeSync() {
  const { data } = useApp()
  const palette = data?.profile.palette ?? null
  const mode = data?.profile.colorMode ?? null

  useEffect(() => {
    if (!palette && !mode) return
    const local = readSavedTheme()
    const next = { palette: palette ?? local.palette, mode: mode ?? local.mode }
    if (next.palette === local.palette && next.mode === local.mode) return
    applyTheme(next)
    saveThemeLocally(next)
  }, [palette, mode])

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setThemeColor(readSavedTheme())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return null
}
