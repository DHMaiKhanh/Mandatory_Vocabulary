import { useVocab } from '../store'
import {
  computeStats,
  buildDailySession,
  getIntroducedToday,
  NEW_PER_DAY,
  REVIEW_PER_DAY,
} from '../lib/srs'

export default function Dashboard({ go }) {
  const { studySets: sets } = useVocab()
  const stats = computeStats(sets)
  const introduced = getIntroducedToday()
  const { newWords, reviewWords } = buildDailySession(sets, Date.now(), introduced)
  const todayTotal = newWords.length + reviewWords.length
  const goal = NEW_PER_DAY + REVIEW_PER_DAY
  const donePct = Math.min(100, Math.round((stats.studiedToday / goal) * 100))

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Xin chào 👋</h1>
          <p>Mỗi ngày học {NEW_PER_DAY} từ mới và ôn {REVIEW_PER_DAY} từ cũ — kiên trì là chìa khoá!</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => go('daily')}>
          🎯 Học hôm nay
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="num">{stats.total}</div>
          <div className="label">Tổng số từ</div>
        </div>
        <div className="stat accent">
          <div className="num">{stats.mastered}</div>
          <div className="label">Đã thành thạo</div>
        </div>
        <div className="stat warn">
          <div className="num">{stats.learning}</div>
          <div className="label">Đang học</div>
        </div>
        <div className="stat">
          <div className="num">{stats.fresh}</div>
          <div className="label">Từ mới chưa học</div>
        </div>
        <div className="stat">
          <div className="num">{stats.accuracy}%</div>
          <div className="label">Độ chính xác</div>
        </div>
      </div>

      <div className="card card-pad mb">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Tiến độ hôm nay</h3>
          <span className="muted">
            Đã học {stats.studiedToday} lượt · Còn {todayTotal} thẻ trong phiên hôm nay
          </span>
        </div>
        <div className="progress mt">
          <span style={{ width: `${donePct}%` }} />
        </div>
        <div className="row mt" style={{ gap: 20 }}>
          <span className="muted">
            🆕 {newWords.length} từ mới (đã dùng {introduced}/{NEW_PER_DAY})
          </span>
          <span className="muted">🔁 {reviewWords.length} từ cần ôn</span>
          <span className="muted">⏰ {stats.dueNow} từ đến hạn</span>
        </div>
      </div>

      <div className="tiles">
        <button className="tile" onClick={() => go('daily')}>
          <span className="tile-icon">🎯</span>
          <h3>Học hôm nay</h3>
          <p>Phiên học lặp lại ngắt quãng: {NEW_PER_DAY} mới + {REVIEW_PER_DAY} ôn.</p>
        </button>
        <button className="tile" onClick={() => go('games')}>
          <span className="tile-icon">🃏</span>
          <h3>Flashcard & Trò chơi</h3>
          <p>Lật thẻ, ghép từ (Match) và Gravity để ôn nhanh.</p>
        </button>
        <button className="tile" onClick={() => go('sets')}>
          <span className="tile-icon">✏️</span>
          <h3>Bộ từ của tôi</h3>
          <p>Tạo bộ từ, thêm nghĩa và câu ví dụ cho mỗi từ.</p>
        </button>
        <button className="tile" onClick={() => go('stats')}>
          <span className="tile-icon">📊</span>
          <h3>Thống kê</h3>
          <p>Bảng theo dõi mức thành thạo của từng từ vựng.</p>
        </button>
      </div>
    </div>
  )
}
