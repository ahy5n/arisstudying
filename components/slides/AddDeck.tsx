'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { readDeck } from '@/lib/deckParse'
import { fmtDayLong } from '@/lib/dates'
import type { ModuleOption } from '@/lib/moduleOptions'
import type { DeckSlide } from '@/lib/store'
import { detectModule, newId, sessionKey } from '@/lib/timetable'
import { cardsFromDeck, setFromDeck } from '@/lib/userCards'
import { useApp, useData } from '../AppProvider'

/** A lecture from her built-in timetable that an upload can be linked to. */
export interface SessionChoice {
  date: string
  start: string
  module: string | null
  label: string
}

export function AddDeck({ modules, sessions, onDone }: { modules: ModuleOption[]; sessions: SessionChoice[]; onDone: () => void }) {
  const { saveDeck, saveCardSet, toast, today } = useApp()
  const [makeCards, setMakeCards] = useState(true)
  const { overrides } = useData()
  const moduleName = (code: string, fallback: string) => overrides[code] || fallback
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [slides, setSlides] = useState<DeckSlide[] | null>(null)
  const [title, setTitle] = useState('')
  const [module, setModule] = useState('')
  const [session, setSession] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  async function pick(file: File | undefined) {
    if (!file) return
    setError(null)
    setReading(true)
    try {
      const read = await readDeck(file)
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
      const mod = detectModule(`${file.name} ${read[0]?.title ?? ''}`, modules.map((m) => m.code)) ?? ''
      setSlides(read)
      setFileName(file.name)
      setTitle(read[0]?.title && read[0].title.length < 90 ? read[0].title : base)
      setModule(mod)
      setSession('')
      setTopics([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t read that file.')
    } finally {
      setReading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // Sessions for the chosen module, nearest to today first.
  const sessionOptions = useMemo(() => {
    const list = sessions.filter((e) => !module || (e.module ?? '').split('/').map((x) => x.trim()).includes(module))
    return [...list]
      .sort((a, b) => Math.abs(Date.parse(a.date) - Date.parse(today)) - Math.abs(Date.parse(b.date) - Date.parse(today)))
      .slice(0, 40)
      .sort((a, b) => sessionKey(a).localeCompare(sessionKey(b)))
  }, [sessions, module, today])
  const moduleTopics = modules.find((m) => m.code === module)?.topics ?? []

  const cardCount = useMemo(() => (slides ? cardsFromDeck(slides, () => '').length : 0), [slides])

  async function save() {
    if (!slides) return
    setSaving(true)
    const [sessionDate, sessionStart] = session ? session.split('T') : [null, null]
    const id = newId()
    try {
      const deck = {
        id,
        title: title.trim() || fileName,
        module: module || null,
        sessionDate,
        sessionStart,
        topics,
        slides,
        fileName,
        createdAt: new Date().toISOString(),
      }
      await saveDeck(deck)
      const set = makeCards ? setFromDeck(deck, newId) : null
      if (set) {
        try {
          await saveCardSet(set)
          toast(`Slides added, with ${set.cards.length} flashcards.`)
        } catch (e) {
          toast(e instanceof Error ? e.message : 'Slides added, but the flashcards couldn’t be saved.')
        }
      } else toast('Slides added.')
      onDone()
      router.push(`/slides/view?id=${encodeURIComponent(id)}`)
    } catch {
      toast('Couldn’t save the outline just now.')
      setSaving(false)
    }
  }

  if (!slides) {
    return (
      <section className="card mt-6 p-6" aria-labelledby="add-deck">
        <div className="flex items-start justify-between gap-3">
          <h2 id="add-deck" className="text-[20px] font-semibold">
            Add slides
          </h2>
          <button className="btn btn-ghost min-h-9 px-3 text-[14px]" onClick={onDone}>
            Cancel
          </button>
        </div>
        <label
          className={`mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] border border-dashed border-muted/40 bg-bg/60 px-4 text-center hover:bg-bg ${reading ? 'pointer-events-none opacity-70' : ''}`}
        >
          <span className="text-[16px] font-semibold">{reading ? 'Reading your slides…' : 'Choose a PDF or PowerPoint file'}</span>
          <span className="text-[13px] text-muted">.pdf or .pptx · read on this device, only the outline is saved</span>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            className="sr-only"
            disabled={reading}
            onChange={(e) => void pick(e.target.files?.[0])}
          />
        </label>
        {error && (
          <p role="alert" className="mt-3 rounded-[10px] bg-bad-soft px-3 py-2.5 text-[14px] text-bad-ink">
            {error}
          </p>
        )}
      </section>
    )
  }

  return (
    <section className="card mt-6 overflow-hidden" aria-labelledby="add-deck">
      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div>
            <h2 id="add-deck" className="text-[20px] font-semibold">
              {slides.length} slides read
            </h2>
            <p className="truncate text-[14px] text-muted">{fileName}</p>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[14px] font-medium">Title</span>
            <input className="field" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[14px] font-medium">Module</span>
            <select
              className="field"
              value={module}
              onChange={(e) => {
                setModule(e.target.value)
                setSession('')
                setTopics([])
              }}
            >
              <option value="">None / not sure</option>
              {modules.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.code} · {moduleName(m.code, m.name)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[14px] font-medium">Lecture it’s from (optional)</span>
            <select className="field" value={session} onChange={(e) => setSession(e.target.value)} disabled={sessionOptions.length === 0}>
              <option value="">{sessionOptions.length ? 'Not linked' : 'No sessions for this module in your timetable'}</option>
              {sessionOptions.map((e) => (
                <option key={sessionKey(e)} value={sessionKey(e)}>
                  {fmtDayLong(e.date)}, {e.start} · {e.label}
                </option>
              ))}
            </select>
          </label>
          {moduleTopics.length > 0 && (
            <fieldset>
              <legend className="mb-1.5 text-[14px] font-medium">Topics it covers</legend>
              <div className="flex flex-wrap gap-2">
                {moduleTopics.map((t) => {
                  const on = topics.includes(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setTopics((cur) => (on ? cur.filter((x) => x !== t.id) : [...cur, t.id]))}
                      className={`min-h-9 rounded-lg px-3 text-left text-[13px] font-medium ${on ? 'bg-accent text-on-accent' : 'bg-bg text-ink hover:bg-border'}`}
                    >
                      {t.title}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}
        </div>
        <div className="min-w-0">
          <p className="eyebrow">Outline preview</p>
          <ol className="mt-2 max-h-[380px] space-y-3 overflow-y-auto rounded-[12px] bg-bg p-4">
            {slides.map((s) => (
              <li key={s.n} className="text-[14px]">
                <p className="font-semibold">
                  <span className="mr-1.5 tabular-nums text-muted">{s.n}</span>
                  {s.title}
                </p>
                {s.points.length > 0 && (
                  <ul className="mt-0.5 space-y-0.5 pl-5 text-muted">
                    {s.points.slice(0, 3).map((p, i) => (
                      <li key={i} className="truncate">
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-bg/40 px-6 py-4">
        {cardCount > 0 && (
          <label className="flex min-h-10 w-full items-center gap-2 text-[14px]">
            <input type="checkbox" className="size-4" checked={makeCards} onChange={(e) => setMakeCards(e.target.checked)} />
            Also make {cardCount} flashcards from these slides (slide title on the front, its points on the back)
          </label>
        )}
        <button className="btn btn-primary" disabled={saving} onClick={() => void save()}>
          {saving ? 'Saving…' : 'Save outline'}
        </button>
        <button className="btn btn-quiet" disabled={saving} onClick={() => setSlides(null)}>
          Choose another file
        </button>
        <button className="btn btn-ghost" disabled={saving} onClick={onDone}>
          Cancel
        </button>
      </div>
    </section>
  )
}
