import { useState, useEffect } from 'react'
import { getMyCourses } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/Toast'
import { Link, useNavigate } from 'react-router-dom'
import Spin from '@/components/ui/Spin'
import Empty from '@/components/ui/Empty'

function UsersIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
}
function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}

export default function MyCoursesPage() {
  const { isTeacher } = useAuth()
  const { toast }     = useToast()
  const navigate      = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyCourses()
      .then(r => setCourses(r.data || []))
      .catch(() => toast('Failed to load courses', 'error'))
      .finally(() => setLoading(false))
  }, [])

  // Not a teacher - redirect hint
  if (!isTeacher) {
    return (
      <div style={{ maxWidth:1100, margin:'0 auto' }} className="fade-up">
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(248,81,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Teacher Access Only
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 20 }}>
            My Courses shows courses you've created as a teacher. Apply to become a verified teacher first.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/teacher-request')}>
              Apply as Teacher
            </button>
            <Link to="/enrolled-courses" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
              View Enrolled Courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }} className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>My Courses</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>
            {loading ? 'Loading...' : `${courses.length} course${courses.length !== 1 ? 's' : ''} you have created`}
          </p>
        </div>
        <Link to="/create-course" className="btn btn-primary" style={{ textDecoration: 'none', gap: 6 }}>
          <PlusIcon /> Create Course
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin /></div>
      ) : courses.length === 0 ? (
        <div className="card">
          <Empty
            title="No courses created yet"
            desc="Create your first course to start teaching and earning credits."
            action={
              <Link to="/create-course" className="btn btn-primary" style={{ textDecoration: 'none', gap: 6 }}>
                <PlusIcon /> Create Course
              </Link>
            }
          />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th className="tbl-head" style={{ width: 40 }}>#</th>
                <th className="tbl-head">Course Title</th>
                <th className="tbl-head">Description</th>
                <th className="tbl-head">Enrolled</th>
                <th className="tbl-head">Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c, i) => (
                <tr key={c.id} className="tbl-row">
                  <td className="tbl-cell" style={{ color: 'var(--text3)' }}>{i + 1}</td>
                  <td className="tbl-cell" style={{ fontWeight: 700, color: 'var(--text)' }}>{c.title}</td>
                  <td className="tbl-cell">
                    <span style={{ fontSize: 12, color: 'var(--text3)', display: 'block', maxWidth:1100, margin:'0 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description}
                    </span>
                  </td>
                  <td className="tbl-cell">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text2)' }}>
                      <UsersIcon /> {c.students_count}
                    </span>
                  </td>
                  <td className="tbl-cell"><span className="badge badge-green">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
