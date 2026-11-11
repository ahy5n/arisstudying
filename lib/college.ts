// College of Optometrists guidance, summarised for study. The data file is
// generated from the College's public pages; each entry links to the original.
import fs from 'node:fs'
import path from 'node:path'

export interface GuidanceItem {
  id: string
  title: string
  domain: string
  url: string
  points: string[]
}

export interface Cmg {
  id: string
  title: string
  group: string
  url: string
  summary: string
  points: string[]
  refer?: string
}

export interface ReferralTable {
  url: string
  levels: string[]
  rows: { area: string; cells: string[][] }[]
}

export interface CollegeData {
  source: string
  note: string
  checked: string
  guidance: GuidanceItem[]
  referrals: ReferralTable
  cmgs: Cmg[]
}

let cache: CollegeData | null = null

export function getCollege(): CollegeData {
  if (!cache) cache = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'college.json'), 'utf8')) as CollegeData
  return cache
}

export function getCollegeEntry(id: string): { kind: 'cmg'; item: Cmg } | { kind: 'guidance'; item: GuidanceItem } | null {
  const d = getCollege()
  const cmg = d.cmgs.find((c) => c.id === id)
  if (cmg) return { kind: 'cmg', item: cmg }
  const g = d.guidance.find((x) => x.id === id)
  return g ? { kind: 'guidance', item: g } : null
}
