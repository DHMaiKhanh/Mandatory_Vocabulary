import { useEffect, useRef, useState } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MatchGame({ words, title, onExit }) {
  const PAIRS = Math.min(6, words.length)

  const buildRound = () => {
    const chosen = shuffle(words).slice(0, PAIRS)
    const tiles = []
    chosen.forEach((w) => {
      tiles.push({ id: `${w.id}-t`, wordId: w.id, kind: 'term', text: w.term })
      tiles.push({ id: `${w.id}-m`, wordId: w.id, kind: 'mean', text: w.meaning })
    })
    return shuffle(tiles)
  }

  const [tiles, setTiles] = useState(buildRound)
  const [matched, setMatched] = useState([])
  const [selected, setSelected] = useState(null)
  const [wrong, setWrong] = useState([])
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)
  const startRef = useRef(Date.now())

  useEffect(() => {
    if (done) return
    const t = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 100)
    return () => clearInterval(t)
  }, [done])

  const click = (tile) => {
    if (done || wrong.length || matched.includes(tile.id)) return
    if (selected === null) {
      setSelected(tile.id)
      return
    }
    if (selected === tile.id) {
      setSelected(null)
      return
    }
    const sel = tiles.find((t) => t.id === selected)
    if (sel.wordId === tile.wordId && sel.kind !== tile.kind) {
      const nm = [...matched, selected, tile.id]
      setMatched(nm)
      setSelected(null)
      if (nm.length === tiles.length) setDone(true)
    } else {
      setWrong([selected, tile.id])
      setTimeout(() => {
        setWrong([])
        setSelected(null)
      }, 650)
    }
  }

  const playAgain = () => {
    setTiles(buildRound())
    setMatched([])
    setSelected(null)
    setWrong([])
    setElapsed(0)
    startRef.current = Date.now()
    setDone(false)
  }

  const cls = (id) => {
    if (matched.includes(id)) return 'matched'
    if (wrong.includes(id)) return 'wrong'
    if (selected === id) return 'selected'
    return ''
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>🧩 Match — Ghép từ</h1>
          <p className="muted">Bộ: {title} · Ghép từ tiếng Anh với nghĩa của nó.</p>
        </div>
        <div className="row">
          <span className="badge badge-learning" style={{ fontSize: '1rem' }}>⏱️ {elapsed.toFixed(1)}s</span>
          <button className="btn" onClick={onExit}>← Quay lại</button>
        </div>
      </div>

      <div className="match-grid">
        {tiles.map((t) => (
          <button key={t.id} className={`match-tile ${cls(t.id)}`} onClick={() => click(t)}>
            {t.text}
          </button>
        ))}
      </div>

      {done && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="big">🏆</div>
            <h2>Hoàn thành!</h2>
            <p className="muted">
              Bạn đã ghép {PAIRS} cặp trong <b>{elapsed.toFixed(1)} giây</b>.
            </p>
            <div className="row mt" style={{ justifyContent: 'center' }}>
              <button className="btn" onClick={onExit}>Thoát</button>
              <button className="btn btn-primary" onClick={playAgain}>🔁 Chơi lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
