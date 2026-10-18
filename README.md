# arisstudying

A private study companion for Ari (2nd-year MOptom, Aston, X3/X4, Term 1 2026–27).
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase · Vercel. Free tiers only.

All of v1, v2 and v3 from `BRIEF.md` are built.

| | What's in it |
|---|---|
| **v1** | Username + password sign-in · home dashboard (greeting, encouragement, verse, next two weeks) · module library with progress rings · module pages (ticks, sessions, editable names) · full AaD topics (summary, key points, exam traps, SVG diagrams, go deeper, checklists, flashcards, multiple choice, clinical cases, label the diagram, notes, links) · mistakes deck (Leitner) · quick quiz and module quiz · Ask Claude · Flag this · Save for GoodNotes (A4 PDF) |
| **v2** | 70% tracker (pre-filled from the timetable) · Settings (Claude project link, change password, sign out, your flags) · PWA (manifest + icons, Add to Home Screen) |
| **v3** | Drop a new `data/content/*.json` file in and it just works. A content checker runs before every build. See [docs/ADDING-A-MODULE.md](docs/ADDING-A-MODULE.md). |
| **Slides & materials** | `/slides`: every lecture deck, handout and worksheet by week and session (from `data/slides.json`), with slide-by-slide outlines for decks that have been added. Materials also appear under their sessions on module pages and as "From your lectures" on topic pages. The files themselves aren't hosted (they're the university's) — only outlines. |
| **Placements** | 40 work-experience contacts from Ari's Birmingham & Solihull list, grouped by type. Tap one for details, phone, email and website; track each as not contacted / emailed / interview / confirmed, with an optional interview date and time. |
| **Content** | All 12 modules are full: 69 topics and 408 practice items (MCQs, flashcards, cases), plus checklists and 32 hand-drawn diagrams (5 with label-the-diagram exercises). |

---

## Run it on this Mac

Node is installed in `~/.local/node` (no admin needed). In a terminal:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

```bash
cd ~/Documents/arisstudying && npm run dev
```

Open http://localhost:3000. With no Supabase keys the site runs in **"this device only" mode**: the first sign-in with a new username creates it in that browser, and progress is saved in the browser.

Testing helpers:

- `?today=2026-10-19` on any URL pretends it's that date (handy for checking the timetable); `?today=off` clears it.
- `npm test` runs the unit tests (Leitner schedule, 70% maths, UK dates, anchors).
- `npm run check-content` validates every content file.

---

## 1. Set up Supabase (free) — so ticks sync across devices

1. Create a project at [supabase.com](https://supabase.com) (free plan). Any region near the UK, e.g. London.
2. **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), **Run**. This creates the tables, turns on Row Level Security (everyone sees only their own rows) and adds a trigger that creates a profile for each new user.
3. **Authentication → Sign In / Providers → Email**: turn **off** “Confirm email”. Leave Email enabled. (Optional: turn off “Allow new users to sign up”, so only accounts you create can exist.)
4. **Authentication → Users → Add user → Create new user**
   - Email: `ari@arisstudying.local` (the username is the part before `@` — she signs in with just `ari`)
   - Password: one you choose (she can change it in Settings)
   - Tick **Auto Confirm User**.
5. **Project Settings → API**: copy the **Project URL** and the **anon / publishable** key. *Never* use the `service_role` / secret key in this app.
6. Copy `.env.example` to `.env.local` and fill in both values. Restart `npm run dev`.

> If Supabase ever refuses the `.local` address, set `NEXT_PUBLIC_USERNAME_EMAIL_DOMAIN` to another domain you like (e.g. `arisstudying.app`) in `.env.local` and on Vercel, and use that domain in step 4.

## 2. Deploy to Vercel (free)

Easiest: push this folder to a private GitHub repo, then on [vercel.com](https://vercel.com) **Add New → Project → Import** it. Or with the CLI:

```bash
npx vercel
```

In the Vercel project: **Settings → Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and the email-domain one if you changed it), then redeploy.

The build runs `scripts/fetch-verses.mjs` first. It fetches the exact Arabic and Sahih International English for the 16 verses from api.quran.com into `data/verses.resolved.json`. Until that has run with network access, the verse card shows the English fallback and hides the Arabic (on purpose, so it never shows wrong text). To fetch them locally:

