# arisstudying — build brief for Claude Code

A private study companion website for **Ari**, a 2nd-year MOptom optometry student at **Aston University** (group **X3/X4**, Term 1 2026–27). Goal: help her average **70% this year**. It's a surprise gift — she has not seen any of this.

Build the whole thing from this brief and the files in `data/`. Do not invent course facts beyond what's in `data/`. If something is missing, leave a clearly marked placeholder.

---

## 1. Principles

- **Content first, design second.** Clean Apple-style, cosy, pastel and feminine. Keep it simple and soft, and put the effort into reading comfort and usability.
- **iPad-first.** Ari uses an iPad with an Apple Pencil and GoodNotes. Design for 1024–1366 px landscape and 768–1024 px portrait, with touch targets ≥ 44 px. It must also work on a phone, which gets a single column.
- **She's independent.** No study plans, no nagging reminders, no countdown banners, no streak pressure. Show her what's coming up and let her decide what to do.
- **Neutral voice.** The site is *her* assistant. It's not signed by anyone.
- **Accuracy matters.** Every topic page shows a small note: "Written from standard optometry knowledge. Check against your lecture slides." Every page has a **Flag this** button.
- **Free to run.** Use free tiers only.

## 2. Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS**, deployed on **Vercel** (free).
- **Supabase** (free tier) for auth and data.
  - Auth: **username + password**. Supabase auth needs an email, so map the username to a synthetic email (`{username}@arisstudying.local`) behind the scenes and turn off email confirmation. The UI only ever says "username".
  - Row Level Security on every table: users can only read and write their own rows.
- Static course content is loaded from the JSON files in `data/` at build time. No CMS.
- PDF export: generate client-side with `@react-pdf/renderer` or print CSS (A4 portrait, wide margins for handwriting).
- Make it a PWA (manifest + icons) so she can "Add to Home Screen" on her iPad.

## 3. Data files (already written — use as-is)

| File | What it is |
|---|---|
| `data/timetable.json` | All 169 Term 1 sessions for X3/X4: date, start/end, type, theme, module, lead initials and name, room, `isAssessment`, `needsRotaCheck`, plus the raw cell text. Also the `staff` map (initials → name + email) and the compulsory-sessions note. Week 1 Monday = 21 Sep 2026. Week 7 is reading week. |
| `data/modules.json` | 12 modules with their inferred names, theme, lead, confidence, pastel colour and either a full content file (`contentStatus: "full"`) or a topic `outline`. |
| `data/content/aad.json` | Full content for **AaD (Optical Dispensing)**: 7 topics, each with a summary, key points, exam traps, diagram spec, "go deeper" sections, checklists, flashcards, multiple choice with per-option feedback, clinical cases, links and an Ask Claude prompt. |
| `data/verses.json` | 16 Quranic verse references with an English fallback. |
| `data/encouragements.json` | 20 neutral encouragement lines. |
| `claude-project/` | Instructions and knowledge files for Ari's Claude project (not used by the site, but the site links to the project). |

More module content files will be added later in the same schema (`content/aam.json`, `content/clb.json` and so on). The site must render any module whose `contentStatus` is `"full"`, and show the outline with a "Content coming soon" state for the rest.

## 4. Layout

### Home page (landscape iPad: two columns)

```
┌───────────────────────────────┬───────────────────────────────┐
│  Good morning ☁️               │  Module library               │
│  "encouragement line"         │  [Management] [Patient] [Prof]│
│  ┌─────────────────────────┐  │  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Arabic verse            │  │  │ AaD  │ │ AaM  │ │ CLB  │   │
│  │ English (Sahih Intl)    │  │  │ ring │ │ ring │ │ ring │   │
│  │ — Surah name 94:5       │  │  └──────┘ └──────┘ └──────┘   │
│  └─────────────────────────┘  │  ┌──────┐ ┌──────┐ ┌──────┐   │
│                               │  │ AnE  │ │ PEG  │ │ SyD  │   │
│  Next two weeks               │  └──────┘ └──────┘ └──────┘   │
│  Week 5 · 19–23 Oct           │  … (all 12)                   │
│   Mon  AaD lecture 12:00      │                               │
│        AaD lab + ASSESSMENT ● │  ─────────────────────────    │
│   Tue  …                      │  Mistakes deck  (14 to redo)  │
│  Week 6 · 26–30 Oct           │  Quick quiz · Checklists      │
│   …                           │                               │
│  [Ask my tutor ✦]             │  70% tracker  ▸               │
└───────────────────────────────┴───────────────────────────────┘
```

