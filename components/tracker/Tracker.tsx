'use client'

import { useEffect, useRef, useState } from 'react'
import type { NewAssessment } from '@/lib/store'
import { type Assessment, summarise, TARGET } from '@/lib/tracker'
import { useApp, useData } from '../AppProvider'
import { BackLink } from '../bits'
import { PlusIcon, TrashIcon } from '../icons'

export interface SeedAssessment {
  name: string
  module: string
  date: string
}

const fmt = (n: number) => (Math.round(n * 10) / 10).toString()

export function Tracker({ seeds, moduleCodes }: { seeds: SeedAssessment[]; moduleCodes: string[] }) {
  const { addAssessments, markTrackerSeeded, toast } = useApp()
  const data = useData()
  const seeding = useRef(false)

  // Pre-fill once from the timetable (weightings left blank — we don't know them).
  useEffect(() => {
    if (data.profile.trackerSeeded || seeding.current) return
    seeding.current = true
    const run = async () => {
      try {
        if (data.assessments.length === 0) {
          await addAssessments(seeds.map((s) => ({ ...s, weight: null, mark: null, passFail: false })))
        }
        markTrackerSeeded()
      } catch {
        seeding.current = false
        toast('Couldn’t set up the list just now.')
      }
    }
    void run()
  }, [data.profile.trackerSeeded, data.assessments.length, seeds, addAssessments, markTrackerSeeded, toast])

  const items = [...data.assessments].sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999') || a.name.localeCompare(b.name))
  const s = summarise(items)

  return (
    <div className="mx-auto max-w-[900px]">
      <BackLink href="/">Home</BackLink>
      <h1 className="mt-2 text-[32px] font-semibold">70% tracker</h1>
      <p className="mt-1 text-muted">
        Add each assessment’s weighting (your module handbooks list them) and your mark once you have it.
      </p>

      <Summary s={s} />

      <section className="mt-8" aria-labelledby="assessments">
        <div className="flex items-center justify-between gap-3">
          <h2 id="assessments" className="text-[22px] font-semibold">
            Assessments
          </h2>
          <AddButton moduleCodes={moduleCodes} />
        </div>
        <ul className="mt-3 space-y-3">
          {items.map((a) => (
            <AssessmentRow key={a.id} a={a} moduleCodes={moduleCodes} />
          ))}
        </ul>
        {items.length === 0 && <p className="mt-3 text-muted">No assessments yet.</p>}
        <p className="mt-4 text-[14px] text-muted">
          Weightings are a share of the year (e.g. 20 for 20%). Pass/fail items don’t count towards the average.
        </p>
      </section>
    </div>
  )
}

function Summary({ s }: { s: ReturnType<typeof summarise> }) {
  const avg = s.average
  let headline: string
  let detail: string
  switch (s.state) {
    case 'empty':
      headline = avg != null ? `${fmt(avg)}% so far` : 'Ready when you are'
      detail =
        avg != null && s.unweightedPending > 0
          ? `Add weightings for the other ${s.unweightedPending} assessment${s.unweightedPending === 1 ? '' : 's'} to see what you need on the rest to reach 70%.`
          : 'Add weightings to see what you need on the rest to reach 70%.'
      break
    case 'secured':
      headline = '70% is already secure 🎉'
      detail = `Your marks so far lock it in on the weightings you’ve entered (${fmt(s.totalWeight)}% of the year). Everything else is a bonus.`
      break
    case 'on-track':
      headline = `${fmt(s.needed!)}% on average from here`
      detail = `That’s what you need across the remaining ${fmt(s.remainingWeight)}% of weighted work to finish on 70%.${
        avg != null && avg >= TARGET ? ' You’re above 70% so far — lovely.' : ''
      }`
      break
    case 'stretch':
      headline = `${fmt(s.needed!)}% on average from here`
      detail = `A stretch on the remaining ${fmt(s.remainingWeight)}%, but it’s still within reach.`
      break
    case 'out-of-reach':
      headline = avg != null ? `${fmt(avg)}% so far` : '—'
      detail = `On these weightings, 70% would need more than 100% on what’s left. Every mark still builds a strong year — and double-check the weightings.`
      break
    case 'done':
      headline = `${fmt(avg!)}% for the year`
      detail = avg! >= TARGET ? 'All weighted marks are in, and you made it. 🌷' : 'All weighted marks are in.'
      break
  }
  const pct = Math.max(0, Math.min(100, avg ?? 0))

  return (
    <div className="card mt-6 overflow-hidden">
      <div className="grid gap-6 bg-gradient-to-br from-butter-soft via-white to-rose-soft p-6 sm:grid-cols-[1fr_auto] sm:p-8">
        <div>
          <p className="eyebrow">Towards 70%</p>
          <p className="mt-2 font-rounded text-[30px] font-semibold leading-tight sm:text-[34px]">{headline}</p>
          <p className="mt-2 max-w-xl text-[16px] text-muted">{detail}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 self-end text-[15px] sm:grid-cols-1">
          <div>
            <dt className="text-muted">Average so far</dt>
            <dd className="font-rounded text-[22px] font-semibold">{avg != null ? `${fmt(avg)}%` : '—'}</dd>
          </div>
          <div>
            <dt className="text-muted">Weighting marked</dt>
            <dd className="font-rounded text-[22px] font-semibold">
              {fmt(s.markedWeight)}
              <span className="text-[15px] text-muted"> / {fmt(s.totalWeight)}%</span>
            </dd>
          </div>
        </dl>
      </div>
      {avg != null && (
        <div className="px-6 pb-6 pt-1 sm:px-8">
          <div className="relative h-3 rounded-full bg-wash" role="img" aria-label={`Average ${fmt(avg)}%, target 70%`}>
            <div className="h-full rounded-full bg-gradient-to-r from-rose to-rose-ink/70 transition-all" style={{ width: `${pct}%` }} />
            <div className="absolute -top-1.5 h-6 w-0.5 rounded bg-ink/60" style={{ left: '70%' }} />
          </div>
          <div className="relative mt-1 h-4 text-[12px] text-muted">
            <span className="absolute -translate-x-1/2" style={{ left: '70%' }}>
              70%
            </span>
          </div>
        </div>
      )}
      {s.state !== 'empty' && s.unweightedPending > 0 && (
        <p className="border-t border-line px-6 py-3 text-[14px] text-muted sm:px-8">
          {s.unweightedPending} upcoming {s.unweightedPending === 1 ? 'assessment has' : 'assessments have'} no weighting yet, so {s.unweightedPending === 1 ? 'it isn’t' : 'they aren’t'} in this sum.
        </p>
      )}
      {s.unweightedMarked > 0 && (
        <p className="border-t border-line px-6 py-3 text-[14px] text-muted sm:px-8">
          {s.unweightedMarked} marked {s.unweightedMarked === 1 ? 'item has' : 'items have'} no weighting yet, so {s.unweightedMarked === 1 ? 'it isn’t' : 'they aren’t'} counted.
        </p>
      )}
    </div>
  )
}

