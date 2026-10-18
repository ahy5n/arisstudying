// Work-experience contacts from data/placements.json (from Ari's PDF list).
import fs from 'node:fs'
import path from 'node:path'

export interface Placement {
  id: string
  name: string
  address: string
  org?: string
  description: string
  phones: { number: string; note?: string }[]
  phoneNote?: string
  emails: { address: string; label?: string }[]
  emailNote?: string
  /** Domain/path without protocol, e.g. "bwc.nhs.uk/eye-department". */
  web?: string
  webNote?: string
  tip?: string
}

export interface PlacementCategory {
  id: string
  title: string
  intro: string
  places: Placement[]
}

export interface PlacementsData {
  title: string
  subtitle: string
  checkedNote: string
  howTo: string[]
  startWith: { id: string; why: string }[]
  beforeYouSend: string[]
  categories: PlacementCategory[]
}

export function getPlacements(): PlacementsData {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'placements.json'), 'utf8')) as PlacementsData
}
