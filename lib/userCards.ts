// The student's own flashcard sets, as practice items and from slide decks.
import type { CardSet, DeckSlide, UserCard, UserDeck } from './store/types'
import type { PracticeItem } from './types'

/** Review ids for the student's own cards; "u:" keeps them apart from built-in ones. */
export const userCardId = (setId: string, cardId: string) => `u:${setId}:${cardId}`

export function cardSetItems(sets: CardSet[]): PracticeItem[] {
  return sets.flatMap((s) =>
    s.cards.map((c) => ({
      id: userCardId(s.id, c.id),
      topicId: '',
      topicTitle: s.name,
      moduleCode: s.module ?? '',
      kind: 'flashcard' as const,
      card: { front: c.front, back: c.back },
    })),
  )
}

// Slides that hold no content worth testing.
const SKIP_SLIDE = /^(contents|outline|overview|agenda|questions\??|any questions\??|thank you|thanks|references|bibliography|further reading|reading list|learning (outcomes|objectives)|aims( and objectives)?|objectives)$/i

/** One card per content slide: its title on the front, its points on the back. */
export function cardsFromDeck(slides: DeckSlide[], newId: () => string): UserCard[] {
  const cards: UserCard[] = []
  const seen = new Set<string>()
  for (const s of slides) {
    const title = s.title.trim()
    const points = s.points.map((p) => p.trim()).filter((p) => p && p !== title)
    if (!title || !points.length || SKIP_SLIDE.test(title.replace(/[.:!]+$/, ''))) continue
    const back = points.map((p) => `• ${p}`).join('\n').slice(0, 1000)
    const key = `${title}\u0000${back}`
    if (seen.has(key)) continue
    seen.add(key)
    cards.push({ id: newId(), front: title.slice(0, 1000), back })
  }
  return cards
}

/** The set made from a deck keeps a fixed id, so making it again replaces it. */
export const deckSetId = (deckId: string) => `deck-${deckId}`

export function setFromDeck(deck: UserDeck, newId: () => string): CardSet | null {
  const cards = cardsFromDeck(deck.slides, newId)
  if (!cards.length) return null
  return { id: deckSetId(deck.id), name: deck.title, module: deck.module, cards, createdAt: new Date().toISOString() }
}
