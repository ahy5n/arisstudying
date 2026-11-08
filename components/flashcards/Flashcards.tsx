'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { isDue } from '@/lib/leitner'
import type { ModuleOption } from '@/lib/moduleOptions'
import type { CardSet } from '@/lib/store'
import { newId } from '@/lib/timetable'
import { cardSetItems, userCardId } from '@/lib/userCards'
import { useApp, useData, useModuleName } from '../AppProvider'
import { BackLink, type ColourMap, ModuleChip } from '../bits'
import { ChevronRight, PlusIcon, TrashIcon } from '../icons'
import { PracticeRunner } from '../practice/PracticeRunner'
import { shuffle } from '../practice/shuffle'
import { ImportCards } from './ImportCards'

export function Flashcards({ modules }: { modules: ModuleOption[] }) {
  const params = useSearchParams()
  const { cardSets } = useData()
  const setId = params.get('set')
  const set = setId ? cardSets.find((s) => s.id === setId) : undefined
  const colours: ColourMap = Object.fromEntries(modules.map((m) => [m.code, m.colour]))

  if (setId) return set ? <SetView set={set} modules={modules} colours={colours} /> : <Missing />
  return <SetList modules={modules} colours={colours} importing={params.get('import') === '1'} />
}

function Missing() {
  return (
    <div className="mx-auto max-w-[760px]">
      <BackLink href="/flashcards">Flashcards</BackLink>
      <p className="card mt-4 p-6 text-muted">That set isn’t here any more.</p>
    </div>
  )
}

