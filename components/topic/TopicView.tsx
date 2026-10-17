'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { caseId, flashcardId } from '@/lib/ids'
import type { PracticeItem, Topic } from '@/lib/types'
import { useApp, useData } from '../AppProvider'
import { AskClaudeButton } from '../AskClaudeButton'
import { BackLink } from '../bits'
import { DiagramFigure } from '../diagrams/DiagramFigure'
import { canLabel, LabelDiagram } from '../diagrams/LabelDiagram'
import { FlagButton } from '../FlagButton'
import { ChevronLeft, ChevronRight, DownloadIcon, ExternalIcon } from '../icons'
import { TickButton } from '../module/TickButton'
import { PracticeRunner } from '../practice/PracticeRunner'
import { ChecklistCard } from './ChecklistCard'
import { GoDeeper } from './GoDeeper'
import { NotesBox } from './NotesBox'

export const VERIFY_NOTE = 'Written from standard optometry knowledge. Check against your lecture slides.'

interface Props {
  topic: Topic
  moduleCode: string
  moduleName: string
  moduleColour: string
  index: number
  total: number
  prev?: { id: string; title: string }
  next?: { id: string; title: string }
}

type Tab = 'flashcards' | 'mcq' | 'cases' | 'label'

export function TopicView({ topic: t, moduleCode, moduleName, moduleColour, index, total, prev, next }: Props) {
  const { setProgress } = useApp()
  const data = useData()
  const p = data.progress[t.id] ?? { covered: false, revised: false }
  const moduleLabel = data.overrides[moduleCode] || moduleName

  const base = { topicId: t.id, topicTitle: t.title, moduleCode }
  const sets = useMemo(() => {
    const fc: PracticeItem[] = t.flashcards.map((card, i) => ({ ...base, kind: 'flashcard', id: flashcardId(t.id, i), card }))
    const mcq: PracticeItem[] = t.mcq.map((m) => ({ ...base, kind: 'mcq', id: m.id, mcq: m }))
    const cases: PracticeItem[] = t.cases.map((kase, i) => ({ ...base, kind: 'case', id: caseId(t.id, i), kase }))
    return { fc, mcq, cases }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t])
  const labelOk = !!t.labelDiagram && canLabel(t.labelDiagram.diagramId, t.labelDiagram.targets)

  const tabs: { key: Tab; label: string; count?: number }[] = [
    ...(sets.mcq.length ? [{ key: 'mcq' as Tab, label: 'Multiple choice', count: sets.mcq.length }] : []),
    ...(sets.fc.length ? [{ key: 'flashcards' as Tab, label: 'Flashcards', count: sets.fc.length }] : []),
    ...(sets.cases.length ? [{ key: 'cases' as Tab, label: 'Clinical cases', count: sets.cases.length }] : []),
    ...(labelOk ? [{ key: 'label' as Tab, label: 'Label the diagram' }] : []),
  ]
  const [tab, setTab] = useState<Tab | undefined>(tabs[0]?.key)

  const toc = [
    ['summary', 'Summary'],
    ...(t.diagram ? [['diagram', 'Diagram']] : []),
    ...(t.goDeeper.length ? [['go-deeper', 'Go deeper']] : []),
    ...(t.checklist ? [['checklist', 'Checklist']] : []),
    ...(tabs.length ? [['practice', 'Practice']] : []),
    ['notes', 'My notes'],
    ...(t.links.length ? [['more-info', 'More info']] : []),
  ]

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Link href={`/t/${t.id}/print`} className="btn btn-quiet">
        <DownloadIcon className="size-[18px]" />
        Save for GoodNotes (PDF)
      </Link>
      <AskClaudeButton text={t.askClaude} />
      <FlagButton topicId={t.id} />
    </div>
  )

  return (
    <div className="mx-auto max-w-[1180px]">
      <BackLink href={`/m/${moduleCode}`}>{moduleCode} · {moduleLabel}</BackLink>

      <div className="mt-2 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="min-w-0">
          {/* 1. Title */}
          <header>
            <p className="flex items-center gap-2 text-[14px] font-semibold text-muted">
              <span className="chip" style={{ background: moduleColour }}>
                {moduleCode}
              </span>
              Topic {index + 1} of {total}
            </p>
            <h1 className="mt-2 text-[32px] font-semibold sm:text-[38px]">{t.title}</h1>
            <p className="mt-3 inline-flex items-start gap-2 rounded-xl bg-butter-soft px-3 py-2 text-[14px] text-butter-ink">
              <span aria-hidden>📎</span>
              {VERIFY_NOTE}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
              <TickButton label="Covered" tone="sage" on={p.covered} onToggle={() => setProgress(t.id, 'covered', !p.covered)} />
              <TickButton label="Revised" tone="lilac" on={p.revised} onToggle={() => setProgress(t.id, 'revised', !p.revised)} />
            </div>
          </header>

          {/* 2. Summary, key points, exam traps */}
          <section id="summary" className="mt-8">
            <p className="text-[19px] leading-relaxed">{t.summary}</p>
            {t.keyPoints.length > 0 && (
              <div className="card mt-6 p-5 sm:p-6">
                <h2 className="text-[20px] font-semibold">Key points</h2>
                <ul className="mt-3 space-y-2.5">
                  {t.keyPoints.map((k, i) => (
                    <li key={i} className="flex gap-3 text-[17px] leading-relaxed">
                      <span aria-hidden className="mt-[0.6em] size-2 shrink-0 rounded-full" style={{ background: moduleColour, boxShadow: 'inset 0 0 0 1.5px rgb(0 0 0 / 0.15)' }} />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {t.examTraps.length > 0 && (
              <div className="mt-4 rounded-[22px] bg-butter-soft p-5 ring-1 ring-butter sm:p-6">
                <h2 className="flex items-center gap-2 text-[20px] font-semibold text-butter-ink">
                  <span aria-hidden>⚠︎</span> Exam traps
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {t.examTraps.map((k, i) => (
                    <li key={i} className="flex gap-3 text-[17px] leading-relaxed">
                      <span aria-hidden className="mt-[0.15em] font-bold text-butter-ink">
                        ✗
                      </span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* 3. Diagram */}
          {t.diagram && (
            <section id="diagram" className="mt-10">
              <h2 className="mb-3 text-[22px] font-semibold">Diagram</h2>
              <DiagramFigure diagram={t.diagram} />
            </section>
          )}

          {/* 4. Go deeper */}
          {t.goDeeper.length > 0 && (
            <section id="go-deeper" className="mt-10">
              <h2 className="mb-3 text-[22px] font-semibold">Go deeper</h2>
              <GoDeeper sections={t.goDeeper} />
            </section>
          )}

          {/* 5. Checklist */}
          {t.checklist && (
            <section id="checklist" className="mt-10">
              <h2 className="mb-3 text-[22px] font-semibold">Practical checklist</h2>
              <ChecklistCard checklist={t.checklist} compact />
            </section>
          )}

          {/* 6. Practice */}
          {tabs.length > 0 && (
            <section id="practice" className="mt-10">
              <h2 className="text-[22px] font-semibold">Practice</h2>
              <div role="tablist" aria-label="Practice type" className="no-scrollbar -mx-1 mt-3 flex gap-1 overflow-x-auto rounded-full bg-wash p-1">
                {tabs.map((x) => (
                  <button
                    key={x.key}
                    role="tab"
                    aria-selected={tab === x.key}
                    onClick={() => setTab(x.key)}
                    className={`min-h-11 shrink-0 flex-1 whitespace-nowrap rounded-full px-4 text-[15px] font-semibold transition-all ${
                      tab === x.key ? 'bg-card text-ink shadow-[var(--shadow-soft)]' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {x.label}
                    {x.count != null && <span className="ml-1.5 text-faint">{x.count}</span>}
                  </button>
                ))}
              </div>
              <div className="card mt-4 p-5 sm:p-7" role="tabpanel">
                {tab === 'mcq' && <PracticeRunner items={sets.mcq} />}
                {tab === 'flashcards' && <PracticeRunner items={sets.fc} />}
                {tab === 'cases' && <PracticeRunner items={sets.cases} />}
                {tab === 'label' && t.labelDiagram && <LabelDiagram diagramId={t.labelDiagram.diagramId} targets={t.labelDiagram.targets} />}
              </div>
            </section>
          )}

          {/* 7. My notes */}
          <section id="notes" className="mt-10">
            <h2 className="mb-3 text-[22px] font-semibold">My notes</h2>
            <NotesBox topicId={t.id} />
          </section>

          {/* 8. More info */}
          {t.links.length > 0 && (
            <section id="more-info" className="mt-8">
              <h2 className="mb-3 text-[22px] font-semibold">More info</h2>
              <ul className="flex flex-wrap gap-2">
                {t.links.map((l) => (
                  <li key={l.url}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-4 text-[15px] font-medium shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]"
                    >
                      {l.label}
                      <ExternalIcon className="size-4 text-muted" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 9. Actions */}
          <div className="mt-10 border-t border-line pt-6 lg:hidden">{actions}</div>

          <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Other topics">
            {prev ? (
              <Link href={`/t/${prev.id}`} className="card flex min-h-16 items-center gap-2 px-4 py-3 hover:shadow-[var(--shadow-lift)]">
                <ChevronLeft className="size-5 shrink-0 text-muted" />
                <span>
                  <span className="block text-[13px] text-muted">Previous</span>
                  <span className="font-medium">{prev.title}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/t/${next.id}`} className="card flex min-h-16 items-center justify-end gap-2 px-4 py-3 text-right hover:shadow-[var(--shadow-lift)]">
                <span>
                  <span className="block text-[13px] text-muted">Next</span>
                  <span className="font-medium">{next.title}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted" />
              </Link>
            )}
          </nav>
        </article>

        {/* Sidebar (landscape iPad and up) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <div className="card space-y-2 p-4">
              <p className="eyebrow">Your progress</p>
              <div className="flex flex-col gap-2">
                <TickButton label="Covered" tone="sage" on={p.covered} onToggle={() => setProgress(t.id, 'covered', !p.covered)} />
                <TickButton label="Revised" tone="lilac" on={p.revised} onToggle={() => setProgress(t.id, 'revised', !p.revised)} />
              </div>
            </div>
            <nav aria-label="On this page" className="px-1">
              <p className="eyebrow mb-1.5">On this page</p>
              <ul>
                {toc.map(([id, label]) => (
                  <li key={id}>
                    <a href={`#${id}`} className="block rounded-lg py-1.5 text-[15px] text-muted hover:text-ink">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex flex-col gap-2 [&_.btn]:w-full [&_.btn]:justify-start">
              <Link href={`/t/${t.id}/print`} className="btn btn-quiet">
                <DownloadIcon className="size-[18px]" />
                Save for GoodNotes
              </Link>
              <AskClaudeButton text={t.askClaude} />
              <FlagButton topicId={t.id} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
