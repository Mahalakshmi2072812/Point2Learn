import { useState, useEffect } from 'react'
import { getAllCourses, getMyRating, addRating } from '@/api'
import { getEnrolledIds } from '@/utils/enrollment'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/Toast'
import { Link } from 'react-router-dom'
import Spin from '@/components/ui/Spin'
import Empty from '@/components/ui/Empty'
import Modal from '@/components/ui/Modal'

function StarRating({ value, onChange, interactive = false, size = 18 }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onClick={interactive ? () => onChange(n) : undefined}
          onMouseEnter={interactive ? () => setHovered(n) : undefined}
          onMouseLeave={interactive ? () => setHovered(0) : undefined}
          style={{ background: 'none', border: 'none', padding: 0,
            cursor: interactive ? 'pointer' : 'default',
            color: n <= active ? '#f59e0b' : 'var(--text3)',
            transform: interactive && n <= (hovered || 0) ? 'scale(1.15)' : 'scale(1)',
            transition: 'color 0.1s, transform 0.1s' }}>
          <svg width={size} height={size} viewBox="0 0 24 24"
            fill={n <= active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function RatingsPage() {
  const { isTeacher } = useAuth()
  const [myRating, setMyRating]   = useState(null)
  const [courses, setCourses]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selCourse, setSelCourse] = useState(null)
  const [rating, setRating]       = useState(5)
  const [review, setReview]       = useState('')
  const [submitting, setSub]      = useState(false)
  const [rated, setRated]         = useState({})
  const { toast } = useToast()

  useEffect(() => {
    if (isTeacher) {
      getMyRating()
        .then(r => setMyRating(r.data))
        .catch(() => {})
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

  const openRate = course => {
    setSelCourse(course); setRating(5); setReview(''); setShowModal(true)
  }

  const submit = async e => {
    e.preventDefault(); setSub(true)
    try {
      await addRating(selCourse.id, rating, review)
      toast('Rating submitted.', 'success')
      setRated(r => ({ ...r, [selCourse.id]: rating }))
      setShowModal(false)
    } catch (err) {
      toast(err.response?.data?.detail || 'Submission failed', 'error')
    }
    setSub(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 12, color: 'var(--text2)', fontSize: 13 }}>
      <Spin /> Loading...
    </div>
  )

  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }} className="fade-up">
      <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Rating</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>
          {isTeacher ? 'View your instructor score and student reviews.' : 'Rate sessions from courses you have joined.'}
        </p>
      </div>

      {isTeacher && (
        <div className="card" style={{ padding: 28 }}>
          {myRating && myRating.total_reviews > 0 ? (
            <>
              <span className="label" style={{ marginBottom: 16 }}>Your Instructor Score</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 52, fontWeight: 800, color: '#f59e0b', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {(myRating.average_rating || 0).toFixed(1)}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <StarRating value={Math.round(myRating.average_rating || 0)} size={16} />
                  </div>
                </div>
                <div style={{ width: 1, height: 38, background: 'var(--border)' }} />
                <div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                    {myRating.total_reviews}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>Total Reviews</div>
                </div>
              </div>
            </>
          ) : (
            <Empty title="No ratings yet" desc="Students will rate your sessions after they end." />
          )}
        </div>
      )}

      {!isTeacher && (
        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="label" style={{ margin: 0 }}>My Enrolled Courses</span>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
          </div>
          {courses.length === 0 ? (
            <Empty
              title="No enrolled courses"
              desc="Join a course and attend sessions to leave a rating."
              action={<Link to="/courses" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Browse Courses</Link>}
            />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th className="tbl-head">Course</th>
                  <th className="tbl-head">Students</th>
                  <th className="tbl-head" style={{ textAlign: 'right' }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id} className="tbl-row">
                    <td className="tbl-cell" style={{ fontWeight: 600, color: 'var(--text)' }}>{c.title}</td>
                    <td className="tbl-cell">
                      <span className="badge badge-blue">{c.students_count} students</span>
                    </td>
                    <td className="tbl-cell" style={{ textAlign: 'right' }}>
                      {rated[c.id] ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
                          <StarRating value={rated[c.id]} size={13} />
                          <span>Rated</span>
                        </div>
                      ) : (
                        <button className="btn btn-ghost btn-sm" onClick={() => openRate(c)}>
                          Rate Session
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={`Rate: ${selCourse?.title || ''}`} size="sm">
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label className="label">Your Score</label>
            <StarRating value={rating} onChange={setRating} interactive size={26} />
            <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 8 }}>
              {['','Poor','Fair','Good','Very Good','Excellent'][rating]} - {rating}/5
            </p>
          </div>
          <div>
            <label className="label">Written Review</label>
            <textarea className="input" rows={4} value={review} onChange={e => setReview(e.target.value)}
              placeholder="Share your experience with this session..." required style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting && <Spin size={14} />} Submit Rating
            </button>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
