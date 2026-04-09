import { useState, useEffect } from 'react'
import { getNotifications, markRead, deleteNotif } from '@/api'
import { useToast } from '@/context/Toast'
import Spin from '@/components/ui/Spin'
import Empty from '@/components/ui/Empty'

const ago = iso => {
  if (!iso) return ''
  const d = Date.now() - new Date(iso)
  const m = Math.floor(d / 60000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const TYPE_COLOR = {
  success: { bg: 'rgba(0,229,160,0.08)', border: 'rgba(0,229,160,0.15)', dot: '#00e5a0' },
  error:   { bg: 'rgba(255,77,109,0.08)', border: 'rgba(255,77,109,0.15)', dot: '#ff4d6d' },
  info:    { bg: 'rgba(79,142,255,0.08)', border: 'rgba(79,142,255,0.15)', dot: '#4f8eff' },
  warning: { bg: 'rgba(240,180,41,0.08)', border: 'rgba(240,180,41,0.15)', dot: '#f0b429' },
}

export default function NotificationsPage() {
  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    getNotifications().then(r => setNotifs(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const read = async id => {
    try { await markRead(id); setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: true } : x)) } catch {}
  }
  const del = async id => {
    try { await deleteNotif(id); setNotifs(n => n.filter(x => x.id !== id)) } catch {}
  }
  const readAll = () => notifs.filter(n => !n.is_read).forEach(n => read(n.id))
  const unread  = notifs.filter(n => !n.is_read).length

  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }} className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 className="section-title" style={{ fontFamily: "'Syne', sans-serif" }}>Notifications</h2>
          <p className="section-sub">{unread > 0 ? `${unread} unread message${unread > 1 ? 's' : ''}` : 'All caught up'}</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={readAll}>Mark all read</button>
        )}
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin /></div>
      : notifs.length === 0 ? <div className="card"><Empty title="No notifications" desc="Course, session, and verification updates will appear here." /></div>
      : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifs.map((n, i) => {
            const tc = TYPE_COLOR[n.type] || TYPE_COLOR.info
            return (
              <div key={n.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <div onClick={() => !n.is_read && read(n.id)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '16px 20px', borderRadius: 16,
                  background: !n.is_read ? tc.bg : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${!n.is_read ? tc.border : 'var(--border)'}`,
                  cursor: !n.is_read ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? 'var(--text3)' : tc.dot, flexShrink: 0, marginTop: 5, boxShadow: !n.is_read ? `0 0 8px ${tc.dot}` : 'none', transition: 'all 0.2s' }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: n.is_read ? 500 : 700, color: n.is_read ? 'var(--text2)' : 'var(--text)', marginBottom: 4 }}>{n.title}</p>
                    <p style={{ fontSize: 12.5, color: 'var(--text3)', lineHeight: 1.5 }}>{n.message}</p>
                    <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>{ago(n.created_at)}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); del(n.id) }}
                    style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, flexShrink: 0, borderRadius: 6, transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,77,109,0.1)'; e.currentTarget.style.color = '#ff4d6d' }}
                    onMouseOut={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text3)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
