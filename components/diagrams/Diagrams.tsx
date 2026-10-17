// Inline SVG diagrams, keyed by `diagram.id` in the content files.
// Each one can be drawn "labelled" (normal) or "blank" (for the
// label-the-diagram exercise, where `spots` gives hotspot positions).
// Unknown ids fall back to a description card.

import { Arrowheads, Cross, Dim, INK, LILAC, MUTED, ROSE, SAGE, SKY, T, type DiagramDef } from './kit'
import { MORE_DIAGRAMS } from './MoreDiagrams'

export type { DiagramDef, Spot } from './kit'

// ── Boxing system ─────────────────────────────────────────────────────

const boxing: DiagramDef = {
  viewBox: [660, 360],
  legend: [
    ['A', 'Horizontal box lens size'],
    ['B', 'Vertical box lens size'],
    ['DBL', 'Distance between lenses'],
    ['×', 'Box centre'],
    ['HCL', 'Horizontal centre line'],
    ['BCD', 'Box centre distance (= A + DBL)'],
    ['ED', 'Effective diameter (2 × longest radius)'],
  ],
  spots: {
    'A (horizontal box lens size)': { x: 440, y: 56 },
    'B (vertical box lens size)': { x: 590, y: 165 },
    DBL: { x: 310, y: 286 },
    'Box centre': { x: 440, y: 165 },
    'Box centre distance (BCD)': { x: 310, y: 330 },
    'Horizontal centre line': { x: 34, y: 165 },
    'Effective diameter (ED)': { x: 222, y: 128 },
  },
  render: (L) => (
    <g fontFamily="inherit">
      <Arrowheads />
      {/* ED circle around the left lens */}
      <circle cx={180} cy={165} r={103} fill="none" stroke={LILAC} strokeWidth={1.3} strokeDasharray="3 5" opacity={0.75} />
      {/* lens shapes */}
      <rect x={80} y={90} width={200} height={150} rx={62} ry={56} fill="#fcebee" stroke={ROSE} strokeWidth={2.4} />
      <rect x={340} y={90} width={200} height={150} rx={62} ry={56} fill="#fcebee" stroke={ROSE} strokeWidth={2.4} />
      {/* boxes */}
      <rect x={80} y={90} width={200} height={150} fill="none" stroke={INK} strokeWidth={1.4} strokeDasharray="6 5" />
      <rect x={340} y={90} width={200} height={150} fill="none" stroke={INK} strokeWidth={1.4} strokeDasharray="6 5" />
      {/* ED radius: box centre to the furthest point of the shape */}
      <line x1={180} y1={165} x2={271} y2={122} stroke={LILAC} strokeWidth={1.8} markerEnd="url(#ah-lilac)" />
      <T x={222} y={128} show={L} fill={LILAC} anchor="middle">
        ED
      </T>
      {/* bridge hint */}
      <path d="M280 120 C 295 108, 325 108, 340 120" fill="none" stroke={MUTED} strokeWidth={2} />
      {/* HCL */}
      <line x1={58} y1={165} x2={606} y2={165} stroke={SKY} strokeWidth={1.4} strokeDasharray="10 6" />
      <T x={34} y={165} show={L} fill={SKY}>
        HCL
      </T>
      {/* box centres */}
      <Cross x={180} y={165} />
      <Cross x={440} y={165} />
      {/* A */}
      <line x1={340} y1={90} x2={340} y2={44} stroke={MUTED} strokeWidth={1} />
      <line x1={540} y1={90} x2={540} y2={44} stroke={MUTED} strokeWidth={1} />
      <Dim x1={341} y1={56} x2={539} y2={56} />
      {L && <rect x={424} y={44} width={32} height={24} fill="white" />}
      <T x={440} y={56} show={L}>
        A
      </T>
      {/* B */}
      <line x1={540} y1={90} x2={600} y2={90} stroke={MUTED} strokeWidth={1} />
      <line x1={540} y1={240} x2={600} y2={240} stroke={MUTED} strokeWidth={1} />
      <Dim x1={590} y1={91} x2={590} y2={239} />
      {L && <rect x={578} y={153} width={24} height={24} fill="white" />}
      <T x={590} y={165} show={L}>
        B
      </T>
      {/* DBL */}
      <line x1={280} y1={240} x2={280} y2={300} stroke={MUTED} strokeWidth={1} />
      <line x1={340} y1={240} x2={340} y2={300} stroke={MUTED} strokeWidth={1} />
      <Dim x1={281} y1={272} x2={339} y2={272} />
      <T x={310} y={290} show={L} size={14}>
        DBL
      </T>
      {/* BCD */}
      <line x1={180} y1={175} x2={180} y2={340} stroke={MUTED} strokeWidth={1} strokeDasharray="2 4" />
      <line x1={440} y1={175} x2={440} y2={340} stroke={MUTED} strokeWidth={1} strokeDasharray="2 4" />
      <Dim x1={181} y1={318} x2={439} y2={318} colour={ROSE} id="ah-rose" />
      <T x={310} y={334} show={L} fill={ROSE} size={14}>
        BCD
      </T>
      <T x={452} y={186} show={L} anchor="start" size={13} fill={ROSE}>
        box centre
      </T>
    </g>
  ),
}

