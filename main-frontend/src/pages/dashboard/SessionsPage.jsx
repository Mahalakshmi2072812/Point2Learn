import { useState, useEffect, useRef } from 'react'
import { getMyCourses, startSession, attendSession, endSession, addRating, getActiveSession, getEnrolledCourses } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/Toast'
import { Link } from 'react-router-dom'
import Spin from '@/components/ui/Spin'

const I = ({ d, s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)
const IC = {
  users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  ext:   <><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
  play:  <><polygon points="5,3 19,12 5,21 5,3"/></>,
  stop:  <><rect x="3" y="3" width="18" height="18" rx="2"/></>,
  join:  <><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>,
  check: <><polyline points="20,6 9,17 4,12"/></>,
  copy:  <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>,
  info:  <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
  star:  <><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></>,
  book:  <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
  bell:  <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
}

function useCountdown(deadlineISO) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!deadlineISO) return
    const tick = () => setSecs(Math.max(0, Math.floor((new Date(deadlineISO) - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadlineISO])
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return { secs, display: `${m}:${String(s).padStart(2,'0')}`, expired: secs === 0 }
}

function TimerBar({ deadlineISO, startedISO }) {
  const { secs, display } = useCountdown(deadlineISO)
  const total = 10 * 60
  const pct   = Math.min(100, Math.max(0, (secs / total) * 100))
  const color = secs > 300 ? '#34d399' : secs > 120 ? '#fbbf24' : '#f87171'

  const [elapsed, setElapsed] = useState('')
  useEffect(() => {
    if (!startedISO) return
    const tick = () => {
      const diff = Math.floor((Date.now() - new Date(startedISO)) / 1000)
      const m = Math.floor(diff / 60), s = diff % 60
      setElapsed(m > 0 ? `${m}m ${s}s ago` : `${s}s ago`)
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [startedISO])

  if (secs === 0) return null
  return (
    <div style={{ marginBottom:14, padding:'12px 14px', borderRadius:10,
      background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontSize:11.5, color:'rgba(240,244,255,0.4)', fontFamily:"'DM Sans',sans-serif",
          display:'flex', alignItems:'center', gap:5 }}>
          <I d={IC.clock} s={11}/> Started {elapsed}
        </span>
        <span style={{ fontSize:16, fontWeight:800, color, fontVariantNumeric:'tabular-nums',
          letterSpacing:'-0.02em', fontFamily:"'Sora',sans-serif" }}>
          {display}
        </span>
      </div>
      <div style={{ height:6, borderRadius:99, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
        <div style={{ height:'100%', borderRadius:99, background:color,
          width:`${pct}%`, transition:'width 1s linear', boxShadow:`0 0 8px ${color}66` }}/>
      </div>
      <div style={{ fontSize:10.5, color:'rgba(240,244,255,0.25)', marginTop:5,
        display:'flex', justifyContent:'space-between', fontFamily:"'DM Sans',sans-serif" }}>
        <span>Join window</span><span>closes in {display}</span>
      </div>
    </div>
  )
}

function ElapsedTimer({ startedISO }) {
  const [display, setDisplay] = useState('0:00')
  useEffect(() => {
    if (!startedISO) return
    const tick = () => {
      const diff = Math.floor((Date.now() - new Date(startedISO)) / 1000)
      setDisplay(`${Math.floor(diff/60)}:${String(diff%60).padStart(2,'0')}`)
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [startedISO])
  return (
    <span style={{ fontSize:13, fontWeight:800, color:'#34d399',
      fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em',
      display:'flex', alignItems:'center', gap:5 }}>
      <I d={IC.clock} s={13}/> {display}
    </span>
  )
}

function RateModal({ open, courseName, onSubmit, onSkip }) {
  const [rating,  setRating]  = useState(5)
  const [hovered, setHovered] = useState(0)
  const [review,  setReview]  = useState('')
  const [loading, setL]       = useState(false)
  const submit = async e => { e.preventDefault(); setL(true); await onSubmit(rating, review); setL(false) }
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(6px)',
      zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'rgba(8,13,32,0.97)', border:'1px solid rgba(255,255,255,0.12)',
        borderRadius:18, padding:36, width:'100%', maxWidth:420, boxShadow:'0 24px 80px rgba(0,0,0,0.6)', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, borderRadius:'18px 18px 0 0',
          background:'linear-gradient(90deg,transparent,rgba(251,191,36,0.8),transparent)'}}/>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <I d={IC.star} s={18}/><span style={{ fontSize:15, fontWeight:700, color:'#f0f4ff' }}>Rate this Session</span>
        </div>
        <p style={{ fontSize:13, color:'rgba(240,244,255,0.4)', marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>Feedback for</p>
        <p style={{ fontSize:14, fontWeight:600, color:'#fbbf24', marginBottom:22 }}>{courseName}</p>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(240,244,255,0.3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Your Rating</div>
            <div style={{ display:'flex', gap:8 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
                  style={{ background:'none', border:'none', padding:0, cursor:'pointer',
                    transform: n<=(hovered||rating)?'scale(1.2)':'scale(1)', transition:'transform 0.12s' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24"
                    fill={n<=(hovered||rating)?'#f59e0b':'none'} stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                </button>
              ))}
            </div>
            <p style={{ fontSize:12, color:'#fbbf24', marginTop:6 }}>{['','Poor','Fair','Good','Very Good','Excellent'][rating]} - {rating}/5</p>
          </div>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(240,244,255,0.3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Review</div>
            <textarea value={review} onChange={e=>setReview(e.target.value)} placeholder="Share your experience..." required rows={3}
              style={{ width:'100%', padding:'12px 14px', fontSize:13, fontFamily:"'DM Sans',sans-serif",
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
                borderRadius:10, color:'#f0f4ff', outline:'none', resize:'none' }}
              onFocus={e=>{e.target.style.borderColor='rgba(251,191,36,0.4)'}}
              onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.09)'}}/>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="submit" disabled={loading} style={{ flex:1, padding:'11px', borderRadius:10, fontSize:13.5, fontWeight:700,
              background:'linear-gradient(135deg,#b45309,#f59e0b)', color:'#fff', border:'none', cursor:loading?'not-allowed':'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:7, opacity:loading?0.6:1 }}>
              {loading?<Spin size={14}/>:<><I d={IC.star} s={13}/> Submit Rating</>}
            </button>
            <button type="button" onClick={onSkip} style={{ padding:'11px 20px', borderRadius:10, fontSize:13, fontWeight:600,
              background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
              color:'rgba(240,244,255,0.5)', cursor:'pointer' }}>Skip</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const BG_COLORS = ['99,102,241','16,185,129','245,158,11','6,182,212','168,85,247','59,130,246','239,68,68','20,184,166']

export default function SessionsPage() {
  const { isTeacher } = useAuth()
  const [courses,   setCourses]  = useState([])
  const [loading,   setLoading]  = useState(true)
  const [busy,      setBusy]     = useState(null)
  const [live,      setLive]     = useState({})
  const [attended,  setAttended] = useState({})
  const [rateQueue, setRateQueue]= useState([])
  const [copied,    setCopied]   = useState(null)
  const pollRef = useRef(null)
  const { toast } = useToast()

  useEffect(() => {
    const load = isTeacher ? getMyCourses() : getEnrolledCourses()
    load.then(r => setCourses(r.data || []))
      .catch(() => toast('Failed to load courses', 'error'))
      .finally(() => setLoading(false))
  }, [isTeacher])

  const pollSessions = async (list) => {
    if (!list.length) return
    const results = await Promise.allSettled(list.map(c => getActiveSession(c.id).then(r => ({ id: c.id, ...r.data }))))
    const newLive = {}
    results.forEach(r => { if (r.status === 'fulfilled') newLive[r.value.id] = r.value })
    setLive(newLive)
  }

  useEffect(() => {
    if (!courses.length) return
    pollSessions(courses)
    pollRef.current = setInterval(() => pollSessions(courses), 8000)
    return () => clearInterval(pollRef.current)
  }, [courses])

  useEffect(() => {
    if (isTeacher) return
    Object.keys(attended).forEach(cid => {
      if (attended[cid] && !live[cid]?.active) {
        const course = courses.find(c => String(c.id) === String(cid))
        if (course) {
          setRateQueue(q => q.find(x => x.id === course.id) ? q : [...q, course])
          setAttended(a => { const n = {...a}; delete n[cid]; return n })
        }
      }
    })
  }, [live, attended, courses, isTeacher])

  const startSess = async cid => {
    setBusy(cid+'_s')
    try {
      await startSession(cid)
      toast('Session started! All enrolled students have been notified.', 'success')
      await pollSessions(courses)
    } catch (err) { toast(err.response?.data?.detail || 'Failed to start', 'error') }
    setBusy(null)
  }

  const attendSess = async cid => {
    setBusy(cid+'_a')
    try {
      const r = await attendSession(cid)
      setAttended(a => ({...a, [cid]:true}))
      toast('Joined! 500 credits deducted.', 'success')
      window.open(r.data.meeting_link, '_blank', 'noopener')
      await pollSessions(courses)
    } catch (err) { toast(err.response?.data?.detail || 'Failed to join', 'error') }
    setBusy(null)
  }

  const endSess = async cid => {
    setBusy(cid+'_e')
    try {
      const r = await endSession(cid)
      toast(`Session ended. ${r.data.students_attended} attended. Earned ${r.data.teacher_earned} credits.`, 'success')
      await pollSessions(courses)
    } catch (err) { toast(err.response?.data?.detail || 'Failed to end', 'error') }
    setBusy(null)
  }

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(id); toast('Copied!', 'success'); setTimeout(() => setCopied(null), 2000)
    })
  }

  const currentRateFor = rateQueue[0] || null
  const submitRating = async (rating, review) => {
    try { await addRating(currentRateFor.id, rating, review); toast('Rating submitted!', 'success') }
    catch (err) { toast(err.response?.data?.detail || 'Failed', 'error') }
    setRateQueue(q => q.slice(1))
  }

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', fontFamily:"'Sora',sans-serif" }} className="fade-up">
      <style>{`
        @keyframes livePulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
        @keyframes sessionPop { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .sess-card:hover { transform:translateY(-3px) !important; }
      `}</style>

      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.03em', marginBottom:4 }}>Sessions</h2>
        <p style={{ fontSize:13, color:'rgba(240,244,255,0.38)', fontFamily:"'DM Sans',sans-serif" }}>
          {isTeacher ? 'Start live sessions - enrolled students are notified automatically.' : 'Live sessions from your enrolled courses. Join within 10 minutes.'}
        </p>
      </div>

      <div style={{ padding:'12px 18px', borderRadius:12, marginBottom:22,
        background:'rgba(56,189,248,0.07)', border:'1px solid rgba(56,189,248,0.18)',
        display:'flex', alignItems:'flex-start', gap:10 }}>
        <span style={{ color:'#7dd3fc', flexShrink:0, marginTop:1 }}><I d={IC.info} s={14}/></span>
        <span style={{ fontSize:13, color:'#bae6fd', fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
          Sessions use <strong style={{color:'#f0f4ff'}}>Jitsi Meet</strong> - no install needed.
          Join window: <strong style={{color:'#f0f4ff'}}>10 minutes</strong>.
          Cost: <strong style={{color:'#f0f4ff'}}>500 credits/session</strong>.
          Teachers earn <strong style={{color:'#f0f4ff'}}>10 credits/student</strong>.
          {isTeacher
            ? <span style={{color:'rgba(186,230,253,0.7)'}}> Students receive instant notification when you start.</span>
            : <span style={{color:'rgba(186,230,253,0.7)'}}> Auto-checks every 8s for live sessions.</span>
          }
        </span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spin/></div>
      ) : courses.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'80px 24px', textAlign:'center' }}>
          <div style={{ width:72, height:72, borderRadius:20, marginBottom:20,
            background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.18)',
            display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(99,102,241,0.5)' }}>
            <I d={IC.book} s={30}/>
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:'#f0f4ff', marginBottom:8 }}>
            {isTeacher ? 'No courses created yet' : 'No enrolled courses'}
          </div>
          <div style={{ fontSize:14, color:'rgba(240,244,255,0.35)', marginBottom:22, fontFamily:"'DM Sans',sans-serif" }}>
            {isTeacher ? 'Create a course to start sessions.' : 'Enroll in courses to attend sessions.'}
          </div>
          <Link to={isTeacher ? '/create-course' : '/courses'} style={{ padding:'10px 28px', borderRadius:10,
            background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(99,102,241,0.1))',
            border:'1px solid rgba(99,102,241,0.3)', color:'#a5b4fc', textDecoration:'none', fontSize:13.5, fontWeight:700 }}>
            {isTeacher ? 'Create Course' : 'Browse Courses'}
          </Link>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:18 }}>
          {courses.map((c, i) => {
            const session   = live[c.id] || {}
            const isLive    = !!session.active
            const winOpen   = !!session.window_open
            const link      = session.meeting_link
            const deadline  = session.join_deadline
            const startedAt = session.started_at
            const attendees = session.attendees_count || 0
            const didAttend = attended[c.id]
            const rgb       = BG_COLORS[i % BG_COLORS.length]

            return (
              <div key={c.id} className="sess-card" style={{
                borderRadius:18, padding:'22px', position:'relative', overflow:'hidden',
                background: isLive
                  ? 'linear-gradient(145deg,rgba(16,185,129,0.12) 0%,rgba(16,185,129,0.04) 60%,rgba(0,0,0,0.15) 100%)'
                  : `linear-gradient(145deg,rgba(${rgb},0.09) 0%,rgba(${rgb},0.03) 60%,rgba(0,0,0,0.15) 100%)`,
                border: isLive ? '1px solid rgba(16,185,129,0.3)' : `1px solid rgba(${rgb},0.18)`,
                boxShadow: isLive ? '0 8px 32px rgba(16,185,129,0.12)' : `0 4px 24px rgba(${rgb},0.07)`,
                transition:'all 0.28s cubic-bezier(0.22,1,0.36,1)',
                animation:`sessionPop 0.4s ${i*0.06}s both`,
              }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
                  background: isLive
                    ? 'linear-gradient(90deg,transparent,rgba(16,185,129,0.9),transparent)'
                    : `linear-gradient(90deg,transparent,rgba(${rgb},0.7),transparent)` }}/>
                <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100,
                  borderRadius:'50%', pointerEvents:'none',
                  background: isLive ? 'radial-gradient(circle,rgba(16,185,129,0.2) 0%,transparent 65%)'
                    : `radial-gradient(circle,rgba(${rgb},0.18) 0%,transparent 65%)` }}/>

                {/* Header */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                    <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                      background: isLive ? 'rgba(16,185,129,0.2)' : `rgba(${rgb},0.2)`,
                      border: isLive ? '1px solid rgba(16,185,129,0.3)' : `1px solid rgba(${rgb},0.3)`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:18, fontWeight:900,
                      color: isLive ? '#34d399' : `rgb(${rgb})` }}>
                      {(c.title||'?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:'#f0f4ff', marginBottom:3,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</div>
                      <div style={{ fontSize:12, color:'rgba(240,244,255,0.35)',
                        fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:6 }}>
                        <I d={IC.users} s={12}/>{c.students_count ?? 0} students
                        {isLive && attendees > 0 && <span style={{color:'#34d399'}}>· {attendees} joined</span>}
                      </div>
                    </div>
                  </div>
                  {isLive ? (
                    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px',
                      borderRadius:100, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.35)', flexShrink:0 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'#10b981',
                        boxShadow:'0 0 8px rgba(16,185,129,0.9)', animation:'livePulse 2s infinite' }}/>
                      <span style={{ fontSize:10.5, fontWeight:700, color:'#34d399', letterSpacing:'0.07em', textTransform:'uppercase' }}>Live</span>
                    </div>
                  ) : (
                    <div style={{ padding:'4px 12px', borderRadius:100,
                      background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
                      fontSize:10.5, fontWeight:600, color:'rgba(240,244,255,0.28)', letterSpacing:'0.07em', textTransform:'uppercase' }}>Idle</div>
                  )}
                </div>

                {/* Timer bar for students when session is live and window open */}
                {isLive && !isTeacher && winOpen && !didAttend && (
                  <TimerBar deadlineISO={deadline} startedISO={startedAt}/>
                )}

                {/* Teacher: running duration + attendee count */}
                {isLive && isTeacher && (
                  <div style={{ marginBottom:14, padding:'10px 14px', borderRadius:10,
                    background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)',
                    display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:12.5, color:'#6ee7b7', fontFamily:"'DM Sans',sans-serif",
                      display:'flex', alignItems:'center', gap:6 }}>
                      <I d={IC.users} s={13}/>{attendees} student{attendees!==1?'s':''} joined
                    </span>
                    <ElapsedTimer startedISO={startedAt}/>
                  </div>
                )}

                {/* Meeting link */}
                {isLive && link && (
                  <div style={{ marginBottom:14, padding:'11px 14px', borderRadius:10,
                    background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)',
                    display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:12.5, color:'#34d399', fontWeight:600, textDecoration:'none',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1,
                        display:'flex', alignItems:'center', gap:6 }}>
                      <I d={IC.ext} s={12}/> Open Jitsi Meet
                    </a>
                    <button onClick={() => copyLink(link, c.id)} style={{ padding:'4px 10px', borderRadius:7,
                      fontSize:11.5, fontWeight:600, background:'rgba(16,185,129,0.15)',
                      border:'1px solid rgba(16,185,129,0.3)', color:'#34d399', cursor:'pointer',
                      display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                      <I d={copied===c.id?IC.check:IC.copy} s={11}/>
                      {copied===c.id?'Copied!':'Copy'}
                    </button>
                  </div>
                )}

                {/* Notification alert for students */}
                {isLive && !isTeacher && winOpen && !didAttend && (
                  <div style={{ marginBottom:12, padding:'9px 12px', borderRadius:9,
                    background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)',
                    fontSize:12.5, color:'#fde68a', display:'flex', alignItems:'center', gap:7,
                    fontFamily:"'DM Sans',sans-serif" }}>
                    <I d={IC.bell} s={13}/> Teacher started - join now before window closes!
                  </div>
                )}

                {/* Window closed */}
                {isLive && !isTeacher && !winOpen && !didAttend && (
                  <div style={{ marginBottom:12, padding:'9px 12px', borderRadius:9,
                    background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.22)',
                    fontSize:12.5, color:'#f87171', display:'flex', alignItems:'center', gap:7,
                    fontFamily:"'DM Sans',sans-serif" }}>
                    <I d={IC.clock} s={13}/> Join window closed (10 min passed)
                  </div>
                )}

                {/* Action */}
                <div style={{ marginTop:4 }}>
                  {isTeacher ? (
                    isLive ? (
                      <button onClick={() => endSess(c.id)} disabled={busy===c.id+'_e'}
                        style={{ width:'100%', padding:'11px', borderRadius:11, fontSize:13.5, fontWeight:700,
                          background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)',
                          color:'#f87171', cursor:busy===c.id+'_e'?'not-allowed':'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                          opacity:busy===c.id+'_e'?0.6:1, transition:'all 0.18s', fontFamily:"'Sora',sans-serif" }}
                        onMouseOver={e=>{ if(busy!==c.id+'_e'){e.currentTarget.style.background='rgba(239,68,68,0.22)';e.currentTarget.style.transform='translateY(-1px)'}}}
                        onMouseOut={e=>{e.currentTarget.style.background='rgba(239,68,68,0.12)';e.currentTarget.style.transform=''}}>
                        {busy===c.id+'_e'?<Spin size={14}/>:<><I d={IC.stop} s={13}/> End Session</>}
                      </button>
                    ) : (
                      <button onClick={() => startSess(c.id)} disabled={busy===c.id+'_s'}
                        style={{ width:'100%', padding:'11px', borderRadius:11, fontSize:13.5, fontWeight:700,
                          background:`linear-gradient(135deg,rgba(${rgb},0.18),rgba(${rgb},0.08))`,
                          border:`1px solid rgba(${rgb},0.32)`, color:`rgb(${rgb})`,
                          cursor:busy===c.id+'_s'?'not-allowed':'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                          opacity:busy===c.id+'_s'?0.6:1, transition:'all 0.18s', fontFamily:"'Sora',sans-serif" }}
                        onMouseOver={e=>{if(busy!==c.id+'_s'){e.currentTarget.style.background=`rgba(${rgb},0.28)`}}}
                        onMouseOut={e=>{e.currentTarget.style.background=`linear-gradient(135deg,rgba(${rgb},0.18),rgba(${rgb},0.08))`}}>
                        {busy===c.id+'_s'?<Spin size={14}/>:<><I d={IC.play} s={13}/> Start Session</>}
                      </button>
                    )
                  ) : (
                    didAttend && isLive ? (
                      <div style={{ width:'100%', padding:'11px', borderRadius:11, fontSize:13.5, fontWeight:700,
                        background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)',
                        color:'#34d399', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                        <I d={IC.check} s={14}/> You are in session
                      </div>
                    ) : isLive && winOpen ? (
                      <button onClick={() => attendSess(c.id)} disabled={busy===c.id+'_a'}
                        style={{ width:'100%', padding:'11px', borderRadius:11, fontSize:13.5, fontWeight:700,
                          background:'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(6,182,212,0.1))',
                          border:'1px solid rgba(16,185,129,0.35)', color:'#34d399',
                          cursor:busy===c.id+'_a'?'not-allowed':'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                          opacity:busy===c.id+'_a'?0.6:1, transition:'all 0.18s',
                          boxShadow:'0 4px 20px rgba(16,185,129,0.12)', fontFamily:"'Sora',sans-serif" }}
                        onMouseOver={e=>{if(busy!==c.id+'_a'){e.currentTarget.style.background='rgba(16,185,129,0.3)';e.currentTarget.style.transform='translateY(-2px)'}}}
                        onMouseOut={e=>{e.currentTarget.style.background='linear-gradient(135deg,rgba(16,185,129,0.2),rgba(6,182,212,0.1))';e.currentTarget.style.transform=''}}>
                        {busy===c.id+'_a'?<Spin size={14}/>:<><I d={IC.join} s={14}/> Attend Session - 500 credits</>}
                      </button>
                    ) : isLive && !winOpen ? (
                      <div style={{ width:'100%', padding:'11px', borderRadius:11, fontSize:13,
                        background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.18)',
                        color:'rgba(248,113,113,0.7)', display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                        fontFamily:"'DM Sans',sans-serif" }}>
                        <I d={IC.clock} s={13}/> Join window expired
                      </div>
                    ) : (
                      <div style={{ width:'100%', padding:'11px', borderRadius:11, fontSize:13,
                        background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
                        color:'rgba(240,244,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                        fontFamily:"'DM Sans',sans-serif" }}>
                        <I d={IC.clock} s={13}/> Waiting for teacher to start...
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <RateModal open={!!currentRateFor} courseName={currentRateFor?.title}
        onSubmit={submitRating} onSkip={() => setRateQueue(q => q.slice(1))}/>
    </div>
  )
}
