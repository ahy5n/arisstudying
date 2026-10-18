// "This device only" mode: used until Supabase keys are added. Everything
// lives in localStorage, so ticks don't follow her to another device.
import type { AuthUser, Backend, UserData } from './types'
import { emptyData, normaliseUsername, USERNAME_RE } from './types'

const USERS = 'aris:v1:users'
const SESSION = 'aris:v1:session'
const dataKey = (id: string) => `aris:v1:data:${id}`

type Users = Record<string, { id: string; hash: string }>

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

async function hash(username: string, password: string): Promise<string> {
  const text = `arisstudying:${username}:${password}`
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Non-secure origins (e.g. a dev server opened over the LAN) have no
  // crypto.subtle. This mode only guards a device-local profile anyway.
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < text.length; i++) {
    h1 = Math.imul(h1 ^ text.charCodeAt(i), 16777619)
    h2 = Math.imul(h2 ^ text.charCodeAt(i), 2246822507)
  }
  return `fnv:${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

function mutate(user: AuthUser, fn: (d: UserData) => void) {
  const d = read<UserData>(dataKey(user.id), emptyData(user.username))
  fn(d)
  write(dataKey(user.id), d)
}

export const localBackend: Backend = {
  mode: 'local',

  async currentUser() {
    return read<AuthUser | null>(SESSION, null)
  },

  async signIn(rawUsername, password) {
    const username = normaliseUsername(rawUsername)
    if (!USERNAME_RE.test(username)) throw new Error('Usernames use letters, numbers, dots, dashes or underscores.')
    if (password.length < 6) throw new Error('Passwords need at least 6 characters.')
    const users = read<Users>(USERS, {})
    const h = await hash(username, password)
    let entry = users[username]
    if (!entry) {
      entry = { id: newId(), hash: h }
      users[username] = entry
      write(USERS, users)
    } else if (entry.hash !== h) {
      throw new Error('That password doesn’t match this username.')
    }
    const user = { id: entry.id, username }
    write(SESSION, user)
    return user
  },

  async signOut() {
    localStorage.removeItem(SESSION)
  },

  async changePassword(user, current, next) {
    const users = read<Users>(USERS, {})
    const entry = users[user.username]
    if (!entry || entry.hash !== (await hash(user.username, current))) throw new Error('Your current password isn’t right.')
    if (next.length < 6) throw new Error('Passwords need at least 6 characters.')
    entry.hash = await hash(user.username, next)
    write(USERS, users)
  },

  async load(user) {
    const d = read<UserData>(dataKey(user.id), emptyData(user.username))
    return { ...emptyData(user.username), ...d, profile: { ...emptyData(user.username).profile, ...d.profile } }
  },

  async saveProfile(user, patch) {
    mutate(user, (d) => Object.assign(d.profile, patch))
  },
  async saveProgress(user, topicId, p) {
    mutate(user, (d) => void (d.progress[topicId] = p))
  },
  async saveChecklist(user, id, steps) {
    mutate(user, (d) => void (d.checklists[id] = steps))
  },
  async saveNote(user, topicId, body) {
    mutate(user, (d) => void (d.notes[topicId] = body))
  },
  async saveReview(user, r) {
    mutate(user, (d) => void (d.reviews[r.itemId] = r))
  },
  async addAttempt() {
    // Attempts are only kept server-side; the deck holds what matters locally.
  },
  async addAssessments(user, items) {
    const created = items.map((a) => ({ ...a, id: newId() }))
    mutate(user, (d) => void d.assessments.push(...created))
    return created
  },
  async updateAssessment(user, a) {
    mutate(user, (d) => void (d.assessments = d.assessments.map((x) => (x.id === a.id ? a : x))))
  },
  async deleteAssessment(user, id) {
    mutate(user, (d) => void (d.assessments = d.assessments.filter((x) => x.id !== id)))
  },
  async saveOverride(user, code, name) {
    mutate(user, (d) => {
      if (name) d.overrides[code] = name
      else delete d.overrides[code]
    })
  },
  async addFlag(user, f) {
    mutate(user, (d) => void d.flags.push({ ...f, createdAt: new Date().toISOString() }))
  },
  async savePlacement(user, id, p) {
    mutate(user, (d) => void ((d.placements ??= {})[id] = p))
  },
}
