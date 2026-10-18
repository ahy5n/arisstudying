'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { todayISO } from '@/lib/dates'
import { schedule } from '@/lib/leitner'
import {
  backend,
  type AuthUser,
  type FlagRecord,
  type NewAssessment,
  type PlacementProgress,
  type Progress,
  type UserData,
} from '@/lib/store'
import type { Assessment } from '@/lib/tracker'
import type { ItemKind } from '@/lib/types'

type Status = 'loading' | 'signed-out' | 'ready' | 'error'

interface AppState {
  status: Status
  user: AuthUser | null
  data: UserData | null
  mode: 'local' | 'supabase'
  today: string
  error: string | null
  signIn(username: string, password: string): Promise<void>
  signOut(): Promise<void>
  changePassword(current: string, next: string): Promise<void>
  retry(): void
  setProgress(topicId: string, field: keyof Progress, value: boolean): void
  setChecklist(checklistId: string, steps: number[]): void
  toggleChecklistStep(checklistId: string, step: number): void
  saveNote(topicId: string, body: string): Promise<void>
  recordResult(itemId: string, kind: ItemKind, correct: boolean, chosen: string): void
  addAssessments(items: NewAssessment[]): Promise<void>
  updateAssessment(a: Assessment): void
  deleteAssessment(id: string): void
  setOverride(code: string, name: string | null): void
  setClaudeUrl(url: string): Promise<void>
  markTrackerSeeded(): void
  flag(f: Omit<FlagRecord, 'createdAt'>): Promise<void>
  setPlacement(placementId: string, patch: Partial<PlacementProgress>): void
  toast(message: string): void
}

const Ctx = createContext<AppState | null>(null)

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside AppProvider')
  return v
}

