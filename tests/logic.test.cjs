// Unit tests for the pure logic in lib/. Run: npm test
const assert = require('node:assert/strict')
const { schedule, isDue } = require('../.test-build/leitner.js')
const { summarise } = require('../.test-build/tracker.js')
const { addDays, mondayOf, weekdayIndex, todayISO, fmtRange } = require('../.test-build/dates.js')
const { slugify } = require('../.test-build/slug.js')
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name) }

const D = '2026-10-19'
t('correct, never wrong → nothing stored', () => assert.equal(schedule(undefined, 'q', 'mcq', true, D), null))
t('wrong → box 1 due tomorrow', () => assert.deepEqual(schedule(undefined, 'q', 'mcq', false, D), { itemId: 'q', itemType: 'mcq', box: 1, dueDate: '2026-10-20', lastResult: 'wrong' }))
let r = schedule(undefined, 'q', 'mcq', false, D)
t('not due yet → schedule unchanged', () => assert.equal(schedule(r, 'q', 'mcq', true, D).box, 1))
r = schedule(r, 'q', 'mcq', true, '2026-10-20'); t('box1→2, +3 days', () => assert.deepEqual([r.box, r.dueDate], [2, '2026-10-23']))
r = schedule(r, 'q', 'mcq', true, '2026-10-23'); t('box2→3, +7', () => assert.deepEqual([r.box, r.dueDate], [3, '2026-10-30']))
r = schedule(r, 'q', 'mcq', true, '2026-10-30'); t('box3→4, +14', () => assert.deepEqual([r.box, r.dueDate], [4, '2026-11-13']))
const r4 = r
r = schedule(r, 'q', 'mcq', true, '2026-11-13'); t('box4→retired', () => { assert.equal(r.box, 5); assert.equal(r.dueDate, null); assert.equal(isDue(r, '2027-01-01'), false) })
t('wrong from box 4 → back to box 1', () => assert.equal(schedule(r4, 'q', 'mcq', false, '2026-11-01').box, 1))
t('wrong after retired → box 1', () => assert.equal(schedule(r, 'q', 'mcq', false, '2027-01-01').box, 1))
t('overdue items are due', () => assert.equal(isDue({ box: 2, dueDate: '2026-10-01' }, D), true))

const A = (weight, mark, passFail = false) => ({ id: Math.random() + '', name: 'x', module: '', weight, mark, passFail, date: null })
t('empty tracker', () => assert.equal(summarise([]).state, 'empty'))
t('needed maths', () => { const s = summarise([A(50, 60), A(50, null)]); assert.equal(s.average, 60); assert.equal(s.needed, 80); assert.equal(s.state, 'stretch') })
t('on track', () => { const s = summarise([A(50, 80), A(50, null)]); assert.equal(s.needed, 60); assert.equal(s.state, 'on-track') })
t('secured', () => { const s = summarise([A(80, 95), A(20, null)]); assert.ok(s.needed <= 0); assert.equal(s.state, 'secured') })
t('out of reach', () => assert.equal(summarise([A(90, 40), A(10, null)]).state, 'out-of-reach'))
t('pass/fail excluded', () => { const s = summarise([A(50, 70), A(null, 100, true), A(50, null)]); assert.equal(s.average, 70); assert.equal(s.needed, 70) })
t('unweighted marks counted separately', () => { const s = summarise([A(null, 65)]); assert.equal(s.unweightedMarked, 1); assert.equal(s.average, null) })
t('one mark in, rest unweighted → not "done"', () => { const s = summarise([A(20, 74), A(null, null), A(null, null)]); assert.equal(s.state, 'empty'); assert.equal(s.unweightedPending, 2); assert.equal(s.average, 74) })
t('pending unweighted noted alongside a target', () => { const s = summarise([A(20, 74), A(30, null), A(null, null)]); assert.equal(s.state, 'on-track'); assert.equal(s.unweightedPending, 1) })
t('done', () => { const s = summarise([A(30, 72), A(70, 68)]); assert.equal(s.state, 'done'); assert.ok(Math.abs(s.average - 69.2) < 1e-9) })

