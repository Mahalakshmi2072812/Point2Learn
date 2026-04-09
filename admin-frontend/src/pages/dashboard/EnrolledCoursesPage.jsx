import { useState, useEffect } from 'react'
import { getEnrolledCourses } from '@/api'
import { useToast } from '@/context/Toast'
import { Link } from 'react-router-dom'
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
  star:   <><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></>,
  browse: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
}

const BG_COLORS = [
  '99,102,241','16,185,129','245,158,11','6,182,212',
  '168,85,247','59,130,246','239,68,68','20,184,166',
]

export default function EnrolledCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const { toast } = useToast()

  useEffect(() => {
    getEnrolledCourses()
      .then(r => setCourses(r.data || []))
      .catch(() => toast('Failed to load enrolled courses', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth:1200, margin:'0 auto' }} className="fade-up">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes enrollPop { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .enroll-card:hover { transform:translateY(-5px) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:28, flexWrap:'wrap', gap:14 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:'#f0f4ff',
            letterSpacing:'-0.03em', marginBottom:4, fontFamily:"'Sora',sans-serif" }}>
            Enrolled Courses
          </h2>
          <p style={{ fontSize:13, color:'rgba(240,244,255,0.38)', fontFamily:"'DM Sans',sans-serif" }}>
            {loading ? 'Loading...' : `${courses.length} course${courses.length!==1?'s':''} you have joined`}
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
              color:'rgba(240,244,255,0.25)', pointerEvents:'none' }}>
              <I d={IC.search} s={14}/>
            </span>
            <input
              style={{ width:210, paddingLeft:36, paddingRight:14, paddingTop:9, paddingBottom:9,
                fontSize:13, fontFamily:"'DM Sans',sans-serif",
                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:10, color:'#f0f4ff', outline:'none', transition:'all 0.18s' }}
              placeholder="Search enrolled..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => { e.target.style.borderColor='rgba(16,185,129,0.5)'; e.target.style.background='rgba(16,185,129,0.07)'; e.target.style.boxShadow='0 0 0 3px rgba(16,185,129,0.1)' }}
              onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.background='rgba(255,255,255,0.05)'; e.target.style.boxShadow='none' }}
            />
          </div>
          <Link to="/courses" style={{ padding:'9px 18px', borderRadius:9, fontSize:12.5, fontWeight:600,
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
            color:'rgba(240,244,255,0.5)', textDecoration:'none', transition:'all 0.15s',
            fontFamily:"'Sora',sans-serif", display:'flex', alignItems:'center', gap:7 }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#f0f4ff' }}
            onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(240,244,255,0.5)' }}>
            <I d={IC.browse} s={13}/> Browse All
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:100 }}>
          <Spin/>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'80px 24px', textAlign:'center' }}>
          {/* Animated empty illustration */}
          <div style={{ position:'relative', marginBottom:28 }}>
            <div style={{ width:100, height:100, borderRadius:28, margin:'0 auto',
              background:'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.03))',
              border:'1px solid rgba(16,185,129,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 50px rgba(16,185,129,0.1)' }}>
              <I d={IC.book} s={36}/>
            </div>
            {/* Orbiting dot */}
            <div style={{ position:'absolute', top:8, right:8, width:16, height:16,
              borderRadius:'50%', background:'#34d399',
              boxShadow:'0 0 12px rgba(16,185,129,0.8)' }}/>
          </div>

          <div style={{ fontSize:20, fontWeight:800, color:'#f0f4ff', marginBottom:10,
            letterSpacing:'-0.03em', fontFamily:"'Sora',sans-serif" }}>
            {search ? 'No matching courses' : "You haven't enrolled yet"}
          </div>
          <div style={{ fontSize:14, color:'rgba(240,244,255,0.38)', maxWidth:360,
            lineHeight:1.75, marginBottom:28, fontFamily:"'DM Sans',sans-serif" }}>
            {search
              ? 'Try a different keyword or clear your search.'
              : 'Browse all available courses and click Enroll to get started. Your enrolled courses will appear here.'}
          </div>

          {search ? (
            <button onClick={() => setSearch('')} style={{ padding:'10px 24px', borderRadius:10,
              fontSize:13.5, fontWeight:700,
              background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.28)',
              color:'#34d399', cursor:'pointer', transition:'all 0.15s',
              fontFamily:"'Sora',sans-serif" }}
              onMouseOver={e => e.currentTarget.style.background='rgba(16,185,129,0.22)'}
              onMouseOut={e  => e.currentTarget.style.background='rgba(16,185,129,0.12)'}>
              Clear Search
            </button>
          ) : (
            <Link to="/courses" style={{ padding:'12px 32px', borderRadius:11, fontSize:14,
              fontWeight:700, background:'linear-gradient(135deg,rgba(16,185,129,0.18),rgba(6,182,212,0.1))',
              border:'1px solid rgba(16,185,129,0.32)', color:'#34d399',
              textDecoration:'none', transition:'all 0.18s', fontFamily:"'Sora',sans-serif",
              boxShadow:'0 4px 20px rgba(16,185,129,0.12)' }}
              onMouseOver={e => { e.currentTarget.style.background='rgba(16,185,129,0.28)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 30px rgba(16,185,129,0.22)' }}
              onMouseOut={e  => { e.currentTarget.style.background='linear-gradient(135deg,rgba(16,185,129,0.18),rgba(6,182,212,0.1))'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 20px rgba(16,185,129,0.12)' }}>
              Browse All Courses
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Enrolled count badge */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 16px',
              borderRadius:100, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#10b981',
                boxShadow:'0 0 8px rgba(16,185,129,0.9)' }}/>
              <span style={{ fontSize:11, fontWeight:700, color:'#6ee7b7',
                letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:"'DM Sans',sans-serif" }}>
                {filtered.length} Course{filtered.length!==1?'s':''} Enrolled
              </span>
            </div>
          </div>

          {/* Cards grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
            {filtered.map((c, i) => {
              const rgb = BG_COLORS[i % BG_COLORS.length]
              const hex = `rgba(${rgb},1)`
              return (
                <div key={c.id} className="enroll-card" style={{
                  borderRadius:18, overflow:'hidden', position:'relative',
                  background:`linear-gradient(145deg,rgba(${rgb},0.12) 0%,rgba(${rgb},0.04) 60%,rgba(0,0,0,0.15) 100%)`,
                  border:`1px solid rgba(${rgb},0.22)`,
                  boxShadow:`0 6px 28px rgba(${rgb},0.1), inset 0 1px 0 rgba(255,255,255,0.07)`,
                  transition:'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                  animation:`enrollPop 0.4s ${i * 0.06}s both`,
                }}>
                  {/* Top accent line */}
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, pointerEvents:'none',
                    background:`linear-gradient(90deg,transparent,rgba(${rgb},0.8),transparent)` }}/>
                  {/* Glow orb */}
                  <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120,
                    borderRadius:'50%', background:`radial-gradient(circle,rgba(${rgb},0.22) 0%,transparent 65%)`,
                    pointerEvents:'none' }}/>

                  <div style={{ padding:'24px' }}>
                    {/* Enrolled badge */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                      <div style={{ width:50, height:50, borderRadius:14,
                        background:`linear-gradient(135deg,rgba(${rgb},0.28),rgba(${rgb},0.1))`,
                        border:`1px solid rgba(${rgb},0.3)`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:20, fontWeight:900, color:hex, fontFamily:"'Sora',sans-serif",
                        boxShadow:`0 0 22px rgba(${rgb},0.2)` }}>
                        {(c.title||'?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6,
                        padding:'5px 12px', borderRadius:100,
                        background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)' }}>
                        <I d={IC.check} s={11}/>
                        <span style={{ fontSize:10.5, fontWeight:700, color:'#34d399',
                          letterSpacing:'0.07em', textTransform:'uppercase' }}>Enrolled</span>
                      </div>
                    </div>

                    {/* Title */}
                    <div style={{ fontSize:16.5, fontWeight:800, color:'#f0f4ff', marginBottom:8,
                      letterSpacing:'-0.03em', fontFamily:"'Sora',sans-serif",
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {c.title}
                    </div>

                    {/* Description */}
                    <div style={{ fontSize:13, color:'rgba(240,244,255,0.4)', lineHeight:1.65,
                      marginBottom:20, fontFamily:"'DM Sans',sans-serif",
                      display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                      overflow:'hidden', minHeight:42 }}>
                      {c.description || 'No description provided.'}
                    </div>

                    {/* Footer stats */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                      paddingTop:16, borderTop:`1px solid rgba(${rgb},0.12)` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6,
                        fontSize:12, color:'rgba(240,244,255,0.35)', fontFamily:"'DM Sans',sans-serif" }}>
                        <I d={IC.users} s={12}/>
                        <span>{c.students_count ?? 0} students</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:5,
                        fontSize:11.5, color:hex, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:hex,
                          boxShadow:`0 0 6px ${hex}` }}/>
                        Active
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