function numOrNull(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v.replace(',', '.').replace('%', ''))
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : null
}

function AssessmentRow({ a, moduleCodes }: { a: Assessment; moduleCodes: string[] }) {
  const { updateAssessment, deleteAssessment } = useApp()
  const [name, setName] = useState(a.name)
  const [weight, setWeight] = useState(a.weight?.toString() ?? '')
  const [mark, setMark] = useState(a.mark?.toString() ?? '')
  const [confirm, setConfirm] = useState(false)

  const commit = (patch: Partial<Assessment>) => {
    const next = { ...a, ...patch }
    if (JSON.stringify(next) !== JSON.stringify(a)) updateAssessment(next)
  }
  const id = `a-${a.id}`
  const modules = a.module && !moduleCodes.includes(a.module) ? [a.module, ...moduleCodes] : moduleCodes

  return (
    <li className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-3">
        <input
          className="field min-w-0 flex-1 basis-60 font-medium"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => commit({ name: name.trim() || a.name })}
          aria-label="Assessment name"
        />
        <button
          className={`btn px-3 ${confirm ? 'bg-rose-soft text-rose-ink' : 'btn-ghost'}`}
          onClick={() => (confirm ? deleteAssessment(a.id) : setConfirm(true))}
          onBlur={() => setConfirm(false)}
          aria-label={confirm ? 'Tap again to remove' : `Remove ${a.name}`}
        >
          <TrashIcon className="size-[18px]" />
          {confirm && <span className="text-[14px]">Remove?</span>}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_110px_110px_auto] sm:items-end">
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium text-muted">Module</span>
          <select className="field" value={a.module} onChange={(e) => commit({ module: e.target.value })}>
            <option value="">—</option>
            {modules.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium text-muted">Date</span>
          <input className="field" type="date" value={a.date ?? ''} onChange={(e) => commit({ date: e.target.value || null })} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium text-muted" id={`${id}-w`}>
            Weighting %
          </span>
          <input
            className="field tabular-nums"
            inputMode="decimal"
            placeholder="?"
            value={weight}
            disabled={a.passFail}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={() => {
              const n = numOrNull(weight)
              setWeight(n?.toString() ?? '')
              commit({ weight: n })
            }}
            aria-labelledby={`${id}-w`}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium text-muted" id={`${id}-m`}>
            {a.passFail ? 'Result' : 'Mark %'}
          </span>
          {a.passFail ? (
            <select
              className="field"
              value={a.mark == null ? '' : a.mark >= 50 ? 'pass' : 'fail'}
              onChange={(e) => commit({ mark: e.target.value === '' ? null : e.target.value === 'pass' ? 100 : 0 })}
              aria-labelledby={`${id}-m`}
            >
              <option value="">—</option>
              <option value="pass">Pass</option>
              <option value="fail">Not yet</option>
            </select>
          ) : (
            <input
              className="field tabular-nums"
              inputMode="decimal"
              placeholder="—"
              value={mark}
              onChange={(e) => setMark(e.target.value)}
              onBlur={() => {
                const n = numOrNull(mark)
                setMark(n?.toString() ?? '')
                commit({ mark: n })
              }}
              aria-labelledby={`${id}-m`}
            />
          )}
        </label>
        <label className="col-span-2 flex min-h-12 cursor-pointer items-center gap-2 sm:col-span-1">
          <input
            type="checkbox"
            className="size-5 accent-[var(--color-rose-ink)]"
            checked={a.passFail}
            onChange={(e) => {
              const pf = e.target.checked
              setMark('')
              commit({ passFail: pf, mark: null })
            }}
          />
          <span className="text-[15px]">Pass/fail</span>
        </label>
      </div>
    </li>
  )
}

function AddButton({ moduleCodes }: { moduleCodes: string[] }) {
  const { addAssessments, toast } = useApp()
  const [busy, setBusy] = useState(false)
  return (
    <button
      className="btn btn-soft"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        const blank: NewAssessment = { name: 'New assessment', module: '', weight: null, mark: null, passFail: false, date: null }
        try {
          await addAssessments([blank])
        } catch {
          toast('Couldn’t add that just now.')
        } finally {
          setBusy(false)
        }
      }}
    >
      <PlusIcon className="size-[18px]" />
      Add
    </button>
  )
}
