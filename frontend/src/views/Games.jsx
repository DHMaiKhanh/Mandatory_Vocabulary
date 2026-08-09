import { useEffect, useState } from 'react'
import { useVocab } from '../store'
import Flashcards from './Flashcards'
import MatchGame from './MatchGame'
import GravityGame from './GravityGame'

const GAMES = [
  { id: 'flash', icon: '🃏', name: 'Flashcard', desc: 'Lật thẻ ôn từ, nghe phát âm.' },
  { id: 'match', icon: '🧩', name: 'Match (Ghép từ)', desc: 'Ghép từ với nghĩa thật nhanh, tính giờ.' },
  { id: 'gravity', icon: '☄️', name: 'Gravity', desc: 'Từ rơi xuống — gõ tiếng Anh trước khi chạm đáy.' },
]

export default function Games() {
  const { sets } = useVocab()
  const [setId, setSetId] = useState(sets[0]?.id ?? null)
  const [game, setGame] = useState(null)

  useEffect(() => {
    if ((setId == null || !sets.some((s) => s.id === setId)) && sets.length) {
      setSetId(sets[0].id)
    }
  }, [sets, setId])

  const set = sets.find((s) => s.id === setId) || null
  const words = (set?.words || []).filter((w) => w.term && w.meaning)

  if (game && set) {
    const exit = () => setGame(null)
    if (game === 'flash') return <Flashcards words={words} title={set.name} onExit={exit} />
    if (game === 'match') return <MatchGame words={words} title={set.name} onExit={exit} />
    if (game === 'gravity') return <GravityGame words={words} title={set.name} onExit={exit} />
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Flashcard & Trò chơi</h1>
          <p className="muted">Chọn bộ từ rồi chọn một chế độ để ôn tập.</p>
        </div>
      </div>

      {sets.length === 0 ? (
        <div className="empty">
          <div className="big">📚</div>
          <p>Bạn chưa có bộ từ nào để chơi. Hãy tạo bộ từ trước.</p>
        </div>
      ) : (
        <>
          <div className="field mb" style={{ maxWidth: 380 }}>
            <label>Chọn bộ từ</label>
            <select className="input" value={setId ?? ''} onChange={(e) => setSetId(Number(e.target.value))}>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({(s.words || []).length} từ)
                </option>
              ))}
            </select>
          </div>

          <p className="muted mb">
            Bộ đang chọn có <b>{words.length}</b> từ hợp lệ (có cả từ và nghĩa).
          </p>

          <div className="tiles">
            {GAMES.map((g) => {
              const disabled = words.length < 2
              return (
                <button
                  key={g.id}
                  className="tile"
                  disabled={disabled}
                  style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                  onClick={() => !disabled && setGame(g.id)}
                >
                  <span className="tile-icon">{g.icon}</span>
                  <h3>{g.name}</h3>
                  <p>{g.desc}</p>
                  {disabled && <p className="muted">Cần ít nhất 2 từ</p>}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