// ── PD with a rule ────────────────────────────────────────────────────

function Eye({ x, y, open, pupil = true, scale = 1, look = 0 }: { x: number; y: number; open: boolean; pupil?: boolean; scale?: number; look?: number }) {
  const w = 30 * scale
  const h = 13 * scale
  if (!open) {
    return <path d={`M${x - w} ${y} Q ${x} ${y + h * 1.1} ${x + w} ${y}`} fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
  }
  return (
    <g>
      <path d={`M${x - w} ${y} Q ${x} ${y - h * 2} ${x + w} ${y} Q ${x} ${y + h * 2} ${x - w} ${y} Z`} fill="white" stroke={INK} strokeWidth={1.8} />
      <circle cx={x + look} cy={y} r={10 * scale} fill="#cfe3f7" stroke={SKY} strokeWidth={1.4} />
      {pupil && <circle cx={x + look} cy={y} r={4.2 * scale} fill={INK} />}
    </g>
  )
}

function PdPanel({ ox, step, L }: { ox: number; step: 1 | 2; L: boolean }) {
  // Practitioner's own eyes on top (their R on the right), patient below as
  // the practitioner sees them (patient's R on the left).
  const pL = ox + 95 // patient right pupil (screen left) — opposite practitioner's left eye
  const pR = ox + 215 // patient left pupil (screen right)
  const openX = step === 1 ? pL : pR
  return (
    <g>
      <T x={ox + 155} y={22} size={15} weight={700} fill={ROSE}>
        {`Step ${step}`}
      </T>
      {/* practitioner */}
      <T x={ox + 155} y={46} size={12} weight={500} fill={MUTED} show={L}>
        practitioner
      </T>
      <Eye x={pL} y={70} open={step === 1} scale={0.8} />
      <Eye x={pR} y={70} open={step === 2} scale={0.8} />
      <T x={pL} y={96} size={11} weight={500} fill={MUTED}>
        your L
      </T>
      <T x={pR} y={96} size={11} weight={500} fill={MUTED}>
        your R
      </T>
      {/* sight line */}
      <line x1={openX} y1={84} x2={openX} y2={196} stroke={LILAC} strokeWidth={1.6} strokeDasharray="5 5" />
      <Dim x1={ox + 22} y1={74} x2={ox + 22} y2={208} colour={MUTED} id="ah" />
      <T x={ox + 30} y={140} anchor="start" size={12} weight={600} fill={MUTED} show={L}>
        ~40 cm
      </T>
      {/* patient face */}
      <ellipse cx={ox + 155} cy={250} rx={128} ry={78} fill="#fbefd0" opacity={0.55} />
      <Eye x={pL} y={212} open look={0} />
      <Eye x={pR} y={212} open look={0} />
      <T x={pL} y={186} size={11} weight={500} fill={MUTED}>
        patient R
      </T>
      <T x={pR} y={186} size={11} weight={500} fill={MUTED}>
        patient L
      </T>
      <path d={`M${ox + 155} 222 L ${ox + 148} 262 L ${ox + 162} 262`} fill="none" stroke={MUTED} strokeWidth={1.5} strokeLinecap="round" />
      {/* PD rule */}
      <rect x={ox + 40} y={238} width={230} height={22} rx={4} fill="white" stroke={INK} strokeWidth={1.4} />
      {Array.from({ length: 24 }, (_, i) => {
        const x = ox + 50 + i * 9.5
        return <line key={i} x1={x} y1={238} x2={x} y2={i % 5 === 0 ? 250 : 245} stroke={INK} strokeWidth={1} />
      })}
      {/* zero / reading markers */}
      <line x1={pL} y1={224} x2={pL} y2={262} stroke={step === 1 ? ROSE : MUTED} strokeWidth={step === 1 ? 2.4 : 1.2} />
      {step === 2 && <line x1={pR} y1={224} x2={pR} y2={262} stroke={ROSE} strokeWidth={2.4} />}
      <T x={step === 1 ? pL : pR} y={282} size={13} weight={700} fill={ROSE} show={L}>
        {step === 1 ? 'zero here' : 'read here'}
      </T>
      <T x={ox + 155} y={308} size={12} weight={500} fill={MUTED} show={L}>
        PD rule on the bridge of the nose
      </T>
    </g>
  )
}

