// The app icon: a soft eye on a pastel gradient. Drawn for ImageResponse,
// so it stays inside the maskable safe zone (centre 80%).
export function IconArt({ size, rounded = false }: { size: number; rounded?: boolean }) {
  const eye = size * 0.62
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #f9d8de 0%, #f6c9d0 45%, #e5daf5 100%)',
        borderRadius: rounded ? size * 0.22 : 0,
      }}
    >
      <svg width={eye} height={eye} viewBox="0 0 100 100">
        <path d="M8 50 Q 50 8 92 50 Q 50 92 8 50 Z" fill="#ffffff" stroke="#9a4560" strokeWidth="5" strokeLinejoin="round" />
        <circle cx="50" cy="50" r="17" fill="#cfe3f7" stroke="#2d5a85" strokeWidth="3.5" />
        <circle cx="50" cy="50" r="7.5" fill="#2e2a33" />
        <circle cx="55" cy="45" r="3" fill="#ffffff" />
      </svg>
    </div>
  )
}
