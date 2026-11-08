// Static icons for ImageResponse. They can't follow the theme, so they use
// the fixed Prism colours: the favicon is the ink mark on the Prism
// background; app icons are the light mark on a violet square.

const FAVICON = { bg: '#F6F5FA', ring: '#17151F', dot: '#5638D1' }
const APP = { bg: '#5638D1', ring: '#FDFCFF', dot: '#E5E0FA' }

function Mark({ size, ring, dot }: { size: number; ring: string; dot: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96">
      <circle cx="48" cy="48" r="40" fill="none" stroke={ring} strokeWidth="7" />
      <circle cx="48" cy="48" r="24" fill="none" stroke={ring} strokeWidth="7" />
      <circle cx="56" cy="40" r="10" fill={dot} />
    </svg>
  )
}

/**
 * kind "favicon": the mark filling a soft Prism tile.
 * kind "app": rounded violet square (home-screen icon).
 * kind "full-bleed": square violet tile with the mark in the maskable
 *   safe zone, for maskable and Apple icons (the OS rounds the corners).
 */
export function IconArt({ size, kind }: { size: number; kind: 'favicon' | 'app' | 'full-bleed' }) {
  const c = kind === 'favicon' ? FAVICON : APP
  const mark = size * (kind === 'favicon' ? 0.86 : kind === 'app' ? 0.64 : 0.56)
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: c.bg,
        borderRadius: kind === 'full-bleed' ? 0 : size * 0.22,
      }}
    >
      <Mark size={mark} ring={c.ring} dot={c.dot} />
    </div>
  )
}
