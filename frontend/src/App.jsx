import { useRef, useState } from 'react'
import { VocabProvider, useVocab } from './store'
import Dashboard from './views/Dashboard'
import Sets from './views/Sets'
import MyVocab from './views/MyVocab'
import Daily from './views/Daily'
import Games from './views/Games'
import Stats from './views/Stats'

const TABS = [
  { id: 'dashboard', label: 'Trang chủ', icon: '🏠' },
  { id: 'sets', label: 'Bộ từ', icon: '📚' },
  { id: 'myvocab', label: 'Từ vựng của tôi', icon: '🗒️' },
  { id: 'daily', label: 'Học hôm nay', icon: '🎯' },
  { id: 'games', label: 'Trò chơi', icon: '🎮' },
  { id: 'stats', label: 'Thống kê', icon: '📊' },
]

function Shell() {
  const { loading, mode } = useVocab()
  const [view, setView] = useState('dashboard')
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast(null), 2200)
  }

  const viewProps = { go: setView, toast: showToast }

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-inner">
          <div className="brand">
            <span className="logo">V</span>
            <span>VocabMaster</span>
          </div>
          <div className="nav-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`nav-tab ${view === t.id ? 'active' : ''}`}
                onClick={() => setView(t.id)}
              >
                <span aria-hidden="true">{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          <span className={`mode-badge ${mode === 'online' ? 'mode-online' : 'mode-offline'}`}>
            {mode === 'online' ? '● Server' : '● Offline'}
          </span>
        </div>
      </nav>

      <main className="container">
        {loading ? (
          <div className="empty">
            <div className="big">⏳</div>
            <p>Đang tải dữ liệu…</p>
          </div>
        ) : (
          <>
            {view === 'dashboard' && <Dashboard {...viewProps} />}
            {view === 'sets' && <Sets {...viewProps} />}
            {view === 'myvocab' && <MyVocab {...viewProps} />}
            {view === 'daily' && <Daily {...viewProps} />}
            {view === 'games' && <Games {...viewProps} />}
            {view === 'stats' && <Stats {...viewProps} />}
          </>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default function App() {
  return (
    <VocabProvider>
      <Shell />
    </VocabProvider>
  )
}
