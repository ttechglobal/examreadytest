'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatTimeAgo } from '@/lib/utils/format'

const ROOM_META = {
  jamb: { color: '#1D6FEF', bg: '#EBF2FE', full: 'Joint Admissions & Matriculation Board' },
  waec: { color: '#15803D', bg: '#DCFCE7', full: 'West African Examinations Council'       },
  neco: { color: '#D97706', bg: '#FEF3C7', full: 'National Examinations Council'           },
}

const POST_TYPE_STYLE = {
  question:    { label: 'Question',   bg: '#EBF2FE', text: '#1D6FEF' },
  tip:         { label: 'Study tip',  bg: '#DCFCE7', text: '#15803D' },
  score_share: { label: 'Score',      bg: '#EBF2FE', text: '#1D6FEF' },
  general:     { label: 'General',    bg: '#F1F5F9', text: '#64748B' },
}

function PostCard({ post, showRoom = false }) {
  const meta = ROOM_META[post.room_id] || ROOM_META.jamb
  const type = POST_TYPE_STYLE[post.post_type] || POST_TYPE_STYLE.general

  return (
    <div style={{ background: '#fff', border: '1px solid #E8EAED', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#0A0A0A' }}>
          {post.display_name}
        </span>
        {showRoom && (
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: meta.bg, color: meta.color }}>
            {post.room_id.toUpperCase()}
          </span>
        )}
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: type.bg, color: type.text }}>
          {type.label}
        </span>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#94A3B8', marginLeft: 'auto' }}>
          {formatTimeAgo(post.created_at)}
        </span>
      </div>

      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#374151', lineHeight: 1.65, margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>
        {post.content.length > 300 ? post.content.slice(0, 300) + '…' : post.content}
      </p>

      {post.score_data && (
        <div style={{ display: 'inline-flex', gap: 10, alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#0A0A0A', fontWeight: 600 }}>
            {post.score_data.subject} · {post.score_data.examType}
          </span>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 900, color: '#1D6FEF' }}>
            {Math.round(post.score_data.percentage)}%
          </span>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#64748B' }}>
            {post.score_data.readinessLabel}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#64748B' }}>
          ♥ {post.upvotes || 0}
        </span>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#64748B' }}>
          💬 {post.replyCount || 0} {post.replyCount === 1 ? 'reply' : 'replies'}
        </span>
        <Link href={`/community/${post.room_id}`}
          style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#1D6FEF', textDecoration: 'none', marginLeft: 'auto', fontWeight: 600 }}>
          View thread →
        </Link>
      </div>
    </div>
  )
}

export default function CommunityPage() {
  const [rooms, setRooms]     = useState([])
  const [feed,  setFeed]      = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/community/rooms').then(r => r.json()),
      fetch('/api/community/feed').then(r => r.json()),
    ]).then(([r, f]) => {
      setRooms(r.rooms || [])
      setFeed(f.posts || [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Nunito, sans-serif' }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #E8EAED', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#1D6FEF"/><path d="M10 22V10l6 9 6-9v12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 16, color: '#0A0A0A' }}>Learniie</span>
        </Link>
        <Link href="/setup" style={{ background: '#1D6FEF', color: '#fff', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 14, padding: '8px 18px', borderRadius: 8, textDecoration: 'none' }}>
          Start test
        </Link>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#1D6FEF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Community</p>
          <h1 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 36, color: '#0A0A0A', lineHeight: 1.1, letterSpacing: '-0.5px', marginBottom: 10 }}>
            Students helping students
          </h1>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, color: '#52525B', lineHeight: 1.6 }}>
            Anonymous, kind, useful. Share tips, ask questions, compare scores.
          </p>
        </div>

        {/* Room cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 14, marginBottom: 48 }}>
          {loading
            ? [1,2,3].map(i => <div key={i} style={{ height: 140, background: '#F1F5F9', borderRadius: 14, animation: 'pulse 1.5s ease-in-out infinite' }}/>)
            : rooms.map(room => {
                const meta = ROOM_META[room.id] || ROOM_META.jamb
                return (
                  <Link key={room.id} href={`/community/${room.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', border: `1.5px solid ${meta.color}22`, borderRadius: 14, padding: '22px 20px', transition: 'all 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${meta.color}22`; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                      <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 22, color: meta.color, marginBottom: 6 }}>{room.id.toUpperCase()}</div>
                      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>{meta.full}</p>
                      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
                        {room.postCount.toLocaleString()} post{room.postCount !== 1 ? 's' : ''}
                      </p>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, color: meta.color }}>Join discussion →</span>
                    </div>
                  </Link>
                )
              })}
        </div>

        {/* Recent feed */}
        <div>
          <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 20, color: '#0A0A0A', marginBottom: 16 }}>Recent posts</h2>
          {loading
            ? <div style={{ height: 200, background: '#F1F5F9', borderRadius: 12 }}/>
            : feed.length === 0
            ? <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#94A3B8', textAlign: 'center', padding: '48px 0' }}>No posts yet. Be the first to post in a room!</p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {feed.map(post => <PostCard key={post.id} post={post} showRoom />)}
              </div>
          }
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </main>
  )
}