'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { outlineText } from '@/lib/deckParse'
import { fmtDayLong } from '@/lib/dates'
import type { ModuleOption } from '@/lib/moduleOptions'
import { newId } from '@/lib/timetable'
import { deckSetId, setFromDeck } from '@/lib/userCards'
import { useApp, useData } from '../AppProvider'
import { AskClaudeButton } from '../AskClaudeButton'
import { BackLink, ModuleChip } from '../bits'
import { TrashIcon } from '../icons'

export function DeckView({ modules }: { modules: ModuleOption[] }) {
  const id = useSearchParams().get('id')
  const { decks, cardSets } = useData()
  const { deleteDeck, saveCardSet, toast } = useApp()
  const router = useRouter()
  const [sure, setSure] = useState(false)
  const d = decks.find((x) => x.id === id)

  if (!d) {
    return (
      <div className="mx-auto max-w-[860px]">
        <BackLink href="/slides">Slides & materials</BackLink>
        <div className="card mt-4 p-6 text-muted">That deck isn’t in your account. It may have been removed.</div>
      </div>
    )
  }

  const colours = Object.fromEntries(modules.map((m) => [m.code, m.colour]))
  const cardSet = cardSets.find((s) => s.id === deckSetId(d.id))
  const mod = modules.find((m) => m.code === d.module)
  const topics = (mod?.topics ?? []).filter((t) => d.topics.includes(t.id))
  const prompt = `${outlineText(d.title, d.slides)}\n\nThese are the slides from one of my optometry lectures. Summarise the key points in plain language, tell me what's most likely to come up in an exam, then ask me three questions to check I've understood.`

  return (
    <div className="mx-auto max-w-[860px]">
      <BackLink href="/slides">Slides & materials</BackLink>
      <header className="mt-2">
        <p className="flex flex-wrap items-center gap-2 text-[14px] text-muted">
          {d.module && <ModuleChip code={d.module} colours={colours} link />}
          {d.sessionDate ? `${fmtDayLong(d.sessionDate)}${d.sessionStart ? `, ${d.sessionStart}` : ''}` : 'Not linked to a session'}
          <span>· {d.slides.length} slides</span>
        </p>
        <h1 className="mt-2 text-[30px] font-semibold sm:text-[34px]">{d.title}</h1>
        <p className="mt-1 break-all text-[13px] text-muted">{d.fileName}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <AskClaudeButton text={prompt} label="Summarise with Claude" variant="primary" />
          {cardSet ? (
            <Link href={`/flashcards?set=${encodeURIComponent(cardSet.id)}`} className="btn btn-soft">
              Study {cardSet.cards.length} flashcards
            </Link>
          ) : (
            <button
              className="btn btn-soft"
              onClick={async () => {
                const set = setFromDeck(d, newId)
                if (!set) return toast('None of these slides have bullet points to turn into cards.')
                try {
                  await saveCardSet(set)
                  toast(`Made ${set.cards.length} flashcards.`)
                  router.push(`/flashcards?set=${encodeURIComponent(set.id)}`)
                } catch (e) {
                  toast(e instanceof Error ? e.message : 'Couldn’t save the flashcards just now.')
                }
              }}
            >
              Make flashcards
            </button>
          )}
          {sure ? (
            <span className="flex items-center gap-2 text-[14px]">
              Remove this outline?
              <button
                className="btn btn-quiet min-h-10 px-3 text-[14px] text-bad-ink"
                onClick={async () => {
                  try {
                    await deleteDeck(d.id)
                    toast('Slides removed.')
                    router.push('/slides')
                  } catch {
                    toast('Couldn’t remove it just now.')
                  }
                }}
              >
                Yes, remove
              </button>
              <button className="btn btn-ghost min-h-10 px-3 text-[14px]" onClick={() => setSure(false)}>
                Keep
              </button>
            </span>
          ) : (
            <button className="btn btn-quiet" onClick={() => setSure(true)}>
              <TrashIcon className="size-[18px]" />
              Remove
            </button>
          )}
        </div>
      </header>

      {topics.length > 0 && (
        <section className="card mt-6 p-5" aria-labelledby="topics">
          <h2 id="topics" className="eyebrow">
            Topics it covers
          </h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {topics.map((t) => (
              <li key={t.id}>
                <Link href={`/t/${t.id}`} className="inline-flex min-h-9 items-center rounded-lg bg-bg px-3 text-[14px] font-medium hover:bg-border">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8" aria-labelledby="outline">
        <h2 id="outline" className="text-[22px] font-semibold">
          Slide by slide
        </h2>
        <ol className="mt-3 space-y-3">
          {d.slides.map((s) => (
            <li key={s.n} className="card p-4 sm:p-5">
              <div className="flex gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-bg text-[13px] font-semibold tabular-nums text-muted">
                  {s.n}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[17px] font-semibold">{s.title}</h3>
                  {s.points.length > 0 ? (
                    <ul className="mt-1.5 space-y-1">
                      {s.points.map((p, i) => (
                        <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-ink/90">
                          <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-full bg-muted" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-[14px] text-muted">No text on this slide (probably a picture or diagram).</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
