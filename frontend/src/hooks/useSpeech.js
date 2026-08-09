import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Text-to-speech using the browser's Web Speech API.
 * Returns { speak, supported }. speak(text, lang) reads the text aloud,
 * preferring an English voice.
 */
export function useSpeech() {
  const [supported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  )
  const voicesRef = useRef([])

  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    const load = () => {
      voicesRef.current = synth.getVoices()
    }
    load()
    synth.addEventListener?.('voiceschanged', load)
    return () => synth.removeEventListener?.('voiceschanged', load)
  }, [supported])

  const speak = useCallback(
    (text, lang = 'en-US') => {
      if (!supported || !text) return
      const synth = window.speechSynthesis
      synth.cancel() // stop anything currently playing
      const u = new SpeechSynthesisUtterance(String(text))
      u.lang = lang
      u.rate = 0.9
      u.pitch = 1
      const voices = voicesRef.current.length ? voicesRef.current : synth.getVoices()
      const preferred =
        voices.find((v) => v.lang && v.lang.toLowerCase() === lang.toLowerCase()) ||
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'))
      if (preferred) u.voice = preferred
      synth.speak(u)
    },
    [supported],
  )

  return { speak, supported }
}
