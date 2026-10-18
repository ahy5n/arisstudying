// Diagrams for the modules beyond AaD. Same contract as Diagrams.tsx:
// keyed by `diagram.id`, drawn labelled or blank (with `spots` for the
// label-the-diagram exercise).

import type { ReactNode } from 'react'
import {
  Arrowheads,
  BUTTER,
  BUTTER_INK,
  type DiagramDef,
  Dim,
  INK,
  LILAC,
  LILAC_SOFT,
  MUTED,
  ROSE,
  ROSE_SOFT,
  SAGE,
  SAGE_SOFT,
  SKY,
  SKY_SOFT,
  T,
} from './kit'

const DARK = '#1f1b24'

function Box({
  x,
  y,
  w,
  h,
  fill,
  stroke,
  r = 12,
  children,
}: {
  x: number
  y: number
  w: number
  h: number
  fill: string
  stroke?: string
  r?: number
  children?: ReactNode
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={stroke ? 1.5 : 0} />
      {children}
    </g>
  )
}

/** Leader line from a point to a label. */
function Lead({ x1, y1, x2, y2, colour = MUTED }: { x1: number; y1: number; x2: number; y2: number; colour?: string }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={1} opacity={0.7} />
}

// ── AaM ───────────────────────────────────────────────────────────────

const retReflex: DiagramDef = {
  viewBox: [660, 250],
  caption: 'Sweep the streak across the pupil and watch the reflex inside it.',
  render: (L) => {
    const panel = (cx: number, kind: 'with' | 'against' | 'neutral') => (
      <g key={kind}>
        <circle cx={cx} cy={110} r={62} fill={DARK} />
        {kind === 'neutral' ? (
          <circle cx={cx} cy={110} r={56} fill="#f2a64a" opacity={0.9} />
        ) : (
          <rect x={cx - 34} y={52} width={30} height={116} rx={4} fill="#f2a64a" opacity={0.9} transform={`rotate(0 ${cx} 110)`} />
        )}
        <circle cx={cx} cy={110} r={62} fill="none" stroke={INK} strokeWidth={2} />
        {kind !== 'neutral' && (
          <>
            <line x1={cx - 50} y1={200} x2={cx + 50} y2={200} stroke={SKY} strokeWidth={2.4} markerEnd="url(#ah-sky)" />
            <T x={cx} y={218} size={12} weight={500} fill={SKY} show={L}>
              streak moves →
            </T>
            <line
              x1={kind === 'with' ? cx - 14 : cx + 6}
              y1={30}
              x2={kind === 'with' ? cx + 26 : cx - 34}
              y2={30}
              stroke={ROSE}
              strokeWidth={2.4}
              markerEnd="url(#ah-rose)"
            />
            <T x={cx} y={14} size={12} weight={500} fill={ROSE} show={L}>
              {kind === 'with' ? 'reflex moves the same way' : 'reflex moves the opposite way'}
            </T>
          </>
        )}
        <T x={cx} y={240} size={14} fill={INK} show={L}>
          {kind === 'with' ? 'With → add plus' : kind === 'against' ? 'Against → add minus' : 'Neutral: filled, no movement'}
        </T>
      </g>
    )
    return (
      <g>
        <Arrowheads />
        {panel(110, 'with')}
        {panel(330, 'against')}
        {panel(550, 'neutral')}
      </g>
    )
  },
}

const duochrome: DiagramDef = {
  viewBox: [660, 270],
  caption: 'Green focuses in front of red (longitudinal chromatic aberration). Aim for the retina between them.',
  render: (L) => {
    const GREEN = '#2f8a55'
    const RED = '#c0392b'
    const panel = (ox: number, title: string, g: number, r: number, verdict: string) => (
      <g key={title}>
        <T x={ox + 100} y={20} size={14} fill={INK} show={L}>
          {title}
        </T>
        {/* lens */}
        <path d={`M${ox + 20} 60 Q ${ox + 34} 130 ${ox + 20} 200 Q ${ox + 6} 130 ${ox + 20} 60 Z`} fill={SKY_SOFT} stroke={SKY} strokeWidth={1.5} />
        {/* rays to each focus */}
        <path d={`M${ox + 20} 70 L ${ox + g} 130 M${ox + 20} 190 L ${ox + g} 130`} stroke={GREEN} strokeWidth={1.8} fill="none" />
        <path d={`M${ox + 20} 76 L ${ox + r} 130 M${ox + 20} 184 L ${ox + r} 130`} stroke={RED} strokeWidth={1.8} fill="none" strokeDasharray="5 3" />
        <circle cx={ox + g} cy={130} r={4.5} fill={GREEN} />
        <circle cx={ox + r} cy={130} r={4.5} fill={RED} />
        {/* retina */}
        <line x1={ox + 140} y1={60} x2={ox + 140} y2={200} stroke={INK} strokeWidth={3} />
        <T x={ox + 140} y={50} size={11} weight={500} fill={MUTED} show={L}>
          retina
        </T>
        <T x={ox + 100} y={232} size={13} fill={INK} show={L}>
          {verdict}
        </T>
      </g>
    )
    return (
      <g>
        {panel(0, 'Under-minused', 100, 124, 'Red clearer → add −0.25')}
        {panel(220, 'Balanced', 128, 152, 'Equal → done')}
        {panel(440, 'Over-minused', 158, 182, 'Green clearer → add +0.25')}
      </g>
    )
  },
}

const rangeClearVision: DiagramDef = {
  viewBox: [720, 230],
  caption: 'Example: 52-year-old with 1.50 D amplitude. With +1.75 the range is about 31–57 cm; with +2.50 it shrinks to about 25–40 cm.',
  render: (L) => {
    const x0 = 60
    const sx = (cm: number) => x0 + cm * 9
    return (
      <g>
        <Arrowheads />
        <circle cx={34} cy={110} r={20} fill="white" stroke={INK} strokeWidth={1.8} />
        <circle cx={44} cy={110} r={7} fill={SKY} />
        <line x1={x0} y1={170} x2={sx(65)} y2={170} stroke={INK} strokeWidth={1.3} markerEnd="url(#ah)" />
        {[0, 10, 20, 30, 40, 50, 60].map((cm) => (
          <g key={cm}>
            <line x1={sx(cm)} y1={166} x2={sx(cm)} y2={174} stroke={INK} />
            <T x={sx(cm)} y={190} size={12} weight={500} fill={MUTED}>
              {`${cm}`}
            </T>
          </g>
        ))}
        <T x={sx(65)} y={190} size={12} weight={500} fill={MUTED} anchor="end">
          cm
        </T>
        <rect x={sx(31)} y={78} width={sx(57) - sx(31)} height={22} rx={11} fill={SAGE_SOFT} stroke={SAGE} strokeWidth={1.5} />
        <T x={sx(57) + 10} y={89} anchor="start" size={13} fill={SAGE} show={L}>
          +1.75 add: 31–57 cm
        </T>
        <rect x={sx(25)} y={120} width={sx(40) - sx(25)} height={22} rx={11} fill={ROSE_SOFT} stroke={ROSE} strokeWidth={1.5} />
        <T x={sx(25) - 10} y={131} anchor="end" size={13} fill={ROSE} show={L}>
          +2.50 add: 25–40 cm
        </T>
        <line x1={sx(40)} y1={40} x2={sx(40)} y2={166} stroke={LILAC} strokeWidth={2} strokeDasharray="5 4" />
        <T x={sx(40)} y={28} size={13} fill={LILAC} show={L}>
          working distance 40 cm
        </T>
      </g>
    )
  },
}

