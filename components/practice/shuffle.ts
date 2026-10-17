export function shuffle<T>(a: readonly T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

/** Weighted sample without replacement. */
export function weightedSample<T>(items: readonly T[], n: number, weight: (t: T) => number): T[] {
  const pool = items.map((t) => ({ t, w: Math.max(0.0001, weight(t)) }))
  const out: T[] = []
  while (out.length < n && pool.length) {
    const total = pool.reduce((s, p) => s + p.w, 0)
    let r = Math.random() * total
    let i = 0
    for (; i < pool.length - 1; i++) {
      r -= pool[i].w
      if (r <= 0) break
    }
    out.push(pool[i].t)
    pool.splice(i, 1)
  }
  return out
}
