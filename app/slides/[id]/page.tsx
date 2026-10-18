import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AskClaudeButton } from '@/components/AskClaudeButton'
import { BackLink, ModuleChip } from '@/components/bits'
import { FlagButton } from '@/components/FlagButton'
import { ChevronRight } from '@/components/icons'
import { DeckStatus, KindBadge } from '@/components/slides/SlidesLibrary'
import { getModules, getStaff, getTimetable, getTopic } from '@/lib/content'
import { fmtDayLong } from '@/lib/dates'
import { getDeck, getDecks, isOutlined, sessionKey } from '@/lib/slides'
import { typeLabel } from '@/components/bits'

export const dynamicParams = false

export function generateStaticParams() {
  return getDecks().map((d) => ({ id: d.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: getDeck(id)?.title ?? 'Slides' }
}

export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const d = getDeck(id)
  if (!d) notFound()
  const colours = Object.fromEntries(getModules().map((m) => [m.code, m.colour]))
  const staff = getStaff()
  const lead = staff[d.lead]
  const tt = getTimetable().sessions
  const sess = (refs: typeof d.sessions) =>
    refs.map((r) => tt.find((s) => sessionKey(s) === sessionKey(r))).filter((s): s is NonNullable<typeof s> => !!s)
  const main = sess(d.sessions)
  const also = sess(d.alsoUseful ?? [])
  const topics = d.topics.map((t) => getTopic(t)).filter((x): x is NonNullable<typeof x> => !!x)
  const outlined = isOutlined(d)

  return (
    <div className="mx-auto max-w-[860px]">
      <BackLink href="/slides">Slides & materials</BackLink>
      <header className="mt-2">
        <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-muted">
          <ModuleChip code={d.module} colours={colours} link />
          <KindBadge kind={d.kind} />
          Week {d.week}
        </p>
        <h1 className="mt-2 text-[30px] font-semibold sm:text-[34px]">{d.title}</h1>
        <p className="mt-1 break-all text-[13px] text-faint">{d.file}</p>
        <p className="mt-2 text-[15px] text-muted">
          {lead ? lead.name : d.lead}
          {main.map((s) => ` · ${fmtDayLong(s.date)}, ${s.start} ${typeLabel(s.type).toLowerCase()}${s.room ? ` (${s.room})` : ''}`).join('')}
        </p>
        {also.length > 0 && (
          <p className="mt-1 text-[14px] text-muted">
            Also useful for: {also.map((s) => `${fmtDayLong(s.date)} ${s.start} ${typeLabel(s.type).toLowerCase()}`).join(' · ')}
          </p>
        )}
        <div className="mt-2">
          <DeckStatus d={{ outlined, slideCount: d.slideCount, status: d.status ?? null }} />
        </div>
      </header>

      {!outlined && (
        <div className="mt-6 rounded-[22px] bg-butter-soft p-5 text-[15px] text-butter-ink">
          {d.status === 'after-lecture'
            ? 'The lecturer releases these slides after the session.'
            : 'This file is listed on Blackboard but hasn’t been added here yet.'}{' '}
          {d.note && d.status !== 'after-lecture' ? d.note : ''} Once it’s added, it gets a slide-by-slide outline and the related topic pages are checked
          against it.
        </div>
      )}

      {d.summary && (
        <section className="card mt-6 p-5 sm:p-6">
          <h2 className="text-[20px] font-semibold">In short</h2>
          <p className="mt-2 text-[17px] leading-relaxed">{d.summary}</p>
        </section>
      )}

      {d.takeaways && (
        <section className="mt-4 rounded-[22px] bg-sage-soft p-5 sm:p-6">
          <h2 className="text-[20px] font-semibold text-sage-ink">Key takeaways</h2>
          <ul className="mt-2 space-y-2">
            {d.takeaways.map((t, i) => (
              <li key={i} className="flex gap-3 text-[16px] leading-relaxed">
                <span aria-hidden className="mt-[0.55em] size-2 shrink-0 rounded-full bg-sage-ink/60" />
                {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      {topics.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[20px] font-semibold">Study it on the site</h2>
          {d.checked && outlined && (
            <p className="mt-1 text-[14px] text-muted">These topic pages have been cross-checked against this deck.</p>
          )}
          <ul className="card mt-3 divide-y divide-line/70">
            {topics.map(({ topic, module }) => (
              <li key={topic.id}>
                <Link href={`/t/${topic.id}`} className="group flex min-h-14 items-center gap-3 px-5 py-3 hover:bg-wash/50">
                  <ModuleChip code={module.code} colours={colours} />
                  <span className="flex-1 font-medium">{topic.title}</span>
                  <ChevronRight className="size-5 text-faint group-hover:text-ink" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {outlined && (
        <section className="mt-8" aria-labelledby="outline">
          <h2 id="outline" className="text-[20px] font-semibold">
            Slide by slide
          </h2>
          <ol className="mt-3 space-y-3">
            {d.outline!.map((o) => (
              <li key={o.slides} className="card p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 rounded-full bg-wash px-2.5 py-1 text-[12px] font-bold tabular-nums text-muted">
                    {o.slides.includes('–') ? 'Slides' : 'Slide'} {o.slides}
                  </span>
                  <h3 className="pt-0.5 font-rounded text-[17px] font-semibold">{o.title}</h3>
                </div>
                <ul className="mt-2 space-y-1.5 pl-1">
                  {o.points.map((p, i) => (
                    <li key={i} className="flex gap-2.5 text-[16px] leading-relaxed">
                      <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-faint" />
                      {p}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-6">
        <AskClaudeButton
          text={`Quiz me on my lecture "${d.title}" (${d.module}, week ${d.week}). ${d.summary ?? ''} Ask one question at a time and explain anything I get wrong.`}
          label="Ask Claude to quiz me on this"
        />
        <FlagButton topicId={`slides:${d.id}`} />
      </div>
    </div>
  )
}