const prismDissociation: DiagramDef = {
  viewBox: [660, 250],
  caption: 'Images move towards the prism apex: base up before the right eye pushes its image down.',
  render: (L) => (
    <g>
      <Box x={150} y={30} w={300} h={180} fill="white" stroke={INK} r={10} />
      <text x={300} y={92} textAnchor="middle" fontSize={34} fontWeight={700} fill={INK} letterSpacing={10}>
        E H N
      </text>
      <text x={300} y={168} textAnchor="middle" fontSize={34} fontWeight={700} fill={INK} letterSpacing={10}>
        E H N
      </text>
      <Lead x1={450} y1={82} x2={480} y2={82} />
      <Lead x1={450} y1={158} x2={480} y2={158} />
      <T x={486} y={74} anchor="start" size={13} fill={LILAC} show={L}>
        Upper image
      </T>
      <T x={486} y={92} anchor="start" size={12} weight={500} fill={MUTED} show={L}>
        left eye (3Δ base down)
      </T>
      <T x={486} y={150} anchor="start" size={13} fill={ROSE} show={L}>
        Lower image
      </T>
      <T x={486} y={168} anchor="start" size={12} weight={500} fill={MUTED} show={L}>
        right eye (3Δ base up)
      </T>
      <T x={300} y={236} size={13} fill={INK} show={L}>
        Patient compares the two lines under +0.75 fog
      </T>
    </g>
  ),
}

// ── CLB ───────────────────────────────────────────────────────────────

const rgpFluorescein: DiagramDef = {
  viewBox: [660, 270],
  caption: 'Under cobalt blue with a yellow barrier filter: green = tear layer (clearance), dark = touch.',
  render: (L) => {
    const FL = '#8ef0a0'
    const panel = (cx: number, id: string, title: string, stops: [number, number][], edge: number) => (
      <g key={id}>
        <defs>
          <radialGradient id={id}>
            {stops.map(([o, a], i) => (
              <stop key={i} offset={`${o}%`} stopColor={FL} stopOpacity={a} />
            ))}
          </radialGradient>
        </defs>
        <circle cx={cx} cy={120} r={96} fill="#1d2552" />
        <circle cx={cx} cy={120} r={80} fill={`url(#${id})`} />
        <circle cx={cx} cy={120} r={80 - edge / 2} fill="none" stroke={FL} strokeWidth={edge} opacity={0.95} />
        <circle cx={cx} cy={120} r={80} fill="none" stroke="#c9d4ff" strokeWidth={1} opacity={0.5} />
        <T x={cx} y={240} size={14} fill={INK} show={L}>
          {title}
        </T>
      </g>
    )
    return (
      <g>
        {panel(110, 'rgp-align', 'Alignment', [[0, 0.35], [70, 0.3], [88, 0.12], [100, 0.1]], 9)}
        {panel(330, 'rgp-steep', 'Steep: central pooling', [[0, 0.95], [45, 0.6], [70, 0.05], [90, 0.05], [100, 0.1]], 5)}
        {panel(550, 'rgp-flat', 'Flat: central touch', [[0, 0.02], [40, 0.04], [65, 0.25], [100, 0.5]], 22)}
      </g>
    )
  },
}

const vertexDistance: DiagramDef = {
  viewBox: [660, 260],
  caption: 'Fc = F / (1 − dF), d in metres. E.g. −6.00 D spectacles at 12 mm ≈ −5.50 D contact lens.',
  render: (L) => (
    <g>
      <Arrowheads />
      {/* eye */}
      <path d="M470 50 A 110 110 0 1 1 470 210" fill={ROSE_SOFT} stroke={INK} strokeWidth={1.8} />
      <path d="M470 50 Q 430 130 470 210" fill="white" stroke={INK} strokeWidth={1.8} />
      {/* contact lens */}
      <path d="M474 60 Q 436 130 474 200" fill="none" stroke={SAGE} strokeWidth={4} />
      <T x={430} y={36} size={13} fill={SAGE} show={L}>
        Contact lens (on the cornea)
      </T>
      {/* spectacle lens */}
      <path d="M330 70 L 342 70 L 336 130 L 342 190 L 330 190 L 336 130 Z" fill={SKY_SOFT} stroke={SKY} strokeWidth={1.8} />
      <T x={336} y={52} size={13} fill={SKY} show={L}>
        Spectacle lens
      </T>
      <Dim x1={338} y1={222} x2={450} y2={222} colour={LILAC} id="ah-lilac" />
      <T x={394} y={240} size={13} fill={LILAC} show={L}>
        vertex distance d (e.g. 12 mm)
      </T>
      <line x1={20} y1={130} x2={600} y2={130} stroke={MUTED} strokeWidth={1} strokeDasharray="4 5" />
      <T x={150} y={100} size={13} fill={INK} show={L}>
        −6.00 D at 12 mm
      </T>
      <T x={150} y={160} size={13} fill={INK} show={L}>
        → about −5.50 D as a CL
      </T>
    </g>
  ),
}

// ── AnE ───────────────────────────────────────────────────────────────

const vanHerick: DiagramDef = {
  viewBox: [680, 330],
  caption: 'Optic section at the limbus, low magnification, illumination at about 60°. Compare the dark gap (peripheral AC) with the corneal section (CT).',
  render: (L) => {
    const grades: [number, string, string][] = [
      [1.0, 'Grade 4', '1:1 wide open'],
      [0.5, 'Grade 3', '1:½ open'],
      [0.25, 'Grade 2', '1:¼ narrow'],
      [0.12, 'Grade 1', '< ¼ dangerously narrow'],
    ]
    const CT = 34
    return (
      <g>
        {grades.map(([ratio, g, txt], i) => {
          const ox = 20 + i * 165
          const cx = ox + 36
          const gap = ratio * CT
          return (
            <g key={g}>
              <rect x={ox} y={30} width={150} height={220} rx={14} fill={DARK} />
              {/* corneal section */}
              <path d={`M${cx} 50 L ${cx + CT} 50 L ${cx + CT - 12} 230 L ${cx - 12} 230 Z`} fill="#e9f2fc" opacity={0.95} />
              {/* iris band */}
              <path
                d={`M${cx + CT + gap} 50 L ${cx + CT + gap + 40} 50 L ${cx + CT + gap + 28} 230 L ${cx + CT + gap - 12} 230 Z`}
                fill="#e2b98f"
                opacity={0.95}
              />
              {i === 0 && L && (
                <g>
                  <line x1={cx} y1={42} x2={cx + CT} y2={42} stroke="#ffffff" strokeWidth={1.5} />
                  <text x={cx + CT / 2} y={36} textAnchor="middle" fontSize={12} fontWeight={700} fill="#ffffff">
                    CT
                  </text>
                  <line x1={cx + CT} y1={258} x2={cx + CT + gap} y2={258} stroke={INK} strokeWidth={1.5} />
                  <text x={cx + CT + gap / 2} y={272} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK}>
                    AC
                  </text>
                  <text x={cx + CT + gap + 46} y={140} fontSize={11} fontWeight={600} fill="#ffffff">
                    iris
                  </text>
                </g>
              )}
              <T x={ox + 75} y={292} size={15} fill={INK}>
                {g}
              </T>
              <T x={ox + 75} y={312} size={13} weight={500} fill={MUTED}>
                {txt}
              </T>
            </g>
          )
        })}
      </g>
    )
  },
}

