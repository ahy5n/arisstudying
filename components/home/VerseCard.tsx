'use client'

import { useState } from 'react'
import { daysBetween } from '@/lib/dates'
import type { ResolvedVerse } from '@/lib/types'
import { useApp } from '../AppProvider'

export function VerseCard({ verses }: { verses: ResolvedVerse[] }) {
  const { today } = useApp()
  const [offset, setOffset] = useState(0)
  const [full, setFull] = useState(false)
  if (!verses.length) return null
  const base = ((daysBetween('2026-01-01', today) % verses.length) + verses.length) % verses.length
  const v = verses[(base + offset) % verses.length]
  const showArabic = !!v.arabic && !v.partial
  const canExpand = v.partial && !!(v.arabic || v.englishFull)

  return (
    <figure className="card relative overflow-hidden bg-gradient-to-br from-white via-white to-rose-soft">
      <button
        className="block w-full px-6 pb-5 pt-6 text-left sm:px-7"
        onClick={() => {
          setOffset((o) => o + 1)
          setFull(false)
        }}
        aria-label="Show another verse"
      >
        {showArabic && (
          <p dir="rtl" lang="ar" className="mb-4 font-arabic text-[26px] leading-[1.9] text-ink sm:text-[28px]">
            {v.arabic}
          </p>
        )}
        <blockquote className="text-[18px] leading-relaxed text-ink">“{v.english}”</blockquote>
        <figcaption className="mt-3 flex items-baseline justify-between gap-3 text-[15px] text-muted">
          <span>
            — {v.surah ? `Surah ${v.surah} ` : 'Qur’an '}
            {v.ref}
          </span>
          <span aria-hidden className="shrink-0 text-[12px] text-faint">
            tap for another
          </span>
        </figcaption>
      </button>
      {canExpand && (
        <div className="-mt-2 px-6 pb-5 sm:px-7">
          <button
            className="text-[14px] font-semibold text-rose-ink underline-offset-4 hover:underline"
            onClick={() => setFull((f) => !f)}
            aria-expanded={full}
          >
            {full ? 'Hide the full ayah' : 'Read the full ayah'}
          </button>
          {full && (
            <div className="fade-in mt-3 space-y-3 border-t border-line pt-3">
              {v.arabic && (
                <p dir="rtl" lang="ar" className="font-arabic text-[24px] leading-[1.9]">
                  {v.arabic}
                </p>
              )}
              {v.englishFull && <p className="text-[16px] text-muted">{v.englishFull}</p>}
            </div>
          )}
        </div>
      )}
    </figure>
  )
}
