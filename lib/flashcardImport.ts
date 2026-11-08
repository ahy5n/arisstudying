// Reads flashcards pasted or exported from Quizlet, Anki, Excel or Google
// Sheets: one card per row, the front and back split by a tab, comma,
// semicolon, pipe or " - ".

export type Separator = 'tab' | 'comma' | 'semicolon' | 'pipe' | 'dash'

export const SEPARATORS: { key: Separator; label: string }[] = [
  { key: 'tab', label: 'Tab (Quizlet, Anki, spreadsheets)' },
  { key: 'comma', label: 'Comma (CSV)' },
  { key: 'semicolon', label: 'Semicolon' },
  { key: 'pipe', label: 'Pipe ( | )' },
  { key: 'dash', label: 'Dash ( - )' },
]

const CHAR: Record<Exclude<Separator, 'dash'>, string> = { tab: '\t', comma: ',', semicolon: ';', pipe: '|' }

export const MAX_CARDS = 2000
const MAX_SIDE = 1000

export interface ParsedCards {
  cards: { front: string; back: string }[]
  separator: Separator
  /** Rows with only one side, or repeats of a card already read. */
  skipped: number
}

// Anki "Notes in plain text" files start with lines like "#separator:tab".
const ANKI_SEPARATORS: Record<string, Separator> = {
  tab: 'tab', comma: 'comma', semicolon: 'semicolon', pipe: 'pipe', ',': 'comma', ';': 'semicolon', '|': 'pipe',
}

// A first row like "Term,Definition" is a header, not a card.
const HEADER = /^(front|term|question|word|prompt|side ?1)$/i

/** Turns exported HTML (Anki keeps <br>, <b>, &nbsp;) into plain text. */
export function cleanSide(raw: string): string {
  return raw
    .replace(/<br\s*\/?>|<\/(div|p|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_SIDE)
}

/** Splits delimited text into rows, honouring "quoted, fields" that may span lines. */
function splitDelimited(text: string, sep: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  let atFieldStart = true
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
      continue
    }
    if (c === '"' && atFieldStart) {
      quoted = true
      atFieldStart = false
    } else if (c === sep) {
      row.push(field)
      field = ''
      atFieldStart = true
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      atFieldStart = true
    } else {
      field += c
      if (c !== ' ') atFieldStart = false
    }
  }
  row.push(field)
  rows.push(row)
  return rows
}

function guessSeparator(lines: string[]): Separator {
  const share = (test: (l: string) => boolean) => lines.filter(test).length / Math.max(1, lines.length)
  if (share((l) => l.includes('\t')) >= 0.5) return 'tab'
  for (const key of ['semicolon', 'pipe', 'comma'] as const) {
    if (share((l) => l.includes(CHAR[key])) >= 0.8) return key
  }
  if (share((l) => / [-–—] /.test(l)) >= 0.5) return 'dash'
  if (share((l) => l.includes(',')) >= 0.5) return 'comma'
  return 'tab'
}

export function parseCards(input: string, chosen: Separator | 'auto' = 'auto'): ParsedCards {
  let text = input.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  let fromFile: Separator | null = null
  // Anki header lines: read the separator, then drop them.
  const kept: string[] = []
  for (const line of text.split('\n')) {
    const m = line.match(/^#(\w+):(.*)$/)
    if (m && kept.length === 0) {
      if (m[1].toLowerCase() === 'separator') fromFile = ANKI_SEPARATORS[m[2].trim().toLowerCase()] ?? null
      continue
    }
    kept.push(line)
  }
  text = kept.join('\n')

  const lines = text.split('\n').filter((l) => l.trim())
  const separator = chosen !== 'auto' ? chosen : (fromFile ?? guessSeparator(lines))

  const rows =
    separator === 'dash'
      ? lines.map((l) => {
          const m = l.match(/^(.*?) [-–—] (.*)$/)
          return m ? [m[1], m[2]] : [l]
        })
      : splitDelimited(text, CHAR[separator])

  const cards: ParsedCards['cards'] = []
  const seen = new Set<string>()
  let skipped = 0
  rows.forEach((cols, i) => {
    if (cols.every((c) => !c.trim())) return
    const front = cleanSide(cols[0] ?? '')
    const back = cleanSide(cols[1] ?? '')
    if (i === 0 && HEADER.test(front)) return
    const key = `${front}\u0000${back}`
    if (!front || !back || seen.has(key) || cards.length >= MAX_CARDS) {
      skipped++
      return
    }
    seen.add(key)
    cards.push({ front, back })
  })
  return { cards, separator, skipped }
}
