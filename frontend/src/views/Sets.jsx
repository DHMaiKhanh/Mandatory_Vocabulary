import { useEffect, useState } from 'react'
import { useVocab } from '../store'
import SpeakButton from '../components/SpeakButton'
import { fmtDate } from '../lib/format'

function WordItem({ word, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [term, setTerm] = useState(word.term)
  const [meaning, setMeaning] = useState(word.meaning)
  const [example, setExample] = useState(word.example || '')

  const save = () => {
    if (!term.trim()) return
    onSave({ ...word, term: term.trim(), meaning: meaning.trim(), example: example.trim() })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="word-row" style={{ gridTemplateColumns: '1fr' }}>
        <div className="add-word-grid">
          <input className="input" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Từ tiếng Anh" />
          <input className="input" value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="Nghĩa" />
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
          <button className="btn btn-sm" onClick={() => setEditing(false)}>Huỷ</button>
        </div>
      </div>
    )
  }

  return (
    <div className="word-row">
      <div className="word-term">
        <SpeakButton text={word.term} size="sm" />
        {word.term}
      </div>
      <div className="word-mean">{word.meaning}</div>
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

export default function Sets({ toast }) {
  const { studySets: sets, createSet, renameSet, deleteSet, addWord, updateWord, deleteWord } = useVocab()
  const [selectedId, setSelectedId] = useState(sets[0]?.id ?? null)

  useEffect(() => {
    if (selectedId == null && sets.length) setSelectedId(sets[0].id)
    if (selectedId != null && !sets.some((s) => s.id === selectedId)) {
      setSelectedId(sets[0]?.id ?? null)
    }
  }, [sets, selectedId])

  const selected = sets.find((s) => s.id === selectedId) || null

  // new-word form
  const [term, setTerm] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')

  const handleAddWord = async (e) => {
    e.preventDefault()
    if (!term.trim() || !selected) return
    await addWord(selected.id, { term, meaning, example })
    setTerm('')
    setMeaning('')
    setExample('')
    toast?.('Đã thêm từ mới ✓')
  }

  const handleCreateSet = async () => {
    const name = prompt('Tên bộ từ mới:')
    if (name == null) return
    const set = await createSet(name || 'Bộ từ mới')
    setSelectedId(set.id)
    toast?.('Đã tạo bộ từ ✓')
  }

  const handleRename = async () => {
    if (!selected) return
    const name = prompt('Đổi tên bộ từ:', selected.name)
    if (name == null || !name.trim()) return
    await renameSet(selected.id, name.trim())
  }

  const handleDeleteSet = async () => {
    if (!selected) return
    if (!confirm(`Xoá bộ "${selected.name}" và toàn bộ từ trong đó?`)) return
    await deleteSet(selected.id)
    toast?.('Đã xoá bộ từ')
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Bộ từ của tôi</h1>
          <p>Tự tạo bộ từ, thêm nghĩa và câu ví dụ cho mỗi từ. Dữ liệu được lưu tự động.</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateSet}>+ Tạo bộ từ</button>
      </div>

      {sets.length === 0 ? (
        <div className="empty">
          <div className="big">📚</div>
          <p>Chưa có bộ từ nào. Hãy tạo bộ từ đầu tiên!</p>
          <button className="btn btn-primary" onClick={handleCreateSet}>+ Tạo bộ từ</button>
        </div>
      ) : (
        <>
          <div className="set-list mb">
            {sets.map((s) => (
              <div
                key={s.id}
                className={`set-card ${s.id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(s.id)}
              >
                <h3>{s.name}</h3>
                <div className="meta">
                  {(s.words || []).length} từ · Tạo ngày {fmtDate(s.createdAt)}
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="card card-pad">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0 }}>{selected.name}</h2>
                <div className="row">
                  <button className="btn btn-sm" onClick={handleRename}>Đổi tên</button>
                  <button className="btn btn-sm btn-danger" onClick={handleDeleteSet}>Xoá bộ</button>
                </div>
              </div>

              <form onSubmit={handleAddWord} className="mt mb">
                <div className="add-word-grid">
                  <div className="field">
                    <label>Từ tiếng Anh *</label>
                    <input className="input" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="ví dụ: benefit" />
                  </div>
                  <div className="field">
                    <label>Nghĩa</label>
                    <input className="input" value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="ví dụ: lợi ích" />
                  </div>
                </div>
                <div className="field" style={{ marginTop: 12 }}>
                  <label>Câu ví dụ (lưu vào bộ từ)</label>
                  <textarea
                    className="textarea"
                    value={example}
                    onChange={(e) => setExample(e.target.value)}
                    placeholder="ví dụ: Regular exercise has many health benefits."
                  />
                </div>
                <button className="btn btn-primary mt" type="submit" disabled={!term.trim()}>
                  + Thêm từ vào bộ
                </button>
              </form>

              <h3>Danh sách từ ({(selected.words || []).length})</h3>
              {(selected.words || []).length === 0 ? (
                <p className="muted">Chưa có từ nào. Thêm từ đầu tiên ở trên nhé!</p>
              ) : (
                <div>
                  {selected.words.map((w) => (
                    <WordItem key={w.id} word={w} onSave={updateWord} onDelete={deleteWord} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
