// Darker shades of the pastel module colours, for rings and text that
// need real contrast on white.

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [h * 60, s, l]
}

/** Same hue, given lightness; saturation nudged so greys stay soft. */
export function shade(hex: string, lightness: number, minSat = 0.25): string {
  const [h, s] = hexToHsl(hex)
  const sat = Math.min(0.55, Math.max(minSat, s * 0.6))
  return `hsl(${Math.round(h)} ${Math.round(sat * 100)}% ${Math.round(lightness * 100)}%)`
}

export const ringColour = (hex: string) => shade(hex, 0.48)
export const inkColour = (hex: string) => shade(hex, 0.28)
