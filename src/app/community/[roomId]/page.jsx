'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getSessions } from '@/lib/storage/sessions'
import { formatTimeAgo } from '@/lib/utils/format'

const ROOM_META = {
  jamb: { color: '#2D3CE6', bg: '#EEF0FE', title: 'JAMB Community', sub: 'Students preparing for JAMB · Anonymous · Be kind' },
  waec: { color: '#15803D', bg: '#DCFCE7', title: 'WAEC Community', sub: 'Students preparing for WAEC · Anonymous · Be kind' },
  neco: { color: '#D97706', bg: '#FEF3C7', title: 'NECO Community', sub: 'Students preparing for NECO · Anonymous · Be kind' },
}

const TYPE_STYLES = {
  general:     { label: 'General',    bg: '#F1F5F9', text: '#64748B' },
  question:    { label: 'Question',   bg: '#EEF0FE', text: '#2D3CE6' },
  tip:         { label: 'Study tip',  bg: '#DCFCE7', text: '#15803D' },
  score_share: { label: 'Score',      bg: '#EEF0FE', text: '#2D3CE6' },
}

// ─── Reply thread ─────────────────────────────────────────────
function ReplyThread({ postId }) {
  const [replies,  setReplies]  = useState(null)
  const [content,  setContent]  = useState('')
  const [name,     setName]     = useState('')
  const [posting,  setPosting]  = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    fetch(`/api/community/posts/${postId}/replies`)
      .then(r => r.json())
      .then(d => setReplies(d.replies || []))
      .catch(() => setReplies([]))
  }, [postId])

  async function handleReply(e) {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true); setError(null)
    try {
      const res  = await fetch(`/api/community/posts/${postId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name, content }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setReplies(r => [...(r || []), data.reply])
      setContent('')
    } catch { setError('Could not post reply. Please try again.') }
    finally { setPosting(false) }
  }

  return (
    <div style={{ borderLeft: '2px solid #EEF0FE', paddingLeft: 16, marginTop: 14 }}>
      {replies === null
        ? <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#94A3B8' }}>Loading…</p>
        : replies.map(r => (
            <div key={r.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, color: '#0A0A0A' }}>{r.display_name}</span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#94A3B8' }}>{formatTimeAgo(r.created_at)}</span>
              </div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{r.content}</p>
            </div>
          ))
      }

      {/* Reply input */}
      <form onSubmit={handleReply} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <textarea
          value={content} onChange={e => setContent(e.target.value.slice(0, 200))}
          placeholder="Your reply…"
          rows={2}
          style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', resize: 'none', outline: 'none', color: '#0A0A0A' }}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={name} onChange={e => setName(e.target.value.slice(0, 40))} placeholder="Your name (optional)"
            style={{ flex: 1, fontFamily: 'Nunito, sans-serif', fontSize: 12, border: '1px solid #E2E8F0', borderRadius: 7, padding: '6px 10px', outline: 'none', color: '#0A0A0A' }}/>
          <button type="submit" disabled={!content.trim() || posting}
            style={{ padding: '7px 16px', background: content.trim() ? '#2D3CE6' : '#E2E8F0', color: content.trim() ? '#fff' : '#94A3B8', border: 'none', borderRadius: 8, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, cursor: content.trim() ? 'pointer' : 'not-allowed' }}>
            {posting ? '…' : 'Reply'}
          </button>
        </div>
        {error && <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#DC2626', margin: 0 }}>{error}</p>}
      </form>
    </div>
  )
}

// ─── Post card ────────────────────────────────────────────────
function PostCard({ post, meta, onUpvote }) {
  const [showReplies, setShowReplies] = useState(false)
  const [upvoted,     setUpvoted]     = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(post.upvotes || 0)
  const [replyCount,  setReplyCount]  = useState(post.replyCount || 0)
  const type = TYPE_STYLES[post.post_type] || TYPE_STYLES.general

  async function handleUpvote() {
    // Optimistic
    const next = !upvoted
    setUpvoted(next)
    setUpvoteCount(c => next ? c + 1 : Math.max(0, c - 1))
    try {
      await fetch(`/api/community/posts/${post.id}/upvote`, { method: 'POST' })
    } catch {
      // Revert
      setUpvoted(!next)
      setUpvoteCount(c => !next ? c + 1 : Math.max(0, c - 1))
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 14, padding: '16px 18px', marginBottom: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: '#0A0A0A' }}>{post.display_name}</span>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: type.bg, color: type.text }}>
          {type.label}
        </span>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#94A3B8', marginLeft: 'auto' }}>{formatTimeAgo(post.created_at)}</span>
      </div>

      {/* Content */}
      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#374151', lineHeight: 1.65, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>
        {post.content}
      </p>

      {/* Score card */}
      {post.score_data && (
        <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 14px', marginBottom: 12 }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#0A0A0A' }}>
            {post.score_data.subject} · {post.score_data.examType}
          </span>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, fontWeight: 900, color: meta.color }}>
            {Math.round(post.score_data.percentage)}%
          </span>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#64748B' }}>{post.score_data.readinessLabel}</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
        <button onClick={handleUpvote}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontSize: 13, color: upvoted ? '#E11D48' : '#64748B', fontWeight: upvoted ? 700 : 400, transition: 'all 0.15s', transform: upvoted ? 'scale(1.05)' : 'scale(1)' }}>
          ♥ {upvoteCount}
        </button>
        <button onClick={() => { setShowReplies(v => !v); if (!showReplies) setReplyCount(0) }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#64748B' }}>
          💬 {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
        </button>
        <button onClick={() => setShowReplies(v => !v)}
          style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${meta.color}`, borderRadius: 7, padding: '5px 12px', fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: meta.color, cursor: 'pointer' }}>
          Reply
        </button>
      </div>

      {showReplies && <ReplyThread postId={post.id} />}
    </div>
  )
}

