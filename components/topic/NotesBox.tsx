'use client'

import { useEffect, useRef, useState } from 'react'
import { useApp, useData } from '../AppProvider'

export function NotesBox({ topicId }: { topicId: string }) {
  const { saveNote } = useApp()
  const data = useData()
  const [body, setBody] = useState(data.notes[topicId] ?? '')
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef(body)

  useEffect(() => () => {
    // Save anything pending when leaving the page.
    if (timer.current) {
      clearTimeout(timer.current)
      void saveNote(topicId, latest.current).catch(() => {})
    }
  }, [topicId, saveNote])

  function onChange(v: string) {
    setBody(v)
    latest.current = v
    setState('saving')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      timer.current = null
      try {
        await saveNote(topicId, v)
        setState('saved')
      } catch {
        setState('error')
      }
    }, 700)
  }

  return (
    <div>
      <textarea
        className="field min-h-36 resize-y leading-relaxed"
        placeholder="Quick typed notes — your main notes stay in GoodNotes."
        value={body}
        onChange={(e) => onChange(e.target.value)}
        aria-label="My notes"
      />
      <p className="mt-1.5 h-5 text-[13px] text-muted" aria-live="polite">
        {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : state === 'error' ? 'Couldn’t save — check your connection.' : ''}
      </p>
    </div>
  )
}