const pd: DiagramDef = {
  viewBox: [640, 320],
  caption:
    'As you see the patient: their right eye is on your left. Step 1 — close your right eye, patient looks at your open left eye, zero on their right pupil. Step 2 — swap eyes, read at their left pupil.',
  render: (L) => (
    <g>
      <Arrowheads />
      <PdPanel ox={0} step={1} L={L} />
      <line x1={320} y1={20} x2={320} y2={300} stroke="#ece4df" strokeWidth={1.5} />
      <PdPanel ox={330} step={2} L={L} />
    </g>
  ),
}

// ── Prentice / plus vs minus as prisms ────────────────────────────────

const prentice: DiagramDef = {
  viewBox: [660, 360],
  caption: 'Prentice’s rule: P (Δ) = c (cm) × F (D). The eye looking 5 mm below the OC meets prism — base up for plus, base down for minus.',
  render: (L) => {
    const oy = 170
    const c = 50 // "5 mm" below the OC
    return (
      <g>
        <Arrowheads />
        {/* PLUS: two prisms base-to-base */}
        <g>
          <T x={170} y={24} size={16} weight={700} fill={ROSE} show={L}>
            Plus lens = base-to-base
          </T>
          <path d={`M170 ${oy - 120} Q 222 ${oy} 170 ${oy + 120} Q 118 ${oy} 170 ${oy - 120} Z`} fill="#fcebee" stroke={ROSE} strokeWidth={1.6} opacity={0.9} />
          <path d={`M170 ${oy - 120} L 205 ${oy} L 135 ${oy} Z`} fill="none" stroke={ROSE} strokeWidth={2} strokeLinejoin="round" />
          <path d={`M170 ${oy + 120} L 205 ${oy} L 135 ${oy} Z`} fill="none" stroke={ROSE} strokeWidth={2} strokeLinejoin="round" />
          {/* OC */}
          <circle cx={170} cy={oy} r={4.5} fill={INK} />
          <line x1={40} y1={oy} x2={300} y2={oy} stroke={MUTED} strokeWidth={1} strokeDasharray="4 5" />
          <T x={292} y={oy - 12} anchor="end" size={13} show={L}>
            OC
          </T>
          {/* ray below OC bends up (towards base) */}
          <line x1={40} y1={oy + c} x2={148} y2={oy + c} stroke={SKY} strokeWidth={2.2} />
          <line x1={148} y1={oy + c} x2={192} y2={oy + c} stroke={SKY} strokeWidth={2.2} />
          <line x1={192} y1={oy + c} x2={300} y2={oy + c - 46} stroke={SKY} strokeWidth={2.2} markerEnd="url(#ah-sky)" />
          {/* c */}
          <Dim x1={70} y1={oy + 2} x2={70} y2={oy + c - 2} colour={LILAC} id="ah-lilac" />
          <T x={60} y={oy + c / 2} anchor="end" size={14} fill={LILAC} show={L}>
            c
          </T>
          {/* base direction */}
          <line x1={226} y1={oy + 92} x2={226} y2={oy + 18} stroke={ROSE} strokeWidth={2.2} markerEnd="url(#ah-rose)" />
          <T x={236} y={oy + 60} anchor="start" size={13} fill={ROSE} show={L}>
            base up
          </T>
        </g>
        <line x1={330} y1={40} x2={330} y2={330} stroke="#ece4df" strokeWidth={1.5} />
        {/* MINUS: two prisms apex-to-apex */}
        <g>
          <T x={490} y={24} size={16} weight={700} fill={SKY} show={L}>
            Minus lens = apex-to-apex
          </T>
          <path d={`M455 ${oy - 120} L 525 ${oy - 120} Q 498 ${oy} 525 ${oy + 120} L 455 ${oy + 120} Q 482 ${oy} 455 ${oy - 120} Z`} fill="#eef5fc" stroke={SKY} strokeWidth={1.6} />
          <path d={`M490 ${oy} L 525 ${oy - 120} L 455 ${oy - 120} Z`} fill="none" stroke={SKY} strokeWidth={2} strokeLinejoin="round" />
          <path d={`M490 ${oy} L 525 ${oy + 120} L 455 ${oy + 120} Z`} fill="none" stroke={SKY} strokeWidth={2} strokeLinejoin="round" />
          <circle cx={490} cy={oy} r={4.5} fill={INK} />
          <line x1={360} y1={oy} x2={630} y2={oy} stroke={MUTED} strokeWidth={1} strokeDasharray="4 5" />
          <T x={622} y={oy - 12} anchor="end" size={13} show={L}>
            OC
          </T>
          {/* ray below OC bends down (towards base) */}
          <line x1={360} y1={oy + c} x2={510} y2={oy + c} stroke={SKY} strokeWidth={2.2} />
          <line x1={510} y1={oy + c} x2={625} y2={oy + c + 46} stroke={SKY} strokeWidth={2.2} markerEnd="url(#ah-sky)" />
          <Dim x1={390} y1={oy + 2} x2={390} y2={oy + c - 2} colour={LILAC} id="ah-lilac" />
          <T x={380} y={oy + c / 2} anchor="end" size={14} fill={LILAC} show={L}>
            c
          </T>
          <line x1={548} y1={oy + 22} x2={548} y2={oy + 110} stroke={ROSE} strokeWidth={2.2} markerEnd="url(#ah-rose)" />
          <T x={558} y={oy + 70} anchor="start" size={13} fill={ROSE} show={L}>
            base down
          </T>
        </g>
      </g>
    )
  },
}

