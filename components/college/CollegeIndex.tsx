'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ChevronRight } from '@/components/icons'
import type { Cmg, GuidanceItem } from '@/lib/college'

type Tab = 'cmg' | 'guidance'

export function CollegeIndex({ cmgs, guidance }: { cmgs: Cmg[]; guidance: GuidanceItem[] }) {
  const [tab, setTab] = useState<Tab>('cmg')
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()

  const groups = useMemo(() => {
    const list: { id: string; title: string; group: string; sub?: string }[] =
      tab === 'cmg'
        ? cmgs.map((c) => ({ id: c.id, title: c.title, group: c.group, sub: c.refer }))
        : guidance.map((g) => ({ id: g.id, title: g.title, group: g.domain }))
    const hits = needle
      ? list.filter((i) => {
          const full = tab === 'cmg' ? cmgs.find((c) => c.id === i.id) : guidance.find((g) => g.id === i.id)
          return JSON.stringify(full).toLowerCase().includes(needle)
        })
      : list
    const m = new Map<string, typeof hits>()
    for (const h of hits) m.set(h.group, [...(m.get(h.group) ?? []), h])
    return [...m.entries()].sort((a, b) => (tab === 'cmg' ? a[0].localeCompare(b[0]) : 0))
  }, [tab, needle, cmgs, guidance])

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2" role="tablist">
        <TabButton active={tab === 'cmg'} onClick={() => setTab('cmg')}>
          Clinical Management Guidelines ({cmgs.length})
        </TabButton>
        <TabButton active={tab === 'guidance'} onClick={() => setTab('guidance')}>
          Professional guidance ({guidance.length})
        </TabButton>
      </div>
      <input
        className="field mt-4"
        type="search"
        placeholder={tab === 'cmg' ? 'Search conditions, e.g. uveitis, red eye, refer' : 'Search guidance, e.g. consent, DVLA, records'}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search"
      />
      {groups.length === 0 && <p className="mt-6 text-muted">Nothing matches “{q}”.</p>}
      <div className="mt-6 space-y-8">
        {groups.map(([group, items]) => (
          <section key={group}>
            <h2 className="mb-2 text-[14px] font-semibold uppercase tracking-wide text-muted">{group}</h2>
            <ul className="card divide-y divide-border/80 overflow-hidden">
              {items.map((i) => (
                <li key={i.id}>
                  <Link href={`/college/${i.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent-soft">
                    <span>
                      <span className="block text-[15px] font-medium text-ink">{i.title}</span>
                      {i.sub && <span className="block text-[13px] text-muted">{i.sub}</span>}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`btn ${active ? 'btn-soft' : 'btn-ghost'}`}>
      {children}
    </button>
  )
}