// ─── Post composer ────────────────────────────────────────────
function Composer({ roomId, meta, onPost }) {
  const [content,    setContent]    = useState('')
  const [name,       setName]       = useState('')
  const [postType,   setPostType]   = useState('general')
  const [posting,    setPosting]    = useState(false)
  const [error,      setError]      = useState(null)
  const [showScore,  setShowScore]  = useState(false)
  const [sessions,   setSessions]   = useState([])
  const [scoreData,  setScoreData]  = useState(null)

  useEffect(() => {
    if (showScore && sessions.length === 0) {
      getSessions().then(setSessions).catch(() => {})
    }
  }, [showScore])

  async function handlePost(e) {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true); setError(null)
    try {
      const res  = await fetch(`/api/community/${roomId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name, content, postType, scoreData }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      onPost(data.post)
      setContent(''); setScoreData(null); setShowScore(false)
    } catch { setError('Could not post. Please try again.') }
    finally { setPosting(false) }
  }

  return (
    <div style={{ background: '#fff', border: `1.5px solid ${meta.color}33`, borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
      <form onSubmit={handlePost}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value.slice(0, 500))}
          placeholder={`What's on your mind about ${roomId.toUpperCase()}?`}
          rows={3}
          style={{ width: '100%', fontFamily: 'Nunito, sans-serif', fontSize: 14, border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', resize: 'none', outline: 'none', boxSizing: 'border-box', color: '#0A0A0A', lineHeight: 1.6 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3, marginBottom: 12 }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: content.length > 450 ? '#DC2626' : '#94A3B8' }}>
            {content.length}/500
          </span>
        </div>

        {/* Attached score card */}
        {scoreData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#0A0A0A', fontWeight: 600 }}>
              {scoreData.subject} · {scoreData.examType} · {Math.round(scoreData.percentage)}%
            </span>
            <button type="button" onClick={() => setScoreData(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
        )}

        {/* Session picker */}
        {showScore && !scoreData && (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Select a test result to share:</p>
            {sessions.length === 0
              ? <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#94A3B8' }}>No saved tests found. Complete a test first.</p>
              : sessions.slice(0, 5).map(s => (
                  <button key={s.shareToken} type="button"
                    onClick={() => { setScoreData({ subject: s.subject, examType: s.examType, percentage: s.percentage, readinessLabel: s.readinessLabel }); setShowScore(false); setPostType('score_share') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', marginBottom: 6, textAlign: 'left' }}>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#0A0A0A', fontWeight: 600 }}>{s.subject} · {s.examType}</span>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 900, color: meta.color, marginLeft: 'auto' }}>{Math.round(s.percentage)}%</span>
                  </button>
                ))
            }
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <input value={name} onChange={e => setName(e.target.value.slice(0, 40))} placeholder="Your name (optional)"
            style={{ flex: 1, minWidth: 160, fontFamily: 'Nunito, sans-serif', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', outline: 'none', color: '#0A0A0A' }}/>
          <button type="button" onClick={() => setShowScore(v => !v)}
            style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, padding: '8px 12px', border: `1px solid ${meta.color}55`, borderRadius: 8, background: scoreData ? meta.bg : '#fff', color: meta.color, cursor: 'pointer' }}>
            📊 {scoreData ? 'Score attached' : 'Share a score'}
          </button>
          <select value={postType} onChange={e => setPostType(e.target.value)}
            style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', outline: 'none', background: '#fff', color: '#374151', cursor: 'pointer' }}>
            <option value="general">General</option>
            <option value="question">Question</option>
            <option value="tip">Study tip</option>
          </select>
          <button type="submit" disabled={!content.trim() || posting}
            style={{ padding: '9px 20px', background: content.trim() ? meta.color : '#E2E8F0', color: content.trim() ? '#fff' : '#94A3B8', border: 'none', borderRadius: 9, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, cursor: content.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
            {posting ? 'Posting…' : 'Post →'}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#FFF1F2', border: '1px solid #FCA5A5', borderRadius: 8 }}>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#B91C1C', margin: 0 }}>{error}</p>
          </div>
        )}
      </form>
    </div>
  )
}

// ─── Main room feed ───────────────────────────────────────────
export default function RoomPage({ params }) {
  const { roomId } = params
  const meta = ROOM_META[roomId] || ROOM_META.jamb

  const [posts,   setPosts]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [more,    setMore]    = useState(false)

  function loadPosts(p = 1, append = false) {
    if (p === 1) setLoading(true)
    else setMore(true)
    fetch(`/api/community/${roomId}/posts?page=${p}`)
      .then(r => r.json())
      .then(d => {
        setPosts(prev => append ? [...prev, ...(d.posts || [])] : (d.posts || []))
        setTotal(d.total || 0)
      })
      .finally(() => { setLoading(false); setMore(false) })
  }

  useEffect(() => { loadPosts(1) }, [roomId])

  function handleNewPost(post) {
    setPosts(prev => [post, ...prev])
    setTotal(t => t + 1)
  }

  if (!ROOM_META[roomId]) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif', color: '#374151' }}>
        Room not found. <Link href="/community" style={{ color: '#2D3CE6', marginLeft: 8 }}>← Back to community</Link>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Nunito, sans-serif' }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #E8EAED', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 20 }}>
        <Link href="/community" style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#64748B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Community
        </Link>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 16, color: '#0A0A0A' }}>{meta.title}</span>
        <Link href="/setup" style={{ marginLeft: 'auto', background: '#2D3CE6', color: '#fff', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, padding: '7px 16px', borderRadius: 8, textDecoration: 'none' }}>
          Start test
        </Link>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 28, color: meta.color, background: meta.bg, padding: '6px 16px', borderRadius: 10, marginBottom: 8 }}>
            {roomId.toUpperCase()}
          </div>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#64748B', marginBottom: 4 }}>{meta.sub}</p>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#94A3B8' }}>
            {total.toLocaleString()} post{total !== 1 ? 's' : ''} · Active now
          </p>
        </div>

        {/* Composer */}
        <Composer roomId={roomId} meta={meta} onPost={handleNewPost} />

        {/* Posts */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 120, background: '#F1F5F9', borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite' }}/>)}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 18, color: '#374151', marginBottom: 8 }}>
              Be the first to post in this room!
            </p>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#94A3B8' }}>Say hi 👋</p>
          </div>
        ) : (
          <>
            <div>
              {posts.map(post => <PostCard key={post.id} post={post} meta={meta} />)}
            </div>
            {posts.length < total && (
              <button onClick={() => { const next = page + 1; setPage(next); loadPosts(next, true) }} disabled={more}
                style={{ width: '100%', marginTop: 14, padding: '12px 0', border: '1.5px solid #E2E8F0', borderRadius: 10, background: '#fff', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 14, color: '#374151', cursor: more ? 'not-allowed' : 'pointer' }}>
                {more ? 'Loading…' : `Load more posts (${total - posts.length} remaining)`}
              </button>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </main>
  )
}