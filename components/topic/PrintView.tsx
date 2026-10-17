'use client'

import { useEffect } from 'react'
import { slugify } from '@/lib/slug'
import type { Topic } from '@/lib/types'
import { useData } from '../AppProvider'
import { BackLink } from '../bits'
import { DiagramFigure } from '../diagrams/DiagramFigure'
import { DownloadIcon } from '../icons'
import { VERIFY_NOTE } from './TopicView'

const LETTERS = 'ABCDEFGH'

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 mt-7 border-b border-line pb-1 font-rounded text-[17pt] font-semibold print:text-[14pt]">{children}</h2>
}

/** A4, wide right margin for handwriting; answers at the end for self-testing. */
export function PrintView({ topic: t, moduleCode, moduleName }: { topic: Topic; moduleCode: string; moduleName: string }) {
  const data = useData()
  const note = data.notes[t.id]?.trim()
  const name = data.overrides[moduleCode] || moduleName

  useEffect(() => {
    const prev = document.title
    document.title = `${moduleCode} – ${t.title}`
    return () => {
      document.title = prev
    }
  }, [moduleCode, t.title])

  return (
    <div>
      <div className="no-print mx-auto mb-6 max-w-[210mm]">
        <BackLink href={`/t/${t.id}`}>Back to the topic</BackLink>
        <div className="card mt-3 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[15px] text-muted">
            <p className="font-semibold text-ink">Save for GoodNotes</p>
            <p className="mt-1">
              Tap the button, then in the print sheet tap <b>Share</b> (or pinch out on the preview) and choose <b>GoodNotes</b> or <b>Save to Files</b>.
              On a Mac, choose “Save as PDF”.
            </p>
          </div>
          <button className="btn btn-primary shrink-0" onClick={() => window.print()}>
            <DownloadIcon className="size-[18px]" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      <article className="print-sheet card mx-auto max-w-[210mm] bg-white p-[14mm] text-[11.5pt] leading-[1.55] text-ink sm:p-[16mm]">
        {/* Content column leaves ~55mm on the right for handwriting */}
        <div className="grid grid-cols-[1fr_50mm] gap-[6mm]">
          <div className="min-w-0">
            <p className="text-[10pt] font-semibold uppercase tracking-wider text-muted">
              {moduleCode} · {name}
            </p>
            <h1 className="mt-1 font-rounded text-[22pt] font-semibold leading-tight">{t.title}</h1>
            <p className="mt-2 text-[9.5pt] italic text-muted">{VERIFY_NOTE}</p>

            <H2>Summary</H2>
            <p>{t.summary}</p>

            {t.keyPoints.length > 0 && (
              <>
                <H2>Key points</H2>
                <ul className="list-disc space-y-1 pl-5">
                  {t.keyPoints.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
              </>
            )}

            {t.examTraps.length > 0 && (
              <div className="avoid-break mt-5 rounded-xl border border-butter bg-butter-soft p-4">
                <p className="font-semibold text-butter-ink">Exam traps</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {t.examTraps.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div aria-hidden className="border-l border-dashed border-line" />
        </div>

        {t.diagram && (
          <div className="avoid-break mt-6">
            <H2>Diagram</H2>
            <DiagramFigure diagram={t.diagram} print />
          </div>
        )}

        <div className="grid grid-cols-[1fr_50mm] gap-[6mm]">
          <div className="min-w-0">
            {t.goDeeper.length > 0 && (
              <>
                <H2>Go deeper</H2>
                {t.goDeeper.map((g) => (
                  <section key={g.heading} id={slugify(g.heading)} className="avoid-break mt-3">
                    <h3 className="font-semibold">{g.heading}</h3>
                    <p className="mt-0.5">{g.body}</p>
                  </section>
                ))}
              </>
            )}

            {t.checklist && (
              <div className="avoid-break">
                <H2>Checklist · {t.checklist.title}</H2>
                <ol className="space-y-1.5">
                  {t.checklist.steps.map((s, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-[3px] inline-block size-[11pt] shrink-0 rounded-[3px] border-[1.5px] border-ink/60" />
                      <span>
                        {i + 1}. {s}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {(t.mcq.length > 0 || t.flashcards.length > 0 || t.cases.length > 0) && (
              <div className="print-break">
                <H2>Test yourself</H2>
                {t.mcq.map((m, qi) => (
                  <div key={m.id} className="avoid-break mt-3">
                    <p className="font-medium">
                      Q{qi + 1}. {m.q}
                    </p>
                    <ol className="mt-1 space-y-0.5 pl-5">
                      {m.options.map((o, i) => (
                        <li key={i}>
                          {LETTERS[i]}. {o.text}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
                {t.flashcards.length > 0 && (
                  <>
                    <p className="mt-5 font-semibold">Quick recall</p>
                    <ol className="mt-1 space-y-2 pl-5">
                      {t.flashcards.map((f, i) => (
                        <li key={i} className="avoid-break list-decimal">
                          {f.front}
                          <div className="mt-1 h-[9mm] border-b border-dotted border-ink/30" />
                        </li>
                      ))}
                    </ol>
                  </>
                )}
                {t.cases.map((c, i) => (
                  <div key={i} className="avoid-break mt-5">
                    <p className="font-semibold">Case {i + 1}</p>
                    <p className="mt-0.5">{c.scenario}</p>
                    <p className="mt-1 font-medium">{c.question}</p>
                    <div className="mt-1 h-[28mm] rounded-lg border border-dotted border-ink/30" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div aria-hidden className="border-l border-dashed border-line" />
        </div>

        {(t.mcq.length > 0 || t.flashcards.length > 0 || t.cases.length > 0) && (
          <div className="print-break">
            <H2>Answers</H2>
            {t.mcq.map((m, qi) => {
              const ci = m.options.findIndex((o) => o.correct)
              return (
                <p key={m.id} className="avoid-break mt-2">
                  <b>
                    Q{qi + 1}: {LETTERS[ci]}. {m.options[ci]?.text}
                  </b>{' '}
                  — {m.explanation}
                </p>
              )
            })}
            {t.flashcards.length > 0 && (
              <ol className="mt-3 list-decimal space-y-1 pl-5">
                {t.flashcards.map((f, i) => (
                  <li key={i}>{f.back}</li>
                ))}
              </ol>
            )}
            {t.cases.map((c, i) => (
              <p key={i} className="avoid-break mt-3">
                <b>Case {i + 1}:</b> {c.modelAnswer}
              </p>
            ))}
          </div>
        )}

        {note && (
          <div className="avoid-break">
            <H2>My typed notes</H2>
            <p className="whitespace-pre-wrap">{note}</p>
          </div>
        )}

        {t.links.length > 0 && (
          <p className="mt-6 text-[9.5pt] text-muted">
            More info: {t.links.map((l) => `${l.label} (${l.url})`).join(' · ')}
          </p>
        )}
      </article>
    </div>
  )
}
