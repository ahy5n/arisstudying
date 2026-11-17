'use client'

// "Explain it": write the topic in your own words, then Claude marks it against
// the key points, says what was missed and what to add next time.
import { useEffect, useState } from 'react'
import { hasSupabase } from '@/lib/store'
import { supabaseAccessToken } from '@/lib/store/supabase'
import { MAX_ANSWER_CHARS, MIN_ANSWER_CHARS, scoreOf, type MarkResult, type PointStatus } from '@/lib/marking'
import { ResetIcon, SparkleIcon } from '../icons'

const STATUS: Record<PointStatus, { mark: string; label: string; cls: string }> = {
  covered: { mark: '✓', label: 'Covered', cls: 'bg-good-soft text-good-ink' },
  partly: { mark: '~', label: 'Partly', cls: 'bg-warn-soft text-warn-ink' },
  missed: { mark: '✗', label: 'Missed', cls: 'bg-bad-soft text-bad-ink' },
}

interface Saved {
  answer: string
  result: MarkResult | null
}

const storeKey = (topicId: string) => `explain-it:${topicId}`

function load(topicId: string): Saved | null {
  try {
    const raw = localStorage.getItem(storeKey(topicId))
    return raw ? (JSON.parse(raw) as Saved) : null
  } catch {
    return null
  }
}

function save(topicId: string, s: Saved) {
  try {
    localStorage.setItem(storeKey(topicId), JSON.stringify(s))
  } catch {
    /* private mode or storage full: the attempt just isn't remembered */
  }
}

export function ExplainIt({ topicId, title }: { topicId: string; title: string }) {
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<MarkResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const s = load(topicId)
    if (s) {
      setAnswer(s.answer)
      setResult(s.result)
    }
  }, [topicId])

  const tooShort = answer.trim().length < MIN_ANSWER_CHARS

  async function mark() {
    setBusy(true)
    setError('')
    try {
      const headers: Record<string, string> = { 'content-type': 'application/json' }
      if (hasSupabase) {
        const token = await supabaseAccessToken()
        if (token) headers.authorization = `Bearer ${token}`
      }
      const res = await fetch('/api/mark', { method: 'POST', headers, body: JSON.stringify({ topicId, answer }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong marking that. Try again.')
      setResult(data as MarkResult)
      save(topicId, { answer, result: data as MarkResult })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong marking that. Try again.')
    } finally {
      setBusy(false)
    }
  }

  function tryAgain() {
    setResult(null)
    setAnswer('')
    setError('')
    save(topicId, { answer: '', result: null })
  }

  const score = result ? scoreOf(result) : null

  return (
    <div className="card p-5 sm:p-7">
      <p className="text-[17px] leading-relaxed">
        Explain <b>{title}</b> in your own words, as if you were teaching a friend. Try it before reading the key points
        above. Claude marks it against them and tells you what to add next time.
      </p>

      {!result && (
        <>
          <textarea
            className="field mt-4 min-h-48 resize-y leading-relaxed"
            placeholder="Start typing, or tap the microphone on your keyboard to say it out loud…"
            value={answer}
            maxLength={MAX_ANSWER_CHARS}
            onChange={(e) => {
              setAnswer(e.target.value)
              save(topicId, { answer: e.target.value, result: null })
            }}
            aria-label={`Your explanation of ${title}`}
            disabled={busy}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button className="btn btn-primary" onClick={mark} disabled={busy || tooShort}>
              <SparkleIcon className="size-[18px]" />
              {busy ? 'Marking…' : 'Mark my explanation'}
            </button>
            <span className="text-[13px] text-muted">
              {busy ? 'This takes a few seconds.' : tooShort ? 'Write a few sentences first.' : `${answer.trim().length} characters`}
            </span>
          </div>
        </>
      )}

      {error && (
        <p className="mt-3 rounded-2xl bg-bad-soft p-3 text-[15px] text-bad-ink" role="alert">
          {error}
        </p>
      )}

      {result && score && (
        <div className="mt-5" aria-live="polite">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-[28px] font-semibold">
              {score.got % 1 ? score.got.toFixed(1) : score.got}/{score.total}
            </p>
            <p className="text-[15px] text-muted">key points covered</p>
          </div>
          <p className="mt-2 text-[17px] leading-relaxed">{result.praise}</p>

          <h3 className="mt-6 text-[18px] font-semibold">Key points</h3>
          <ul className="mt-2 space-y-3">
            {result.points.map((p, i) => {
              const s = STATUS[p.status]
              return (
                <li key={i} className="flex gap-3">
                  <span
                    className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-[15px] font-bold ${s.cls}`}
                    aria-label={s.label}
                    title={s.label}
                  >
                    {s.mark}
                  </span>
                  <div className="text-[16px] leading-relaxed">
                    <p className={p.status === 'covered' ? 'text-muted' : 'font-medium'}>{p.point}</p>
                    <p className="text-[15px] text-muted">{p.comment}</p>
                  </div>
                </li>
              )
            })}
          </ul>

          {result.corrections.length > 0 && (
            <div className="mt-6 rounded-[22px] bg-warn-soft p-5 ring-1 ring-warn">
              <h3 className="text-[18px] font-semibold text-warn-ink">Watch out</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[16px] leading-relaxed">
                {result.corrections.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {result.addNextTime.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[18px] font-semibold">Add next time</h3>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[16px] leading-relaxed">
                {result.addNextTime.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ol>
            </div>
          )}

          <details className="mt-6 text-[15px]">
            <summary className="cursor-pointer text-muted">Your explanation</summary>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">{answer}</p>
          </details>

          <div className="mt-5 flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={tryAgain}>
              <ResetIcon className="size-[18px]" />
              Try again
            </button>
            <button className="btn btn-quiet" onClick={() => setResult(null)}>
              Edit this answer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
