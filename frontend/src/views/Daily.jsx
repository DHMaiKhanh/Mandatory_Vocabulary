import { useMemo, useState } from 'react'
import { useVocab } from '../store'
import SpeakButton from '../components/SpeakButton'
import {
  applyReview,
  buildDailySession,
  getIntroducedToday,
  addIntroducedToday,
  NEW_PER_DAY,
  REVIEW_PER_DAY,
} from '../lib/srs'

export default function Daily({ go }) {
  const { sets, updateWord } = useVocab()

  // Build the session once when the view opens.
  const initialQueue = useMemo(() => {
    const { newWords, reviewWords } = buildDailySession(sets, Date.now(), getIntroducedToday())
    return [...newWords, ...reviewWords]
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [queue] = useState(initialQueue)
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [result, setResult] = useState({ known: 0, unknown: 0 })

  const current = queue[idx]
  const total = queue.length
  const finished = idx >= total

  const grade = (known) => {
    const wasNew = (current.status || 'new') === 'new'
    const updated = applyReview(current, known, Date.now())
    updateWord(updated)
    if (wasNew) addIntroducedToday(1)
    setResult((r) => ({
      known: r.known + (known ? 1 : 0),
      unknown: r.unknown + (known ? 0 : 1),
    }))
    setRevealed(false)
    setIdx((i) => i + 1)
  }

  if (total === 0) {
    return (
      <div>
        <div className="page-head">
          <h1>Học hôm nay</h1>
        </div>
        <div className="empty">
          <div className="big">🎉</div>
          <p>Bạn đã hoàn thành hết các từ đến hạn hôm nay!</p>
          <p className="muted">
            Thêm từ mới trong mục “Bộ từ” hoặc quay lại sau để ôn tiếp.
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={() => go('sets')}>Quản lý bộ từ</button>
            <button className="btn btn-primary" onClick={() => go('games')}>Chơi trò chơi</button>
          </div>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div>
        <div className="page-head">
          <h1>Hoàn thành phiên học 🎯</h1>
        </div>
        <div className="card card-pad center">
          <div className="big" style={{ fontSize: '3rem' }}>🌟</div>
          <h2>Bạn đã học {total} thẻ!</h2>
          <div className="row mt" style={{ justifyContent: 'center', gap: 30 }}>
            <div>
              <div className="stat-num" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
                {result.known}
              </div>
              <div className="muted">Đã thuộc</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)' }}>
                {result.unknown}
              </div>
              <div className="muted">Cần ôn lại</div>
            </div>
          </div>
          <div className="row mt" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={() => go('dashboard')}>Về trang chủ</button>
            <button className="btn btn-primary" onClick={() => go('stats')}>Xem thống kê</button>
          </div>
        </div>
      </div>
    )
  }

  const isNew = (current.status || 'new') === 'new'
  const pct = Math.round((idx / total) * 100)

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Học hôm nay</h1>
          <p className="muted">
            {NEW_PER_DAY} từ mới + {REVIEW_PER_DAY} từ ôn · Nhớ tự chấm trung thực nhé!
          </p>
        </div>
        <button className="btn" onClick={() => go('dashboard')}>Thoát</button>
      </div>

      <div className="progress mb">
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="center muted">
        Thẻ {idx + 1} / {total} · {isNew ? '🆕 Từ mới' : '🔁 Ôn tập'} · Bộ: {current.setName}
      </p>

      <div className="flash-stage">
        <div className={`flashcard ${revealed ? 'flipped' : ''}`} onClick={() => setRevealed(true)}>
          <div className="flashcard-inner">
            <div className="flash-face">
              <span className="hint">Từ tiếng Anh</span>
              <div className="flash-term">{current.term}</div>
              <SpeakButton text={current.term} size="lg" stop />
              <p className="muted">Nhấn để xem nghĩa</p>
            </div>
            <div className="flash-face flash-back">
              <span className="hint">Nghĩa & ví dụ</span>
              <div className="flash-mean">{current.meaning || '(chưa có nghĩa)'}</div>
              {current.example && <p className="flash-example">“{current.example}”</p>}
              <SpeakButton text={current.example || current.term} size="md" stop />
            </div>
          </div>
        </div>

        {!revealed ? (
          <button className="btn btn-primary btn-lg" onClick={() => setRevealed(true)}>
            Hiện đáp án
          </button>
        ) : (
          <div className="flash-controls">
            <button className="btn btn-danger btn-lg" onClick={() => grade(false)}>
              😕 Chưa thuộc
            </button>
            <button className="btn btn-success btn-lg" onClick={() => grade(true)}>
              😄 Đã thuộc
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
