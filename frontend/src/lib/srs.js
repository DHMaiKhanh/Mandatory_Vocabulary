// Spaced-repetition (Leitner) logic, daily-session builder and statistics.
import { isSameDay } from './format'

export const DAY = 86400000
export const NEW_PER_DAY = 10
export const REVIEW_PER_DAY = 20

// Interval before a word is due again, indexed by Leitner box (0..5).
const INTERVALS = [10 * 60 * 1000, DAY, 2 * DAY, 4 * DAY, 7 * DAY, 15 * DAY]

export function intervalForBox(box) {
  const i = Math.max(0, Math.min(box, INTERVALS.length - 1))
  return INTERVALS[i]
}

/**
 * Return a new word object with updated SRS state after a review.
 * @param known true if the learner recalled the word correctly.
 */
export function applyReview(word, known, now = Date.now()) {
  const w = { ...word }
  w.reps = (w.reps || 0) + 1
  w.lastStudied = now
  if (known) {
    w.correct = (w.correct || 0) + 1
    w.box = Math.min((w.box || 0) + 1, 5)
  } else {
    w.wrong = (w.wrong || 0) + 1
    w.box = 0
  }
  w.status = w.box >= 5 ? 'mastered' : 'learning'
  w.nextReview = now + intervalForBox(w.box)
  return w
}

/** Flatten all sets into a single word list, tagging each with its set. */
export function flattenWords(sets) {
  const out = []
  for (const s of sets || []) {
    for (const w of s.words || []) {
      out.push({ ...w, setName: s.name, setId: s.id })
    }
  }
  return out
}

export function isDue(w, now = Date.now()) {
  return (w.status || 'new') !== 'new' && (w.nextReview || 0) <= now
}

/**
 * Build a daily study session: up to (10 - introducedToday) brand-new words
 * plus up to 20 review words that are due (soonest first).
 */
export function buildDailySession(sets, now = Date.now(), introducedToday = 0) {
  const all = flattenWords(sets)
  const newSlots = Math.max(0, NEW_PER_DAY - introducedToday)
  const newWords = all
    .filter((w) => (w.status || 'new') === 'new')
    .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0))
    .slice(0, newSlots)

  const reviewWords = all
    .filter((w) => isDue(w, now))
    .sort((a, b) => (a.nextReview || 0) - (b.nextReview || 0))
    .slice(0, REVIEW_PER_DAY)

  return { newWords, reviewWords }
}

export function computeStats(sets) {
  const all = flattenWords(sets)
  const now = Date.now()
  let mastered = 0,
    learning = 0,
    fresh = 0,
    totalReps = 0,
    totalCorrect = 0,
    totalWrong = 0,
    studiedToday = 0,
    dueNow = 0

  for (const w of all) {
    const st = w.status || 'new'
    if (st === 'mastered') mastered++
    else if (st === 'learning') learning++
    else fresh++
    totalReps += w.reps || 0
    totalCorrect += w.correct || 0
    totalWrong += w.wrong || 0
    if (isSameDay(w.lastStudied, now)) studiedToday++
    if (isDue(w, now)) dueNow++
  }

  const answered = totalCorrect + totalWrong
  return {
    total: all.length,
    mastered,
    learning,
    fresh,
    totalReps,
    totalCorrect,
    totalWrong,
    accuracy: answered ? Math.round((totalCorrect / answered) * 100) : 0,
    studiedToday,
    dueNow,
  }
}

// ---- Daily "new words introduced" counter (kept in localStorage) ----
const DAILY_KEY = 'vocab_daily_intro_v1'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function getIntroducedToday() {
  try {
    const raw = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}')
    return raw.date === todayStr() ? raw.count || 0 : 0
  } catch {
    return 0
  }
}

export function addIntroducedToday(n = 1) {
  const cur = getIntroducedToday()
  localStorage.setItem(DAILY_KEY, JSON.stringify({ date: todayStr(), count: cur + n }))
}
