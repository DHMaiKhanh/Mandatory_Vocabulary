import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as storage from './api/storage'

const VocabContext = createContext(null)

export function VocabProvider({ children }) {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('unknown')

  const reload = useCallback(async () => {
    const data = await storage.loadSets()
    setSets(data || [])
    setMode(storage.getMode())
  }, [])

  useEffect(() => {
    ;(async () => {
      await storage.init()
      await reload()
      setLoading(false)
    })()
  }, [reload])

  // ---- Set operations (optimistic where useful) ----
  const createSet = useCallback(async (name, type) => {
    const set = await storage.createSet(name, type)
    setSets((prev) => [...prev, { ...set, words: set.words || [] }])
    return set
  }, [])

  const renameSet = useCallback(async (id, name) => {
    setSets((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)))
    await storage.renameSet(id, name)
  }, [])

  const deleteSet = useCallback(async (id) => {
    setSets((prev) => prev.filter((s) => s.id !== id))
    await storage.deleteSet(id)
  }, [])

  const addWord = useCallback(async (setId, body) => {
    const word = await storage.addWord(setId, body)
    setSets((prev) =>
      prev.map((s) => (s.id === setId ? { ...s, words: [...(s.words || []), word] } : s)),
    )
    return word
  }, [])

  const updateWord = useCallback(async (word) => {
    // Optimistic in-place update, then persist (fire-and-forget for smooth study).
    setSets((prev) =>
      prev.map((s) =>
        s.id === (word.setId ?? s.id) || (s.words || []).some((w) => w.id === word.id)
          ? { ...s, words: (s.words || []).map((w) => (w.id === word.id ? { ...w, ...word } : w)) }
          : s,
      ),
    )
    try {
      await storage.updateWord(word)
    } catch (e) {
      console.error('updateWord failed', e)
    }
  }, [])

  const deleteWord = useCallback(async (id) => {
    setSets((prev) => prev.map((s) => ({ ...s, words: (s.words || []).filter((w) => w.id !== id) })))
    await storage.deleteWord(id)
  }, [])

  // Personal notebook ("Từ vựng của tôi") is kept separate from the TOEIC
  // study sets so it never mixes into daily study, games or stats.
  const personalSets = sets.filter((s) => s.type === 'personal')
  const studySets = sets.filter((s) => s.type !== 'personal')

  const value = {
    sets,
    studySets,
    personalSets,
    loading,
    mode,
    reload,
    createSet,
    renameSet,
    deleteSet,
    addWord,
    updateWord,
    deleteWord,
  }

  return <VocabContext.Provider value={value}>{children}</VocabContext.Provider>
}

export function useVocab() {
  const ctx = useContext(VocabContext)
  if (!ctx) throw new Error('useVocab must be used inside <VocabProvider>')
  return ctx
}
