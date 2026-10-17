# Adding a module's content (v3)

No code changes needed. Three steps:

1. **Add the file** — e.g. `data/content/aam.json`, in the same schema as `data/content/aad.json` (below).
2. **Point `data/modules.json` at it** — for that module set:
   ```json
   "contentStatus": "full",
   "contentFile": "content/aam.json",
   "topics": ["aam-retinoscopy", "aam-subjective", "…"]
   ```
   `topics` is the teaching order (topic ids from the file). The old `outline` can stay; it's ignored once the module is full.
3. **Check it, then deploy:**
   ```bash
   npm run check-content
   ```
   Errors (bad JSON, missing fields, MCQs without exactly one correct answer, duplicate ids) stop the build. Warnings (a “Read more” anchor that matches no heading, a diagram with no built-in drawing) don't.

The module card, topic pages, quizzes, mistakes deck, checklists page and PDFs all pick it up automatically.

> **Progress note:** ticks on an outline module are stored against outline ids (`aam-outline-1`, …). When the module becomes “full”, the topics get new ids, so those outline ticks won't carry over.

## Schema (one topic)

```jsonc
{
  "module": "AaM",
  "verifyNote": "Shown under the topic list on the module page.",
  "topics": [
    {
      "id": "aam-jcc",                       // unique across ALL modules; prefix with the module code
      "title": "Jackson cross-cylinder",
      "summary": "2–3 sentences.",
      "keyPoints": ["…"],
      "examTraps": ["…"],
      "diagram": {                           // optional
        "id": "jcc",                         // a built-in drawing id, or any new id → “Diagram to sketch” card
        "description": "What to draw, in words.",
        "labels": ["…"]
      },
      "goDeeper": [{ "heading": "Axis first, then power", "body": "…" }],
      "checklist": { "id": "chk-jcc", "title": "…", "steps": ["…"] },   // optional; id unique
      "labelDiagram": { "diagramId": "…", "targets": ["…"] },           // optional; needs a built-in drawing with hotspots
      "flashcards": [{ "front": "…", "back": "…" }],
      "mcq": [
        {
          "id": "aam-jcc-1",                 // unique across ALL modules
          "q": "…",
          "options": [
            { "text": "…", "correct": true,  "feedback": "Why this is right." },
            { "text": "…", "correct": false, "feedback": "Why this is tempting but wrong." }
          ],
          "explanation": "…",
          "link": "aam-jcc#axis-first-then-power"   // topic id + # + slug of a goDeeper heading
        }
      ],
      "cases": [{ "scenario": "…", "question": "…", "modelAnswer": "…" }],
      "links": [{ "label": "…", "url": "https://…" }],
      "askClaude": "A ready-made question for her tutor chat."
    }
  ]
}
```

**Anchor slugs:** lower-case the heading, turn `&` into `and`, and replace anything that isn't a letter or digit with `-`. “Axis first, then power” → `axis-first-then-power`.

**Built-in diagram ids** (with drawings): `boxing-system` (has label hotspots), `pd-measurement`, `prentice`, `materials-chart`, `ar-interference`, `pal-zones`. To draw a new one, add an entry to `DIAGRAMS` in `components/diagrams/Diagrams.tsx`. That's the one case where a code change is worth it, and it's optional.

## A prompt for writing a module file with Claude

Paste this into a Claude chat together with `data/content/aad.json` (as the example) and the module's outline from `data/modules.json`:

```
Write data/content/{code}.json for my study site, in exactly the same JSON schema as the attached aad.json.
Module: {CODE} — {name}. Topics, in this order: {outline lines}.
Audience: 2nd-year MOptom optometry student in the UK (Aston). Use UK conventions, College of Optometrists / GOC / NICE where relevant.
For each topic: short summary, 5–7 key points, 2–3 exam traps, a diagram spec (description + labels), 2–4 "goDeeper" sections,
a practical checklist only if it's a hands-on routine, 4 flashcards, 2–3 multiple-choice questions (exactly one correct option,
feedback on every option, an explanation, and a "link" to the goDeeper section that explains it as topic-id#slug-of-heading),
0–1 clinical case, 1–2 reputable links, and an askClaude prompt.
Ids: prefix topic ids with "{code}-", MCQ ids like "{code}-xx-1". Keep facts standard; where departments differ, say "check your slides".
Return only the JSON.
```

Then read it through against the lecture slides before adding it. The site shows “Check against your lecture slides” on every topic, but it's still worth a look.