// ── Materials: index vs Abbe ──────────────────────────────────────────

const MATERIALS: { name: string; n: number; v: number; approx?: boolean; dx?: number; dy?: number; anchor?: 'start' | 'end' | 'middle' }[] = [
  { name: 'CR39', n: 1.5, v: 58, dx: -10, dy: 2, anchor: 'end' },
  { name: 'Crown glass', n: 1.523, v: 59, dx: 10, dy: -12, anchor: 'start' },
  { name: 'Trivex', n: 1.53, v: 44, dx: 10, dy: 0, anchor: 'start' },
  { name: '1.60', n: 1.6, v: 42, approx: true, dx: 10, dy: -4, anchor: 'start' },
  { name: 'Polycarbonate', n: 1.59, v: 30, dx: -10, dy: 0, anchor: 'end' },
  { name: '1.67', n: 1.67, v: 32, dx: 0, dy: -16, anchor: 'middle' },
  { name: '1.74', n: 1.74, v: 33, approx: true, dx: 0, dy: -16, anchor: 'middle' },
]

const materials: DiagramDef = {
  viewBox: [640, 360],
  caption: 'Typical values (check your slides). 1.60 and 1.74 points are approximate. As index rises, Abbe number generally falls.',
  render: () => {
    const x0 = 70
    const x1 = 610
    const y0 = 310
    const y1 = 30
    const sx = (n: number) => x0 + ((n - 1.48) / (1.76 - 1.48)) * (x1 - x0)
    const sy = (v: number) => y0 - ((v - 25) / (62 - 25)) * (y0 - y1)
    return (
      <g>
        {/* grid */}
        {[30, 40, 50, 60].map((v) => (
          <g key={v}>
            <line x1={x0} y1={sy(v)} x2={x1} y2={sy(v)} stroke="#ece4df" />
            <T x={x0 - 10} y={sy(v)} anchor="end" size={12} weight={500} fill={MUTED}>
              {v}
            </T>
          </g>
        ))}
        {[1.5, 1.55, 1.6, 1.65, 1.7, 1.75].map((n) => (
          <g key={n}>
            <line x1={sx(n)} y1={y0} x2={sx(n)} y2={y0 + 5} stroke={MUTED} />
            <T x={sx(n)} y={y0 + 18} size={12} weight={500} fill={MUTED}>
              {n.toFixed(2)}
            </T>
          </g>
        ))}
        <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={INK} strokeWidth={1.3} />
        <line x1={x0} y1={y0} x2={x0} y2={y1 - 6} stroke={INK} strokeWidth={1.3} />
        <T x={(x0 + x1) / 2} y={y0 + 42} size={13} fill={INK}>
          Refractive index (n) → thinner
        </T>
        <text x={22} y={(y0 + y1) / 2} transform={`rotate(-90 22 ${(y0 + y1) / 2})`} textAnchor="middle" fontSize={13} fontWeight={600} fill={INK}>
          Abbe number (V) → less colour fringing
        </text>
        {/* trend */}
        <line x1={sx(1.495)} y1={sy(60)} x2={sx(1.75)} y2={sy(29)} stroke={LILAC} strokeWidth={2} strokeDasharray="8 7" opacity={0.6} />
        {MATERIALS.map((m) => (
          <g key={m.name}>
            <circle cx={sx(m.n)} cy={sy(m.v)} r={7} fill={m.approx ? 'white' : '#f6c9d0'} stroke={ROSE} strokeWidth={2} strokeDasharray={m.approx ? '3 2' : undefined} />
            <T x={sx(m.n) + (m.dx ?? 0)} y={sy(m.v) + (m.dy ?? 0)} anchor={m.anchor} size={13}>
              {m.name}
            </T>
          </g>
        ))}
      </g>
    )
  },
}

