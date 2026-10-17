import Link from 'next/link'
import { ringColour } from '@/lib/colour'
import { ChevronLeft } from './icons'

export type ColourMap = Record<string, string>

export function ModuleChip({ code, colours, link = false }: { code: string; colours: ColourMap; link?: boolean }) {
  const colour = colours[code]
  const chip = (
    <span className="chip" style={{ background: colour ?? '#ece4df' }}>
      {code}
    </span>
  )
  return link && colour ? (
    <Link href={`/m/${code}`} className="rounded-full">
      {chip}
    </Link>
  ) : (
    chip
  )
}

/** Session.module can be "AnE/PEG" — split into known codes. */
export function splitModules(m: string | null): string[] {
  return m ? m.split('/').map((s) => s.trim()).filter(Boolean) : []
}

export function ProgressRing({
  value,
  colour,
  size = 44,
  stroke = 5,
  label,
}: {
  value: number
  colour: string
  size?: number
  stroke?: number
  label: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value))
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(0 0 0 / 0.07)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={ringColour(colour)}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={size * 0.27}
        fontWeight={650}
        fill="#4a4350"
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  )
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="no-print -ml-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-[15px] font-medium text-muted hover:text-ink"
    >
      <ChevronLeft className="size-[18px]" />
      {children}
    </Link>
  )
}

export function SectionTitle({ children, id, className = '' }: { children: React.ReactNode; id?: string; className?: string }) {
  return (
    <h2 id={id} className={`text-[22px] font-semibold ${className}`}>
      {children}
    </h2>
  )
}

const TYPE_LABELS: Record<string, string> = {
  'Pc Lab': 'PC lab',
  Ipl: 'IPL',
  'Prac Lab + Assessment': 'Practical lab + assessment',
  'Practical Lab': 'Practical lab',
  'Mock interview': 'Mock interview',
  'Mock class test': 'Mock class test',
  'Careers talk': 'Careers talk',
  'Careers workshop': 'Careers workshop',
  'Library workshop': 'Library workshop',
  'Drop in': 'Drop-in',
  Zeiss: 'Zeiss visit',
  Presbyope: 'Presbyope clinic',
}
export const typeLabel = (t: string) => TYPE_LABELS[t] ?? t