const tearFilm: DiagramDef = {
  viewBox: [640, 300],
  spots: {
    'Lipid layer (meibomian glands)': { x: 120, y: 54 },
    'Aqueous layer (lacrimal gland)': { x: 120, y: 120 },
    'Mucin layer (goblet cells)': { x: 120, y: 186 },
    'Corneal epithelium': { x: 120, y: 240 },
  },
  render: (L) => {
    const wave = (y: number, amp: number) => {
      let d = `M40 ${y}`
      for (let x = 40; x <= 400; x += 20) d += ` Q ${x + 10} ${y + (x % 40 === 0 ? amp : -amp)} ${x + 20} ${y}`
      return d
    }
    return (
      <g>
        <rect x={40} y={44} width={380} height={20} fill={BUTTER} stroke={BUTTER_INK} strokeWidth={1.2} />
        <rect x={40} y={64} width={380} height={110} fill={SKY_SOFT} stroke={SKY} strokeWidth={1.2} />
        <path d={`${wave(174, 5)} L 420 200 L 40 200 Z`} fill={LILAC_SOFT} stroke={LILAC} strokeWidth={1.2} />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={42 + i * 38} y={204} width={34} height={56} rx={10} fill={ROSE_SOFT} stroke={ROSE} strokeWidth={1.2} />
        ))}
        {L && (
          <g>
            <Lead x1={420} y1={54} x2={440} y2={54} />
            <T x={446} y={54} anchor="start" size={13} fill={BUTTER_INK}>
              Lipid (meibomian glands)
            </T>
            <Lead x1={420} y1={120} x2={440} y2={120} />
            <T x={446} y={120} anchor="start" size={13} fill={SKY}>
              Aqueous (lacrimal gland)
            </T>
            <Lead x1={420} y1={186} x2={440} y2={186} />
            <T x={446} y={186} anchor="start" size={13} fill={LILAC}>
              Mucin (goblet cells)
            </T>
            <Lead x1={420} y1={232} x2={440} y2={232} />
            <T x={446} y={232} anchor="start" size={13} fill={ROSE}>
              Corneal epithelium
            </T>
            <T x={230} y={24} size={12} weight={500} fill={MUTED}>
              air
            </T>
          </g>
        )}
      </g>
    )
  },
}

const cornealZones: DiagramDef = {
  viewBox: [580, 320],
  caption: 'A common five-zone layout for recording corneal staining (grade each zone).',
  render: (L) => {
    const cx = 170
    const cy = 160
    const R = 130
    const r = 52
    const seg = (a0: number, a1: number) => {
      const p = (a: number, rad: number) => [cx + rad * Math.cos((a * Math.PI) / 180), cy + rad * Math.sin((a * Math.PI) / 180)]
      const [x1, y1] = p(a0, R)
      const [x2, y2] = p(a1, R)
      const [x3, y3] = p(a1, r)
      const [x4, y4] = p(a0, r)
      return `M${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 0 0 ${x4} ${y4} Z`
    }
    const zones: [number, number, string, string][] = [
      [-135, -45, 'Superior', SKY_SOFT],
      [-45, 45, 'Temporal', SAGE_SOFT],
      [45, 135, 'Inferior', BUTTER],
      [135, 225, 'Nasal', LILAC_SOFT],
    ]
    return (
      <g>
        {zones.map(([a0, a1, , fill]) => (
          <path key={a0} d={seg(a0, a1)} fill={fill} stroke={INK} strokeWidth={1.2} />
        ))}
        <circle cx={cx} cy={cy} r={r} fill={ROSE_SOFT} stroke={INK} strokeWidth={1.2} />
        {[[150, 226], [168, 234], [186, 230], [140, 218], [200, 220], [175, 222]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3} fill="#2f8a55" />
        ))}
        {L && (
          <g>
            <T x={cx} y={cy} size={13}>
              Central
            </T>
            <T x={cx} y={cy - 92} size={13}>
              Superior
            </T>
            <T x={cx} y={cy + 92} size={13}>
              Inferior
            </T>
            <T x={cx - 92} y={cy} size={13}>
              Nasal
            </T>
            <T x={cx + 92} y={cy} size={13}>
              Temporal
            </T>
            <Lead x1={204} y1={224} x2={330} y2={270} />
            <T x={336} y={270} anchor="start" size={13} fill="#2f8a55">
              e.g. inferior punctate staining
            </T>
            <T x={336} y={70} anchor="start" size={12} weight={500} fill={MUTED}>
              (left eye, as you look at it:
            </T>
            <T x={336} y={88} anchor="start" size={12} weight={500} fill={MUTED}>
              nasal on your left)
            </T>
          </g>
        )}
      </g>
    )
  },
}

// ── PEG ───────────────────────────────────────────────────────────────

const opticDisc: DiagramDef = {
  viewBox: [660, 340],
  spots: {
    'Disc margin': { x: 72, y: 178 },
    Cup: { x: 160, y: 164 },
    'Neuroretinal rim': { x: 150, y: 270 },
    Notch: { x: 504, y: 252 },
    'Disc haemorrhage': { x: 470, y: 298 },
  },
  caption: 'Right disc as seen in the fundus (temporal on the left). Normal rim follows ISNT: Inferior ≥ Superior ≥ Nasal ≥ Temporal.',
  render: (L) => {
    const disc = (cx: number, cy: number, notch: boolean) => (
      <g>
        <ellipse cx={cx} cy={cy} rx={108} ry={122} fill="#f4c7a1" stroke="#c98d63" strokeWidth={2} />
        {notch ? (
          <path
            d={`M${cx - 70} ${cy - 10} C ${cx - 70} ${cy - 70}, ${cx + 30} ${cy - 76}, ${cx + 40} ${cy - 20} C ${cx + 46} ${cy + 20}, ${cx + 18} ${cy + 50}, ${cx + 14} ${cy + 110} L ${cx - 6} ${cy + 112} C ${cx - 14} ${cy + 60}, ${cx - 70} ${cy + 40}, ${cx - 70} ${cy - 10} Z`}
            fill="#fbe9d6"
            stroke="#e0b48c"
            strokeWidth={1.5}
          />
        ) : (
          <ellipse cx={cx - 20} cy={cy - 14} rx={56} ry={62} fill="#fbe9d6" stroke="#e0b48c" strokeWidth={1.5} />
        )}
        {/* vessels emerging from the cup and bending over the rim */}
        {[
          `M${cx + 10} ${cy - 20} C ${cx + 20} ${cy - 70}, ${cx + 10} ${cy - 110}, ${cx - 40} ${cy - 150}`,
          `M${cx + 10} ${cy - 10} C ${cx + 26} ${cy + 50}, ${cx + 14} ${cy + 100}, ${cx - 40} ${cy + 150}`,
          `M${cx + 14} ${cy - 16} C ${cx + 60} ${cy - 40}, ${cx + 100} ${cy - 60}, ${cx + 140} ${cy - 100}`,
          `M${cx + 14} ${cy - 4} C ${cx + 60} ${cy + 20}, ${cx + 100} ${cy + 50}, ${cx + 140} ${cy + 90}`,
        ].map((d, i) => (
          <path key={i} d={d} fill="none" stroke={i % 2 ? '#a8343a' : '#cc5a50'} strokeWidth={i % 2 ? 6 : 4.5} strokeLinecap="round" />
        ))}
      </g>
    )
    return (
      <g>
        <defs>
          <clipPath id="disc-clip-a">
            <circle cx={180} cy={178} r={138} />
          </clipPath>
          <clipPath id="disc-clip-b">
            <circle cx={500} cy={178} r={138} />
          </clipPath>
        </defs>
        <g clipPath="url(#disc-clip-a)">{disc(180, 178, false)}</g>
        <g clipPath="url(#disc-clip-b)">{disc(500, 178, true)}</g>
        {/* flame haemorrhage at the inferior margin of the notched disc */}
        <path d="M468 286 q 8 10 2 22 q -10 -8 -2 -22 Z" fill="#b3202a" />
        {L && (
          <g>
            <T x={180} y={22} size={14} fill={INK}>
              Healthy disc
            </T>
            <T x={500} y={22} size={14} fill={INK}>
              Glaucomatous changes
            </T>
            <T x={140} y={84} size={13} fill={INK}>
              S
            </T>
            <T x={140} y={276} size={13} fill={INK}>
              I
            </T>
            <T x={88} y={178} size={13} fill={INK}>
              T
            </T>
            <T x={270} y={178} size={13} fill={INK}>
              N
            </T>
            <T x={150} y={164} size={12} weight={600} fill={ROSE}>
              cup
            </T>
            <Lead x1={514} y1={270} x2={600} y2={306} />
            <T x={604} y={306} anchor="start" size={12} fill={ROSE}>
              notch
            </T>
            <Lead x1={462} y1={298} x2={400} y2={322} />
            <T x={396} y={322} anchor="end" size={12} fill="#b3202a">
              disc haemorrhage
            </T>
          </g>
        )}
      </g>
    )
  },
}

