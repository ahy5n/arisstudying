import type { Topic } from '@/lib/types'
import { DIAGRAMS } from './Diagrams'

export function DiagramFigure({ diagram, print = false }: { diagram: NonNullable<Topic['diagram']>; print?: boolean }) {
  const def = DIAGRAMS[diagram.id]
  if (!def) {
    // Too complex to draw well: describe it instead of drawing it badly.
    return (
      <figure className="avoid-break rounded-[22px] border-2 border-dashed border-line bg-wash/60 p-5 sm:p-6">
        <p className="eyebrow">Diagram to sketch</p>
        <p className="mt-2 text-[16px] leading-relaxed">{diagram.description}</p>
        {diagram.labels.length > 0 && (
          <>
            <p className="mt-4 text-[14px] font-semibold text-muted">Label these:</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {diagram.labels.map((l) => (
                <li key={l} className="rounded-full bg-card px-3 py-1 text-[14px] shadow-[var(--shadow-soft)]">
                  {l}
                </li>
              ))}
            </ul>
          </>
        )}
        {!print && <p className="mt-4 text-[13px] text-muted">A nice one to draw yourself in GoodNotes.</p>}
      </figure>
    )
  }
  const [w, h] = def.viewBox
  return (
    <figure className="avoid-break">
      <div className={print ? '' : 'card overflow-x-auto p-3 sm:p-5'}>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={diagram.description}
          className="mx-auto block h-auto w-full min-w-[520px] max-w-[760px]"
        >
          {def.render(true)}
        </svg>
      </div>
      {!print && <p className="mt-2 text-center text-[13px] text-faint sm:hidden">Swipe sideways to see the whole diagram</p>}
      {(def.legend || def.caption) && (
        <figcaption className="mt-3 space-y-2 text-[15px] text-muted">
          {def.legend && (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              {def.legend.map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="min-w-10 font-semibold text-ink">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {def.caption && <p>{def.caption}</p>}
        </figcaption>
      )}
    </figure>
  )
}
