'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { slugify } from '@/lib/slug'
import { ChevronDown } from '../icons'

/**
 * Collapsible "go deeper" sections, closed by default. Each has an anchor
 * id (slug of its heading) so quiz feedback can link straight to it; the
 * linked section opens and scrolls into view.
 */
export function GoDeeper({ sections }: { sections: { heading: string; body: string }[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [flash, setFlash] = useState<string | null>(null)
  const pathname = usePathname()

  const openFromHash = useCallback((hash?: string) => {
    const id = decodeURIComponent((typeof hash === 'string' ? hash : window.location.hash).replace(/^#/, ''))
    if (!id || !sections.some((s) => slugify(s.heading) === id)) return
    setOpen((o) => ({ ...o, [id]: true }))
    setFlash(id)
    setTimeout(() => setFlash(null), 1800)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })),
    )
    // Router scroll can land a beat later; settle on the section again.
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350)
  }, [sections])

  useEffect(() => {
    const onHash = () => openFromHash()
    onHash()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [openFromHash, pathname])

  // Same-page "Read more" links don't fire hashchange under client routing.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      if (!a) return
      const url = new URL(a.href, window.location.href)
      if (url.pathname === window.location.pathname && url.hash) {
        const hash = url.hash
        setTimeout(() => openFromHash(hash), 50)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [openFromHash])

  return (
    <div className="space-y-2.5">
      {sections.map((s) => {
        const id = slugify(s.heading)
        const isOpen = !!open[id]
        return (
          <section
            key={id}
            id={id}
            className={`card overflow-hidden transition-shadow ${flash === id ? 'ring-2 ring-sky shadow-[var(--shadow-lift)]' : ''}`}
          >
            <h3>
              <button
                aria-expanded={isOpen}
                aria-controls={`${id}-body`}
                onClick={() => setOpen((o) => ({ ...o, [id]: !o[id] }))}
                className="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-3 text-left font-rounded text-[18px] font-semibold"
              >
                {s.heading}
                <ChevronDown className={`size-5 shrink-0 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </h3>
            <div id={`${id}-body`} hidden={!isOpen} className="px-5 pb-5 text-[17px] leading-relaxed">
              {s.body}
            </div>
          </section>
        )
      })}
    </div>
  )
}
