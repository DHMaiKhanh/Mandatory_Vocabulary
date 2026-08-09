// Data layer. Talks to the Java backend when it is reachable; otherwise
// transparently falls back to localStorage so the app always works.
import { SEED_SET } from '../lib/seed'

const BASE = '/api'
const LS_KEY = 'vocab_data_v1'
let mode = 'unknown' // 'online' | 'offline' | 'unknown'

export function getMode() {
  return mode
}

// ---------------------------------------------------------------------------
// localStorage backend
// ---------------------------------------------------------------------------
function lsRead() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  // First run: seed a sample set.
  const now = Date.now()
  let seq = 1
  const words = SEED_SET.words.map(([term, meaning, example]) => ({
    id: seq++,
    term,
    meaning,
    example,
    box: 0,
    reps: 0,
    correct: 0,
    wrong: 0,
    status: 'new',
    addedAt: now,
    lastStudied: null,
    nextReview: now,
  }))
  const setId = seq++
  words.forEach((w) => (w.setId = setId))
  const data = {
    seq,
    sets: [{ id: setId, name: SEED_SET.name, createdAt: now, words }],
  }
  lsWrite(data)
  return data
}

function lsWrite(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

const local = {
  loadSets() {
    return lsRead().sets
  },
  createSet(name, type) {
    const data = lsRead()
    const set = {
      id: data.seq++,
      name: name?.trim() || 'Bộ từ mới',
      type: type || null,
      createdAt: Date.now(),
      words: [],
    }
    data.sets.push(set)
    lsWrite(data)
    return set
  },
  renameSet(id, name) {
    const data = lsRead()
    const set = data.sets.find((s) => s.id === id)
    if (set) set.name = name?.trim() || set.name
    lsWrite(data)
    return set
  },
  deleteSet(id) {
    const data = lsRead()
    data.sets = data.sets.filter((s) => s.id !== id)
    lsWrite(data)
  },
  addWord(setId, { term, meaning, example, note, category }) {
    const data = lsRead()
    const set = data.sets.find((s) => s.id === setId)
    if (!set) return null
    const now = Date.now()
    const word = {
      id: data.seq++,
      term: (term || '').trim(),
      meaning: (meaning || '').trim(),
      example: (example || '').trim(),
      note: (note || '').trim(),
      category: (category || '').trim(),
      box: 0,
      reps: 0,
      correct: 0,
      wrong: 0,
      status: 'new',
      addedAt: now,
      lastStudied: null,
      nextReview: now,
      setId,
    }
    set.words.push(word)
    lsWrite(data)
    return word
  },
  updateWord(word) {
    const data = lsRead()
    for (const s of data.sets) {
      const i = s.words.findIndex((w) => w.id === word.id)
      if (i !== -1) {
        s.words[i] = { ...s.words[i], ...word }
        lsWrite(data)
        return s.words[i]
      }
    }
    return null
  },
  deleteWord(id) {
    const data = lsRead()
    for (const s of data.sets) {
      s.words = s.words.filter((w) => w.id !== id)
    }
    lsWrite(data)
  },
}

// ---------------------------------------------------------------------------
// HTTP backend
// ---------------------------------------------------------------------------
async function http(path, options) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

const api = {
  loadSets: () => http('/sets'),
  createSet: (name, type) => http('/sets', { method: 'POST', body: JSON.stringify({ name, type }) }),
  renameSet: (id, name) =>
    http(`/sets/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteSet: (id) => http(`/sets/${id}`, { method: 'DELETE' }),
  addWord: (setId, body) =>
    http(`/sets/${setId}/words`, { method: 'POST', body: JSON.stringify(body) }),
  updateWord: (word) =>
    http(`/words/${word.id}`, { method: 'PUT', body: JSON.stringify(word) }),
  deleteWord: (id) => http(`/words/${id}`, { method: 'DELETE' }),
}

// ---------------------------------------------------------------------------
// Public interface — picks the active backend based on availability.
// ---------------------------------------------------------------------------
export async function init() {
  try {
    await api.loadSets()
    mode = 'online'
  } catch {
    mode = 'offline'
  }
  return mode
}

function impl() {
  return mode === 'online' ? api : local
}

export const loadSets = () => impl().loadSets()
export const createSet = (name, type) => impl().createSet(name, type)
export const renameSet = (id, name) => impl().renameSet(id, name)
export const deleteSet = (id) => impl().deleteSet(id)
export const addWord = (setId, body) => impl().addWord(setId, body)
export const updateWord = (word) => impl().updateWord(word)
export const deleteWord = (id) => impl().deleteWord(id)
