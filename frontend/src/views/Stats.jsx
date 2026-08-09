import { useMemo, useState } from 'react'
import { useVocab } from '../store'
import SpeakButton from '../components/SpeakButton'
import { computeStats, flattenWords } from '../lib/srs'
import { fmtDate, pct, statusLabel } from '../lib/format'

const COLUMNS = [
  { key: 'term', label: 'Từ' },
  { key: 'meaning', label: 'Nghĩa' },
  { key: 'setName', label: 'Bộ' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'box', label: 'Cấp độ' },
  { key: 'reps', label: 'Số lần học' },
  { key: 'accuracy', label: 'Chính xác' },
  { key: 'lastStudied', label: 'Học gần nhất' },
  { key: 'addedAt', label: 'Ngày thêm' },
]

export default function Stats() {
  const { studySets: sets } = useVocab()
  const stats = computeStats(sets)
  const [sort, setSort] = useState({ key: 'addedAt', dir: 'desc' })
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    let list = flattenWords(sets).map((w) => ({
      ...w,
      accuracy: pct(w.correct || 0, (w.correct || 0) + (w.wrong || 0)),
    }))
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      list = list.filter(
        (w) =>
          (w.term || '').toLowerCase().includes(s) ||
          (w.meaning || '').toLowerCase().includes(s),
      )
    }
    const { key, dir } = sort
    const mul = dir === 'asc' ? 1 : -1
    list.sort((a, b) => {
      const av = a[key] ?? (typeof a[key] === 'string' ? '' : 0)
      const bv = b[key] ?? 0
      if (typeof av === 'string') return av.localeCompare(bv || '') * mul
      return ((av || 0) - (bv || 0)) * mul
    })
    return list
  }, [sets, sort, q])

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  const arrow = (key) => (sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '')

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Thống kê từ vựng</h1>
          <p className="muted">Theo dõi mức thành thạo và độ chính xác của từng từ.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat"><div className="num">{stats.total}</div><div className="label">Tổng số từ</div></div>
        <div className="stat accent"><div className="num">{stats.mastered}</div><div className="label">Thành thạo</div></div>
        <div className="stat warn"><div className="num">{stats.learning}</div><div className="label">Đang học</div></div>
        <div className="stat"><div className="num">{stats.fresh}</div><div className="label">Từ mới</div></div>
        <div className="stat"><div className="num">{stats.accuracy}%</div><div className="label">Chính xác chung</div></div>
        <div className="stat"><div className="num">{stats.studiedToday}</div><div className="label">Đã học hôm nay</div></div>
      </div>

      <div className="row mb" style={{ justifyContent: 'space-between' }}>
        <input
          className="input"
          style={{ maxWidth: 320 }}
          placeholder="🔍 Tìm từ hoặc nghĩa…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="muted">{rows.length} từ</span>
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <div className="big">📊</div>
          <p>Chưa có dữ liệu. Hãy thêm từ và bắt đầu học nhé!</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="stats">
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c.key} onClick={() => toggleSort(c.key)}>
                    {c.label}
                    {arrow(c.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => {
                const answered = (w.correct || 0) + (w.wrong || 0)
                return (
                  <tr key={w.id}>
                    <td>
                      <div className="row" style={{ gap: 6 }}>
                        <SpeakButton text={w.term} size="sm" />
                        <b>{w.term}</b>
                      </div>
                    </td>
                    <td>{w.meaning}</td>
                    <td className="muted">{w.setName}</td>
                    <td>
                      <span className={`badge badge-${w.status || 'new'}`}>{statusLabel(w.status)}</span>
                    </td>
                    <td>{w.box || 0}/5</td>
                    <td>{w.reps || 0}</td>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <div className="acc-bar" style={{ flex: 1 }}>
                          <span style={{ width: `${w.accuracy}%` }} />
                        </div>
                        <span className="muted" style={{ minWidth: 60 }}>
                          {answered ? `${w.accuracy}%` : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="muted">{fmtDate(w.lastStudied)}</td>
                    <td className="muted">{fmtDate(w.addedAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
