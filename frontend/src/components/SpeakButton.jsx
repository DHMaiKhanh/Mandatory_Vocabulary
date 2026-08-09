import { useSpeech } from '../hooks/useSpeech'

/**
 * Speaker button that reads `text` aloud in English.
 * size: 'sm' | 'md' | 'lg'
 */
export default function SpeakButton({ text, lang = 'en-US', size = 'md', title = 'Nghe phát âm', stop }) {
  const { speak, supported } = useSpeech()
  if (!supported) return null
  return (
    <button
      type="button"
      className={`speak-btn speak-${size}`}
      title={title}
      aria-label={title}
      onClick={(e) => {
        if (stop) e.stopPropagation()
        speak(text, lang)
      }}
    >
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
      </svg>
    </button>
  )
}
