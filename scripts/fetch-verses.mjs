// Build step: resolve data/verses.json into data/verses.resolved.json with
// the exact Arabic (text_uthmani) and Sahih International (translation 20)
// from quran.com. Any verse that fails keeps its English fallback and hides
// the Arabic rather than risk showing wrong text. Never fails the build.
//
//   node scripts/fetch-verses.mjs            fetch from quran.com
//   VERSES_OFFLINE=1 node scripts/...        skip the network, fallbacks only
import fs from 'node:fs'
import path from 'node:path'

const DATA = path.join(process.cwd(), 'data')
const SURAHS = {
  2: 'Al-Baqarah', 3: 'Aal-Imran', 8: 'Al-Anfal', 11: 'Hud', 12: 'Yusuf', 13: "Ar-Ra'd", 20: 'Taha',
  39: 'Az-Zumar', 40: 'Ghafir', 53: 'An-Najm', 58: 'Al-Mujadila', 65: 'At-Talaq', 94: 'Ash-Sharh', 96: "Al-'Alaq",
}
const offline = process.env.VERSES_OFFLINE === '1' || process.argv.includes('--offline')

async function getJson(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

const clean = (html) =>
  html
    .replace(/<sup[^>]*>.*?<\/sup>/gis, '') // footnote markers
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '')

const src = JSON.parse(fs.readFileSync(path.join(DATA, 'verses.json'), 'utf8'))
const chapterNames = {}
const out = []
let ok = 0

for (const v of src.verses) {
  const chapter = Number(v.ref.split(':')[0])
  const markedPartial = v.englishFallback.trim().startsWith('...')
  const excerpt = v.englishFallback.trim().replace(/^\.\.\.\s*/, '…')
  const base = {
    ref: v.ref,
    surah: SURAHS[chapter] ?? '',
    arabic: null,
    english: excerpt,
    englishFull: null,
    partial: markedPartial,
  }
  if (offline) {
    out.push(base)
    continue
  }
  try {
    const j = await getJson(`https://api.quran.com/api/v4/verses/by_key/${v.ref}?translations=20&fields=text_uthmani`)
    const arabic = j?.verse?.text_uthmani?.trim()
    const tr = j?.verse?.translations?.find((t) => t.resource_id === 20) ?? j?.verse?.translations?.[0]
    const english = tr ? clean(tr.text) : ''
    if (!arabic || !/[\u0600-\u06FF]/.test(arabic) || !english) throw new Error('incomplete response')
    if (!(chapter in chapterNames)) {
      try {
        const c = await getJson(`https://api.quran.com/api/v4/chapters/${chapter}`)
        chapterNames[chapter] = c?.chapter?.name_simple ?? ''
      } catch {
        chapterNames[chapter] = ''
      }
    }
    // The card shows the excerpt when only part of the ayah is quoted;
    // the full ayah (Arabic + English) sits behind "Read the full ayah".
    const partial = markedPartial || norm(english).length > norm(v.englishFallback).length + 12
    out.push({
      ...base,
      surah: chapterNames[chapter] || base.surah,
      arabic,
      english: partial ? excerpt : english,
      englishFull: partial ? english : null,
      partial,
    })
    ok++
  } catch (err) {
    console.warn(`[verses] ${v.ref}: ${err.message} — using the English fallback, Arabic hidden`)
    out.push(base)
  }
}

fs.writeFileSync(path.join(DATA, 'verses.resolved.json'), JSON.stringify(out, null, 1) + '\n')
console.log(`[verses] ${offline ? 'offline: fallbacks only' : `${ok}/${src.verses.length} fetched`} → data/verses.resolved.json`)