// ── Anti-reflection interference ──────────────────────────────────────

function wave(x1: number, y1: number, x2: number, y2: number, phase: number, amp = 6, waves = 3) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const nx = -uy
  const ny = ux
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * len
    const s = Math.sin((t / len) * waves * 2 * Math.PI + phase) * amp
    pts.push(`${(x1 + ux * t + nx * s).toFixed(1)},${(y1 + uy * t + ny * s).toFixed(1)}`)
  }
  return pts.join(' ')
}

const arCoating: DiagramDef = {
  viewBox: [640, 360],
  render: (L) => (
    <g>
      <Arrowheads />
      {/* lens and coating */}
      <rect x={40} y={200} width={560} height={130} fill="#eef5fc" stroke={SKY} strokeWidth={1.5} />
      <rect x={40} y={176} width={560} height={24} fill="#e5daf5" stroke={LILAC} strokeWidth={1.5} />
      <T x={590} y={265} anchor="end" size={13} fill={SKY} show={L}>
        lens
      </T>
      <T x={590} y={188} anchor="end" size={13} fill={LILAC} show={L}>
        Coating (¼ wavelength thick)
      </T>
      <T x={56} y={160} anchor="start" size={12} weight={500} fill={MUTED} show={L}>
        air
      </T>
      {/* incident */}
      <line x1={110} y1={40} x2={230} y2={176} stroke={INK} strokeWidth={2.2} markerEnd="url(#ah)" />
      <T x={100} y={30} anchor="start" size={14} show={L}>
        Incident light
      </T>
      {/* reflection 1 at top of coating */}
      <polyline points={wave(232, 176, 342, 56, 0)} fill="none" stroke={ROSE} strokeWidth={2} />
      {/* path through coating */}
      <line x1={232} y1={176} x2={250} y2={200} stroke={INK} strokeWidth={1.8} />
      <line x1={250} y1={200} x2={268} y2={176} stroke={ROSE} strokeWidth={1.8} />
      {/* reflection 2, half a wave out of step */}
      <polyline points={wave(268, 176, 378, 56, Math.PI)} fill="none" stroke={ROSE} strokeWidth={2} strokeDasharray="5 3" />
      <T x={390} y={60} anchor="start" size={14} fill={ROSE} show={L}>
        Reflected rays out of phase
      </T>
      <T x={390} y={80} anchor="start" size={12} weight={500} fill={MUTED} show={L}>
        → they cancel
      </T>
      {/* transmitted */}
      <line x1={250} y1={200} x2={330} y2={322} stroke={SAGE} strokeWidth={3.2} markerEnd="url(#ah-sage)" />
      <T x={344} y={300} anchor="start" size={14} fill={SAGE} show={L}>
        Transmitted light (increases)
      </T>
    </g>
  ),
}

