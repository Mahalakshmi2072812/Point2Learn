import { useState, useEffect } from 'react'
import { getMyCourses, getAllCourses, startSession, attendSession, endSession, addRating } from '@/api'
import { getEnrolledIds } from '@/utils/enrollment'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/Toast'
import { Link } from 'react-router-dom'
import Spin from '@/components/ui/Spin'
import Empty from '@/components/ui/Empty'

function UsersIcon({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
}
function InfoIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
}
function ExtIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
}

function RateModal({ open, courseName, onSubmit, onSkip }) {
  const [rating, setRating]   = useState(5)
  const [hovered, setHovered] = useState(0)
  const [review, setReview]   = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    await onSubmit(rating, review)
    setLoading(false)
  }

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--bg2,#0d1220)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 32, width: '100%', maxWidth:1100, margin:'0 auto', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Rate this Session</p>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Session ended — share your feedback</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>{courseName}</p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="label">Your Rating</label>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', transform: n <= (hovered || rating) ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.1s' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={n <= (hovered || rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6 }}>
              {['','Poor','Fair','Good','Very Good','Excellent'][rating]} — {rating}/5
            </p>
          </div>
          <div>
            <label className="label">Review</label>
            <textarea className="input" rows={3} value={review} onChange={e => setReview(e.target.value)}
              placeholder="Share your experience..." required style={{ resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading && <Spin size={14} />} Submit Rating
            </button>
            <button type="button" className="btn btn-ghost" onClick={onSkip}>Skip</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SessionsPage() {
  const { isTeacher } = useAuth()
  const [courses, setCourses]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [busy, setBusy]           = useState(null)
  const [live, setLive]           = useState({})
  const [attended, setAttended]   = useState({})
  const [rateQueue, setRateQueue] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    if (isTeacher) {
      getMyCourses()
        .then(r => setCourses(r.data || []))
        .catch(() => toast('Failed to load', 'error'))
        .finally(() => setLoading(false))
    } else {
      getAllCourses()
        .then(r => {
          const all = r.data || []
          const ids = getEnrolledIds().map(String)
          setCourses(all.filter(c => ids.includes(String(c.id))))
        })
        .catch(() => toast('Failed to load', 'error'))
        .finally(() => setLoading(false))
    }
  }, [isTeacher])

  const start = async cid => {
    setBusy(cid + '_s')
    try {
      const r = await startSession(cid)
      setLive(l => ({ ...l, [cid]: r.data.meeting_link }))
      toast('Session started. Students can join within 10 minutes.', 'success')
    } catch (err) { toast(err.response?.data?.detail || 'Failed to start', 'error') }
    setBusy(null)
  }

  const attend = async cid => {
    setBusy(cid + '_a')
    try {
      const r = await attendSession(cid)
      setLive(l => ({ ...l, [cid]: r.data.meeting_link }))
      setAttended(a => ({ ...a, [cid]: true }))
      toast('Joined. 500 credits deducted.', 'success')
      window.open(r.data.meeting_link, '_blank', 'noopener')
    } catch (err) { toast(err.response?.data?.detail || 'Failed to join', 'error') }
    setBusy(null)
  }

  const end = async cid => {
    setBusy(cid + '_e')
    try {
      const r = await endSession(cid)
      toast(`Session ended. ${r.data.students_attended} attended. Earned ${r.data.teacher_earned} credits.`, 'success')
      setLive(l => { const n = { ...l }; delete n[cid]; return n })
    } catch (err) { toast(err.response?.data?.detail || 'Failed to end', 'error') }
    setBusy(null)
  }

  // When session goes offline and student was attending, prompt rating
  useEffect(() => {
    if (isTeacher) return
    Object.keys(attended).forEach(cid => {
      if (attended[cid] && !live[cid]) {
        const course = courses.find(c => String(c.id) === String(cid))
        if (course) {
          setRateQueue(q => q.find(x => x.id === course.id) ? q : [...q, course])
          setAttended(a => { const n = { ...a }; delete n[cid]; return n })
        }
      }
    })
  }, [live, attended, courses, isTeacher])

  const currentRateFor = rateQueue[0] || null

  const submitRating = async (rating, review) => {
    try {
      await addRating(currentRateFor.id, rating, review)
      toast('Rating submitted.', 'success')
    } catch (err) { toast(err.response?.data?.detail || 'Failed', 'error') }
    setRateQueue(q => q.slice(1))
  }

  const liveDot = <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }} />

  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }} className="fade-up">
      <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Sessions</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>
          {isTeacher ? 'Start and manage your live teaching sessions.' : 'Join live sessions from your enrolled courses.'}
        </p>
      </div>

      <div style={{ borderRadius: 10, padding: '11px 14px', marginBottom: 20, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 13, color: '#93c5fd', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ marginTop: 1, flexShrink: 0 }}><InfoIcon /></span>
        <span>Sessions run on <strong>Jitsi Meet</strong>. Students must join within <strong>10 minutes</strong>. Cost: <strong>500 credits/session</strong>. Teachers earn <strong>10 credits/student</strong>.</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin /></div>
      ) : courses.length === 0 ? (
        <div className="card">
          <Empty
            title={isTeacher ? 'No courses created' : 'No enrolled courses'}
            desc={isTeacher ? 'Create a course first to start sessions.' : 'Enroll in courses first to attend sessions.'}
            action={
              isTeacher
                ? <Link to="/create-course" className="btn btn-primary" style={{ textDecoration: 'none' }}>Create Course</Link>
                : <Link to="/courses" className="btn btn-primary" style={{ textDecoration: 'none' }}>Browse Courses</Link>
            }
          />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th className="tbl-head">Course</th>
                <th className="tbl-head">Students</th>
                <th className="tbl-head">Status</th>
                <th className="tbl-head">Meeting Link</th>
                <th className="tbl-head" style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => {
                const link      = live[c.id]
                const isLive    = !!link
                const didAttend = attended[c.id]
                return (
                  <tr key={c.id} className="tbl-row">
                    <td className="tbl-cell" style={{ fontWeight: 600, color: 'var(--text)' }}>{c.title}</td>
                    <td className="tbl-cell">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text2)' }}>
                        <UsersIcon /> {c.students_count}
                      </span>
                    </td>
                    <td className="tbl-cell">
                      {isLive
                        ? <span className="badge badge-green" style={{ gap: 6 }}>{liveDot} Live</span>
                        : <span className="badge badge-gray">Inactive</span>}
                    </td>
                    <td className="tbl-cell">
                      {isLive
                        ? <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                            Open Jitsi <ExtIcon />
                          </a>
                        : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>}
                    </td>
                    <td className="tbl-cell" style={{ textAlign: 'right' }}>
                      {isTeacher ? (
                        isLive
                          ? <button className="btn btn-danger btn-sm" onClick={() => end(c.id)} disabled={busy === c.id + '_e'}>
                              {busy === c.id + '_e' ? <Spin size={13} /> : 'End Session'}
                            </button>
                          : <button className="btn btn-primary btn-sm" onClick={() => start(c.id)} disabled={busy === c.id + '_s'}>
                              {busy === c.id + '_s' ? <Spin size={13} /> : 'Start Session'}
                            </button>
                      ) : (
                        didAttend && isLive
                          ? <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>In Session</span>
                          : isLive
                            ? <button className="btn btn-ghost btn-sm" onClick={() => attend(c.id)}
                                disabled={busy === c.id + '_a'}
                                style={{ borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                                {busy === c.id + '_a' ? <Spin size={13} /> : 'Attend (500 cr)'}
                              </button>
                            : <span style={{ fontSize: 12, color: 'var(--text3)' }}>Waiting for session</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <RateModal
        open={!!currentRateFor}
        courseName={currentRateFor?.title}
        onSubmit={submitRating}
        onSkip={() => setRateQueue(q => q.slice(1))}
      />
    </div>
  )
}
