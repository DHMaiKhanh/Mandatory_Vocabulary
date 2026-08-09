import { useMemo, useState } from 'react'
import { useVocab } from '../store'
import SpeakButton from '../components/SpeakButton'

const PERSONAL_SET_NAME = 'Sổ tay từ vựng của tôi'
const UNCATEGORIZED = 'Chưa phân loại'

/** One editable entry in the personal notebook. Shows: term (note) : meaning. */
function VocabItem({ word, categories, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [term, setTerm] = useState(word.term || '')
  const [note, setNote] = useState(word.note || '')
  const [meaning, setMeaning] = useState(word.meaning || '')
  const [example, setExample] = useState(word.example || '')
  const [category, setCategory] = useState(word.category || '')

  const save = () => {
    if (!term.trim()) return
    onSave({
      ...word,
      term: term.trim(),
      note: note.trim(),
      meaning: meaning.trim(),
      example: example.trim(),
      category: category.trim(),
    })
    setEditing(false)
  }

  const cancel = () => {
    setTerm(word.term || '')
    setNote(word.note || '')
    setMeaning(word.meaning || '')
    setExample(word.example || '')
    setCategory(word.category || '')
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="word-row" style={{ gridTemplateColumns: '1fr' }}>
        <div className="add-word-grid">
          <input className="input" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Từ tiếng Anh" />
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Cách đọc / note (vd: chờ lai)" />
        </div>
        <div className="add-word-grid" style={{ marginTop: 8 }}>
          <input className="input" value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="Nghĩa (vd: Tháng 7)" />
          <input
            className="input"
            list="mv-cat-list"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Chủ đề (vd: Tháng)"
          />
        </div>
        <textarea
          className="textarea"
          style={{ marginTop: 8 }}
          value={example}
          onChange={(e) => setExample(e.target.value)}
          placeholder="Câu ví dụ (tuỳ chọn)"
        />
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={save}>Lưu</button>
          <button className="btn btn-sm" onClick={cancel}>Huỷ</button>
        </div>
      </div>
    )
  }

  return (
    <div className="word-row">
      <div className="word-term">
        <SpeakButton text={word.term} size="sm" />
        <span>
          {word.term}
          {word.note && <span className="word-note"> ({word.note})</span>}
        </span>
      </div>
      <div className="word-mean">{word.meaning || <span className="muted">(chưa có nghĩa)</span>}</div>
      <div className="word-actions">
        <button className="icon-btn" title="Sửa" onClick={() => setEditing(true)}>✏️</button>
        <button className="icon-btn" title="Xoá" onClick={() => onDelete(word.id)}>🗑️</button>
      </div>
      {word.example && (
        <div className="word-example">
          <SpeakButton text={word.example} size="sm" title="Nghe câu ví dụ" />
          <span>“{word.example}”</span>
        </div>
      )}
    </div>
  )
}

export default function MyVocab({ toast }) {
  const { personalSets, createSet, addWord, updateWord, deleteWord } = useVocab()
  const personalSet = personalSets[0] || null
  const words = personalSet?.words || []

  // new-word form
  const [term, setTerm] = useState('')
  const [note, setNote] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [category, setCategory] = useState('')

  // browsing
  const [filter, setFilter] = useState('__all__')
  const [q, setQ] = useState('')

  const categories = useMemo(() => {
    const set = new Set()
    for (const w of words) if ((w.category || '').trim()) set.add(w.category.trim())
    return [...set].sort((a, b) => a.localeCompare(b, 'vi'))
  }, [words])

  // Group words by category, applying the active filter + search.
  const groups = useMemo(() => {
    const s = q.trim().toLowerCase()
    const map = new Map()
    for (const w of words) {
      const cat = (w.category || '').trim() || UNCATEGORIZED
      if (filter !== '__all__' && cat !== filter) continue
      if (
        s &&
        !(w.term || '').toLowerCase().includes(s) &&
        !(w.meaning || '').toLowerCase().includes(s) &&
        !(w.note || '').toLowerCase().includes(s)
      )
        continue
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat).push(w)
    }
    // Sort: named categories first (alphabetically), "Chưa phân loại" last.
    return [...map.entries()].sort(([a], [b]) => {
      if (a === UNCATEGORIZED) return 1
      if (b === UNCATEGORIZED) return -1
      return a.localeCompare(b, 'vi')
    })
  }, [words, filter, q])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!term.trim()) return
    // Lazily create the personal notebook set on first use.
    let target = personalSet
    if (!target) target = await createSet(PERSONAL_SET_NAME, 'personal')
    await addWord(target.id, {
      term,
      note,
      meaning,
      example,
      category: category.trim(),
    })
    setTerm('')
    setNote('')
    setMeaning('')
    setExample('')
    // keep `category` so adding several words to the same topic is quick
    toast?.('Đã lưu từ vào sổ tay ✓')
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Từ vựng của tôi</h1>
          <p>
            Sổ tay riêng của bạn — ghi lại từ học được mỗi ngày theo <b>chủ đề</b>. Có thể thêm cách đọc
            (vd: <i>July (chờ lai) : Tháng 7</i>). Tách biệt hoàn toàn với bộ từ TOEIC.
          </p>
        </div>
      </div>

      {/* shared category suggestions for all inputs */}
      <datalist id="mv-cat-list">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="card card-pad mb">
        <h3 style={{ marginTop: 0 }}>+ Thêm từ vào sổ tay</h3>
        <form onSubmit={handleAdd}>
          <div className="add-word-grid">
            <div className="field">
              <label>Từ tiếng Anh *</label>
              <input className="input" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="ví dụ: July" />
            </div>
            <div className="field">
              <label>Cách đọc / note</label>
              <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="ví dụ: chờ lai" />
            </div>
          </div>
          <div className="add-word-grid" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Nghĩa</label>
              <input className="input" value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="ví dụ: Tháng 7" />
            </div>
            <div className="field">
              <label>Chủ đề (category)</label>
              <input
                className="input"
                list="mv-cat-list"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="ví dụ: Tháng / Động vật / Công việc"
              />
            </div>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Câu ví dụ (tuỳ chọn)</label>
            <textarea
              className="textarea"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="ví dụ: My birthday is in July."
            />
          </div>
          <button className="btn btn-primary mt" type="submit" disabled={!term.trim()}>
            + Lưu vào sổ tay
          </button>
        </form>
      </div>

      {words.length === 0 ? (
        <div className="empty">
          <div className="big">🗒️</div>
          <p>Sổ tay của bạn còn trống. Thêm từ đầu tiên ở trên nhé!</p>
        </div>
      ) : (
        <>
          <div className="row mb" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div className="chip-row">
              <button
                className={`chip ${filter === '__all__' ? 'active' : ''}`}
                onClick={() => setFilter('__all__')}
              >
                Tất cả ({words.length})
              </button>
              {categories.map((c) => (
                <button key={c} className={`chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
                  {c} ({words.filter((w) => (w.category || '').trim() === c).length})
                </button>
              ))}
            </div>
            <input
              className="input"
              style={{ maxWidth: 260 }}
              placeholder="🔍 Tìm trong sổ tay…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {groups.length === 0 ? (
            <p className="muted">Không tìm thấy từ nào khớp.</p>
          ) : (
            groups.map(([cat, list]) => (
              <div className="card card-pad mb" key={cat}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>📁 {cat}</h3>
                  <span className="muted">{list.length} từ</span>
                </div>
                <div className="mt">
                  {list.map((w) => (
                    <VocabItem
                      key={w.id}
                      word={w}
                      categories={categories}
                      onSave={updateWord}
                      onDelete={deleteWord}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