/** A schematic right fundus used by several diagrams. Disc on the right (nasal). */
function FundusBase({ id }: { id: string }) {
  const disc = { x: 440, y: 190 }
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-bg`} cx="45%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#f5c9a2" />
          <stop offset="80%" stopColor="#e9a77c" />
          <stop offset="100%" stopColor="#d98d63" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx={320} cy={190} r={170} />
        </clipPath>
      </defs>
      <circle cx={320} cy={190} r={170} fill={`url(#${id}-bg)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {/* arcades: veins darker/wider, arteries lighter/thinner */}
        {[
          [`M${disc.x} ${disc.y - 8} C 400 110, 300 70, 170 80`, 'v'],
          [`M${disc.x} ${disc.y + 8} C 400 270, 300 310, 170 300`, 'v'],
          [`M${disc.x - 4} ${disc.y - 14} C 390 120, 290 90, 160 110`, 'a'],
          [`M${disc.x - 4} ${disc.y + 14} C 390 260, 290 290, 160 270`, 'a'],
          [`M${disc.x + 6} ${disc.y - 10} C 470 140, 500 100, 520 60`, 'v'],
          [`M${disc.x + 6} ${disc.y + 10} C 470 240, 500 280, 520 320`, 'v'],
          [`M${disc.x + 2} ${disc.y - 16} C 460 130, 480 100, 500 60`, 'a'],
          [`M${disc.x + 2} ${disc.y + 16} C 460 250, 480 280, 500 320`, 'a'],
        ].map(([d, k], i) => (
          <path key={i} d={d} fill="none" stroke={k === 'v' ? '#9e2f35' : '#cf5f55'} strokeWidth={k === 'v' ? 6 : 4} strokeLinecap="round" />
        ))}
        <ellipse cx={disc.x} cy={disc.y} rx={30} ry={34} fill="#fbe2c2" stroke="#e7b98d" strokeWidth={1.5} />
        <ellipse cx={disc.x - 5} cy={disc.y - 3} rx={12} ry={14} fill="#fff4e6" />
        {/* macula and fovea */}
        <circle cx={250} cy={196} r={44} fill="#c9784f" opacity={0.35} />
        <circle cx={250} cy={196} r={6} fill="#8a4a2e" />
      </g>
      <circle cx={320} cy={190} r={170} fill="none" stroke={INK} strokeWidth={1.5} />
    </g>
  )
}

const normalFundus: DiagramDef = {
  viewBox: [660, 380],
  spots: {
    'Optic disc': { x: 440, y: 190 },
    Macula: { x: 222, y: 168 },
    Fovea: { x: 250, y: 196 },
    Artery: { x: 330, y: 103 },
    Vein: { x: 300, y: 296 },
  },
  caption: 'Right eye. Disc about two disc diameters nasal to the fovea; arteries thinner and lighter than veins (about 2:3).',
  render: (L) => (
    <g>
      <FundusBase id="nf" />
      {L && (
        <g>
          <Lead x1={470} y1={190} x2={560} y2={190} />
          <T x={566} y={190} anchor="start" size={13}>
            Optic disc
          </T>
          <Lead x1={250} y1={196} x2={120} y2={360} />
          <T x={116} y={360} anchor="end" size={13}>
            Fovea
          </T>
          <Lead x1={216} y1={170} x2={60} y2={150} />
          <T x={56} y={150} anchor="end" size={13}>
            Macula
          </T>
          <Lead x1={330} y1={103} x2={360} y2={20} />
          <T x={366} y={20} anchor="start" size={13} fill="#cf5f55">
            Artery (thinner, lighter)
          </T>
          <Lead x1={300} y1={300} x2={360} y2={366} />
          <T x={366} y={366} anchor="start" size={13} fill="#9e2f35">
            Vein (wider, darker)
          </T>
        </g>
      )}
    </g>
  ),
}

const diabeticRetinopathy: DiagramDef = {
  viewBox: [740, 380],
  spots: {
    Microaneurysm: { x: 300, y: 230 },
    'Blot haemorrhage': { x: 200, y: 250 },
    'Hard exudate': { x: 276, y: 172 },
    'Cotton wool spot': { x: 338, y: 128 },
    NVD: { x: 440, y: 190 },
  },
  caption: 'Signs in rough order of severity: microaneurysms → haemorrhages and exudates → cotton wool spots, venous beading, IRMA → new vessels.',
  render: (L) => (
    <g>
      <FundusBase id="dr" />
      {/* microaneurysms */}
      {[[300, 230], [312, 214], [282, 244], [214, 150], [330, 250]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.6} fill="#8f1d24" />
      ))}
      {/* blot haemorrhages */}
      {[[200, 250], [176, 168], [356, 280]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={8} fill="#a3252d" opacity={0.9} />
      ))}
      {/* hard exudates near the macula */}
      {[[276, 172], [284, 178], [270, 182], [290, 168], [278, 186], [268, 170]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.4} fill="#f7e27a" stroke="#c9a92a" strokeWidth={0.8} />
      ))}
      {/* cotton wool spots */}
      {[[338, 128], [370, 252]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={13} ry={9} fill="#fffaf0" opacity={0.92} />
      ))}
      {/* venous beading on the inferior vein */}
      {[[350, 288], [334, 293], [318, 297]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5.5} fill="#9e2f35" />
      ))}
      {/* IRMA */}
      <path d="M220 110 q 6 -8 12 0 q 6 8 12 0 q 6 -8 12 0" fill="none" stroke="#b73b3b" strokeWidth={1.4} />
      {/* NVD: fine new vessels on the disc */}
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path
          key={a}
          d={`M440 190 q ${16 * Math.cos((a * Math.PI) / 180)} ${16 * Math.sin((a * Math.PI) / 180) - 10} ${28 * Math.cos((a * Math.PI) / 180)} ${28 * Math.sin((a * Math.PI) / 180)}`}
          fill="none"
          stroke="#c0283a"
          strokeWidth={1.3}
        />
      ))}
      {L && (
        <g>
          <Lead x1={300} y1={230} x2={540} y2={330} />
          <T x={546} y={330} anchor="start" size={13}>
            Microaneurysms
          </T>
          <Lead x1={200} y1={250} x2={130} y2={346} />
          <T x={126} y={356} anchor="end" size={13}>
            Blot haemorrhage
          </T>
          <Lead x1={270} y1={170} x2={120} y2={60} />
          <T x={116} y={56} anchor="end" size={13}>
            Hard exudates
          </T>
          <Lead x1={338} y1={120} x2={420} y2={30} />
          <T x={426} y={30} anchor="start" size={13}>
            Cotton wool spot
          </T>
          <Lead x1={334} y1={293} x2={420} y2={362} />
          <T x={426} y={362} anchor="start" size={13}>
            Venous beading
          </T>
          <Lead x1={238} y1={108} x2={160} y2={24} />
          <T x={156} y={22} anchor="end" size={13}>
            IRMA
          </T>
          <Lead x1={466} y1={180} x2={540} y2={150} />
          <T x={546} y={150} anchor="start" size={13}>
            NVD (new vessels at disc)
          </T>
        </g>
      )}
    </g>
  ),
}

