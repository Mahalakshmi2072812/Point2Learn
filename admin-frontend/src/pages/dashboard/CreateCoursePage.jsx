import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCourse } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/Toast'
import Spin from '@/components/ui/Spin'

export default function CreateCoursePage() {
  const { isTeacher } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [title, setTitle]     = useState('')
  const [desc, setDesc]       = useState('')
  const [creating, setCreating] = useState(false)

  // Not a verified teacher → access denied
  if (!isTeacher) {
    return (
      <div style={{ maxWidth: 480 }} className="fade-up">
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 52, height: 36, borderRadius: 14, background: 'rgba(248,81,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.01em' }}>
            Verified Teacher Access Only
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 20 }}>
            You need to be a verified teacher to create courses. Apply via the Teacher Request page.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/teacher-request')} style={{ margin: '0 auto' }}>
            Apply as Teacher
          </button>
        </div>
      </div>
    )
  }

  const submit = async e => {
    e.preventDefault(); setCreating(true)
    try {
      await createCourse(title, desc)
      toast('Course created successfully!', 'success')
      navigate('/my-courses')
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to create course', 'error')
    }
    setCreating(false)
  }

  return (
    <div style={{ maxWidth: 620 }} className="fade-up">
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Create Course</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Create a new course and start earning credits by teaching.</p>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label className="label">Course Title <span style={{ color: '#f87171' }}>*</span></label>
            <input
              className="input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Python for Beginners"
              required
            />
          </div>
          <div>
            <label className="label">Description <span style={{ color: '#f87171' }}>*</span></label>
            <textarea
              className="input" rows={5}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Describe what students will learn, prerequisites, and what topics you will cover..."
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Info callout */}
          <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 12, color: '#93c5fd', lineHeight: 1.6 }}>
            After creating the course, students can enroll and you can start live sessions from the Sessions page. You earn <strong>10 credits per student</strong> per session.
          </div>

          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: 13 }} disabled={creating}>
              {creating && <Spin size={14} />} Create Course
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/my-courses')} style={{ padding: '13px 24px' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
