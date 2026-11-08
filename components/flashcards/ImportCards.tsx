'use client'

import { useMemo, useRef, useState } from 'react'
import { MAX_CARDS, parseCards, SEPARATORS, type Separator } from '@/lib/flashcardImport'
import type { ModuleOption } from '@/lib/moduleOptions'
import { detectModule, newId } from '@/lib/timetable'
import { useApp, useModuleName } from '../AppProvider'

const MAX_FILE = 5 * 1024 * 1024

/** Paste or upload cards from Quizlet, Anki or a spreadsheet, check them, then save as a set. */
export function ImportCards({ modules, onDone }: { modules: ModuleOption[]; onDone: (setId: string | null) => void }) {
  const { saveCardSet, toast } = useApp()
  const moduleName = useModuleName()
  const fileRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [sep, setSep] = useState<Separator | 'auto'>('auto')
  const [swap, setSwap] = useState(false)
  const [name, setName] = useState('')
  const [mod, setMod] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const parsed = useMemo(() => (text.trim() ? parseCards(text, sep) : null), [text, sep])
  const cards = parsed ? parsed.cards.map((c) => (swap ? { front: c.back, back: c.front } : c)) : []

  async function readFile(file: File) {
    setError(null)
    if (file.size > MAX_FILE) return setError('That file is over 5 MB. Export just the cards as text or CSV.')
    if (/\.(apkg|colpkg|xlsx?|numbers|docx?)$/i.test(file.name)) {
      return setError(
        'That file type can’t be read here. From Anki use File → Export → “Notes in Plain Text”; from Excel or Sheets save as CSV; from Quizlet use Export and copy the text.',
      )
    }
    const body = await file.text()
    setText(body)
    if (!name) setName(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim())
    if (!mod) setMod(detectModule(file.name, modules.map((m) => m.code)) ?? '')
  }

  async function save() {
    if (!cards.length) return
    setBusy(true)
    try {
      const id = newId()
      await saveCardSet({
        id,
        name: name.trim() || 'Imported cards',
        module: mod || null,
        cards: cards.map((c) => ({ id: newId(), ...c })),
        createdAt: new Date().toISOString(),
      })
      toast(`Imported ${cards.length} ${cards.length === 1 ? 'card' : 'cards'}.`)
      onDone(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t save just now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card mt-6 p-5 sm:p-7" aria-labelledby="import-title">
      <h2 id="import-title" className="text-[20px] font-semibold">
        Import flashcards
      </h2>
      <p className="mt-1 text-[14px] text-muted">
        One card per line, with the front and back split by a tab or comma. This is what Quizlet’s Export, Anki’s “Notes in Plain Text” and a two-column
        spreadsheet saved as CSV all give you.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-soft" onClick={() => fileRef.current?.click()}>
          Choose a file
        </button>
        <span className="text-[13px] text-muted">.txt, .csv or .tsv, or paste below</span>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.csv,.tsv,text/plain,text/csv,text/tab-separated-values"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void readFile(f)
            e.target.value = ''
          }}
        />
      </div>

      <label className="mt-4 block text-[14px] font-semibold" htmlFor="cards-text">
        Cards
      </label>
      <textarea
        id="cards-text"
        className="field mt-1 min-h-[160px] font-mono text-[13.5px]"
        placeholder={'Myopia\tShort-sightedness: light focuses in front of the retina\nPrentice’s rule\tP = cF, with c in cm'}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setError(null)
        }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
        <label className="flex items-center gap-2">
          Split by
          <select className="field min-h-9 w-auto py-1 text-[14px]" value={sep} onChange={(e) => setSep(e.target.value as Separator | 'auto')}>
            <option value="auto">Work it out{parsed && sep === 'auto' ? ` (${SEPARATORS.find((s) => s.key === parsed.separator)?.label.split(' (')[0]})` : ''}</option>
            {SEPARATORS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-9 items-center gap-2">
          <input type="checkbox" className="size-4" checked={swap} onChange={(e) => setSwap(e.target.checked)} />
          Swap front and back
        </label>
      </div>

      {parsed && (
        <div className="mt-5">
          <p className="text-[14px] font-semibold">
            {cards.length ? `${cards.length} ${cards.length === 1 ? 'card' : 'cards'} found` : 'No cards found yet'}
            {parsed.skipped > 0 && (
              <span className="font-normal text-muted">
                {' '}
                · {parsed.skipped} {parsed.skipped === 1 ? 'line' : 'lines'} skipped: missing a side or a repeat
                {parsed.cards.length >= MAX_CARDS ? `, or over the ${MAX_CARDS}-card limit` : ''}
              </span>
            )}
          </p>
          {cards.length === 0 && <p className="mt-1 text-[14px] text-muted">Try a different “Split by” option.</p>}
          {cards.length > 0 && (
            <ul className="mt-2 divide-y divide-border/80 overflow-hidden rounded-xl border border-border">
              {cards.slice(0, 5).map((c, i) => (
                <li key={i} className="grid gap-1 px-4 py-2.5 text-[14px] sm:grid-cols-2 sm:gap-4">
                  <span className="whitespace-pre-line font-medium">{c.front}</span>
                  <span className="whitespace-pre-line text-muted">{c.back}</span>
                </li>
              ))}
              {cards.length > 5 && <li className="px-4 py-2 text-[13px] text-muted">…and {cards.length - 5} more</li>}
            </ul>
          )}
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block text-[14px] font-semibold">
          Set name
          <input className="field mt-1" value={name} placeholder="Imported cards" onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-[14px] font-semibold">
          Subject (optional)
          <select className="field mt-1" value={mod} onChange={(e) => setMod(e.target.value)}>
            <option value="">None</option>
            {modules.map((m) => (
              <option key={m.code} value={m.code}>
                {m.code} · {moduleName(m.code, m.name)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-bad-soft px-4 py-3 text-[14px] text-bad-ink">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button className="btn btn-primary" disabled={!cards.length || busy} onClick={save}>
          {busy ? 'Saving…' : cards.length ? `Save ${cards.length} ${cards.length === 1 ? 'card' : 'cards'}` : 'Save cards'}
        </button>
        <button className="btn btn-quiet" onClick={() => onDone(null)}>
          Cancel
        </button>
      </div>
    </section>
  )
}
