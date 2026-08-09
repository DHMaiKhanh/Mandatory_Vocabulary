// Small formatting helpers.

export function pct(correct, total) {
  if (!total) return 0
  return Math.round((correct / total) * 100)
}

export function fmtDate(ms) {
  if (!ms) return '—'
  return new Date(ms).toLocaleDateString('vi-VN')
}

export function fmtDateTime(ms) {
  if (!ms) return '—'
  return new Date(ms).toLocaleString('vi-VN')
}

export function isSameDay(ms, ref = Date.now()) {
  if (!ms) return false
  const a = new Date(ms)
  const b = new Date(ref)
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const STATUS_LABEL = {
  new: 'Từ mới',
  learning: 'Đang học',
  mastered: 'Thành thạo',
}

export function statusLabel(status) {
  return STATUS_LABEL[status] || 'Từ mới'
}