const gatMires: DiagramDef = {
  viewBox: [660, 250],
  caption: 'Turn the dial until the inner edges of the two semicircles just touch. Dial reading × 10 = IOP in mmHg.',
  render: (L) => {
    const FL = '#7fe08f'
    const panel = (cx: number, s: number, title: string) => {
      const R = 40
      const t = 9
      return (
        <g key={title}>
          <circle cx={cx} cy={110} r={92} fill="#1d2552" />
          <line x1={cx - 92} y1={110} x2={cx + 92} y2={110} stroke="#c9d4ff" strokeWidth={0.8} opacity={0.5} />
          {/* upper semicircle (shifted left), lower semicircle (shifted right) */}
          <path d={`M${cx - s - R} 110 A ${R} ${R} 0 0 1 ${cx - s + R} 110`} fill="none" stroke={FL} strokeWidth={t} />
          <path d={`M${cx + s - R} 110 A ${R} ${R} 0 0 0 ${cx + s + R} 110`} fill="none" stroke={FL} strokeWidth={t} />
          <T x={cx} y={226} size={14} fill={INK} show={L}>
            {title}
          </T>
        </g>
      )
    }
    return (
      <g>
        {panel(110, 52, 'Too little force: apart')}
        {panel(330, 35.5, 'End point: inner edges touch')}
        {panel(550, 20, 'Too much force: overlap')}
      </g>
    )
  },
}

const octMacula: DiagramDef = {
  viewBox: [700, 320],
  caption: 'Simplified layer order (vitreous at the top). Inner layers thin out to form the foveal pit.',
  render: (L) => {
    const x0 = 30
    const x1 = 470
    const pit = (x: number) => Math.exp(-(((x - 250) / 52) ** 2))
    // [name, base thickness, thins at fovea?, colour]
    const layers: [string, number, boolean, string][] = [
      ['RNFL', 16, true, '#f2f2f2'],
      ['Ganglion cell layer', 18, true, '#8c8c8c'],
      ['Inner plexiform', 14, true, '#d6d6d6'],
      ['Inner nuclear', 16, true, '#6f6f6f'],
      ['Outer plexiform', 10, true, '#cfcfcf'],
      ['Outer nuclear', 34, false, '#4b4b4b'],
      ['Ellipsoid zone', 8, false, '#f0f0f0'],
      ['RPE', 10, false, '#ffffff'],
      ['Choroid', 40, false, '#5d5d5d'],
    ]
    const top = (x: number) => 70 + 46 * pit(x)
    const paths: ReactNode[] = []
    const label: { name: string; y: number; colour: string }[] = []
    let prev = (x: number) => top(x)
    layers.forEach(([name, th, thins, colour]) => {
      const prevF = prev
      const cur = (x: number) => prevF(x) + th * (thins ? 1 - 0.92 * pit(x) : 1)
      let d = `M${x0} ${prevF(x0)}`
      for (let x = x0; x <= x1; x += 6) d += ` L ${x} ${prevF(x).toFixed(1)}`
      for (let x = x1; x >= x0; x -= 6) d += ` L ${x} ${cur(x).toFixed(1)}`
      d += ' Z'
      paths.push(<path key={name} d={d} fill={colour} />)
      label.push({ name, y: (prevF(x1) + cur(x1)) / 2, colour })
      prev = cur
    })
    return (
      <g>
        <rect x={x0} y={20} width={x1 - x0} height={290} fill="#151515" />
        {paths}
        {L && (
          <g>
            <text x={250} y={40} textAnchor="middle" fontSize={12} fontWeight={600} fill="#ffffff">
              vitreous
            </text>
            <Lead x1={250} y1={112} x2={250} y2={50} colour="#ffffff" />
            {label.map((l, i) => {
              const ly = 40 + i * 30
              return (
                <g key={l.name}>
                  <Lead x1={x1} y1={l.y} x2={500} y2={ly} />
                  <T x={506} y={ly} anchor="start" size={13}>
                    {l.name}
                  </T>
                </g>
              )
            })}
            <text x={300} y={104} fontSize={11} fontWeight={600} fill="#ffffff">
              foveal pit
            </text>
          </g>
        )}
      </g>
    )
  },
}

// ── SyD ───────────────────────────────────────────────────────────────

const visualPathway: DiagramDef = {
  viewBox: [850, 420],
  caption: 'Viewed from above; lesions shown on the right-hand pathway. Fields drawn as the patient sees them (left eye field on the left).',
  render: (L) => {
    const field = (cx: number, cy: number, shade: string | null, spare = false) => {
      const r = 20
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="white" stroke={MUTED} strokeWidth={1.3} />
          {shade && <path d={shade} fill="#4a4350" opacity={0.85} />}
          {spare && <circle cx={cx} cy={cy} r={6} fill="white" />}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={MUTED} strokeWidth={1.3} />
        </g>
      )
    }
    const r = 20
    const full = (cx: number, cy: number) => `M${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`
    const leftHalf = (cx: number, cy: number) => `M${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`
    const rightHalf = (cx: number, cy: number) => `M${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`
    const upperLeft = (cx: number, cy: number) => `M${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx - r} ${cy} Z`
    const lowerLeft = (cx: number, cy: number) => `M${cx} ${cy} L ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`
    const rows: { n: number; text: string; le: (cx: number, cy: number) => string | null; re: (cx: number, cy: number) => string | null; spare?: boolean }[] = [
      { n: 1, text: 'Optic nerve: loss in one eye', le: () => null, re: full },
      { n: 2, text: 'Chiasm: bitemporal hemianopia', le: leftHalf, re: rightHalf },
      { n: 3, text: 'Optic tract: homonymous hemianopia', le: leftHalf, re: leftHalf },
      { n: 4, text: "Temporal (Meyer's loop): superior quadrantanopia", le: upperLeft, re: upperLeft },
      { n: 5, text: 'Parietal: inferior quadrantanopia', le: lowerLeft, re: lowerLeft },
      { n: 6, text: 'Occipital: hemianopia with macular sparing', le: leftHalf, re: leftHalf, spare: true },
    ]
    const marker = (n: number, x: number, y: number) => (
      <g key={`m${n}`}>
        <circle cx={x} cy={y} r={11} fill={ROSE} />
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700} fill="white">
          {n}
        </text>
      </g>
    )
    return (
      <g>
        {/* eyes */}
        <circle cx={100} cy={50} r={26} fill="white" stroke={INK} strokeWidth={1.8} />
        <circle cx={240} cy={50} r={26} fill="white" stroke={INK} strokeWidth={1.8} />
        <T x={100} y={14} size={12} weight={500} fill={MUTED} show={L}>
          left eye
        </T>
        <T x={240} y={14} size={12} weight={500} fill={MUTED} show={L}>
          right eye
        </T>
        {/* optic nerves to chiasm */}
        <path d="M110 74 L 170 150 M230 74 L 170 150" stroke={SKY} strokeWidth={6} strokeLinecap="round" />
        {/* tracts to LGN */}
        <path d="M170 150 L 112 222 M170 150 L 228 222" stroke={SKY} strokeWidth={6} strokeLinecap="round" />
        <circle cx={112} cy={226} r={9} fill={LILAC} />
        <circle cx={228} cy={226} r={9} fill={LILAC} />
        {/* radiations: left side simple, right side temporal loop and parietal path */}
        <path d="M112 230 C 90 290, 110 340, 140 372" stroke={SAGE} strokeWidth={4} fill="none" />
        <path d="M228 230 C 300 270, 290 330, 206 372" stroke={SAGE} strokeWidth={4} fill="none" />
        <path d="M228 230 C 238 290, 226 340, 204 372" stroke={SAGE} strokeWidth={4} fill="none" strokeDasharray="7 4" />
        <rect x={120} y={372} width={100} height={30} rx={14} fill={SAGE_SOFT} stroke={SAGE} strokeWidth={1.5} />
        <T x={170} y={387} size={12} fill={SAGE} show={L}>
          occipital cortex
        </T>
        <T x={210} y={150} anchor="start" size={12} weight={500} fill={MUTED} show={L}>
          chiasm
        </T>
        <T x={244} y={222} anchor="start" size={12} weight={500} fill={MUTED} show={L}>
          LGN
        </T>
        {marker(1, 214, 104)}
        {marker(2, 170, 150)}
        {marker(3, 206, 196)}
        {marker(4, 276, 300)}
        {marker(5, 228, 312)}
        {marker(6, 210, 364)}
        {/* fields */}
        <T x={410} y={20} size={12} weight={600} fill={MUTED}>
          L eye
        </T>
        <T x={460} y={20} size={12} weight={600} fill={MUTED}>
          R eye
        </T>
        {rows.map((row, i) => {
          const y = 56 + i * 62
          return (
            <g key={row.n}>
              {marker(row.n, 370, y)}
              {field(410, y, row.le(410, y), row.spare)}
              {field(460, y, row.re(460, y), row.spare)}
              <T x={494} y={y} anchor="start" size={13} show={L}>
                {row.text}
              </T>
            </g>
          )
        })}
      </g>
    )
  },
}