- **Left half: dashboard.**
  - Greeting by time of day, then one random encouragement line (never the same twice in a row).
  - A verse card: Arabic on top (right-to-left, using a proper Arabic font such as Amiri or Scheherazade New from Google Fonts), English below, and the surah name with its ref. A new verse each day; tapping it shows another.
  - **Next two weeks:** this week and next, from `timetable.json`, grouped by day. Each session shows time, type, module chip (in the module's colour) and room. Assessments get a soft dot or label, never a red alarm. Sessions with `needsRotaCheck` say "check your rota". Tapping a session opens its module. On reading week, show "Reading week 🌿" with the module library emphasised. Skip "Independent Study" rows, or show them as a faint line.
  - **Ask my tutor** button (see §7).
- **Right half: module library.**
  - Filter chips by theme. Cards show the code, name, and a progress ring (covered and revised ticks ÷ topics).
  - Below the cards: **Mistakes deck** (count due today), **Quick quiz** (10 random questions from full modules), **Checklists** and the **70% tracker**.
- Portrait iPad or phone: stack the dashboard on top and the library underneath.

### Module page

- Header: code, name, lead (name + email from staff), confidence note ("Name inferred — tap to correct" lets Ari edit the module name, saved per user), and a list of this module's sessions and assessments from the timetable.
- Topic list in teaching order. Each row has a **Covered ✓** and a **Revised ✓** tick, saved to her profile.
- Module quiz button (all of the module's questions).

### Topic page

1. Title + "Check against your lecture slides" note.
2. **Summary** (short) + key points + exam traps (styled as a soft warning card).
3. **Diagram** — build each diagram as an inline SVG from the `diagram.description` and `labels`. Keep them clean and well labelled. If a diagram is too complex to draw well, render a placeholder card with the description instead of a bad drawing.
4. **Go deeper** — collapsible sections, closed by default. Each section gets an anchor id (slug of the heading) so quiz feedback can link straight to it.
5. **Checklist** (if present) — tickable steps, with a "Reset" button for when she practises again.
6. **Practice**: flashcards, multiple choice, clinical cases, label-the-diagram (see §5).
7. **My notes** — a simple text area saved to her profile (short typed notes; her main notes stay in GoodNotes).
8. **More info** links (open in a new tab).
9. Buttons: **Save for GoodNotes (PDF)**, **Ask Claude about this**, **Flag this**.

## 5. Practice features

- **Multiple choice:** one question at a time. After she answers, show the chosen option's `feedback` and the `explanation`. If she's wrong, also show a **"Read more"** link to `link` (topic id + `#section-anchor`) and a small **Ask Claude** button. Shuffle option order.
- **Flashcards:** tap to flip, then "Got it" or "Again".
- **Clinical cases:** show the scenario and question. She types or thinks through her answer, then taps "Show model answer" and marks herself "Nailed it", "Partly" or "Missed it". "Partly" and "Missed it" go into the mistakes deck.
- **Label the diagram:** use the topic's `labelDiagram.targets`. Show the SVG with numbered hotspots. She drags (or taps) labels onto the hotspots, then gets feedback per label.
- **Spaced repetition (mistakes deck):** every wrong MCQ, "Again" flashcard or missed case is added with a simple Leitner schedule (box 1 = tomorrow, 2 = 3 days, 3 = 7 days, 4 = 14 days, then retire). A correct answer moves an item up a box; a wrong answer sends it back to box 1. The home page shows how many are due today — a calm number, not an alert.
- **Quick quiz:** 10 random questions from all full modules, weighted towards items she's got wrong before.

## 6. 70% tracker

- Ari enters each assessment herself: name, module, weighting (%) and her mark (%) once she has it. Pre-fill the list of assessments from `timetable.json` (`isAssessment: true`) but leave weightings blank — we don't know them.
- Show her current weighted average from the marks entered so far, and **what she needs on average in the remaining weighted assessments to reach 70%**. Keep it encouraging: if 70% is already secure, say so warmly.
- Allow pass/fail items (excluded from the average).

## 7. Claude integration (no API)

Ari is on the **free Claude plan**. Clicking any Ask Claude button:

1. **Copies** a ready-made question to the clipboard. Use the topic's `askClaude` text, or for a wrong quiz answer: `I got this wrong: "{question}". I picked "{her answer}". The answer is "{correct}". Explain why simply, then give me one similar question to try.`
2. Shows a small toast: "Copied — paste it into your tutor chat."
3. Opens her Claude project in a new tab.

The project URL is stored in her profile settings (a **Settings** page with one field: "Your Claude project link", plus a short help text explaining how to find it). If it's empty, fall back to `https://claude.ai/new`.

Keep these buttons few: one per topic, one after each wrong answer, and the **Ask my tutor** button on the home page.

## 8. Supabase schema

```sql
profiles(id uuid pk references auth.users, username text unique, claude_project_url text, created_at timestamptz)
topic_progress(user_id uuid, topic_id text, covered bool, revised bool, updated_at timestamptz, primary key(user_id, topic_id))
checklist_progress(user_id uuid, checklist_id text, done_steps int[], updated_at timestamptz, primary key(user_id, checklist_id))
notes(user_id uuid, topic_id text, body text, updated_at timestamptz, primary key(user_id, topic_id))
review_items(user_id uuid, item_id text, item_type text, box int, due_date date, last_result text, primary key(user_id, item_id))
quiz_attempts(id bigserial pk, user_id uuid, item_id text, correct bool, chosen text, created_at timestamptz)
assessments(id bigserial pk, user_id uuid, name text, module text, weight numeric, mark numeric, pass_fail bool default false, date date)
module_overrides(user_id uuid, module_code text, name text, primary key(user_id, module_code))
flags(id bigserial pk, user_id uuid, topic_id text, item_id text, message text, created_at timestamptz)
```

Enable RLS on all of them, with policies `user_id = auth.uid()` (and `id = auth.uid()` for profiles).

## 9. Verses

At build time, run a script that fetches each ref in `data/verses.json` from
`https://api.quran.com/api/v4/verses/by_key/{ref}?translations=20&fields=text_uthmani`
(translation id 20 = Sahih International). Strip HTML footnote tags from the translation and save the results to `data/verses.resolved.json` with the Arabic, English, ref and surah name. The site reads only the resolved file. If the fetch fails, use `englishFallback` and hide the Arabic rather than showing wrong text.

## 10. Build order (ship fast)

1. **v1 — today:** auth, home page (dashboard + library), timetable, the AaD module fully working (topics, checklists, all quiz types, mistakes deck), verse and encouragement, Ask Claude, Flag this, PDF export. Outline-only modules show their topic list.
2. **v2:** 70% tracker, settings page, PWA polish.
3. **v3+:** drop in new `content/*.json` files for each remaining module. No code changes should be needed.

## 11. Acceptance checks

- Log in on the iPad, tick a topic, log in on another device: the tick is there.
- Opening the site on Mon 19 Oct shows Week 5 and Week 6, with the AaD lab + assessment at 16:00–18:00 in VSG40.
- A wrong MCQ answer shows feedback, a "Read more" link that scrolls to the right "go deeper" section, and adds the item to the mistakes deck.
- An Ask Claude click copies the text and opens the project URL.
- A PDF export of an AaD topic opens cleanly in GoodNotes with room to annotate.
- No reminders, streaks, countdowns or study plans anywhere.
- Lighthouse accessibility ≥ 90; contrast is fine on pastel backgrounds (use darker text for chips).