t('weekday + monday', () => { assert.equal(weekdayIndex('2026-10-19'), 0); assert.equal(mondayOf('2026-10-25'), '2026-10-19'); assert.equal(weekdayIndex('2026-10-17'), 5) })
t('addDays across month', () => assert.equal(addDays('2026-10-30', 3), '2026-11-02'))
t('UK date at 23:30 UTC in BST is next day', () => assert.equal(todayISO(new Date('2026-07-01T23:30:00Z')), '2026-07-02'))
t('UK date in GMT', () => assert.equal(todayISO(new Date('2026-12-01T23:30:00Z')), '2026-12-01'))
t('range format', () => { assert.equal(fmtRange('2026-10-19', '2026-10-23'), '19–23 Oct'); assert.equal(fmtRange('2026-11-30', '2026-12-04'), '30 Nov – 4 Dec') })
t('slugs match content anchors', () => { assert.equal(slugify('Reading a frame'), 'reading-a-frame'); assert.equal(slugify('Effectivity and vertex distance'), 'effectivity-and-vertex-distance'); assert.equal(slugify('Distance PD with a rule (method)'), 'distance-pd-with-a-rule-method') })

const { parseIcs, weeklyEntries, detectModule } = require('../.test-build/timetable.js')
const CODES = ['AaD', 'CLB', 'AnE']
const cal = (...events) => ['BEGIN:VCALENDAR', 'VERSION:2.0', ...events.flatMap((e) => ['BEGIN:VEVENT', ...e, 'END:VEVENT']), 'END:VCALENDAR'].join('\r\n')
const TODAY = '2026-10-01'
t('ics: weekly series with UNTIL and a skipped week', () => {
  const { entries } = parseIcs(cal(['UID:a', 'SUMMARY:AaD Lecture', 'LOCATION:Room 1', 'DTSTART;TZID=Europe/London:20261005T090000', 'DTEND;TZID=Europe/London:20261005T110000', 'RRULE:FREQ=WEEKLY;UNTIL=20261102T235959Z', 'EXDATE;TZID=Europe/London:20261019T090000']), CODES, TODAY)
  assert.deepEqual(entries.map((e) => e.date), ['2026-10-05', '2026-10-12', '2026-10-26', '2026-11-02'])
  assert.equal(entries[0].start, '09:00'); assert.equal(entries[0].end, '11:00'); assert.equal(entries[0].module, 'AaD'); assert.equal(entries[0].room, 'Room 1')
  assert.ok(entries[0].series && entries.every((e) => e.series === entries[0].series))
})
t('ics: UTC times shown in UK time either side of the clock change', () => {
  const { entries } = parseIcs(cal(['UID:b', 'SUMMARY:CLB seminar', 'DTSTART:20261021T080000Z', 'DTEND:20261021T090000Z', 'RRULE:FREQ=WEEKLY;COUNT=2']), CODES, TODAY)
  assert.deepEqual(entries.map((e) => [e.date, e.start, e.end]), [['2026-10-21', '09:00', '10:00'], ['2026-10-28', '08:00', '09:00']])
})
t('ics: a moved week replaces that week of the series', () => {
  const { entries } = parseIcs(cal(
    ['UID:c', 'SUMMARY:AnE lab', 'DTSTART:20261006T140000', 'DTEND:20261006T160000', 'RRULE:FREQ=WEEKLY;COUNT=3'],
    ['UID:c', 'RECURRENCE-ID:20261013T140000', 'SUMMARY:AnE lab (moved)', 'DTSTART:20261014T100000', 'DTEND:20261014T120000'],
  ), CODES, TODAY)
  assert.deepEqual(entries.map((e) => `${e.date} ${e.start} ${e.title}`), ['2026-10-06 14:00 AnE lab', '2026-10-14 10:00 AnE lab (moved)', '2026-10-20 14:00 AnE lab'])
})
t('ics: BYDAY, all-day skipped, cancelled skipped, assessment spotted', () => {
  const r = parseIcs(cal(
    ['UID:d', 'SUMMARY:Clinic', 'DTSTART:20261005T090000', 'DTEND:20261005T100000', 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE;COUNT=3'],
    ['UID:e', 'SUMMARY:Reading week', 'DTSTART;VALUE=DATE:20261102'],
    ['UID:f', 'SUMMARY:Gone', 'STATUS:CANCELLED', 'DTSTART:20261008T090000'],
    ['UID:g', 'SUMMARY:AaD practical exam', 'DTSTART:20261009T090000', 'DTEND:20261009T093000'],
  ), CODES, TODAY)
  assert.deepEqual(r.entries.map((e) => e.date), ['2026-10-05', '2026-10-07', '2026-10-09', '2026-10-12'])
  assert.equal(r.skippedAllDay, 1)
  assert.equal(r.entries.find((e) => e.title.includes('exam')).isAssessment, true)
})
t('ics: folded lines and escaped text', () => {
  const { entries } = parseIcs('BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:Contact lenses\\, part 2\r\n  (CLB)\r\nDTSTART:20261007T100000\r\nEND:VEVENT\r\nEND:VCALENDAR', CODES, TODAY)
  assert.equal(entries[0].title, 'Contact lenses, part 2 (CLB)'); assert.equal(entries[0].module, 'CLB'); assert.equal(entries[0].end, '11:00')
})
t('ics: not a calendar → clear error', () => assert.throws(() => parseIcs('<html>', CODES, TODAY), /calendar file/))
t('weekly sessions until a date', () => {
  const list = weeklyEntries({ title: 'x', module: null, room: null, start: '09:00', end: '10:00', isAssessment: false }, '2026-10-05', '2026-10-26')
  assert.deepEqual(list.map((e) => e.date), ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26'])
  assert.equal(weeklyEntries({ title: 'x', module: null, room: null, start: '09:00', end: '10:00', isAssessment: false }, '2026-10-05', null).length, 1)
})
t('module codes match whole words only', () => { assert.equal(detectModule('AaD lecture', CODES), 'AaD'); assert.equal(detectModule('Ladder talk', CODES), null) })

const { parseCards } = require('../.test-build/flashcardImport.js')
t('cards: Quizlet tab export', () => {
  const r = parseCards('Myopia\tShort-sightedness\nHyperopia\tLong-sightedness\n')
  assert.equal(r.separator, 'tab'); assert.deepEqual(r.cards, [{ front: 'Myopia', back: 'Short-sightedness' }, { front: 'Hyperopia', back: 'Long-sightedness' }])
})
t('cards: CSV with header, quotes and line breaks', () => {
  const r = parseCards('Term,Definition\n"Snell\'s law","n1 sin i = n2 sin r, at a boundary"\n"Prentice","P = cF\nc in cm"\n')
  assert.equal(r.separator, 'comma'); assert.equal(r.cards.length, 2)
  assert.equal(r.cards[0].back, 'n1 sin i = n2 sin r, at a boundary'); assert.equal(r.cards[1].back, 'P = cF\nc in cm')
})
t('cards: Anki headers and HTML', () => {
  const r = parseCards('#separator:tab\n#html:true\nIOP<br>normal?\t10&ndash;21 &amp; <b>mmHg</b>\n')
  assert.deepEqual(r.cards, [{ front: 'IOP\nnormal?', back: '10–21 & mmHg' }])
})
t('cards: dash lines, one-sided rows and repeats skipped', () => {
  const r = parseCards('Cornea - clear front window\nLens - focuses\nno answer here\nLens - focuses')
  assert.equal(r.separator, 'dash'); assert.equal(r.cards.length, 2); assert.equal(r.skipped, 2)
})
t('cards: chosen separator wins', () => assert.equal(parseCards('a;b,c\nd;e,f', 'comma').cards[0].back, 'c'))
const { cardsFromDeck } = require('../.test-build/userCards.js')
t('slides → cards: title front, points back, filler slides skipped', () => {
  let i = 0
  const cards = cardsFromDeck([
    { n: 1, title: 'Learning outcomes', points: ['Know things'] },
    { n: 2, title: 'Tear film layers', points: ['Lipid', 'Aqueous', 'Mucin'] },
    { n: 3, title: 'Questions?', points: ['Ask away'] },
    { n: 4, title: 'Picture only', points: [] },
  ], () => `c${++i}`)
  assert.deepEqual(cards, [{ id: 'c1', front: 'Tear film layers', back: '• Lipid\n• Aqueous\n• Mucin' }])
})
const { ladderOrder, toRounds, unlockedRounds, levelKey } = require('../.test-build/quizLadder.js')
const q = (kind, id) => ({ kind, id })
t('quiz ladder: a written question after every four MCQs', () => {
  const order = ladderOrder([...Array(9)].map((_, i) => q('mcq', 'm' + i)).concat([q('case', 'c0'), q('case', 'c1')]))
  assert.deepEqual(order.map((x) => x.id), ['m0', 'm1', 'm2', 'm3', 'c0', 'm4', 'm5', 'm6', 'm7', 'c1', 'm8'])
})
t('quiz ladder: capped at 50, rounds of 10', () => {
  const order = ladderOrder([...Array(70)].map((_, i) => q('mcq', 'm' + i)))
  assert.equal(order.length, 50); assert.deepEqual(toRounds(order).map((r) => r.length), [10, 10, 10, 10, 10])
})
t('quiz ladder: last round can be short', () => assert.deepEqual(toRounds([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).map((r) => r.length), [10, 2]))
t('quiz ladder: unlocked rounds default 1, clamped to total', () => {
  assert.equal(unlockedRounds({}, 'x', 3), 1)
  assert.equal(unlockedRounds({ [levelKey('x')]: [9] }, 'x', 3), 3)
})
console.log(`\n${n} passed`)
