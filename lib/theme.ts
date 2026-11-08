// The student's colour theme: a palette (Prism, Focus, Companion) and a mode
// (follow the device, or force light/dark). Applied as attributes on <html>
// that styles/themes.css reads.
import { PALETTES } from './palettes'

export type Palette = keyof typeof PALETTES
export type Mode = 'system' | 'light' | 'dark'
export interface ThemeChoice {
  palette: Palette
  mode: Mode
}

export const THEME_KEY = 'oc:theme'
export const DEFAULT_THEME: ThemeChoice = { palette: 'prism', mode: 'system' }
export const PALETTE_ORDER: Palette[] = ['prism', 'focus', 'companion']

export const isPalette = (v: unknown): v is Palette => typeof v === 'string' && v in PALETTES
export const isMode = (v: unknown): v is Mode => v === 'system' || v === 'light' || v === 'dark'

export function readSavedTheme(): ThemeChoice {
  try {
    const v = JSON.parse(localStorage.getItem(THEME_KEY) ?? 'null')
    return { palette: isPalette(v?.palette) ? v.palette : 'prism', mode: isMode(v?.mode) ? v.mode : 'system' }
  } catch {
    return DEFAULT_THEME
  }
}

export function saveThemeLocally(t: ThemeChoice) {
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(t))
  } catch {
    // Private mode or blocked storage: the theme still applies for this visit.
  }
}

const prefersDark = () => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches

/** Sets the <html> attributes and the browser's theme-color. `fade` gives a short colour transition. */
export function applyTheme(t: ThemeChoice, fade = false) {
  const root = document.documentElement
  if (fade && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-fade')
    window.setTimeout(() => root.classList.remove('theme-fade'), 200)
  }
  root.dataset.palette = t.palette
  if (t.mode === 'system') delete root.dataset.mode
  else root.dataset.mode = t.mode
  setThemeColor(t)
}

export function setThemeColor(t: ThemeChoice) {
  const dark = t.mode === 'dark' || (t.mode === 'system' && prefersDark())
  const colour = PALETTES[t.palette][dark ? 'dark' : 'light'].bg
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove())
  const meta = document.createElement('meta')
  meta.name = 'theme-color'
  meta.content = colour
  document.head.appendChild(meta)
}

/**
 * Runs in <head> before first paint so the page never flashes the wrong
 * theme. Self-contained: it can't import anything.
 */
export const THEME_SCRIPT = `(function(){try{var P=${JSON.stringify(
  Object.fromEntries(Object.entries(PALETTES).map(([k, v]) => [k, [v.light.bg, v.dark.bg]])),
)};var t=JSON.parse(localStorage.getItem('${THEME_KEY}')||'null')||{};var p=P[t.palette]?t.palette:'prism';var m=t.mode==='light'||t.mode==='dark'?t.mode:'system';var r=document.documentElement;r.setAttribute('data-palette',p);if(m!=='system')r.setAttribute('data-mode',m);var d=m==='dark'||(m==='system'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);var e=document.createElement('meta');e.name='theme-color';e.content=P[p][d?1:0];document.head.appendChild(e)}catch(_){}})()`
