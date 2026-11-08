// Reads a lecture deck (PDF or PowerPoint) in the browser and turns it
// into a slide-by-slide outline. The file never leaves the device: only
// the outline is saved. The readers load from a CDN on first use.
import type { DeckSlide } from './store/types'

const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
const JSZIP = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'

export const MAX_DECK_BYTES = 60 * 1024 * 1024
const MAX_POINTS = 6
const MAX_LINE = 180

const loading = new Map<string, Promise<void>>()
function loadScript(src: string): Promise<void> {
  if (!loading.has(src)) {
    loading.set(
      src,
      new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = src
        s.async = true
        s.onload = () => resolve()
        s.onerror = () => {
          loading.delete(src)
          reject(new Error('Couldn’t load the slide reader. Check your connection and try again.'))
        }
        document.head.appendChild(s)
      }),
    )
  }
  return loading.get(src)!
}

const clean = (t: string) => t.replace(/\s+/g, ' ').trim()
const clip = (t: string) => (t.length > MAX_LINE ? `${t.slice(0, MAX_LINE - 1)}…` : t)

/** Turns a slide's lines of text into a title and a few points. */
function toSlide(n: number, lines: string[], title?: string): DeckSlide {
  const all = lines.map(clean).filter((l) => l && !/^\d{1,3}$/.test(l))
  const head = clean(title ?? '') || all[0] || ''
  const rest = all.filter((l) => l !== head)
  return { n, title: clip(head) || `Slide ${n}`, points: rest.slice(0, MAX_POINTS).map(clip) }
}

// ── PDF ──────────────────────────────────────────────────────────────────

interface PdfTextItem {
  str: string
  transform: number[]
  height: number
}
interface PdfJs {
  GlobalWorkerOptions: { workerSrc: string }
  getDocument(src: { data: ArrayBuffer }): {
    promise: Promise<{
      numPages: number
      getPage(n: number): Promise<{ getTextContent(): Promise<{ items: PdfTextItem[] }> }>
    }>
  }
}

async function readPdf(file: File): Promise<DeckSlide[]> {
  await loadScript(PDFJS)
  const pdfjs = (window as unknown as { pdfjsLib: PdfJs }).pdfjsLib
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  const slides: DeckSlide[] = []
  for (let n = 1; n <= Math.min(doc.numPages, 300); n++) {
    const { items } = await (await doc.getPage(n)).getTextContent()
    // Group text runs into lines by their vertical position, top to bottom.
    const rows: { y: number; size: number; parts: string[] }[] = []
    for (const it of items) {
      if (!it.str?.trim()) continue
      const y = Math.round(it.transform[5])
      const row = rows.find((r) => Math.abs(r.y - y) <= 3)
      if (row) {
        row.parts.push(it.str)
        row.size = Math.max(row.size, it.height)
      } else rows.push({ y, size: it.height, parts: [it.str] })
    }
    rows.sort((a, b) => b.y - a.y)
    const lines = rows.map((r) => r.parts.join(' '))
    // The biggest text near the top is usually the slide title.
    const biggest = rows.slice(0, 4).reduce<(typeof rows)[number] | null>((best, r) => (!best || r.size > best.size + 0.5 ? r : best), null)
    slides.push(toSlide(n, lines, biggest?.parts.join(' ')))
  }
  return slides
}

// ── PowerPoint (.pptx) ───────────────────────────────────────────────────

interface Zip {
  files: Record<string, { async(type: 'string'): Promise<string> }>
}
interface JSZipStatic {
  loadAsync(data: ArrayBuffer): Promise<Zip>
}

async function readPptx(file: File): Promise<DeckSlide[]> {
  await loadScript(JSZIP)
  const zip = await (window as unknown as { JSZip: JSZipStatic }).JSZip.loadAsync(await file.arrayBuffer())
  const names = Object.keys(zip.files)
    .map((name) => ({ name, n: Number(name.match(/^ppt\/slides\/slide(\d+)\.xml$/)?.[1]) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => a.n - b.n)
  const parser = new DOMParser()
  const slides: DeckSlide[] = []
  for (const { name } of names) {
    const xml = parser.parseFromString(await zip.files[name].async('string'), 'application/xml')
    let title = ''
    const lines: string[] = []
    for (const sp of Array.from(xml.getElementsByTagNameNS('*', 'sp'))) {
      const ph = sp.getElementsByTagNameNS('*', 'ph')[0]?.getAttribute('type') ?? ''
      const paras = Array.from(sp.getElementsByTagNameNS('*', 'p')).map((p) =>
        Array.from(p.getElementsByTagNameNS('*', 't'))
          .map((t) => t.textContent ?? '')
          .join(''),
      )
      if (!title && (ph === 'title' || ph === 'ctrTitle')) title = paras.join(' ')
      else lines.push(...paras)
    }
    slides.push(toSlide(slides.length + 1, lines, title || undefined))
  }
  return slides
}

export async function readDeck(file: File): Promise<DeckSlide[]> {
  if (file.size > MAX_DECK_BYTES) throw new Error('That file is over 60 MB. Try exporting it as a PDF.')
  const name = file.name.toLowerCase()
  let slides: DeckSlide[]
  if (name.endsWith('.pdf') || file.type === 'application/pdf') slides = await readPdf(file)
  else if (name.endsWith('.pptx')) slides = await readPptx(file)
  else if (name.endsWith('.ppt') || name.endsWith('.key'))
    throw new Error('Older .ppt and Keynote files can’t be read here. Save it as PDF or .pptx and try again.')
  else throw new Error('Choose a PDF or PowerPoint (.pptx) file.')
  if (!slides.length) throw new Error('No slides found in that file.')
  if (slides.every((s) => s.points.length === 0 && /^Slide \d+$/.test(s.title))) {
    throw new Error('This file has no readable text: it may be scanned images. Try the original slides instead.')
  }
  return slides
}

/** Plain-text version of an outline, for asking Claude about the deck. */
export function outlineText(title: string, slides: DeckSlide[], limit = 9000): string {
  let out = `Lecture slides: ${title}\n`
  for (const s of slides) {
    const block = `\nSlide ${s.n}: ${s.title}\n${s.points.map((p) => `- ${p}`).join('\n')}`
    if (out.length + block.length > limit) {
      out += '\n…(later slides left out for length)'
      break
    }
    out += block
  }
  return out
}