const referralUrgency: DiagramDef = {
  viewBox: [660, 300],
  caption: 'Examples only — check the College CMGs and your local pathways for each condition.',
  render: () => {
    const cols: [string, string, string, string[]][] = [
      ['Emergency: same day', ROSE, ROSE_SOFT, ['Retinal detachment', 'Acute angle closure', 'Suspected GCA', 'Microbial keratitis', 'Chemical injury', 'Papilloedema']],
      ['Urgent', BUTTER_INK, BUTTER, ['Wet AMD (fast-track)', 'Anterior uveitis', 'New unexplained field loss', 'Recent vein occlusion']],
      ['Routine', SAGE, SAGE_SOFT, ['Cataract affecting life', 'Suspected COAG / OHT', 'Stable chronic findings']],
    ]
    return (
      <g>
        {cols.map(([title, ink, fill, items], i) => {
          const x = 10 + i * 218
          return (
            <g key={title}>
              <rect x={x} y={10} width={206} height={280} rx={16} fill={fill} />
              <T x={x + 103} y={36} size={14} fill={ink}>
                {title}
              </T>
              {items.map((it, j) => (
                <g key={it}>
                  <circle cx={x + 20} cy={76 + j * 34} r={3.5} fill={ink} />
                  <text x={x + 32} y={76 + j * 34} dominantBaseline="middle" fontSize={13} fontWeight={500} fill={INK}>
                    {it}
                  </text>
                </g>
              ))}
            </g>
          )
        })}
      </g>
    )
  },
}

// ── BVP ───────────────────────────────────────────────────────────────

const mallettOxo: DiagramDef = {
  viewBox: [620, 260],
  caption: 'Each nonius line is seen by one eye only (polarised); the OXO is seen by both and locks fusion.',
  render: (L) => {
    const panel = (ox: number, shift: number, title: string) => (
      <g key={title}>
        <rect x={ox} y={30} width={260} height={180} rx={12} fill="white" stroke={INK} strokeWidth={1.4} />
        <text x={ox + 130} y={122} textAnchor="middle" dominantBaseline="middle" fontSize={34} fontWeight={700} fill={INK} letterSpacing={6}>
          OXO
        </text>
        <line x1={ox + 130} y1={50} x2={ox + 130} y2={96} stroke={SKY} strokeWidth={5} strokeLinecap="round" />
        <line x1={ox + 130 + shift} y1={148} x2={ox + 130 + shift} y2={194} stroke={ROSE} strokeWidth={5} strokeLinecap="round" />
        <T x={ox + 130} y={232} size={14} fill={INK} show={L}>
          {title}
        </T>
      </g>
    )
    return (
      <g>
        {panel(20, 0, 'Aligned: no slip')}
        {panel(340, 14, 'Lower line displaced: slip')}
        {L && (
          <g>
            <T x={196} y={70} anchor="start" size={12} fill={SKY}>
              one eye
            </T>
            <T x={196} y={172} anchor="start" size={12} fill={ROSE}>
              other eye
            </T>
          </g>
        )}
      </g>
    )
  },
}

// ── PaP ───────────────────────────────────────────────────────────────

const acuityDevelopment: DiagramDef = {
  viewBox: [660, 320],
  caption: 'Illustrative curves only — the shape matters, not exact values.',
  render: (L) => {
    const x0 = 80
    const x1 = 600
    const y0 = 260
    const y1 = 40
    const sx = (yr: number) => x0 + (yr / 6) * (x1 - x0)
    const sy = (v: number) => y0 - v * (y0 - y1)
    const curve = (f: (t: number) => number, from: number) => {
      let d = ''
      for (let t = from; t <= 6.001; t += 0.1) d += `${d ? ' L' : 'M'} ${sx(t).toFixed(1)} ${sy(f(t)).toFixed(1)}`
      return d
    }
    const grating = (t: number) => Math.min(1, 0.08 + 0.92 * (1 - Math.exp(-t / 0.55)))
    const optotype = (t: number) => Math.min(1, 0.45 + 0.55 * (1 - Math.exp(-(t - 2) / 1.1)))
    return (
      <g>
        <rect x={sx(0)} y={y1} width={sx(7.0) > x1 ? x1 - sx(0) : sx(7) - sx(0)} height={y0 - y1} fill={LILAC_SOFT} />
        <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={INK} strokeWidth={1.3} />
        <line x1={x0} y1={y0} x2={x0} y2={y1 - 10} stroke={INK} strokeWidth={1.3} />
        {[0, 1, 2, 3, 4, 5, 6].map((yr) => (
          <g key={yr}>
            <line x1={sx(yr)} y1={y0} x2={sx(yr)} y2={y0 + 5} stroke={INK} />
            <T x={sx(yr)} y={y0 + 18} size={12} weight={500} fill={MUTED}>
              {`${yr}`}
            </T>
          </g>
        ))}
        <T x={(x0 + x1) / 2} y={y0 + 40} size={13}>
          Age (years)
        </T>
        <line x1={x0} y1={sy(1)} x2={x1} y2={sy(1)} stroke={MUTED} strokeDasharray="4 5" />
        <T x={x0 - 8} y={sy(1)} anchor="end" size={12} weight={500} fill={MUTED}>
          adult
        </T>
        <T x={x0 - 8} y={sy(0.08)} anchor="end" size={12} weight={500} fill={MUTED}>
          poor
        </T>
        <path d={curve(grating, 0)} fill="none" stroke={SKY} strokeWidth={3} />
        <path d={curve(optotype, 2)} fill="none" stroke={ROSE} strokeWidth={3} />
        {L && (
          <g>
            <T x={sx(0.9)} y={sy(0.62)} anchor="start" size={13} fill={SKY}>
              Grating acuity
            </T>
            <T x={sx(2.6)} y={sy(0.62)} anchor="start" size={13} fill={ROSE}>
              Optotype acuity
            </T>
            <T x={sx(5.1)} y={sy(0.18)} size={12} fill={LILAC}>
              sensitive period
            </T>
          </g>
        )}
      </g>
    )
  },
}