// ── Varifocal zones ───────────────────────────────────────────────────

const palZones: DiagramDef = {
  viewBox: [670, 372],
  caption: 'Temporary ink markings (circles, cross, dot) wipe off; the two engravings are permanent, about 17 mm either side of the prism reference point.',
  render: (L) => {
    const cx = 260
    return (
      <g>
        <Arrowheads />
        <defs>
          <clipPath id="pal-lens">
            <ellipse cx={262} cy={192} rx={206} ry={158} />
          </clipPath>
        </defs>
        {/* lens outline */}
        <ellipse cx={262} cy={192} rx={206} ry={158} fill="#fbf7f4" />
        {/* distortion zones either side of the corridor */}
        <g clipPath="url(#pal-lens)">
          <path d="M40 236 C 120 206, 196 226, 226 300 C 232 330, 200 360, 150 362 L 40 362 Z" fill="#e5daf5" opacity={0.85} />
          <path d="M484 236 C 404 206, 318 226, 290 300 C 284 330, 316 360, 366 362 L 484 362 Z" fill="#e5daf5" opacity={0.85} />
        </g>
        <ellipse cx={262} cy={192} rx={206} ry={158} fill="none" stroke={INK} strokeWidth={1.8} />
        {/* corridor: narrow below the fitting cross, opening into the near zone */}
        <path
          d={`M${cx - 12} 162 C ${cx - 6} 200, ${cx - 8} 236, ${cx - 42} 292 Q ${cx - 12} 310 ${cx + 18} 292 C ${cx + 4} 236, ${cx + 6} 200, ${cx + 12} 162 Z`}
          fill="#d9f0e3"
          opacity={0.9}
          stroke={SAGE}
          strokeWidth={1.2}
        />
        {/* DRP */}
        <circle cx={cx} cy={92} r={26} fill="none" stroke={SKY} strokeWidth={2} />
        {/* fitting cross */}
        <g stroke={ROSE} strokeWidth={2.4} strokeLinecap="round">
          <line x1={cx - 14} y1={146} x2={cx + 14} y2={146} />
          <line x1={cx} y1={132} x2={cx} y2={160} />
        </g>
        {/* PRP + engravings on the horizontal line */}
        <line x1={110} y1={182} x2={410} y2={182} stroke={MUTED} strokeWidth={1} strokeDasharray="3 5" />
        <circle cx={cx} cy={182} r={4.5} fill={INK} />
        <circle cx={130} cy={182} r={8} fill="none" stroke={MUTED} strokeWidth={1.5} />
        <circle cx={390} cy={182} r={8} fill="none" stroke={MUTED} strokeWidth={1.5} />
        <T x={390} y={202} size={11} weight={600} fill={MUTED}>
          20
        </T>
        {/* NRP, inset nasally */}
        <circle cx={cx - 12} cy={300} r={24} fill="none" stroke={SKY} strokeWidth={2} />
        {/* labels on the right */}
        {L && (
          <g fontSize={13} fontWeight={600}>
            {[
              [92, 'Distance reference point', SKY, cx + 26],
              [146, 'Fitting cross', ROSE, cx + 16],
              [182, 'Prism reference point', INK, cx + 6],
              [240, 'Progressive corridor', SAGE, cx + 12],
              [300, 'Near reference point', SKY, cx + 12],
            ].map(([y, text, colour, from]) => (
              <g key={text as string}>
                <line x1={from as number} y1={y as number} x2={476} y2={y as number} stroke={colour as string} strokeWidth={1} opacity={0.6} />
                <T x={484} y={y as number} anchor="start" size={13} fill={colour as string}>
                  {text}
                </T>
              </g>
            ))}
            <T x={484} y={336} anchor="start" size={13} fill={LILAC}>
              Peripheral distortion
            </T>
            <line x1={392} y1={300} x2={476} y2={336} stroke={LILAC} strokeWidth={1} opacity={0.6} />
            <T x={130} y={160} size={13} fill={MUTED} anchor="middle">
              Engravings
            </T>
          </g>
        )}
      </g>
    )
  },
}

export const DIAGRAMS: Record<string, DiagramDef> = {
  ...MORE_DIAGRAMS,
  'boxing-system': boxing,
  'pd-measurement': pd,
  prentice,
  'materials-chart': materials,
  'ar-interference': arCoating,
  'pal-zones': palZones,
}
