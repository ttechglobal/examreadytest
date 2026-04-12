'use client'
import { useState, useEffect } from 'react'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { formatDate, formatTimeAgo } from '@/lib/utils/format'

const ROOM_COLORS = {
  jamb: '#2D3CE6', waec: '#15803D', neco: '#D97706',
}

export default function AdminCommunityPage() {
  const [tab,     setTab]     = useState('posts')
  const [posts,   setPosts]   = useState([])
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    setLoading(true)
    const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL

    // Fetch via our own API routes
    Promise.all([
      fetch('/api/admin/community/posts').then(r => r.json()),
      fetch('/api/admin/community/replies').then(r => r.json()),
    ]).then(([p, r]) => {
      setPosts(p.posts || [])
      setReplies(r.replies || [])
    }).finally(() => setLoading(false))
  }, [])

  async function deletePost(id) {
    setDeleting(id)
    try {
      await fetch(`/api/admin/community/posts/${id}`, { method: 'DELETE' })
      setPosts(ps => ps.filter(p => p.id !== id))
    } finally { setDeleting(null) }
  }

  async function deleteReply(id) {
    setDeleting(id)
    try {
      await fetch(`/api/admin/community/replies/${id}`, { method: 'DELETE' })
      setReplies(rs => rs.filter(r => r.id !== id))
    } finally { setDeleting(null) }
  }

  const tabBtn = (key, label, count) => (
    <button onClick={() => setTab(key)}
      style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: tab === key ? 700 : 500, padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', color: tab === key ? '#2D3CE6' : '#6B7280', borderBottom: `2px solid ${tab === key ? '#2D3CE6' : 'transparent'}`, marginBottom: -1 }}>
      {label} ({count})
    </button>
  )

  const today = new Date().toDateString()
  const postsToday  = posts.filter(p => new Date(p.created_at).toDateString() === today).length
  const postsWeek   = posts.filter(p => Date.now() - new Date(p.created_at) < 7 * 86400000).length
  const roomCounts  = { jamb: 0, waec: 0, neco: 0 }
  posts.forEach(p => { if (roomCounts[p.room_id] !== undefined) roomCounts[p.room_id]++ })

  return (
    <>
      <AdminTopbar title="Community" />
      <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total posts',   value: posts.length },
            { label: 'Posts today',   value: postsToday },
            { label: 'Posts this week', value: postsWeek },
            { label: 'Total replies', value: replies.length },
            { label: 'JAMB posts',    value: roomCounts.jamb },
            { label: 'WAEC posts',    value: roomCounts.waec },
            { label: 'NECO posts',    value: roomCounts.neco },
          ].map(s => (
            <div key={s.label} style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 22, color: '#0A0A0A', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid #E8EAED', marginBottom: 16 }}>
          {tabBtn('posts', 'Posts', posts.length)}
          {tabBtn('replies', 'Replies', replies.length)}
        </div>

        {loading ? (
          <div style={{ height: 200, background: '#F1F5F9', borderRadius: 12 }}/>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 12, overflow: 'hidden' }}>
            {tab === 'posts' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '8%' }}/><col style={{ width: '10%' }}/><col style={{ width: '40%' }}/><col style={{ width: '10%' }}/><col style={{ width: '10%' }}/><col style={{ width: '12%' }}/><col style={{ width: '10%' }}/>
                </colgroup>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E8EAED' }}>
                    {['Room','Name','Content','Type','Upvotes','Date','Delete'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8' }}>No posts yet</td></tr>
                  )}
                  {posts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: '#EEF0FE', color: ROOM_COLORS[p.room_id] || '#2D3CE6' }}>
                          {p.room_id?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.display_name}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.content}>{p.content}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748B' }}>{p.post_type}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151' }}>{p.upvotes || 0}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94A3B8' }}>{formatTimeAgo(p.created_at)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => deletePost(p.id)} disabled={deleting === p.id}
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, border: '1px solid #FCA5A5', borderRadius: 7, padding: '4px 10px', background: '#fff', color: '#DC2626', cursor: 'pointer' }}>
                          {deleting === p.id ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'replies' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '14%' }}/><col style={{ width: '50%' }}/><col style={{ width: '14%' }}/><col style={{ width: '12%' }}/>
                </colgroup>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E8EAED' }}>
                    {['Name','Content','Date','Delete'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {replies.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8' }}>No replies yet</td></tr>
                  )}
                  {replies.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151' }}>{r.display_name}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.content}>{r.content}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94A3B8' }}>{formatTimeAgo(r.created_at)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => deleteReply(r.id)} disabled={deleting === r.id}
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, border: '1px solid #FCA5A5', borderRadius: 7, padding: '4px 10px', background: '#fff', color: '#DC2626', cursor: 'pointer' }}>
                          {deleting === r.id ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  )
}