// ── VSE ───────────────────────────────────────────────────────────────

const evidencePyramid: DiagramDef = {
  viewBox: [640, 360],
  render: () => {
    const levels = ['Systematic reviews & meta-analyses', 'Randomised controlled trials', 'Cohort studies', 'Case-control studies', 'Cross-sectional studies', 'Case series & reports', 'Expert opinion']
    const fills = ['#f6c9d0', '#f8d6dc', '#e5daf5', '#ece4f8', '#cfe3f7', '#dde9f6', '#e7efe0']
    return (
      <g>
        {levels.map((l, i) => {
          const w = 260 + i * 50
          const x = 320 - w / 2
          const y = 16 + i * 46
          return (
            <g key={l}>
              <rect x={x} y={y} width={w} height={40} rx={10} fill={fills[i]} />
              <text x={320} y={y + 20} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={600} fill={INK}>
                {l}
              </text>
            </g>
          )
        })}
        <T x={36} y={30} anchor="start" size={12} weight={500} fill={MUTED}>
          stronger
        </T>
        <T x={36} y={316} anchor="start" size={12} weight={500} fill={MUTED}>
          weaker
        </T>
      </g>
    )
  },
}

const normalCurve: DiagramDef = {
  viewBox: [660, 350],
  render: (L) => {
    const x0 = 40
    const x1 = 620
    const base = 250
    const H = 200
    const sx = (z: number) => (x0 + x1) / 2 + z * 88
    const sy = (z: number) => base - H * Math.exp(-(z * z) / 2)
    const area = (a: number, b: number) => {
      let d = `M${sx(a)} ${base}`
      for (let z = a; z <= b + 1e-9; z += 0.05) d += ` L ${sx(z).toFixed(1)} ${sy(z).toFixed(1)}`
      return d + ` L ${sx(b)} ${base} Z`
    }
    let curve = ''
    for (let z = -3.3; z <= 3.3; z += 0.05) curve += `${curve ? ' L' : 'M'} ${sx(z).toFixed(1)} ${sy(z).toFixed(1)}`
    return (
      <g>
        <Arrowheads />
        <path d={area(-3, 3)} fill={SKY_SOFT} />
        <path d={area(-2, 2)} fill="#dbe9f8" />
        <path d={area(-1, 1)} fill="#c3dbf3" />
        <path d={curve} fill="none" stroke={SKY} strokeWidth={2.5} />
        <line x1={x0} y1={base} x2={x1} y2={base} stroke={INK} strokeWidth={1.2} />
        {[-3, -2, -1, 0, 1, 2, 3].map((z) => (
          <g key={z}>
            <line x1={sx(z)} y1={base} x2={sx(z)} y2={base + 5} stroke={INK} />
            <T x={sx(z)} y={base + 20} size={12} weight={500} fill={MUTED}>
              {z === 0 ? 'mean' : `${z > 0 ? '+' : '−'}${Math.abs(z)} SD`}
            </T>
          </g>
        ))}
        {L && (
          <g>
            <T x={sx(0)} y={170} size={15} fill={SKY}>
              68%
            </T>
            {(
              [
                [1, 284, '68% within ±1 SD'],
                [2, 306, '95% within ±1.96 SD'],
                [3, 328, '99.7% within ±3 SD'],
              ] as [number, number, string][]
            ).map(([k, y, t]) => (
              <g key={k}>
                <Dim x1={sx(-k)} y1={y} x2={sx(k)} y2={y} colour={SKY} id="ah-sky" />
                <T x={sx(0)} y={y} size={12} fill={SKY}>
                  {t}
                </T>
              </g>
            ))}
          </g>
        )}
      </g>
    )
  },
}

const boolean: DiagramDef = {
  viewBox: [660, 230],
  render: (L) => {
    const panel = (ox: number, kind: 'or' | 'and' | 'not', title: string) => {
      const a = { x: ox + 80, y: 100 }
      const b = { x: ox + 130, y: 100 }
      const R = 56
      const id = `bool-${kind}`
      return (
        <g key={kind}>
          <defs>
            <clipPath id={`${id}-a`}>
              <circle cx={a.x} cy={a.y} r={R} />
            </clipPath>
          </defs>
          {kind === 'or' && (
            <>
              <circle cx={a.x} cy={a.y} r={R} fill={LILAC_SOFT} />
              <circle cx={b.x} cy={b.y} r={R} fill={LILAC_SOFT} />
            </>
          )}
          {kind === 'and' && <circle cx={b.x} cy={b.y} r={R} fill="#cdbdf0" clipPath={`url(#${id}-a)`} />}
          {kind === 'not' && (
            <>
              <circle cx={a.x} cy={a.y} r={R} fill={LILAC_SOFT} />
              <circle cx={b.x} cy={b.y} r={R} fill="white" clipPath={`url(#${id}-a)`} />
            </>
          )}
          <circle cx={a.x} cy={a.y} r={R} fill="none" stroke={LILAC} strokeWidth={1.8} />
          <circle cx={b.x} cy={b.y} r={R} fill="none" stroke={LILAC} strokeWidth={1.8} />
          <T x={a.x - 22} y={a.y} size={12} show={L}>
            A
          </T>
          <T x={b.x + 22} y={b.y} size={12} show={L}>
            B
          </T>
          <T x={ox + 105} y={186} size={14} fill={INK} show={L}>
            {title}
          </T>
        </g>
      )
    }
    return (
      <g>
        {panel(0, 'or', 'A OR B: wider')}
        {panel(220, 'and', 'A AND B: narrower')}
        {panel(440, 'not', 'A NOT B: excludes')}
      </g>
    )
  },
}

/** Nodes on a circle with arrows between them. */
function Cycle({ items, cx, cy, r, colours, w = 150 }: { items: string[]; cx: number; cy: number; r: number; colours: string[]; w?: number }) {
  const n = items.length
  const ang = (i: number) => -90 + (360 / n) * i
  const pt = (a: number, rad = r) => [cx + rad * Math.cos((a * Math.PI) / 180), cy + rad * Math.sin((a * Math.PI) / 180)]
  return (
    <g>
      {items.map((_, i) => {
        const a0 = ang(i) + 360 / n / 2 - 14
        const a1 = ang(i) + 360 / n / 2 + 14
        const [x0, y0] = pt(a0)
        const [x1, y1] = pt(a1)
        return <path key={`arc${i}`} d={`M${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`} fill="none" stroke={MUTED} strokeWidth={1.8} markerEnd="url(#ah)" />
      })}
      {items.map((t, i) => {
        const [x, y] = pt(ang(i))
        return (
          <g key={t}>
            <rect x={x - w / 2} y={y - 20} width={w} height={40} rx={20} fill={colours[i % colours.length]} />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={600} fill={INK}>
              {t}
            </text>
          </g>
        )
      })}
    </g>
  )
}