/** The signed-in user's data; only call inside the signed-in shell. */
export function useData(): UserData {
  const { data } = useApp()
  if (!data) throw new Error('useData before data loaded')
  return data
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [data, setData] = useState<UserData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [today, setToday] = useState(() => todayISO())
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Latest data for actions that compute from current state.
  const dataRef = useRef<UserData | null>(null)

  const toast = useCallback((message: string) => {
    setToastMsg(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 3200)
  }, [])

  const loadFor = useCallback(async (u: AuthUser) => {
    setStatus('loading')
    try {
      const d = await backend.load(u)
      dataRef.current = d
      setUser(u)
      setData(d)
      setError(null)
      setStatus('ready')
    } catch (e) {
      setUser(u)
      setError(e instanceof Error ? e.message : String(e))
      setStatus('error')
    }
  }, [])

  const boot = useCallback(async () => {
    try {
      const u = await backend.currentUser()
      if (u) await loadFor(u)
      else setStatus('signed-out')
    } catch {
      setStatus('signed-out')
    }
  }, [loadFor])

  useEffect(() => {
    // Dev/testing aid: ?today=2026-10-19 pretends it's that date.
    const q = new URLSearchParams(window.location.search).get('today')
    if (q === 'off') sessionStorage.removeItem('aris:today')
    else if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) sessionStorage.setItem('aris:today', q)
    const stored = sessionStorage.getItem('aris:today')
    if (stored) setToday(stored)
    void boot()
  }, [boot])

  // Saving failures shouldn't lose the tick on screen; tell her gently.
  const persist = useCallback(
    (p: Promise<unknown>) => {
      p.catch(() => toast('Couldn’t save that just now — check your connection.'))
    },
    [toast],
  )

  // Saves to the same row run one after another, so the last tap wins.
  const queues = useRef(new Map<string, Promise<unknown>>())
  const serial = useCallback(
    (key: string, run: () => Promise<unknown>) => {
      const prev = queues.current.get(key) ?? Promise.resolve()
      const next = prev.catch(() => {}).then(run)
      queues.current.set(key, next)
      persist(next)
    },
    [persist],
  )

  // Apply changes to the latest data synchronously, so two quick taps
  // (before React re-renders) both land.
  const update = useCallback((fn: (d: UserData) => UserData) => {
    const cur = dataRef.current
    if (!cur) return
    const next = fn(cur)
    dataRef.current = next
    setData(next)
  }, [])

  const value = useMemo<AppState>(() => {
    const u = user!
    return {
      status,
      user,
      data,
      mode: backend.mode,
      today,
      error,
      toast,
      retry: () => void boot(),

      async signIn(username, password) {
        const signed = await backend.signIn(username, password)
        await loadFor(signed)
      },
      async signOut() {
        await backend.signOut()
        dataRef.current = null
        setUser(null)
        setData(null)
        setStatus('signed-out')
      },
      async changePassword(current, next) {
        await backend.changePassword(u, current, next)
      },

      setProgress(topicId, field, v) {
        const cur = dataRef.current?.progress[topicId] ?? { covered: false, revised: false }
        const next = { ...cur, [field]: v }
        update((d) => ({ ...d, progress: { ...d.progress, [topicId]: next } }))
        serial(`progress:${topicId}`, () => backend.saveProgress(u, topicId, next))
      },

      toggleChecklistStep(id, step) {
        const cur = new Set(dataRef.current?.checklists[id] ?? [])
        if (cur.has(step)) cur.delete(step)
        else cur.add(step)
        const steps = [...cur].sort((a, b) => a - b)
        update((d) => ({ ...d, checklists: { ...d.checklists, [id]: steps } }))
        serial(`checklist:${id}`, () => backend.saveChecklist(u, id, steps))
      },

      setChecklist(id, steps) {
        update((d) => ({ ...d, checklists: { ...d.checklists, [id]: steps } }))
        serial(`checklist:${id}`, () => backend.saveChecklist(u, id, steps))
      },

      async saveNote(topicId, body) {
        update((d) => ({ ...d, notes: { ...d.notes, [topicId]: body } }))
        await backend.saveNote(u, topicId, body)
      },

      recordResult(itemId, kind, correct, chosen) {
        const existing = dataRef.current?.reviews[itemId]
        const next = schedule(existing, itemId, kind, correct, today)
        if (next) {
          update((d) => ({ ...d, reviews: { ...d.reviews, [itemId]: next } }))
          serial(`review:${itemId}`, () => backend.saveReview(u, next))
        }
        persist(backend.addAttempt(u, itemId, correct, chosen))
      },

      async addAssessments(items) {
        const created = await backend.addAssessments(u, items)
        update((d) => ({ ...d, assessments: [...d.assessments, ...created] }))
      },
      updateAssessment(a) {
        update((d) => ({ ...d, assessments: d.assessments.map((x) => (x.id === a.id ? a : x)) }))
        serial(`assessment:${a.id}`, () => backend.updateAssessment(u, a))
      },
      deleteAssessment(id) {
        update((d) => ({ ...d, assessments: d.assessments.filter((x) => x.id !== id) }))
        persist(backend.deleteAssessment(u, id))
      },

      setOverride(code, name) {
        update((d) => {
          const overrides = { ...d.overrides }
          if (name) overrides[code] = name
          else delete overrides[code]
          return { ...d, overrides }
        })
        serial(`override:${code}`, () => backend.saveOverride(u, code, name))
      },

      async setClaudeUrl(url) {
        await backend.saveProfile(u, { claudeProjectUrl: url })
        update((d) => ({ ...d, profile: { ...d.profile, claudeProjectUrl: url } }))
      },

      markTrackerSeeded() {
        update((d) => ({ ...d, profile: { ...d.profile, trackerSeeded: true } }))
        persist(backend.saveProfile(u, { trackerSeeded: true }))
      },

      setPlacement(id, patch) {
        const cur: PlacementProgress = dataRef.current?.placements?.[id] ?? {
          status: 'not-contacted',
          interviewDate: null,
          interviewTime: null,
        }
        const next = { ...cur, ...patch }
        update((d) => ({ ...d, placements: { ...d.placements, [id]: next } }))
        serial(`placement:${id}`, () => backend.savePlacement(u, id, next))
      },

      async flag(f) {
        await backend.addFlag(u, f)
        update((d) => ({ ...d, flags: [{ ...f, createdAt: new Date().toISOString() }, ...d.flags] }))
      },
    }
  }, [status, user, data, today, error, toast, boot, loadFor, persist, serial, update])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {toastMsg && (
          <div className="toast-in rounded-full bg-ink px-5 py-3 text-[15px] font-medium text-white shadow-lg">
            {toastMsg}
          </div>
        )}
      </div>
    </Ctx.Provider>
  )
}
