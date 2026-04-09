import { useState, useEffect } from 'react'
import { getAllCourses, joinCourse } from '@/api'
import { addEnrolledId, getEnrolledIds } from '@/utils/enrollment'
import { useToast } from '@/context/Toast'
import Spin from '@/components/ui/Spin'

const I = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)
const IC = {
  search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  users:  <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  check:  <><polyline points="20,6 9,17 4,12"/></>,
  book:   <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
  empty:  <><path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12"/><path d="M4 19h16"/><path d="M9 7v6l3-2 3 2V7"/></>,
  grid:   <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  list:   <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
}

const BG_COLORS = [
  '99,102,241','16,185,129','245,158,11','239,68,68',
  '6,182,212','168,85,247','59,130,246','20,184,166',
]

export default function CoursesPage() {
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [joining, setJoining]   = useState(null)
  const [search,  setSearch]    = useState('')
  const [view,    setView]      = useState('grid')
  const [enrolledIds, setEnrolledIds] = useState(() => getEnrolledIds())
  const { toast } = useToast()

  const load = () =>
    getAllCourses()
      .then(r => setCourses(r.data || []))
      .catch(() => toast('Failed to load courses', 'error'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const join = async id => {
    setJoining(id)
    try {
      await joinCourse(id)
      addEnrolledId(id)
      setEnrolledIds(getEnrolledIds())
      toast('Enrolled successfully!', 'success')
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to enroll', 'error')
    }
    setJoining(null)
  }

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth:1200, margin:'0 auto' }} className="fade-up">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .course-card:hover { transform:translateY(-5px) !important; box-shadow:0 20px 50px rgba(0,0,0,0.5) !important; }
        .enroll-btn:hover { transform:translateY(-2px) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:28, flexWrap:'wrap', gap:14 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:'#f0f4ff',
            letterSpacing:'-0.03em', marginBottom:4, fontFamily:"'Sora',sans-serif" }}>
            All Courses
          </h2>
          <p style={{ fontSize:13, color:'rgba(240,244,255,0.38)',
            fontFamily:"'DM Sans',sans-serif" }}>
            {courses.length} courses available on Point2Learn
          </p>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Search */}
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
              color:'rgba(240,244,255,0.25)', pointerEvents:'none' }}>
              <I d={IC.search} s={14}/>
            </span>
            <input
              style={{ width:220, paddingLeft:36, paddingRight:14, paddingTop:9, paddingBottom:9,
                fontSize:13, fontFamily:"'DM Sans',sans-serif",
                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:10, color:'#f0f4ff', outline:'none', transition:'all 0.18s' }}
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => { e.target.style.borderColor='rgba(99,102,241,0.5)'; e.target.style.background='rgba(99,102,241,0.07)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)' }}
              onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.background='rgba(255,255,255,0.05)'; e.target.style.boxShadow='none' }}
            />
          </div>

          {/* View toggle */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.05)',
            border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, overflow:'hidden' }}>
            {[['grid', IC.grid], ['list', IC.list]].map(([v, icon]) => (
              <button key={v} onClick={() => setView(v)} style={{
                width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center',
                background: view === v ? 'rgba(99,102,241,0.25)' : 'transparent',
                border:'none', cursor:'pointer', transition:'all 0.15s',
                color: view === v ? '#a5b4fc' : 'rgba(240,244,255,0.3)',
              }}>
                <I d={icon} s={14}/>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Count bar */}
      {!loading && filtered.length > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
          <div style={{ height:1, flex:1, background:'rgba(255,255,255,0.06)' }}/>
          <span style={{ fontSize:11, color:'rgba(240,244,255,0.25)', fontWeight:600,
            letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:"'DM Sans',sans-serif",
            whiteSpace:'nowrap' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
          <div style={{ height:1, flex:1, background:'rgba(255,255,255,0.06)' }}/>
        </div>
      )}

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:100 }}>
          <Spin/>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'80px 24px', textAlign:'center' }}>
          <div style={{ width:72, height:72, borderRadius:20, marginBottom:24,
            background:'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(99,102,241,0.04))',
            border:'1px solid rgba(99,102,241,0.2)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 40px rgba(99,102,241,0.1)' }}>
            <I d={IC.empty} s={28}/>
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:'#f0f4ff', marginBottom:8,
            letterSpacing:'-0.02em', fontFamily:"'Sora',sans-serif" }}>
            {search ? 'No courses match your search' : 'No courses available yet'}
          </div>
          <div style={{ fontSize:14, color:'rgba(240,244,255,0.35)', maxWidth:320, lineHeight:1.7,
            fontFamily:"'DM Sans',sans-serif" }}>
            {search ? `Try searching with different keywords.` : 'Check back later — new courses are added regularly.'}
          </div>
          {search && (
            <button onClick={() => setSearch('')} style={{ marginTop:20, padding:'9px 22px',
              borderRadius:9, fontSize:13, fontWeight:600,
              background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)',
              color:'#a5b4fc', cursor:'pointer', transition:'all 0.15s' }}
              onMouseOver={e => e.currentTarget.style.background='rgba(99,102,241,0.22)'}
              onMouseOut={e  => e.currentTarget.style.background='rgba(99,102,241,0.12)'}>
              Clear search
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        /* GRID VIEW */
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
          {filtered.map((c, i) => {
            const isEnrolled = enrolledIds.includes(c.id)
            const rgb = BG_COLORS[i % BG_COLORS.length]
            const hex = `rgba(${rgb},1)`
            return (
              <div key={c.id} className="course-card" style={{
                borderRadius:16, overflow:'hidden', position:'relative',
                background:`linear-gradient(145deg,rgba(${rgb},0.1) 0%,rgba(${rgb},0.03) 60%,rgba(0,0,0,0.2) 100%)`,
                border:`1px solid rgba(${rgb},0.2)`,
                boxShadow:`0 4px 24px rgba(${rgb},0.08), inset 0 1px 0 rgba(255,255,255,0.07)`,
                transition:'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                padding:'24px',
              }}>
                {/* Top glow */}
                <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100,
                  borderRadius:'50%', background:`radial-gradient(circle,rgba(${rgb},0.25) 0%,transparent 65%)`,
                  pointerEvents:'none' }}/>
                {/* Bottom line */}
                <div style={{ position:'absolute', bottom:0, left:'10%', right:'10%', height:1,
                  background:`linear-gradient(90deg,transparent,rgba(${rgb},0.5),transparent)`,
                  pointerEvents:'none' }}/>

                {/* Enrolled badge top-right */}
                {isEnrolled && (
                  <div style={{ position:'absolute', top:16, right:16,
                    display:'flex', alignItems:'center', gap:5, padding:'4px 10px',
                    borderRadius:100, background:'rgba(16,185,129,0.15)',
                    border:'1px solid rgba(16,185,129,0.35)', zIndex:1 }}>
                    <I d={IC.check} s={10}/>
                    <span style={{ fontSize:10, fontWeight:700, color:'#34d399',
                      letterSpacing:'0.06em', textTransform:'uppercase' }}>Enrolled</span>
                  </div>
                )}

                {/* Course initial avatar */}
                <div style={{ width:48, height:48, borderRadius:14, marginBottom:16,
                  background:`linear-gradient(135deg,rgba(${rgb},0.25),rgba(${rgb},0.1))`,
                  border:`1px solid rgba(${rgb},0.3)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:20, fontWeight:900, color:hex, fontFamily:"'Sora',sans-serif",
                  boxShadow:`0 0 20px rgba(${rgb},0.2)` }}>
                  {(c.title||'?').charAt(0).toUpperCase()}
                </div>

                {/* Title */}
                <div style={{ fontSize:16, fontWeight:700, color:'#f0f4ff', marginBottom:8,
                  letterSpacing:'-0.025em', fontFamily:"'Sora',sans-serif",
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                  paddingRight: isEnrolled ? 80 : 0 }}>
                  {c.title}
                </div>

                {/* Description */}
                <div style={{ fontSize:13, color:'rgba(240,244,255,0.38)', lineHeight:1.65,
                  marginBottom:20, fontFamily:"'DM Sans',sans-serif",
                  display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                  overflow:'hidden', minHeight:42 }}>
                  {c.description || 'No description provided.'}
                </div>

                {/* Footer */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6,
                    fontSize:12, color:'rgba(240,244,255,0.35)',
                    fontFamily:"'DM Sans',sans-serif" }}>
                    <I d={IC.users} s={13}/>
                    <span>{c.students_count ?? 0} students</span>
                  </div>

                  {isEnrolled ? (
                    <div style={{ display:'flex', alignItems:'center', gap:6,
                      fontSize:12, fontWeight:700, color:'#34d399',
                      padding:'6px 14px', borderRadius:8,
                      background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)' }}>
                      <I d={IC.check} s={11}/> Joined
                    </div>
                  ) : (
                    <button className="enroll-btn" onClick={() => join(c.id)}
                      disabled={joining === c.id}
                      style={{ padding:'7px 18px', borderRadius:9, fontSize:12.5, fontWeight:700,
                        background:`linear-gradient(135deg,rgba(${rgb},0.2),rgba(${rgb},0.1))`,
                        border:`1px solid rgba(${rgb},0.35)`, color:hex,
                        cursor:joining===c.id?'not-allowed':'pointer',
                        transition:'all 0.18s', fontFamily:"'Sora',sans-serif",
                        display:'flex', alignItems:'center', gap:7,
                        opacity: joining===c.id ? 0.6 : 1 }}
                      onMouseOver={e => { if(joining!==c.id){ e.currentTarget.style.background=`rgba(${rgb},0.28)`; e.currentTarget.style.boxShadow=`0 6px 20px rgba(${rgb},0.22)` }}}
                      onMouseOut={e  => { e.currentTarget.style.background=`linear-gradient(135deg,rgba(${rgb},0.2),rgba(${rgb},0.1))`; e.currentTarget.style.boxShadow='' }}>
                      {joining === c.id ? <Spin size={13}/> : 'Enroll Now'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map((c, i) => {
            const isEnrolled = enrolledIds.includes(c.id)
            const rgb = BG_COLORS[i % BG_COLORS.length]
            const hex = `rgba(${rgb},1)`
            return (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:18,
                padding:'18px 22px', borderRadius:14,
                background:`rgba(${rgb},0.05)`, border:`1px solid rgba(${rgb},0.12)`,
                transition:'all 0.18s', position:'relative', overflow:'hidden' }}
                onMouseOver={e => { e.currentTarget.style.background=`rgba(${rgb},0.1)`; e.currentTarget.style.borderColor=`rgba(${rgb},0.25)`; e.currentTarget.style.transform='translateX(3px)' }}
                onMouseOut={e  => { e.currentTarget.style.background=`rgba(${rgb},0.05)`; e.currentTarget.style.borderColor=`rgba(${rgb},0.12)`; e.currentTarget.style.transform='' }}>

                <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                  background:`linear-gradient(135deg,rgba(${rgb},0.22),rgba(${rgb},0.08))`,
                  border:`1px solid rgba(${rgb},0.25)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:18, fontWeight:900, color:hex, fontFamily:"'Sora',sans-serif" }}>
                  {(c.title||'?').charAt(0).toUpperCase()}
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14.5, fontWeight:700, color:'#f0f4ff', marginBottom:3,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    letterSpacing:'-0.02em', fontFamily:"'Sora',sans-serif" }}>{c.title}</div>
                  <div style={{ fontSize:12.5, color:'rgba(240,244,255,0.35)', overflow:'hidden',
                    textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:"'DM Sans',sans-serif" }}>
                    {c.description || 'No description.'}
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0,
                  fontSize:12, color:'rgba(240,244,255,0.35)', fontFamily:"'DM Sans',sans-serif" }}>
                  <I d={IC.users} s={12}/>{c.students_count ?? 0}
                </div>

                <div style={{ flexShrink:0 }}>
                  {isEnrolled ? (
                    <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12,
                      fontWeight:700, color:'#34d399', padding:'5px 12px', borderRadius:7,
                      background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.22)' }}>
                      <I d={IC.check} s={11}/> Joined
                    </div>
                  ) : (
                    <button onClick={() => join(c.id)} disabled={joining===c.id}
                      style={{ padding:'6px 16px', borderRadius:8, fontSize:12.5, fontWeight:700,
                        background:`rgba(${rgb},0.15)`, border:`1px solid rgba(${rgb},0.3)`,
                        color:hex, cursor:joining===c.id?'not-allowed':'pointer',
                        display:'flex', alignItems:'center', gap:6, transition:'all 0.15s',
                        opacity:joining===c.id?0.6:1, fontFamily:"'Sora',sans-serif" }}
                      onMouseOver={e => { if(joining!==c.id) e.currentTarget.style.background=`rgba(${rgb},0.28)` }}
                      onMouseOut={e  => { e.currentTarget.style.background=`rgba(${rgb},0.15)` }}>
                      {joining===c.id ? <Spin size={12}/> : 'Enroll'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
