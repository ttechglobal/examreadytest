'use client'
import { useState, useEffect } from 'react'

const LEVELS = [
  { id: 'junior',        label: 'Junior Secondary' },
  { id: 'secondary',     label: 'Senior Secondary' },
  { id: 'international', label: 'International' },
  { id: 'professional',  label: 'Professional / Other' },
]

const LEVEL_COLORS = {
  junior:        { bg: '#FEF3C7', text: '#D97706' },
  secondary:     { bg: '#DBEAFE', text: '#1D4ED8' },
  international: { bg: '#F3E8FF', text: '#7C3AED' },
  professional:  { bg: '#D1FAE5', text: '#065F46' },
}

const EMPTY_FORM = { id: '', name: '', full_name: '', description: '', level: 'secondary', sort_order: 100 }

export default function AdminExamsPage() {
  const [exams,   setExams]   = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [form,    setForm]    = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null) // exam id being edited
  const [showNew, setShowNew] = useState(false)
  const [confirm, setConfirm] = useState(null) // id to confirm deactivate

  async function load() {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/exam-types')
      const data = await res.json()
      setExams(data.examTypes || [])
    } catch { setError('Failed to load exam types') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function flash(msg, isError = false) {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000) }
    else         { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.id.trim() || !form.name.trim() || !form.full_name.trim()) {
      return flash('ID, Short Name and Full Name are required', true)
    }
    setSaving(true)
    try {
      const res  = await fetch('/api/admin/exam-types', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sort_order: Number(form.sort_order) || 100 })
      })
      const data = await res.json()
      if (!res.ok) return flash(data.error || 'Failed to create', true)
      flash(`${data.examType.name} added successfully`)
      setForm(EMPTY_FORM)
      setShowNew(false)
      load()
    } catch { flash('Network error', true) }
    finally { setSaving(false) }
  }

  async function handleUpdate(id, updates) {
    try {
      const res  = await fetch(`/api/admin/exam-types/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      if (!res.ok) return flash(data.error || 'Failed to update', true)
      flash(`${data.examType.name} updated`)
      setEditing(null)
      load()
    } catch { flash('Network error', true) }
  }

  async function handleDeactivate(id) {
    try {
      const res  = await fetch(`/api/admin/exam-types/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) return flash(data.error || 'Failed to deactivate', true)
      flash(`${data.examType.name} deactivated`)
      setConfirm(null)
      load()
    } catch { flash('Network error', true) }
  }

  async function handleReactivate(id) {
    await handleUpdate(id, { active: true })
  }

  const active   = exams.filter(e => e.active)
  const inactive = exams.filter(e => !e.active)

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[22px] font-bold text-[#0F172A] leading-tight">Exam Types</h1>
            <p className="text-[14px] text-slate-500 mt-1">
              Manage available exams. Changes here affect the student setup flow immediately.
            </p>
          </div>
          <button
            onClick={() => { setShowNew(true); setForm(EMPTY_FORM) }}
            className="flex items-center gap-2 bg-[#1A2B5E] text-white text-[13px] font-bold px-4 py-2.5 rounded-[9px] hover:bg-[#243575] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add exam type
          </button>
        </div>

        {/* Flash messages */}
        {error   && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-[10px] text-[13px] text-red-700 font-semibold">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-[10px] text-[13px] text-green-700 font-semibold">{success}</div>}

        {/* New exam form */}
        {showNew && (
          <div className="mb-6 bg-white border border-slate-200 rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-[#0F172A]">New exam type</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-600 text-[20px] leading-none">×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Short ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value.toUpperCase() }))}
                    placeholder="e.g. IGCSE"
                    className="w-full border border-slate-200 rounded-[9px] px-3 py-2.5 text-[14px] font-mono font-bold text-[#0F172A] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Used internally — cannot change later</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Short Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. IGCSE"
                    className="w-full border border-slate-200 rounded-[9px] px-3 py-2.5 text-[14px] text-[#0F172A] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="e.g. International General Certificate of Secondary Education"
                  className="w-full border border-slate-200 rounded-[9px] px-3 py-2.5 text-[14px] text-[#0F172A] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                  <input
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="e.g. Cambridge international qualification"
                    className="w-full border border-slate-200 rounded-[9px] px-3 py-2.5 text-[14px] text-[#0F172A] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Level</label>
                  <select
                    value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                    className="w-full border border-slate-200 rounded-[9px] px-3 py-2.5 text-[14px] text-[#0F172A] outline-none focus:border-blue-400 bg-white"
                  >
                    {LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Sort order</label>
                  <input
                    type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                    className="w-20 border border-slate-200 rounded-[8px] px-2 py-1.5 text-[13px] text-center outline-none focus:border-blue-400"
                  />
                  <span className="text-[11px] text-slate-400">Lower = appears first</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowNew(false)}
                    className="px-4 py-2 text-[13px] font-semibold text-slate-600 border border-slate-200 rounded-[9px] hover:bg-slate-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="px-5 py-2 text-[13px] font-bold text-white bg-[#1A2B5E] rounded-[9px] hover:bg-[#243575] disabled:opacity-50">
                    {saving ? 'Creating…' : 'Create exam type'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Active exam types */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-[14px]">Loading…</div>
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-[14px] overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-[13px] font-bold text-slate-700">
                  Active exam types <span className="text-slate-400 font-normal ml-1">({active.length})</span>
                </h2>
              </div>
              {active.length === 0 ? (
                <div className="px-5 py-8 text-center text-[14px] text-slate-400">No active exam types</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {active.map(exam => (
                    <ExamRow
                      key={exam.id} exam={exam}
                      editing={editing === exam.id}
                      onEdit={() => setEditing(exam.id)}
                      onCancelEdit={() => setEditing(null)}
                      onSave={(updates) => handleUpdate(exam.id, updates)}
                      onDeactivate={() => setConfirm(exam.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Inactive */}
            {inactive.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-[14px] overflow-hidden opacity-70">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-[13px] font-bold text-slate-500">
                    Inactive <span className="font-normal ml-1">({inactive.length})</span>
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {inactive.map(exam => (
                    <div key={exam.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <span className="text-[14px] font-bold text-slate-400 line-through mr-2">{exam.name}</span>
                        <span className="text-[12px] text-slate-400">{exam.full_name}</span>
                      </div>
                      <button onClick={() => handleReactivate(exam.id)}
                        className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-[7px] hover:bg-blue-50">
                        Reactivate
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Confirm deactivate modal */}
        {confirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[16px] p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-2">Deactivate exam type?</h3>
              <p className="text-[14px] text-slate-500 mb-5">
                Students will no longer see <strong>{exams.find(e => e.id === confirm)?.name}</strong> as an option.
                Existing sessions and questions are unaffected. You can reactivate it at any time.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirm(null)}
                  className="px-4 py-2 text-[13px] font-semibold text-slate-600 border border-slate-200 rounded-[9px] hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={() => handleDeactivate(confirm)}
                  className="px-4 py-2 text-[13px] font-bold text-white bg-red-600 rounded-[9px] hover:bg-red-700">
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-[12px] px-4 py-4">
          <p className="text-[13px] font-semibold text-blue-800 mb-1">About exam types</p>
          <p className="text-[12px] text-blue-600 leading-relaxed">
            Exam types appear in the student setup flow and in the question bank.
            Adding a new exam type here makes it available for question uploads and student sessions.
            Deactivating hides it from students but preserves all existing data.
            The sort order controls which exam appears first in the list.
          </p>
        </div>

      </div>
    </div>
  )
}

// ── Inline editable row ─────────────────────────────────────────
function ExamRow({ exam, editing, onEdit, onCancelEdit, onSave, onDeactivate }) {
  const [form, setForm] = useState({ name: exam.name, full_name: exam.full_name, description: exam.description, level: exam.level, sort_order: exam.sort_order })
  const lc = LEVEL_COLORS[exam.level] || LEVEL_COLORS.secondary

  if (editing) {
    return (
      <div className="px-5 py-4 bg-blue-50/40">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Short Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-slate-200 rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-blue-400"/>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Level</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
              className="w-full border border-slate-200 rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-blue-400 bg-white">
              {LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
          <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            className="w-full border border-slate-200 rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-blue-400"/>
        </div>
        <div className="mb-3">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Description</label>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border border-slate-200 rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-blue-400"/>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sort</label>
            <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
              className="w-16 border border-slate-200 rounded-[7px] px-2 py-1 text-[13px] text-center outline-none focus:border-blue-400"/>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancelEdit} className="px-3 py-1.5 text-[12px] font-semibold text-slate-600 border border-slate-200 rounded-[8px] hover:bg-white">Cancel</button>
            <button onClick={() => onSave(form)} className="px-4 py-1.5 text-[12px] font-bold text-white bg-[#1A2B5E] rounded-[8px] hover:bg-[#243575]">Save</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
      {/* Sort handle */}
      <span className="text-[11px] font-mono text-slate-300 w-6 text-center shrink-0">{exam.sort_order}</span>
      {/* ID badge */}
      <span className="font-mono font-black text-[14px] text-[#1A2B5E] w-14 shrink-0">{exam.id}</span>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-bold text-[#0F172A]">{exam.name}</span>
          <span className="text-[12px] text-slate-500">{exam.full_name}</span>
        </div>
        {exam.description && <p className="text-[12px] text-slate-400 mt-0.5">{exam.description}</p>}
      </div>
      {/* Level pill */}
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
        style={{ background: lc.bg, color: lc.text }}>
        {LEVELS.find(l => l.id === exam.level)?.label || exam.level}
      </span>
      {/* Actions */}
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onEdit}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-[6px] transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={onDeactivate}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-[6px] transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 7h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}