function SetList({ modules, colours, importing }: { modules: ModuleOption[]; colours: ColourMap; importing: boolean }) {
  const router = useRouter()
  const { cardSets } = useData()
  const [adding, setAdding] = useState(importing)
  const sets = [...cardSets].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const total = sets.reduce((n, s) => n + s.cards.length, 0)

  return (
    <div className="mx-auto max-w-[920px]">
      <BackLink href="/">Home</BackLink>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-semibold">Your flashcards</h1>
          <p className="mt-1 max-w-2xl text-muted">
            Bring in cards from Quizlet, Anki or a spreadsheet, or make them from your lecture slides. Ones you mark “Again” come back in your mistakes
            deck.
          </p>
        </div>
        {!adding && (
          <button className="btn btn-primary" onClick={() => setAdding(true)}>
            <PlusIcon className="size-[18px]" />
            Import cards
          </button>
        )}
      </div>

      {adding && (
        <ImportCards
          modules={modules}
          onDone={(id) => {
            setAdding(false)
            if (id) router.push(`/flashcards?set=${encodeURIComponent(id)}`)
          }}
        />
      )}

      {sets.length === 0 && !adding && (
        <div className="card mt-6 p-8 text-center">
          <p className="text-[18px] font-semibold">No flashcard sets yet</p>
          <p className="mx-auto mt-1 max-w-md text-[15px] text-muted">
            Import a set you already have, or open one of your <Link href="/slides" className="font-semibold text-ink underline underline-offset-4">slide decks</Link> and
            choose “Make flashcards”.
          </p>
          <button className="btn btn-primary mt-4" onClick={() => setAdding(true)}>
            <PlusIcon className="size-[18px]" />
            Import cards
          </button>
        </div>
      )}

      {sets.length > 0 && (
        <>
          <p className="mt-6 text-[14px] text-muted">
            {sets.length} {sets.length === 1 ? 'set' : 'sets'} · {total} cards
          </p>
          <ul className="card mt-2 divide-y divide-border/80">
            {sets.map((s) => (
              <li key={s.id}>
                <Link href={`/flashcards?set=${encodeURIComponent(s.id)}`} className="group flex items-center gap-3 px-5 py-4 hover:bg-bg/50">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                      {s.module && <ModuleChip code={s.module} colours={colours} />}
                      {s.cards.length} {s.cards.length === 1 ? 'card' : 'cards'}
                    </span>
                    <span className="mt-1 block truncate text-[16px] font-medium">{s.name}</span>
                  </span>
                  <ChevronRight className="size-[18px] shrink-0 text-muted group-hover:text-ink" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function SetView({ set, modules, colours }: { set: CardSet; modules: ModuleOption[]; colours: ColourMap }) {
  const router = useRouter()
  const { saveCardSet, deleteCardSet, toast, today } = useApp()
  const { reviews } = useData()
  const moduleName = useModuleName()
  const [session, setSession] = useState<ReturnType<typeof cardSetItems> | null>(null)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const items = useMemo(() => cardSetItems([set]), [set])
  const due = items.filter((it) => reviews[it.id] && isDue(reviews[it.id], today))

  async function save(next: CardSet, message?: string) {
    try {
      await saveCardSet(next)
      if (message) toast(message)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Couldn’t save just now.')
    }
  }

  if (session) {
    return (
      <div className="mx-auto max-w-[760px]">
        <button className="text-[15px] font-medium text-muted hover:text-ink" onClick={() => setSession(null)}>
          ← {set.name}
        </button>
        <div className="card mt-4 p-5 sm:p-7">
          <PracticeRunner items={session} onRestart={() => setSession(shuffle(items))} restartLabel="Go again" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <BackLink href="/flashcards">Flashcards</BackLink>
      <div className="mt-2">
        {set.module && <ModuleChip code={set.module} colours={colours} link />}
        {editing ? (
          <SetDetailsForm
            set={set}
            modules={modules}
            onCancel={() => setEditing(false)}
            onSave={async (name, module) => {
              await save({ ...set, name, module }, 'Saved.')
              setEditing(false)
            }}
          />
        ) : (
          <>
            <h1 className="mt-1 text-[30px] font-semibold">{set.name}</h1>
            <p className="mt-1 text-muted">
              {set.cards.length} {set.cards.length === 1 ? 'card' : 'cards'}
              {set.module && ` · ${moduleName(set.module, modules.find((m) => m.code === set.module)?.name ?? set.module)}`}
              {' · '}
              <button className="font-semibold text-ink underline-offset-4 hover:underline" onClick={() => setEditing(true)}>
                Rename
              </button>
            </p>
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className="btn btn-primary" disabled={!items.length} onClick={() => setSession(shuffle(items))}>
          Study all {items.length}
        </button>
        {due.length > 0 && (
          <button className="btn btn-soft" onClick={() => setSession(shuffle(due))}>
            Redo {due.length} due today
          </button>
        )}
      </div>

      <AddCardForm onAdd={(front, back) => save({ ...set, cards: [...set.cards, { id: newId(), front, back }] }, 'Card added.')} />

      <ul className="mt-4 space-y-2">
        {set.cards.map((c, i) => (
          <CardRow
            key={c.id}
            n={i + 1}
            front={c.front}
            back={c.back}
            inDeck={!!reviews[userCardId(set.id, c.id)]}
            onSave={(front, back) => save({ ...set, cards: set.cards.map((x) => (x.id === c.id ? { ...x, front, back } : x)) })}
            onDelete={() => save({ ...set, cards: set.cards.filter((x) => x.id !== c.id) }, 'Card removed.')}
          />
        ))}
      </ul>

      <div className="mt-8 border-t border-border pt-5">
        {confirmDelete ? (
          <p className="flex flex-wrap items-center gap-3 text-[14px]">
            Delete “{set.name}” and all {set.cards.length} cards?
            <button
              className="btn min-h-10 bg-bad-ink px-4 text-surface hover:opacity-90"
              onClick={async () => {
                try {
                  await deleteCardSet(set.id)
                  toast('Set deleted.')
                  router.push('/flashcards')
                } catch (e) {
                  toast(e instanceof Error ? e.message : 'Couldn’t delete just now.')
                }
              }}
            >
              Delete set
            </button>
            <button className="btn btn-quiet min-h-10" onClick={() => setConfirmDelete(false)}>
              Keep it
            </button>
          </p>
        ) : (
          <button className="inline-flex min-h-10 items-center gap-1.5 text-[14px] font-semibold text-bad-ink" onClick={() => setConfirmDelete(true)}>
            <TrashIcon className="size-4" />
            Delete this set
          </button>
        )}
      </div>
    </div>
  )
}

function SetDetailsForm({
  set,
  modules,
  onSave,
  onCancel,
}: {
  set: CardSet
  modules: ModuleOption[]
  onSave: (name: string, module: string | null) => void
  onCancel: () => void
}) {
  const moduleName = useModuleName()
  const [name, setName] = useState(set.name)
  const [mod, setMod] = useState(set.module ?? '')
  return (
    <form
      className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(name.trim() || set.name, mod || null)
      }}
    >
      <input className="field text-[18px] font-semibold" value={name} onChange={(e) => setName(e.target.value)} aria-label="Set name" autoFocus />
      <select className="field" value={mod} onChange={(e) => setMod(e.target.value)} aria-label="Subject">
        <option value="">No subject</option>
        {modules.map((m) => (
          <option key={m.code} value={m.code}>
            {m.code} · {moduleName(m.code, m.name)}
          </option>
        ))}
      </select>
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn btn-primary">Save</button>
        <button type="button" className="btn btn-quiet" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function AddCardForm({ onAdd }: { onAdd: (front: string, back: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  if (!open) {
    return (
      <button className="mt-6 inline-flex min-h-10 items-center gap-1.5 text-[14px] font-semibold text-ink" onClick={() => setOpen(true)}>
        <PlusIcon className="size-4" />
        Add a card
      </button>
    )
  }
  return (
    <form
      className="card mt-6 grid gap-3 p-4 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!front.trim() || !back.trim()) return
        await onAdd(front.trim(), back.trim())
        setFront('')
        setBack('')
      }}
    >
      <label className="block text-[14px] font-semibold">
        Front
        <textarea className="field mt-1 min-h-[80px]" value={front} onChange={(e) => setFront(e.target.value)} autoFocus />
      </label>
      <label className="block text-[14px] font-semibold">
        Back
        <textarea className="field mt-1 min-h-[80px]" value={back} onChange={(e) => setBack(e.target.value)} />
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn btn-primary" disabled={!front.trim() || !back.trim()}>
          Add card
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => setOpen(false)}>
          Done
        </button>
      </div>
    </form>
  )
}

function CardRow({
  n,
  front,
  back,
  inDeck,
  onSave,
  onDelete,
}: {
  n: number
  front: string
  back: string
  inDeck: boolean
  onSave: (front: string, back: string) => Promise<void>
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [f, setF] = useState(front)
  const [b, setB] = useState(back)

  if (editing) {
    return (
      <li className="card grid gap-3 p-4 sm:grid-cols-2">
        <textarea className="field min-h-[80px]" value={f} onChange={(e) => setF(e.target.value)} aria-label={`Card ${n} front`} autoFocus />
        <textarea className="field min-h-[80px]" value={b} onChange={(e) => setB(e.target.value)} aria-label={`Card ${n} back`} />
        <div className="flex gap-2 sm:col-span-2">
          <button
            className="btn btn-primary min-h-10"
            disabled={!f.trim() || !b.trim()}
            onClick={async () => {
              await onSave(f.trim(), b.trim())
              setEditing(false)
            }}
          >
            Save
          </button>
          <button
            className="btn btn-quiet min-h-10"
            onClick={() => {
              setF(front)
              setB(back)
              setEditing(false)
            }}
          >
            Cancel
          </button>
        </div>
      </li>
    )
  }
  return (
    <li className="card flex items-start gap-3 px-4 py-3">
      <span className="w-6 shrink-0 pt-0.5 text-[13px] text-muted">{n}</span>
      <button className="grid min-w-0 flex-1 gap-1 text-left text-[14.5px] sm:grid-cols-2 sm:gap-4" onClick={() => setEditing(true)} aria-label={`Edit card ${n}`}>
        <span className="whitespace-pre-line font-medium">{front}</span>
        <span className="whitespace-pre-line text-muted">{back}</span>
      </button>
      {inDeck && <span className="shrink-0 rounded-md bg-accent-soft px-1.5 py-0.5 text-[11.5px] font-semibold text-accent-strong">In mistakes</span>}
      <button className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-bg hover:text-bad-ink" onClick={onDelete} aria-label={`Remove card ${n}`}>
        <TrashIcon className="size-4" />
      </button>
    </li>
  )
}
