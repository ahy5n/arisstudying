'use client'

import Link from 'next/link'
import { useState } from 'react'
import { fmtDayLong } from '@/lib/dates'
import type { ModuleOption } from '@/lib/moduleOptions'
import { useData } from '../AppProvider'
import { type ColourMap, ModuleChip } from '../bits'
import { ChevronRight, PlusIcon } from '../icons'
import { AddDeck, type SessionChoice } from './AddDeck'

/** Decks Ari adds herself: read on her device into an outline, saved to her account. */
export function YourUploads({ modules, sessions, colours }: { modules: ModuleOption[]; sessions: SessionChoice[]; colours: ColourMap }) {
  const { decks } = useData()
  const [adding, setAdding] = useState(false)
  const mine = [...decks].sort((a, b) => (b.sessionDate ?? b.createdAt).localeCompare(a.sessionDate ?? a.createdAt))

  return (
    <section className="mt-6" aria-labelledby="your-uploads">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="your-uploads" className="text-[22px] font-semibold">
            Your uploads
          </h2>
          <p className="mt-0.5 text-[14px] text-muted">Add a PDF or PowerPoint and get a slide-by-slide outline. Only the outline is saved, never the file.</p>
        </div>
        {!adding && (
          <button className="btn btn-primary" onClick={() => setAdding(true)}>
            <PlusIcon className="size-[18px]" />
            Add slides
          </button>
        )}
      </div>

      {adding && <AddDeck modules={modules} sessions={sessions} onDone={() => setAdding(false)} />}

      {mine.length > 0 && (
        <ul className="card mt-4 divide-y divide-border/70">
          {mine.map((d) => (
            <li key={d.id}>
              <Link href={`/slides/view?id=${encodeURIComponent(d.id)}`} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-bg/50">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                    {d.module && <ModuleChip code={d.module} colours={colours} />}
                    {d.sessionDate ? `${fmtDayLong(d.sessionDate)}${d.sessionStart ? `, ${d.sessionStart}` : ''}` : 'Not linked to a session'}
                    <span>· {d.slides.length} {d.slides.length === 1 ? 'slide' : 'slides'}</span>
                  </span>
                  <span className="mt-1 block truncate text-[16px] font-medium">{d.title}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted group-hover:text-ink" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