```bash
npm run verses
```

Verses quoted only in part on the card (e.g. 20:114) show the quoted excerpt, with **“Read the full ayah”** revealing the whole ayah in Arabic and English.

## 3. Set up Ari's Claude project

Follow [`claude-project/PROJECT-INSTRUCTIONS.md`](claude-project/PROJECT-INSTRUCTIONS.md). Then paste the project link into **arisstudying → Settings → Your Claude project link**. Without it, the Ask Claude buttons open a new chat at claude.ai/new.

## 4. On her iPad

Safari → open the site → **Share → Add to Home Screen**. It opens full screen like an app, with its own icon.

---

## How things work

- **Content** is read from `data/` at build time (no CMS). `data/` files are used exactly as supplied.
- **Storage**: `lib/store/` has one interface with two backends: Supabase (when the env vars are set) and browser storage (when they aren't). Saves are optimistic and queued per row, so quick taps always land in order.
- **Diagrams** are hand-built inline SVGs in `components/diagrams/Diagrams.tsx` (AaD) and `MoreDiagrams.tsx` (other modules), keyed by `diagram.id`. Unknown ids (and the focimeter, which is too complex to draw well) show a “Diagram to sketch” card with the description and labels instead. That card doubles as a GoodNotes prompt.
- **Mistakes deck**: wrong answer, “Again” or “Partly”/“Missed it” → box 1 (tomorrow). Right while due → next box (3 days, 7 days, 14 days) → retired. Wrong at any point → back to box 1. Right when not yet due doesn't skip boxes.
- **Quick quiz**: 10 questions from all full modules; ones she's ever got wrong are 3× as likely, ones still in the deck 6×.
- **70% tracker**: weighted average of marked, weighted, graded items; the “needed” figure is `(70 × total weight − points so far) ÷ remaining weight`. Pass/fail items are excluded. Until every upcoming item has a weighting it says “so far” rather than claiming a final result.
- **PDF export**: “Save for GoodNotes” opens an A4 print view with a ~50 mm right margin for handwriting, a “Test yourself” section and the answers at the end.
- **Dates** are always UK time (Europe/London), whatever the device clock says.

## Project layout

```
app/                 routes (/, /m/[code], /m/[code]/quiz, /t/[topicId], /t/[topicId]/print,
                     /quiz, /mistakes, /checklists, /tracker, /settings, manifest, icons)
components/          UI (home/, module/, topic/, practice/, diagrams/, tracker/, settings/)
lib/                 content loader, dates, Leitner, tracker maths, storage backends
data/                course data from the build pack (+ verses.resolved.json, generated)
scripts/             fetch-verses.mjs, check-content.mjs
supabase/schema.sql  tables, RLS policies, new-user trigger
tests/               unit tests (npm test)
docs/                adding a module (v3)
claude-project/      instructions + knowledge files for Ari's Claude project
```

## Notes and known limits

- **Content for the 11 non-AaD modules was written from standard UK optometry knowledge** (College CMGs, NICE, DESP, TFOS DEWS II, GOC) to follow each module's outline. It has *not* been checked against Aston's lecture slides. Every topic shows the "check against your lecture slides" note, and the Flag button exists for exactly this. Numbers that vary by department (fog lens size, Van Herick referral grade, cycloplegic protocols, Abbe values, statistics on sight loss) are hedged in the text.

- Schema additions: `placement_progress` table for the placements tracker — **if you ran `schema.sql` before, run it again** (it's safe to re-run) — and `profiles.tracker_seeded` (boolean), so the tracker pre-fills from the timetable only once, even across devices.
- One content inconsistency to check: in `aad.json`, the centration key points say minus lenses are “base-to-apex”, but the diagram spec (and usual teaching) says **apex-to-apex**. The diagram follows apex-to-apex. Worth checking against Dr Hallam's slides and fixing the text if needed.
- The 1.60 and 1.74 points on the materials chart use typical Abbe values (≈42 and ≈33), shown as dashed “approximate” points. The other values come from the content file.
- No offline service worker: Add to Home Screen works, but the site needs a connection. That's deliberate, so new content always shows up.
- No reminders, streaks, countdowns or study plans anywhere.
