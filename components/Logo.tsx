/**
 * The Focus mark: two open rings in the text colour and an off-centre focal
 * dot in the theme accent. At 24px and below only the inner ring and dot are
 * drawn, cropped in, so it stays crisp.
 */
export function Logo({
  size = 32,
  withWordmark = true,
  className = '',
}: {
  size?: number
  withWordmark?: boolean
  className?: string
}) {
  const small = size <= 24
  const mark = (
    <svg
      viewBox={small ? '18 18 60 60' : '0 0 96 96'}
      width={size}
      height={size}
      className="shrink-0"
      role={withWordmark ? undefined : 'img'}
      aria-label={withWordmark ? undefined : 'arisstudying'}
      aria-hidden={withWordmark ? true : undefined}
    >
      {!small && <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="7" />}
      <circle cx="48" cy="48" r="24" fill="none" stroke="currentColor" strokeWidth="7" />
      <circle cx="56" cy="40" r="10" fill="var(--accent)" />
    </svg>
  )
  if (!withWordmark) return <span className={`inline-flex text-ink ${className}`}>{mark}</span>
  return (
    <span className={`inline-flex items-center text-ink ${className}`} style={{ gap: size * 0.32 }}>
      {mark}
      <span className="font-semibold leading-none" style={{ fontSize: size * 0.55, letterSpacing: '-0.02em' }}>
        arisstudying
      </span>
    </span>
  )
}
