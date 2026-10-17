// Server-side loader for everything in /data. Runs at build time, so
// dropping a new content/*.json file in and flipping its module to
// contentStatus "full" is all that's needed for it to appear.
import fs from 'node:fs'
import path from 'node:path'
import { caseId, flashcardId } from './ids'
import { surahName } from './surahs'
import type {
  Checklist,
  ModuleContent,
  ModuleMeta,
  ModuleView,
  PracticeItem,
  ResolvedVerse,
  Session,
  StaffMember,
  Topic,
  WeekInfo,
} from './types'

const DATA = path.join(process.cwd(), 'data')

function readJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8')) as T
}

interface ModulesFile {
  themes: Record<string, string>
  modules: ModuleMeta[]
}

interface TimetableFile {
  group: string
  term: string
  week1Monday: string
  weeks: WeekInfo[]
  compulsory: string
  staff: Record<string, StaffMember>
  sessions: Session[]
}

let cache: {
  modulesFile: ModulesFile
  contents: Map<string, ModuleContent>
  timetable: TimetableFile
} | null = null

function load() {
  // Re-read in dev so new or edited content files show up without a restart.
  if (cache && process.env.NODE_ENV === 'production') return cache
  const modulesFile = readJson<ModulesFile>('modules.json')
  const contents = new Map<string, ModuleContent>()
  for (const m of modulesFile.modules) {
    if (m.contentStatus !== 'full' || !m.contentFile) continue
    try {
      contents.set(m.code, readJson<ModuleContent>(m.contentFile))
    } catch (err) {
      // A missing or broken file falls back to the outline instead of
      // taking the whole site down. `npm run check-content` reports it.
      console.warn(`[content] could not load ${m.contentFile}:`, err)
    }
  }
  const timetable = readJson<TimetableFile>('timetable.json')
  cache = { modulesFile, contents, timetable }
  return cache
}

function normaliseTopic(t: Topic): Topic {
  return {
    ...t,
    keyPoints: t.keyPoints ?? [],
    examTraps: t.examTraps ?? [],
    goDeeper: t.goDeeper ?? [],
    flashcards: t.flashcards ?? [],
    mcq: t.mcq ?? [],
    cases: t.cases ?? [],
    links: t.links ?? [],
  }
}

/** Topics of a full module in teaching order (modules.json `topics` first). */
function orderedTopics(m: ModuleMeta, c: ModuleContent): Topic[] {
  const byId = new Map(c.topics.map((t) => [t.id, normaliseTopic(t)]))
  const ordered: Topic[] = []
  for (const id of m.topics ?? []) {
    const t = byId.get(id)
    if (t) {
      ordered.push(t)
      byId.delete(id)
    }
  }
  return [...ordered, ...byId.values()]
}

export function getThemes(): Record<string, string> {
  return load().modulesFile.themes
}

export function getModules(): ModuleView[] {
  const { modulesFile, contents } = load()
  return modulesFile.modules.map((m) => {
    const c = contents.get(m.code)
    if (c) {
      return {
        ...m,
        hasContent: true,
        rows: orderedTopics(m, c).map((t) => ({ id: t.id, title: t.title, full: true })),
      }
    }
    return {
      ...m,
      hasContent: false,
      rows: (m.outline ?? []).map((title, i) => ({
        id: `${m.code.toLowerCase()}-outline-${i + 1}`,
        title,
        full: false,
      })),
    }
  })
}

export function getModule(code: string): ModuleView | undefined {
  return getModules().find((m) => m.code === code)
}

export function getModuleTopics(code: string): Topic[] {
  const { modulesFile, contents } = load()
  const m = modulesFile.modules.find((x) => x.code === code)
  const c = contents.get(code)
  return m && c ? orderedTopics(m, c) : []
}

export function getVerifyNote(code: string): string | undefined {
  return load().contents.get(code)?.verifyNote
}

export function getAllTopics(): { topic: Topic; module: ModuleView }[] {
  const out: { topic: Topic; module: ModuleView }[] = []
  for (const m of getModules()) {
    if (!m.hasContent) continue
    for (const t of getModuleTopics(m.code)) out.push({ topic: t, module: m })
  }
  return out
}

export function getTopic(id: string) {
  return getAllTopics().find((x) => x.topic.id === id)
}

export function getChecklists(): { checklist: Checklist; topicId: string; topicTitle: string; moduleCode: string }[] {
  return getAllTopics()
    .filter((x) => x.topic.checklist)
    .map((x) => ({
      checklist: x.topic.checklist!,
      topicId: x.topic.id,
      topicTitle: x.topic.title,
      moduleCode: x.module.code,
    }))
}


export function getPracticeItems(moduleCode?: string): PracticeItem[] {
  const items: PracticeItem[] = []
  for (const { topic, module } of getAllTopics()) {
    if (moduleCode && module.code !== moduleCode) continue
    const base = { topicId: topic.id, topicTitle: topic.title, moduleCode: module.code }
    topic.mcq.forEach((mcq) => items.push({ ...base, kind: 'mcq', id: mcq.id, mcq }))
    topic.flashcards.forEach((card, i) =>
      items.push({ ...base, kind: 'flashcard', id: flashcardId(topic.id, i), card }),
    )
    topic.cases.forEach((kase, i) => items.push({ ...base, kind: 'case', id: caseId(topic.id, i), kase }))
  }
  return items
}

export function getTimetable() {
  const t = load().timetable
  return { group: t.group, term: t.term, weeks: t.weeks, compulsory: t.compulsory, sessions: t.sessions }
}

export function getStaff(): Record<string, StaffMember> {
  return load().timetable.staff
}

export function getEncouragements(): string[] {
  return readJson<{ lines: string[] }>('encouragements.json').lines
}

export function getVerses(): ResolvedVerse[] {
  try {
    return readJson<ResolvedVerse[]>('verses.resolved.json').map((v) => ({ ...v, surah: v.surah || surahName(v.ref) }))
  } catch {
    // Not generated yet: English fallbacks only, Arabic hidden.
    const raw = readJson<{ verses: { ref: string; englishFallback: string }[] }>('verses.json')
    return raw.verses.map((v) => ({
      ref: v.ref,
      surah: surahName(v.ref),
      arabic: null,
      english: v.englishFallback,
      englishFull: null,
      partial: v.englishFallback.startsWith('...'),
    }))
  }
}
