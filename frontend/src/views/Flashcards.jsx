import { useMemo, useState } from 'react'
import SpeakButton from '../components/SpeakButton'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Flashcards({ words, title, onExit }) {
  const [deck, setDeck] = useState(() => words)
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = deck[idx]
  const progress = useMemo(() => `${idx + 1} / ${deck.length}`, [idx, deck.length])

  const go = (delta) => {
    setFlipped(false)
    setIdx((i) => (i + delta + deck.length) % deck.length)
  }

  const reshuffle = () => {
    setDeck(shuffle(words))
    setIdx(0)
    setFlipped(false)
  }

  if (!card) return null

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>🃏 Flashcard</h1>
          <p className="muted">Bộ: {title}</p>
        </div>
        <button className="btn" onClick={onExit}>← Quay lại</button>
      </div>

      <div className="flash-stage">
        <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((f) => !f)}>
          <div className="flashcard-inner">
            <div className="flash-face">
              <span className="hint">Từ</span>
              <div className="flash-term">{card.term}</div>
              <SpeakButton text={card.term} size="lg" stop />
              <p className="muted">Nhấn để lật thẻ</p>
            </div>
            <div className="flash-face flash-back">
              <span className="hint">Nghĩa</span>
              <div className="flash-mean">{card.meaning}</div>
              {card.example && <p className="flash-example">“{card.example}”</p>}
              <SpeakButton text={card.example || card.term} size="md" stop />
            </div>
          </div>
        </div>

        <div className="flash-progress">{progress}</div>

        <div className="flash-controls">
          <button className="btn" onClick={() => go(-1)}>← Trước</button>
          <button className="btn btn-primary" onClick={() => setFlipped((f) => !f)}>Lật thẻ</button>
          <button className="btn" onClick={() => go(1)}>Sau →</button>
          <button className="btn btn-ghost" onClick={reshuffle}>🔀 Xáo trộn</button>
        </div>
      </div>
    </div>
  )
}