const ebpVenn: DiagramDef = {
  viewBox: [600, 380],
  render: () => (
    <g>
      <circle cx={230} cy={150} r={110} fill={ROSE_SOFT} opacity={0.85} stroke={ROSE} strokeWidth={1.5} />
      <circle cx={370} cy={150} r={110} fill={SKY_SOFT} opacity={0.85} stroke={SKY} strokeWidth={1.5} />
      <circle cx={300} cy={260} r={110} fill={SAGE_SOFT} opacity={0.85} stroke={SAGE} strokeWidth={1.5} />
      <T x={196} y={110} size={14} fill={ROSE}>
        Research evidence
      </T>
      <T x={404} y={110} size={14} fill={SKY}>
        Clinical expertise
      </T>
      <T x={300} y={322} size={14} fill={SAGE}>
        Patient values
      </T>
      <T x={300} y={192} size={14} fill={INK}>
        EBP
      </T>
    </g>
  ),
}

const gibbsCycle: DiagramDef = {
  viewBox: [620, 420],
  render: () => (
    <g>
      <Arrowheads />
      <Cycle
        items={['Description', 'Feelings', 'Evaluation', 'Analysis', 'Conclusion', 'Action plan']}
        cx={310}
        cy={210}
        r={160}
        colours={[ROSE_SOFT, LILAC_SOFT, SKY_SOFT, SAGE_SOFT, BUTTER, '#f6e3ec']}
      />
    </g>
  ),
}

const stagesOfChange: DiagramDef = {
  viewBox: [640, 430],
  caption: 'People can relapse to an earlier stage — that’s part of the process, not failure.',
  render: () => (
    <g>
      <Arrowheads />
      <Cycle
        items={['Precontemplation', 'Contemplation', 'Preparation', 'Action', 'Maintenance']}
        cx={320}
        cy={210}
        r={160}
        colours={[ROSE_SOFT, LILAC_SOFT, SKY_SOFT, SAGE_SOFT, BUTTER]}
        w={170}
      />
      <path d="M260 320 Q 320 250 380 110" fill="none" stroke={ROSE} strokeWidth={1.6} strokeDasharray="6 5" markerEnd="url(#ah-rose)" />
      <T x={318} y={214} size={13} fill={ROSE}>
        relapse
      </T>
    </g>
  ),
}

const consentTriangle: DiagramDef = {
  viewBox: [600, 360],
  render: () => (
    <g>
      <path d="M300 40 L 520 290 L 80 290 Z" fill={LILAC_SOFT} stroke={LILAC} strokeWidth={1.8} />
      <T x={300} y={200} size={16} fill={LILAC}>
        Valid consent
      </T>
      {(
        [
          [300, 40, 'Voluntary', ROSE_SOFT],
          [80, 290, 'Informed', SKY_SOFT],
          [520, 290, 'Capacity', SAGE_SOFT],
        ] as [number, number, string, string][]
      ).map(([x, y, t, f]) => (
        <g key={t}>
          <rect x={x - 60} y={y - 20} width={120} height={40} rx={20} fill={f} stroke={INK} strokeWidth={1} />
          <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={600} fill={INK}>
            {t}
          </text>
        </g>
      ))}
      <T x={470} y={334} size={12} weight={500} fill={MUTED}>
        understand · retain · weigh · communicate
      </T>
    </g>
  ),
}

const candourSteps: DiagramDef = {
  viewBox: [660, 220],
  render: () => {
    const steps: [string, string][] = [
      ['Tell', ROSE_SOFT],
      ['Apologise', LILAC_SOFT],
      ['Put right', SKY_SOFT],
      ['Explain', SAGE_SOFT],
    ]
    return (
      <g>
        <Arrowheads />
        {steps.map(([t, f], i) => {
          const x = 20 + i * 160
          return (
            <g key={t}>
              <rect x={x} y={30} width={130} height={60} rx={16} fill={f} stroke={INK} strokeWidth={1} />
              <text x={x + 65} y={60} textAnchor="middle" dominantBaseline="middle" fontSize={16} fontWeight={700} fill={INK}>
                {t}
              </text>
              {i < steps.length - 1 && <line x1={x + 132} y1={60} x2={x + 158} y2={60} stroke={MUTED} strokeWidth={2} markerEnd="url(#ah)" />}
            </g>
          )
        })}
        <rect x={20} y={140} width={610} height={50} rx={16} fill={BUTTER} />
        <text x={325} y={165} textAnchor="middle" dominantBaseline="middle" fontSize={15} fontWeight={700} fill={BUTTER_INK}>
          Report and learn (incidents and near misses)
        </text>
        <path d="M565 92 L 565 136" stroke={MUTED} strokeWidth={2} markerEnd="url(#ah)" />
      </g>
    )
  },
}

const clHistory: DiagramDef = {
  viewBox: [700, 260],
  caption: 'From Dr Dutta’s CLB Lecture 1. Early ideas didn’t really describe contact lenses; Young and Herschel get more credit.',
  render: (L) => {
    const events: [number, string, string, string][] = [
      [60, 'Early ideas', 'Celsus · Da Vinci · Descartes 1637 · de la Hire 1685', MUTED],
      [200, '1801', 'Thomas Young', SKY],
      [320, '1827', 'John Herschel: a jelly-filled glass capsule or a corneal mould', LILAC],
      [470, '1880s', 'Fick · Kalt · Müller (−14 D, ~30 min wear)', ROSE],
      [620, 'Later', 'Zeiss lathe-cut lenses, first trial sets', SAGE],
    ]
    return (
      <g>
        <Arrowheads />
        <line x1={30} y1={120} x2={676} y2={120} stroke={INK} strokeWidth={2} markerEnd="url(#ah)" />
        {events.map(([x, when, what, c], i) => (
          <g key={when}>
            <circle cx={x} cy={120} r={9} fill="white" stroke={c} strokeWidth={3} />
            <T x={x} y={i % 2 ? 160 : 82} size={15} fill={c}>
              {when}
            </T>
            {L && (
              <foreignObject x={x - 70} y={i % 2 ? 172 : 14} width={140} height={60}>
                <div style={{ fontSize: 12, lineHeight: 1.25, textAlign: 'center', color: INK, fontWeight: 500 }}>{what}</div>
              </foreignObject>
            )}
          </g>
        ))}
      </g>
    )
  },
}

export const MORE_DIAGRAMS: Record<string, DiagramDef> = {
  'ret-reflex': retReflex,
  duochrome,
  'range-clear-vision': rangeClearVision,
  'prism-dissociation': prismDissociation,
  'rgp-fluorescein': rgpFluorescein,
  'vertex-distance': vertexDistance,
  'van-herick': vanHerick,
  'tear-film-layers': tearFilm,
  'corneal-zones': cornealZones,
  'optic-disc': opticDisc,
  'normal-fundus': normalFundus,
  'diabetic-retinopathy': diabeticRetinopathy,
  'gat-mires': gatMires,
  'oct-macula': octMacula,
  'visual-pathway-defects': visualPathway,
  'referral-urgency': referralUrgency,
  'mallett-oxo': mallettOxo,
  'acuity-development': acuityDevelopment,
  'evidence-pyramid': evidencePyramid,
  'normal-curve': normalCurve,
  boolean,
  'ebp-venn': ebpVenn,
  'gibbs-cycle': gibbsCycle,
  'stages-of-change': stagesOfChange,
  'consent-triangle': consentTriangle,
  'candour-steps': candourSteps,
  'cl-history-timeline': clHistory,
}
