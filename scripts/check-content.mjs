// Validates data/modules.json and every content/*.json it points to.
// Run: npm run check-content   (also runs automatically before each build)
// Errors stop the build; warnings are printed and the build carries on.
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA = path.join(ROOT, 'data')
const errors = []
const warnings = []
const err = (m) => errors.push(m)
const warn = (m) => warnings.push(m)

// Keep in sync with lib/slug.ts
const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function readJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'))
  } catch (e) {
    err(`${rel}: ${e.code === 'ENOENT' ? 'file not found' : `not valid JSON (${e.message})`}`)
    return null
  }
}

// Built-in diagram drawings: keys of DIAGRAMS (Diagrams.tsx) and MORE_DIAGRAMS (MoreDiagrams.tsx).
const diagramSrc = ['Diagrams.tsx', 'MoreDiagrams.tsx']
  .map((f) => fs.readFileSync(path.join(ROOT, 'components/diagrams', f), 'utf8'))
  .join('\n')
const registries = [...diagramSrc.matchAll(/export const (?:MORE_)?DIAGRAMS[^=]*=\s*\{([\s\S]*?)\n\}/g)].map((m) => m[1])
const registryEntries = registries.flatMap((b) => [...b.matchAll(/^\s*'?([\w-]+)'?\s*(?::\s*(\w+))?\s*,/gm)])
const builtIn = new Set(registryEntries.map((m) => m[1]))
const spotsFor = (id) => {
  const name = registryEntries.find((m) => m[1] === id)?.[2] ?? id
  const def = diagramSrc.slice(diagramSrc.indexOf(`const ${name}: DiagramDef`))
  const spots = def.slice(def.indexOf('spots:'), def.indexOf('render:'))
  return new Set([...spots.matchAll(/^\s*'?([^':]+?)'?\s*:\s*\{\s*x:/gm)].map((m) => m[1]))
}

const modulesFile = readJson('modules.json')
const topicsById = new Map()
const itemIds = new Map()
const seenItem = (id, where) => {
  if (itemIds.has(id)) err(`duplicate practice id "${id}" in ${where} (also in ${itemIds.get(id)})`)
  itemIds.set(id, where)
}

for (const m of modulesFile?.modules ?? []) {
  for (const k of ['code', 'name', 'theme', 'colour', 'contentStatus']) if (!m[k]) err(`modules.json: module ${m.code ?? '?'} is missing "${k}"`)
  if (!['Management', 'Patient', 'Professional'].includes(m.theme)) warn(`modules.json: ${m.code} has unknown theme "${m.theme}"`)
  if (m.contentStatus !== 'full') {
    if (!m.outline?.length) warn(`modules.json: ${m.code} is an outline module with no outline topics`)
    continue
  }
  if (!m.contentFile) {
    err(`modules.json: ${m.code} is "full" but has no contentFile`)
    continue
  }
  const c = readJson(m.contentFile)
  if (!c) continue
  if (!Array.isArray(c.topics) || !c.topics.length) {
    err(`${m.contentFile}: no topics`)
    continue
  }
  const fileIds = new Set()
  for (const t of c.topics) {
    const where = `${m.contentFile} › ${t.id ?? '(no id)'}`
    for (const k of ['id', 'title', 'summary', 'askClaude']) if (!t[k]) err(`${where}: missing "${k}"`)
    if (topicsById.has(t.id)) err(`${where}: topic id already used in another file`)
    topicsById.set(t.id, t)
    fileIds.add(t.id)
    for (const k of ['keyPoints', 'examTraps', 'goDeeper', 'flashcards', 'mcq', 'cases', 'links'])
      if (t[k] !== undefined && !Array.isArray(t[k])) err(`${where}: "${k}" should be a list`)
    for (const g of t.goDeeper ?? []) if (!g.heading || !g.body) err(`${where}: a goDeeper section needs heading and body`)
    for (const [i, f] of (t.flashcards ?? []).entries()) {
      if (!f.front || !f.back) err(`${where}: flashcard ${i + 1} needs front and back`)
      seenItem(`${t.id}:fc${i + 1}`, where)
    }
    for (const [i, cs] of (t.cases ?? []).entries()) {
      if (!cs.scenario || !cs.question || !cs.modelAnswer) err(`${where}: case ${i + 1} needs scenario, question and modelAnswer`)
      seenItem(`${t.id}:case${i + 1}`, where)
    }
    for (const q of t.mcq ?? []) {
      if (!q.id) err(`${where}: an MCQ has no id`)
      else seenItem(q.id, where)
      const correct = (q.options ?? []).filter((o) => o.correct).length
      if (correct !== 1) err(`${where} › ${q.id}: needs exactly one correct option (has ${correct})`)
      for (const o of q.options ?? []) if (!o.text || !o.feedback) warn(`${where} › ${q.id}: every option should have text and feedback`)
    }
    if (t.checklist) {
      if (!t.checklist.id || !t.checklist.steps?.length) err(`${where}: checklist needs id and steps`)
      else seenItem(t.checklist.id, where)
    }
    if (t.diagram && !builtIn.has(t.diagram.id))
      warn(`${where}: diagram "${t.diagram.id}" has no built-in drawing — the page shows its description card instead`)
    if (t.labelDiagram) {
      const spots = builtIn.has(t.labelDiagram.diagramId) ? spotsFor(t.labelDiagram.diagramId) : new Set()
      const missing = t.labelDiagram.targets.filter((x) => !spots.has(x))
      if (missing.length) warn(`${where}: label-the-diagram hidden — no hotspot for ${missing.map((x) => `"${x}"`).join(', ')}`)
    }
    for (const l of t.links ?? []) if (!/^https?:\/\//.test(l.url ?? '')) warn(`${where}: link "${l.label}" isn't a full URL`)
  }
  for (const id of m.topics ?? []) if (!fileIds.has(id)) warn(`modules.json: ${m.code} lists topic "${id}" that isn't in ${m.contentFile}`)
}

// Quiz "Read more" links must land on a real topic and section.
for (const t of topicsById.values()) {
  for (const q of t.mcq ?? []) {
    if (!q.link) continue
    const [tid, anchor] = q.link.split('#')
    const target = topicsById.get(tid)
    if (!target) warn(`${t.id} › ${q.id}: "Read more" points to unknown topic "${tid}"`)
    else if (anchor && !(target.goDeeper ?? []).some((g) => slugify(g.heading) === anchor))
      warn(`${t.id} › ${q.id}: "Read more" anchor "#${anchor}" matches no go-deeper heading in ${tid}`)
  }
}

// Slides library: every deck must point at real sessions and topics.
const timetable = readJson('timetable.json')
const sessionKeys = new Set((timetable?.sessions ?? []).map((x) => `${x.date}T${x.start}`))
const slides = readJson('slides.json')
const deckIds = new Set()
for (const d of slides?.decks ?? []) {
  const where = `slides.json › ${d.id ?? '(no id)'}`
  for (const k of ['id', 'title', 'file', 'module', 'kind', 'week']) if (d[k] === undefined) err(`${where}: missing "${k}"`)
  if (deckIds.has(d.id)) err(`${where}: duplicate deck id`)
  deckIds.add(d.id)
  for (const ref of [...(d.sessions ?? []), ...(d.alsoUseful ?? [])])
    if (!sessionKeys.has(`${ref.date}T${ref.start}`)) err(`${where}: no timetable session on ${ref.date} at ${ref.start}`)
  for (const t of d.topics ?? []) if (!topicsById.has(t)) err(`${where}: unknown topic "${t}"`)
}

for (const w of warnings) console.warn(`  warn  ${w}`)
for (const e of errors) console.error(`  ERROR ${e}`)
console.log(`[content] ${topicsById.size} topics, ${itemIds.size} practice items · ${errors.length} errors, ${warnings.length} warnings`)
if (errors.length) process.exit(1)
