import { useEffect, useRef, useState } from 'react'

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function GravityGame({ words, title, onExit }) {
  const areaRef = useRef(null)
  const inputRef = useRef(null)
  const [phase, setPhase] = useState('ready') // ready | playing | over
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [value, setValue] = useState('')
  const [, force] = useState(0)

  const g = useRef(null)
  const raf = useRef(0)
  const phaseRef = useRef('ready')
  const livesRef = useRef(3)

  const setPhaseBoth = (p) => {
    phaseRef.current = p
    setPhase(p)
  }

  const start = () => {
    g.current = { items: [], seq: 0, lastSpawn: 0, lastTime: 0, spawnEvery: 2200, fallBase: 55, speedMul: 1 }
    livesRef.current = 3
    setLives(3)
    setScore(0)
    setValue('')
    setPhaseBoth('playing')
    setTimeout(() => inputRef.current?.focus(), 60)
  }

  useEffect(() => {
    if (phase !== 'playing') return
    const step = (t) => {
      const gs = g.current
      if (!gs) return
      if (!gs.lastTime) gs.lastTime = t
      const dt = Math.min(0.05, (t - gs.lastTime) / 1000)
      gs.lastTime = t
      const areaH = areaRef.current?.clientHeight || 460

      if (t - gs.lastSpawn > gs.spawnEvery) {
        gs.lastSpawn = t
        const w = pick(words)
        gs.items.push({
          id: gs.seq++,
          term: w.term,
          meaning: w.meaning,
          x: 8 + Math.random() * 84,
          y: 0,
          speed: (gs.fallBase + Math.random() * 20) * gs.speedMul,
        })
      }

      let lost = 0
      const alive = []
      for (const it of gs.items) {
        it.y += it.speed * dt
        if (it.y >= areaH - 34) lost++
        else alive.push(it)
      }
      gs.items = alive

      if (lost > 0) {
        livesRef.current -= lost
        setLives(Math.max(0, livesRef.current))
        if (livesRef.current <= 0) {
          setPhaseBoth('over')
          return
        }
      }
      force((x) => x + 1)
      if (phaseRef.current === 'playing') raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [phase, words])

  const submit = (e) => {
    e.preventDefault()
    const guess = value.trim().toLowerCase()
    setValue('')
    if (!guess || !g.current) return
    const gs = g.current
    const i = gs.items.findIndex((it) => it.term.toLowerCase() === guess)
    if (i !== -1) {
      gs.items.splice(i, 1)
      setScore((s) => s + 1)
      gs.speedMul = Math.min(2.4, gs.speedMul + 0.06)
      gs.spawnEvery = Math.max(900, gs.spawnEvery - 40)
      force((x) => x + 1)
    }
  }

  const items = g.current?.items || []

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>☄️ Gravity</h1>
          <p className="muted">Bộ: {title} · Gõ TỪ TIẾNG ANH của nghĩa đang rơi rồi Enter.</p>
        </div>
        <button className="btn" onClick={onExit}>← Quay lại</button>
      </div>

      <div className="gravity-area" ref={areaRef}>
        <div className="gravity-hud">
          <span>Điểm: {score}</span>
          <span className="gravity-lives">{'❤'.repeat(Math.max(0, lives)) || '—'}</span>
        </div>

        {phase === 'playing' &&
          items.map((it) => (
            <div key={it.id} className="falling" style={{ left: `${it.x}%`, top: `${it.y}px`, maxWidth: '46%', whiteSpace: 'normal', textAlign: 'center' }}>
              {it.meaning}
            </div>
          ))}

        {phase === 'ready' && (
          <div className="overlay" style={{ position: 'absolute' }}>
            <div className="overlay-card">
              <div className="big">☄️</div>
              <h2>Gravity</h2>
              <p className="muted">
                Nghĩa tiếng Việt rơi từ trên xuống. Gõ đúng <b>từ tiếng Anh</b> rồi nhấn Enter để phá.
                Bạn có 3 mạng ❤.
              </p>
              <button className="btn btn-primary btn-lg mt" onClick={start}>▶ Bắt đầu</button>
            </div>
          </div>
        )}

        {phase === 'over' && (
          <div className="overlay" style={{ position: 'absolute' }}>
            <div className="overlay-card">
              <div className="big">💥</div>
              <h2>Kết thúc!</h2>
              <p className="muted">Điểm của bạn: <b>{score}</b></p>
              <div className="row mt" style={{ justifyContent: 'center' }}>
                <button className="btn" onClick={onExit}>Thoát</button>
                <button className="btn btn-primary" onClick={start}>🔁 Chơi lại</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <form className="gravity-input-row" onSubmit={submit}>
        <input
          ref={inputRef}
          className="input"
          placeholder={phase === 'playing' ? 'Gõ từ tiếng Anh…' : 'Nhấn Bắt đầu để chơi'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={phase !== 'playing'}
          autoComplete="off"
        />
        <button className="btn btn-primary" type="submit" disabled={phase !== 'playing'}>Bắn</button>
      </form>
    </div>
  )
}
