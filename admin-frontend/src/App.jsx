import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'

const BACKEND = import.meta.env.VITE_API_BASE
const http = axios.create({ baseURL: BACKEND })
http.interceptors.request.use(cfg => {
  const t = localStorage.getItem('admin_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})
http.interceptors.response.use(r => r, err => {
  if (err.response?.status === 403) {
    localStorage.removeItem('admin_token')
    window.location.reload()
  }
  return Promise.reject(err)
})

/* ── SVG Icons ──────────────────────────────────────────────── */
const I = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)
const IC = {
  dash:    <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  users:   <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  teacher: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>,
  rating:  <><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></>,
  chart:   <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  fake:    <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  notif:   <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
  logout:  <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  menu:    <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  check:   <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></>,
  x:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  ban:     <><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>,
  trash:   <><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M9 6V4h6v2"/></>,
  send:    <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></>,
  refresh: <><polyline points="23,4 23,11 16,11"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 11M1 13l4.64 4.36A9 9 0 0020.49 15"/></>,
  search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  trend:   <><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></>,
  eye:     <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  user1:   <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  chevron: <><polyline points="6,9 12,15 18,9"/></>,
  close:   <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
}

function Spin({ s = 18, c = '#fff' }) {
  return <div style={{ width:s, height:s, borderRadius:'50%', border:`2.5px solid rgba(255,255,255,0.12)`,
    borderTopColor:c, animation:'aspin 0.7s linear infinite', flexShrink:0 }}/>
}

/* ── Toast ─────────────────────────────────────────────────── */
let _toastAdd = () => {}
const toast = (msg, type = 'info') => _toastAdd(msg, type)
function Toasts() {
  const [list, setList] = useState([])
  _toastAdd = (msg, type) => {
    const id = Date.now()
    setList(p => [...p.slice(-4), { id, msg, type }])
    setTimeout(() => setList(p => p.filter(t => t.id !== id)), 4000)
  }
  const C = { success:'#34d399', error:'#f87171', info:'#818cf8', warning:'#fbbf24' }
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:10 }}>
      {list.map(t => (
        <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 18px',
          borderRadius:12, background:'rgba(5,7,22,0.97)', border:`1px solid ${C[t.type]}30`,
          color:C[t.type], backdropFilter:'blur(20px)', fontSize:13.5, fontWeight:500,
          fontFamily:"'Sora',sans-serif", maxWidth:340, boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
          animation:'afadeup 0.3s both' }}>
          <span style={{ fontSize:15 }}>
            {t.type==='success'?'✓':t.type==='error'?'✕':t.type==='warning'?'⚠':'ℹ'}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  )
}

/* ── Confirm Modal ─────────────────────────────────────────── */
function ConfirmModal({ data, onYes, onNo }) {
  if (!data) return null
  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center',
      justifyContent:'center', background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onNo()}>
      <div style={{ background:'#080d28', border:'1px solid rgba(239,68,68,0.3)',
        borderRadius:18, padding:'32px 36px', maxWidth:400, width:'90%',
        boxShadow:'0 24px 80px rgba(0,0,0,0.7)', animation:'apopin 0.22s both' }}>
        <div style={{ width:48, height:48, borderRadius:14, background:'rgba(239,68,68,0.12)',
          border:'1px solid rgba(239,68,68,0.3)', display:'flex', alignItems:'center',
          justifyContent:'center', color:'#f87171', marginBottom:16 }}>
          <I d={data.icon || IC.fake} s={20}/>
        </div>
        <h3 style={{ fontSize:17, fontWeight:800, color:'#f0f4ff', marginBottom:8 }}>{data.title}</h3>
        <p style={{ fontSize:13.5, color:'rgba(240,244,255,0.5)', lineHeight:1.7,
          fontFamily:"'DM Sans',sans-serif", marginBottom:24 }}>{data.msg}</p>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onYes} style={{ flex:1, padding:'11px',
            background:'linear-gradient(135deg,#b91c1c,#ef4444)', color:'#fff', border:'none',
            borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Sora',sans-serif",
            transition:'all 0.18s' }}
            onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseOut={e  => e.currentTarget.style.transform=''}>
            {data.confirmLabel || 'Confirm'}
          </button>
          <button onClick={onNo} style={{ flex:1, padding:'11px',
            background:'rgba(255,255,255,0.05)', color:'rgba(240,244,255,0.5)',
            border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, fontSize:14,
            fontWeight:600, cursor:'pointer', fontFamily:"'Sora',sans-serif" }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#f0f4ff' }}
            onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(240,244,255,0.5)' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── CSS ────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{font-family:'Sora',sans-serif;background:#030612;color:#f0f4ff;min-height:100vh;}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:8px;}

  @keyframes aspin   { to{transform:rotate(360deg)} }
  @keyframes afadeup { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes apopin  { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
  @keyframes aborrun { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
  @keyframes apulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.25;transform:scale(1.7)} }
  @keyframes afloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-18px,-22px)} }
  @keyframes afloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(16px,-16px)} }
  @keyframes abar    { from{width:0} to{width:var(--w)} }
  @keyframes acountin{ from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .adm-inp{width:100%;padding:12px 16px;font-size:14px;font-family:'Sora',sans-serif;
    background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);
    border-radius:11px;color:#f0f4ff;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
  .adm-inp:focus{border-color:rgba(239,68,68,0.6);box-shadow:0 0 0 3px rgba(239,68,68,0.1);}
  .adm-inp::placeholder{color:rgba(240,244,255,0.22);}

  .nav-btn{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;
    font-size:13.5px;font-weight:500;color:rgba(240,244,255,0.38);cursor:pointer;
    transition:all 0.15s;width:100%;background:transparent;border:none;
    font-family:'Sora',sans-serif;letter-spacing:-0.01em;text-align:left;}
  .nav-btn:hover{background:rgba(255,255,255,0.05);color:rgba(240,244,255,0.75);}
  .nav-btn.act{background:rgba(239,68,68,0.13);color:#f87171;
    border-left:2.5px solid #ef4444;padding-left:9px;}

  .acard{background:rgba(5,8,24,0.85);border:1px solid rgba(255,255,255,0.07);
    border-radius:18px;backdrop-filter:blur(18px);
    box-shadow:0 4px 28px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.04);}

  .tbl{width:100%;border-collapse:collapse;}
  .th{padding:11px 16px;text-align:left;font-size:10px;font-weight:700;
    color:rgba(240,244,255,0.2);letter-spacing:0.12em;text-transform:uppercase;
    background:rgba(255,255,255,0.012);border-bottom:1px solid rgba(255,255,255,0.06);}
  .td{padding:13px 16px;font-size:13.5px;color:rgba(240,244,255,0.55);
    border-bottom:1px solid rgba(255,255,255,0.04);}
  .tr{transition:background 0.15s;}
  .tr:hover .td{background:rgba(255,255,255,0.025);}

  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;
    border-radius:7px;font-size:11px;font-weight:700;white-space:nowrap;}
  .abtn{padding:6px 13px;border-radius:8px;font-size:12px;font-weight:600;border:none;
    cursor:pointer;display:inline-flex;align-items:center;gap:5px;
    transition:all 0.15s;font-family:'Sora',sans-serif;}
  .abtn:hover{transform:translateY(-1px);}
  .abtn:disabled{opacity:0.4;cursor:not-allowed;transform:none!important;}

  .tab-btn{padding:8px 16px;border:none;cursor:pointer;font-size:12.5px;font-weight:600;
    font-family:'Sora',sans-serif;border-radius:9px;transition:all 0.18s;}

  .search-inp{padding:9px 14px 9px 36px;font-size:13px;font-family:'DM Sans',sans-serif;
    background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);
    border-radius:10px;color:#f0f4ff;outline:none;width:200px;transition:all 0.2s;}
  .search-inp:focus{border-color:rgba(239,68,68,0.4);}
  .search-inp::placeholder{color:rgba(240,244,255,0.2);}

  .stat-card{transition:all 0.25s cubic-bezier(0.22,1,0.36,1)!important;}
  .stat-card:hover{transform:translateY(-4px)!important;}
`

/* ══════════════════════════════════════════════════════
   ANALYTICS PAGE (new page)
══════════════════════════════════════════════════════ */
function AnalyticsPage() {
  const [stats,   setStats]   = useState(null)
  const [growth,  setGrowth]  = useState(null)
  const [tStats,  setTStats]  = useState(null)
  const [loading, setL]       = useState(true)

  useEffect(() => {
    Promise.all([
      http.get('/admin/analytics/dashboard').catch(()=>null),
      http.get('/admin/analytics/user-growth').catch(()=>null),
      http.get('/admin/analytics/teacher-stats').catch(()=>null),
    ]).then(([s,g,t]) => {
      setStats(s?.data)
      setGrowth(g?.data)
      setTStats(t?.data)
    }).finally(() => setL(false))
  }, [])

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spin c='#818cf8' s={28}/></div>

  const teacherTotal = (tStats?.pending||0) + (tStats?.approved||0) + (tStats?.rejected||0)
  const tBars = [
    { l:'Pending',  v:tStats?.pending||0,  c:'#fbbf24', b:'245,158,11' },
    { l:'Approved', v:tStats?.approved||0, c:'#34d399', b:'16,185,129' },
    { l:'Rejected', v:tStats?.rejected||0, c:'#f87171', b:'239,68,68' },
  ]
  const maxT = Math.max(...tBars.map(b => b.v), 1)

  const userBars = [
    { l:'Last 7 days',  v:growth?.new_users_last_7_days||0,  c:'#818cf8' },
    { l:'Last 30 days', v:growth?.new_users_last_30_days||0, c:'#7dd3fc' },
    { l:'Total Users',  v:stats?.total_users||0,             c:'#c084fc' },
  ]
  const maxU = Math.max(...userBars.map(b => b.v), 1)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
      <div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.03em', marginBottom:4 }}>Analytics</h2>
        <p style={{ fontSize:13, color:'rgba(240,244,255,0.35)', fontFamily:"'DM Sans',sans-serif" }}>
          Platform growth and performance metrics
        </p>
      </div>

      {/* Big KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { l:'Total Users',    v:stats?.total_users??'—',    c:'56,189,248',  ic:IC.users    },
          { l:'Total Teachers', v:stats?.total_teachers??'—', c:'16,185,129',  ic:IC.teacher  },
          { l:'Total Sessions', v:stats?.total_sessions??'—', c:'99,102,241',  ic:IC.chart    },
          { l:'Total Ratings',  v:stats?.total_ratings??'—',  c:'245,158,11',  ic:IC.rating   },
        ].map(({ l, v, c, ic }) => (
          <div key={l} className="stat-card" style={{ padding:'22px', borderRadius:16,
            background:`linear-gradient(145deg,rgba(${c},0.12) 0%,rgba(${c},0.04) 100%)`,
            border:`1px solid rgba(${c},0.22)`, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-16, right:-16, width:80, height:80, borderRadius:'50%',
              background:`radial-gradient(circle,rgba(${c},0.3) 0%,transparent 65%)`, pointerEvents:'none' }}/>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <span style={{ fontSize:9.5, fontWeight:700, color:`rgba(${c},0.7)`,
                letterSpacing:'0.12em', textTransform:'uppercase' }}>{l}</span>
              <div style={{ width:30, height:30, borderRadius:9, background:`rgba(${c},0.15)`,
                border:`1px solid rgba(${c},0.25)`, display:'flex', alignItems:'center',
                justifyContent:'center', color:`rgb(${c})` }}>
                <I d={ic} s={14}/>
              </div>
            </div>
            <div style={{ fontSize:42, fontWeight:900, color:'#f0f4ff', letterSpacing:'-0.05em',
              lineHeight:1, fontVariantNumeric:'tabular-nums', animation:'acountin 0.5s both' }}>
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>

        {/* User Growth Chart */}
        <div className="acard" style={{ padding:'24px' }}>
          <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(240,244,255,0.28)',
            letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:20 }}>User Growth</div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {userBars.map(({ l, v, c }) => (
              <div key={l}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                  <span style={{ fontSize:12.5, color:'rgba(240,244,255,0.5)', fontFamily:"'DM Sans',sans-serif" }}>{l}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:'#f0f4ff' }}>{v}</span>
                </div>
                <div style={{ height:10, borderRadius:99, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:99, background:`linear-gradient(90deg,${c},${c}88)`,
                    width:`${Math.round((v/maxU)*100)}%`, transition:'width 1s cubic-bezier(0.22,1,0.36,1)' }}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:12, marginTop:20 }}>
            {[
              { l:`+${growth?.new_users_last_7_days||0}`, sub:'This week', c:'#818cf8' },
              { l:`+${growth?.new_users_last_30_days||0}`, sub:'This month', c:'#7dd3fc' },
            ].map(({ l, sub, c }) => (
              <div key={sub} style={{ flex:1, padding:'12px 14px', borderRadius:11,
                background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize:22, fontWeight:900, color:c, marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:11, color:'rgba(240,244,255,0.3)', fontFamily:"'DM Sans',sans-serif" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Stats Chart */}
        <div className="acard" style={{ padding:'24px' }}>
          <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(240,244,255,0.28)',
            letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:20 }}>Teacher Applications</div>

          {/* Donut-style visual */}
          <div style={{ display:'flex', gap:16, marginBottom:20 }}>
            {tBars.map(({ l, v, c, b }) => (
              <div key={l} style={{ flex:1, padding:'16px', borderRadius:12,
                background:`rgba(${b},0.08)`, border:`1px solid rgba(${b},0.2)` }}>
                <div style={{ fontSize:32, fontWeight:900, color:c, letterSpacing:'-0.04em',
                  lineHeight:1, marginBottom:4 }}>{v}</div>
                <div style={{ fontSize:11, color:'rgba(240,244,255,0.4)', fontFamily:"'DM Sans',sans-serif" }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {tBars.map(({ l, v, c, b }) => (
              <div key={l}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:'rgba(240,244,255,0.45)', fontFamily:"'DM Sans',sans-serif" }}>{l}</span>
                  <span style={{ fontSize:11, color:'rgba(240,244,255,0.3)', fontFamily:"'DM Sans',sans-serif" }}>
                    {teacherTotal ? Math.round((v/teacherTotal)*100) : 0}%
                  </span>
                </div>
                <div style={{ height:7, borderRadius:99, background:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:99, background:`linear-gradient(90deg,rgb(${b}),rgba(${b},0.6))`,
                    width:`${teacherTotal ? Math.round((v/teacherTotal)*100) : 0}%`,
                    transition:'width 1s cubic-bezier(0.22,1,0.36,1)' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform health */}
      <div className="acard" style={{ padding:'24px' }}>
        <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(240,244,255,0.28)',
          letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:18 }}>Platform Health</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
          {[
            { l:'Banned Users',    v:stats?.banned_users??0,       c:'239,68,68',  ok:stats?.banned_users===0 },
            { l:'Active Sessions', v:stats?.active_sessions??0,    c:'16,185,129', ok:true },
            { l:'Total Courses',   v:stats?.total_courses??0,      c:'99,102,241', ok:true },
            { l:'Pending Reviews', v:tStats?.pending??0,           c:'245,158,11', ok:tStats?.pending===0 },
          ].map(({ l, v, c, ok }) => (
            <div key={l} style={{ padding:'16px', borderRadius:12,
              background:`rgba(${c},0.07)`, border:`1px solid rgba(${c},0.18)` }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:`rgb(${c})`,
                  boxShadow:`0 0 8px rgba(${c},0.9)`, animation:ok?'none':'apulse 2s infinite' }}/>
                <span style={{ fontSize:10, fontWeight:700, color:`rgba(${c},0.7)`,
                  letterSpacing:'0.1em', textTransform:'uppercase' }}>{l}</span>
              </div>
              <div style={{ fontSize:34, fontWeight:900, color:'#f0f4ff', letterSpacing:'-0.04em' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════ */
function Dashboard({ goPage }) {
  const [stats,   setStats]   = useState(null)
  const [growth,  setGrowth]  = useState(null)
  const [users,   setUsers]   = useState([])
  const [loading, setL]       = useState(true)

  const load = useCallback(() => {
    setL(true)
    Promise.all([
      http.get('/admin/analytics/dashboard').catch(()=>null),
      http.get('/admin/analytics/user-growth').catch(()=>null),
      http.get('/admin/users/').catch(()=>({data:[]})),
    ]).then(([s,g,u]) => {
      setStats(s?.data)
      setGrowth(g?.data)
      setUsers((u?.data||[]).slice(0,6))
    }).finally(() => setL(false))
  }, [])

  useEffect(() => { load() }, [load])

  const STAT_CARDS = [
    { l:'Total Users',    v:stats?.total_users??'—',              c:'56,189,248', ic:IC.users,   pg:'users'    },
    { l:'Total Teachers', v:stats?.total_teachers??'—',           c:'16,185,129', ic:IC.teacher, pg:'teachers' },
    { l:'Pending',        v:stats?.pending_teacher_requests??'—', c:'245,158,11', ic:IC.notif,   pg:'teachers' },
    { l:'Approved',       v:stats?.approved_teachers??'—',        c:'99,102,241', ic:IC.check,   pg:'teachers' },
    { l:'Rejected',       v:stats?.rejected_teachers??'—',        c:'168,85,247', ic:IC.x,       pg:'teachers' },
    { l:'Banned Users',   v:stats?.banned_users??'—',             c:'239,68,68',  ic:IC.ban,     pg:'users'    },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Welcome banner */}
      <div style={{ borderRadius:20, overflow:'hidden', position:'relative',
        background:'linear-gradient(135deg,#06081e 0%,#0b0f3c 50%,#06081e 100%)',
        border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 12px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ position:'absolute', top:-50, left:-50, width:300, height:300, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(239,68,68,0.12) 0%,transparent 65%)',
          pointerEvents:'none', animation:'afloat1 12s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', bottom:-40, right:60, width:260, height:260, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 65%)',
          pointerEvents:'none', animation:'afloat2 15s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)',
          backgroundSize:'28px 28px', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2.5,
          background:'linear-gradient(90deg,transparent,#ef4444,#a855f7,#6366f1,transparent)',
          backgroundSize:'300% 100%', animation:'aborrun 5s linear infinite' }}/>

        <div style={{ position:'relative', padding:'28px 34px',
          display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'3px 12px',
                borderRadius:100, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444',
                  boxShadow:'0 0 8px rgba(239,68,68,0.9)', animation:'apulse 2.5s infinite' }}/>
                <span style={{ fontSize:10, fontWeight:700, color:'#f87171', letterSpacing:'0.1em', textTransform:'uppercase' }}>Admin Panel</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'3px 12px',
                borderRadius:100, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.22)' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#10b981',
                  boxShadow:'0 0 8px rgba(16,185,129,0.9)', animation:'apulse 2.5s 0.5s infinite' }}/>
                <span style={{ fontSize:10, fontWeight:700, color:'#6ee7b7', letterSpacing:'0.1em', textTransform:'uppercase' }}>Live</span>
              </div>
            </div>
            <h1 style={{ fontSize:30, fontWeight:900, color:'#f0f4ff', letterSpacing:'-0.04em', marginBottom:8, lineHeight:1 }}>
              Point2Learn Admin
            </h1>
            <p style={{ fontSize:13.5, color:'rgba(240,244,255,0.38)', fontFamily:"'DM Sans',sans-serif",
              lineHeight:1.6, maxWidth:460 }}>
              Full control over users, teachers, sessions, and platform integrity.
            </p>
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              {[['Users','users','56,189,248'],['Teachers','teachers','16,185,129'],['Analytics','analytics','99,102,241']].map(([l,pg,c])=>(
                <button key={pg} onClick={()=>goPage(pg)} style={{
                  padding:'8px 16px', borderRadius:9, fontSize:12.5, fontWeight:700,
                  background:`rgba(${c},0.12)`, border:`1px solid rgba(${c},0.28)`,
                  color:`rgb(${c})`, cursor:'pointer', fontFamily:"'Sora',sans-serif",
                  transition:'all 0.18s' }}
                  onMouseOver={e=>{e.currentTarget.style.background=`rgba(${c},0.22)`}}
                  onMouseOut={e=>{e.currentTarget.style.background=`rgba(${c},0.12)`}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:9, minWidth:200 }}>
            {[
              { l:'New users (7d)',  v:growth?.new_users_last_7_days??'—',  c:'#7dd3fc', b:'56,189,248' },
              { l:'New users (30d)', v:growth?.new_users_last_30_days??'—', c:'#818cf8', b:'99,102,241' },
            ].map(({ l, v, c, b }) => (
              <div key={l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'11px 16px', borderRadius:11, background:`rgba(${b},0.07)`, border:`1px solid rgba(${b},0.18)` }}>
                <span style={{ fontSize:12, color:'rgba(240,244,255,0.4)', fontFamily:"'DM Sans',sans-serif" }}>{l}</span>
                <span style={{ fontSize:20, fontWeight:900, color:c, fontVariantNumeric:'tabular-nums' }}>{v}</span>
              </div>
            ))}
            <button onClick={load} style={{ padding:'9px 14px', borderRadius:10, fontSize:12.5, fontWeight:600,
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
              color:'rgba(240,244,255,0.4)', cursor:'pointer', display:'flex', alignItems:'center', gap:7,
              fontFamily:"'Sora',sans-serif", transition:'all 0.15s' }}
              onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)';e.currentTarget.style.color='#f0f4ff'}}
              onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='rgba(240,244,255,0.4)'}}>
              <I d={IC.refresh} s={13}/> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:48 }}><Spin c='#f87171' s={28}/></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:14 }}>
          {STAT_CARDS.map(({ l, v, c, ic, pg }) => (
            <div key={l} className="stat-card" onClick={() => goPage(pg)}
              style={{ padding:'20px', borderRadius:16, cursor:'pointer', position:'relative', overflow:'hidden',
                background:`linear-gradient(150deg,rgba(${c},0.13) 0%,rgba(${c},0.04) 100%)`,
                border:`1.5px solid rgba(${c},0.2)`,
                boxShadow:`0 4px 20px rgba(${c},0.08),inset 0 1px 0 rgba(255,255,255,0.05)` }}
              onMouseOver={e=>{e.currentTarget.style.borderColor=`rgba(${c},0.4)`;e.currentTarget.style.boxShadow=`0 16px 40px rgba(${c},0.2)`}}
              onMouseOut={e=>{e.currentTarget.style.borderColor=`rgba(${c},0.2)`;e.currentTarget.style.boxShadow=`0 4px 20px rgba(${c},0.08)`}}>
              <div style={{ position:'absolute', top:-15, right:-15, width:75, height:75, borderRadius:'50%',
                background:`radial-gradient(circle,rgba(${c},0.28) 0%,transparent 65%)`, pointerEvents:'none' }}/>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <span style={{ fontSize:9.5, fontWeight:700, color:`rgba(${c},0.7)`,
                  letterSpacing:'0.12em', textTransform:'uppercase' }}>{l}</span>
                <div style={{ width:30, height:30, borderRadius:9, background:`rgba(${c},0.15)`,
                  border:`1px solid rgba(${c},0.26)`, color:`rgb(${c})`,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <I d={ic} s={13}/>
                </div>
              </div>
              <div style={{ fontSize:42, fontWeight:900, color:'#f0f4ff', letterSpacing:'-0.05em',
                lineHeight:1, fontVariantNumeric:'tabular-nums',
                textShadow:`0 0 28px rgba(${c},0.45)` }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent users table */}
      <div className="acard" style={{ padding:'22px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <span style={{ fontSize:10.5, fontWeight:700, color:'rgba(240,244,255,0.26)',
            letterSpacing:'0.12em', textTransform:'uppercase' }}>Recent Registrations</span>
          <button onClick={() => goPage('users')} style={{
            fontSize:12, color:'#818cf8', background:'rgba(99,102,241,0.08)',
            border:'1px solid rgba(99,102,241,0.22)', padding:'4px 12px', borderRadius:7,
            cursor:'pointer', fontWeight:600, fontFamily:"'Sora',sans-serif", transition:'all 0.15s' }}
            onMouseOver={e=>e.currentTarget.style.background='rgba(99,102,241,0.18)'}
            onMouseOut={e=>e.currentTarget.style.background='rgba(99,102,241,0.08)'}>
            View All
          </button>
        </div>
        <table className="tbl">
          <thead>
            <tr>{['User','Email','Role','Status','Joined'].map(h => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding:'40px', textAlign:'center', color:'rgba(240,244,255,0.2)' }}>No users</td></tr>
            ) : users.map(u => (
              <tr key={u._id} className="tr">
                <td className="td">
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0,
                      background:`linear-gradient(135deg,#312e81,#4f46e5)`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:13, fontWeight:700, color:'#f0f4ff' }}>
                      {(u.name||'?').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight:600, color:'#f0f4ff' }}>{u.name||'—'}</span>
                  </div>
                </td>
                <td className="td" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>{u.email||'—'}</td>
                <td className="td">
                  <span className="badge" style={{
                    color:u.role==='teacher'?'#34d399':'#818cf8',
                    background:u.role==='teacher'?'rgba(16,185,129,0.1)':'rgba(99,102,241,0.1)',
                    border:`1px solid ${u.role==='teacher'?'rgba(16,185,129,0.22)':'rgba(99,102,241,0.22)'}`,
                    textTransform:'capitalize' }}>{u.role||'user'}</span>
                </td>
                <td className="td">
                  {(() => {
                    const st = !!u.is_banned ? 'banned' : u.payment_status === 'paid' ? 'active' : 'inactive'
                    const sc = { active:['#34d399','16,185,129'], inactive:['#94a3b8','100,116,139'], banned:['#f87171','239,68,68'] }[st]
                    return (
                      <span className="badge" style={{
                        color:sc[0], background:`rgba(${sc[1]},0.1)`,
                        border:`1px solid rgba(${sc[1]},0.22)` }}>
                        <div style={{ width:5, height:5, borderRadius:'50%', background:sc[0] }}/>
                        {st === 'active' ? 'Active' : st === 'inactive' ? 'Inactive' : 'Banned'}
                      </span>
                    )
                  })()}
                </td>
                <td className="td" style={{ fontSize:12, fontFamily:"'DM Sans',sans-serif" }}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   USERS PAGE  — fixed blank bug + proper status
══════════════════════════════════════════════════════ */
function UsersPage() {
  const [users,   setUsers]   = useState([])
  const [loading, setL]       = useState(true)
  const [actingId, setActing] = useState(null)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')

  const load = useCallback((silent = false) => {
    if (!silent) setL(true)
    return http.get('/admin/users/')
      .then(r => setUsers(r.data || []))
      .catch(() => toast('Failed to load users', 'error'))
      .finally(() => setL(false))
  }, [])

  useEffect(() => { load() }, [load])

  const doAction = async (userId, fn, successMsg) => {
    setActing(userId)
    try {
      await fn()
      toast(successMsg, 'success')
      await load(true)
    } catch (e) {
      toast(e.response?.data?.detail || 'Action failed', 'error')
    } finally {
      setActing(null)
    }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const mq = !q || (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q)
    const banned = !!u.is_banned
    const paid   = u.payment_status === 'paid'
    const mf = filter === 'all'
      || (filter === 'banned'   && banned)
      || (filter === 'active'   && !banned && paid)
      || (filter === 'inactive' && !banned && !paid)
      || (filter === 'teacher'  && u.role === 'teacher')
    return mq && mf
  })

  const counts = {
    all:      users.length,
    active:   users.filter(u => !u.is_banned && u.payment_status === 'paid').length,
    inactive: users.filter(u => !u.is_banned && u.payment_status !== 'paid').length,
    teacher:  users.filter(u => u.role === 'teacher').length,
    banned:   users.filter(u => !!u.is_banned).length,
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.03em', marginBottom:4 }}>User Management</h2>
          <p style={{ fontSize:13, color:'rgba(240,244,255,0.35)', fontFamily:"'DM Sans',sans-serif" }}>
            {users.length} registered users
          </p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          {/* Filter pills */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:3, gap:2 }}>
            {[['all','All'],['active','Active'],['inactive','Inactive'],['teacher','Teachers'],['banned','Banned']].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)} className="tab-btn" style={{
                background: filter===v ? 'rgba(239,68,68,0.18)' : 'transparent',
                color: filter===v ? '#f87171' : 'rgba(240,244,255,0.4)',
                display:'flex', alignItems:'center', gap:6 }}>
                {l}
                <span style={{ fontSize:10, background: filter===v?'rgba(239,68,68,0.25)':'rgba(255,255,255,0.07)',
                  color: filter===v?'#fca5a5':'rgba(240,244,255,0.3)',
                  padding:'1px 6px', borderRadius:5, fontWeight:800 }}>{counts[v]}</span>
              </button>
            ))}
          </div>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
              color:'rgba(240,244,255,0.22)', pointerEvents:'none' }}><I d={IC.search} s={13}/></span>
            <input className="search-inp" placeholder="Search name or email..."
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <button onClick={load} style={{ padding:'9px 12px', borderRadius:10,
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
            color:'rgba(240,244,255,0.4)', cursor:'pointer', transition:'all 0.15s' }}
            onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)';e.currentTarget.style.color='#f0f4ff'}}
            onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='rgba(240,244,255,0.4)'}}>
            <I d={IC.refresh} s={14}/>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spin c='#f87171' s={24}/></div>
      ) : (
        <div className="acard" style={{ overflow:'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>{['#','User','Email','Role','Status','Joined','Actions'].map(h => <th key={h} className="th">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:'48px', textAlign:'center',
                  color:'rgba(240,244,255,0.2)', fontFamily:"'DM Sans',sans-serif" }}>
                  No users match the current filter
                </td></tr>
              ) : filtered.map((u, i) => {
                const isBanned = !!u.is_banned
                return (
                  <tr key={u._id} className="tr">
                    <td className="td" style={{ color:'rgba(240,244,255,0.2)', width:40 }}>{i+1}</td>
                    <td className="td">
                      <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                        <div style={{ width:35, height:35, borderRadius:'50%', flexShrink:0,
                          background: isBanned ? 'linear-gradient(135deg,#7f1d1d,#991b1b)' : 'linear-gradient(135deg,#312e81,#4f46e5)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:14, fontWeight:700, color:'#f0f4ff',
                          boxShadow: isBanned ? '0 0 0 2px rgba(239,68,68,0.3)' : 'none' }}>
                          {(u.name||'?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, color:'#f0f4ff', fontSize:13.5 }}>{u.name||'—'}</div>
                          {isBanned && <div style={{ fontSize:10, color:'#f87171', fontWeight:700 }}>BANNED</div>}
                        </div>
                      </div>
                    </td>
                    <td className="td" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>{u.email||'—'}</td>
                    <td className="td">
                      <span className="badge" style={{
                        color:u.role==='teacher'?'#34d399':u.role==='admin'?'#f87171':'#818cf8',
                        background:u.role==='teacher'?'rgba(16,185,129,0.1)':u.role==='admin'?'rgba(239,68,68,0.1)':'rgba(99,102,241,0.1)',
                        border:`1px solid ${u.role==='teacher'?'rgba(16,185,129,0.22)':u.role==='admin'?'rgba(239,68,68,0.22)':'rgba(99,102,241,0.22)'}`,
                        textTransform:'capitalize' }}>
                        {u.role||'user'}
                      </span>
                    </td>
                    <td className="td">
                      {(() => {
                        const st = isBanned ? 'banned' : u.payment_status === 'paid' ? 'active' : 'inactive'
                        const sc = { active:['#34d399','16,185,129'], inactive:['#94a3b8','100,116,139'], banned:['#f87171','239,68,68'] }[st]
                        return (
                          <span className="badge" style={{
                            color:sc[0], background:`rgba(${sc[1]},0.12)`,
                            border:`1px solid rgba(${sc[1]},0.3)` }}>
                            <div style={{ width:6, height:6, borderRadius:'50%',
                              background: st === 'active' ? '#10b981' : st === 'inactive' ? '#64748b' : '#ef4444',
                              boxShadow:`0 0 6px ${st === 'active' ? 'rgba(16,185,129,0.8)' : st === 'inactive' ? 'rgba(100,116,139,0.6)' : 'rgba(239,68,68,0.8)'}` }}/>
                            {st === 'active' ? 'Active' : st === 'inactive' ? 'Inactive' : 'Banned'}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="td" style={{ fontSize:12, fontFamily:"'DM Sans',sans-serif" }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                    </td>
                    <td className="td">
                      {actingId === u._id ? (
                        <div style={{ padding:'4px' }}><Spin c='#f87171' s={16}/></div>
                      ) : (
                        <div style={{ display:'flex', gap:7 }}>
                          <button className="abtn"
                            onClick={() => doAction(
                              u._id,
                              () => http.put(`/admin/users/${isBanned ? 'unban' : 'ban'}/${u._id}`),
                              isBanned ? `${u.name} unbanned` : `${u.name} banned`
                            )}
                            style={{
                              background: isBanned ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                              color:      isBanned ? '#34d399' : '#fbbf24',
                              border:`1px solid ${isBanned ? 'rgba(16,185,129,0.28)' : 'rgba(245,158,11,0.28)'}`,
                            }}>
                            <I d={isBanned ? IC.check : IC.ban} s={12}/>
                            {isBanned ? 'Unban' : 'Ban'}
                          </button>
                          <button className="abtn"
                            onClick={() => {
                              if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return
                              doAction(u._id, () => http.delete(`/admin/users/${u._id}`), `${u.name} deleted`)
                            }}
                            style={{ background:'rgba(239,68,68,0.09)', color:'#f87171', border:'1px solid rgba(239,68,68,0.24)' }}>
                            <I d={IC.trash} s={12}/>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TEACHERS PAGE
══════════════════════════════════════════════════════ */
function TeachersPage() {
  const [teachers, setTeachers] = useState([])
  const [loading,  setL]        = useState(true)
  const [actingId, setActing]   = useState(null)
  const [tab,      setTab]       = useState('pending')

  const load = () => http.get('/admin/teachers/all')
    .then(r => setTeachers(r.data || []))
    .catch(() => toast('Failed to load', 'error'))
    .finally(() => setL(false))

  useEffect(() => { load() }, [])

  const act = async (fn, id, msg) => {
    setActing(id)
    try { await fn(); toast(msg, 'success'); load() }
    catch (e) { toast(e.response?.data?.detail || 'Action failed', 'error') }
    finally { setActing(null) }
  }

  const filtered  = teachers.filter(t => tab === 'all' || t.teacher_verification?.status === tab)
  const counts    = { pending:0, approved:0, rejected:0, all:teachers.length }
  teachers.forEach(t => { const s = t.teacher_verification?.status; if(s) counts[s] = (counts[s]||0)+1 })
  const ST = { pending:{c:'#fbbf24',b:'245,158,11'}, approved:{c:'#34d399',b:'16,185,129'}, rejected:{c:'#f87171',b:'239,68,68'} }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.03em', marginBottom:4 }}>Teacher Verification</h2>
        <p style={{ fontSize:13, color:'rgba(240,244,255,0.35)', fontFamily:"'DM Sans',sans-serif" }}>Review and approve credential applications</p>
      </div>
      <div style={{ display:'flex', gap:0, background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:3, width:'fit-content' }}>
        {[['pending','Pending','245,158,11'],['approved','Approved','16,185,129'],['rejected','Rejected','239,68,68'],['all','All','99,102,241']].map(([v,l,b])=>(
          <button key={v} onClick={() => setTab(v)} className="tab-btn" style={{
            background:tab===v?`rgba(${b},0.18)`:'transparent',
            color:tab===v?`rgb(${b})`:'rgba(240,244,255,0.4)',
            display:'flex', alignItems:'center', gap:7 }}>
            {l}
            {counts[v]>0&&<span style={{ fontSize:10.5, fontWeight:800, padding:'1px 7px', borderRadius:5,
              background:`rgba(${b},0.2)`, color:`rgb(${b})` }}>{counts[v]}</span>}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spin c='#f87171' s={24}/></div>
      ) : filtered.length === 0 ? (
        <div className="acard" style={{ padding:'60px', textAlign:'center',
          color:'rgba(240,244,255,0.2)', fontFamily:"'DM Sans',sans-serif" }}>
          No {tab} applications
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {filtered.map(t => {
            const v  = t.teacher_verification || {}
            const st = ST[v.status] || ST.pending
            return (
              <div key={t._id} style={{ borderRadius:16, padding:'22px 24px', position:'relative', overflow:'hidden',
                background:`linear-gradient(145deg,rgba(${st.b},0.08) 0%,rgba(${st.b},0.02) 100%)`,
                border:`1px solid rgba(${st.b},0.22)`,
                boxShadow:`0 4px 20px rgba(${st.b},0.07)` }}>
                <div style={{ position:'absolute', top:-20, right:-20, width:90, height:90, borderRadius:'50%',
                  background:`radial-gradient(circle,rgba(${st.b},0.18) 0%,transparent 65%)`, pointerEvents:'none' }}/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:20, alignItems:'start' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:10 }}>
                      <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                        background:'linear-gradient(135deg,#312e81,#4f46e5)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:17, fontWeight:800, color:'#f0f4ff' }}>
                        {(v.first_name||t.name||'?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize:14.5, fontWeight:700, color:'#f0f4ff' }}>
                          {v.first_name?`${v.first_name} ${v.last_name||''}`.trim():t.name||'—'}
                        </div>
                        <div style={{ fontSize:12, color:'rgba(240,244,255,0.38)', fontFamily:"'DM Sans',sans-serif" }}>
                          {t.email||'—'}
                        </div>
                      </div>
                    </div>
                    <span className="badge" style={{ color:st.c, background:`rgba(${st.b},0.12)`,
                      border:`1px solid rgba(${st.b},0.3)`, textTransform:'capitalize' }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:st.c }}/>{v.status||'pending'}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(240,244,255,0.25)',
                      letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:7 }}>Institution</div>
                    <div style={{ fontSize:13.5, fontWeight:600, color:'rgba(240,244,255,0.75)', marginBottom:3 }}>{v.institution_name||'—'}</div>
                    <div style={{ fontSize:12, color:'rgba(240,244,255,0.4)', fontFamily:"'DM Sans',sans-serif" }}>{v.institution_type||'—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(240,244,255,0.25)',
                      letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:7 }}>Background</div>
                    <div style={{ fontSize:13.5, fontWeight:600, color:'rgba(240,244,255,0.75)', marginBottom:3 }}>{v.qualification||'—'}</div>
                    <div style={{ fontSize:12, color:'rgba(240,244,255,0.4)', fontFamily:"'DM Sans',sans-serif" }}>{v.experience_years||0} yrs exp</div>
                    {v.linkedin_url&&<a href={v.linkedin_url} target="_blank" rel="noreferrer"
                      style={{ fontSize:11.5, color:'#7dd3fc', textDecoration:'none', display:'block', marginTop:4 }}>LinkedIn</a>}
                    {v.demo_video_url&&<a href={v.demo_video_url} target="_blank" rel="noreferrer"
                      style={{ fontSize:11.5, color:'#c084fc', textDecoration:'none', display:'block', marginTop:2 }}>Demo Video</a>}
                  </div>
                  {v.status==='pending' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:8, minWidth:120 }}>
                      {actingId===t._id ? <Spin c='#34d399' s={18}/> : (
                        <>
                          <button className="abtn" onClick={() => act(() => http.put(`/admin/teachers/approve/${t._id}`), t._id, 'Teacher approved!')}
                            style={{ background:'rgba(16,185,129,0.12)', color:'#34d399',
                              border:'1px solid rgba(16,185,129,0.3)', padding:'9px 16px', fontSize:13 }}>
                            <I d={IC.check} s={13}/> Approve
                          </button>
                          <button className="abtn" onClick={() => act(() => http.put(`/admin/teachers/reject/${t._id}`), t._id, 'Application rejected')}
                            style={{ background:'rgba(239,68,68,0.09)', color:'#f87171',
                              border:'1px solid rgba(239,68,68,0.26)', padding:'9px 16px', fontSize:13 }}>
                            <I d={IC.x} s={13}/> Reject
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {v.bio && <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid rgba(${st.b},0.15)`,
                  fontSize:13, color:'rgba(240,244,255,0.4)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.65 }}>{v.bio}</div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   RATINGS
══════════════════════════════════════════════════════ */
function RatingsPage() {
  const [ratings,setRatings]=useState([])
  const [susp,setSusp]=useState([])
  const [loading,setL]=useState(true)
  const [tab,setTab]=useState('all')
  useEffect(()=>{
    Promise.all([http.get('/admin/ratings/all').catch(()=>({data:[]})),http.get('/admin/ratings/suspicious').catch(()=>({data:[]}))])
      .then(([r,s])=>{setRatings(r.data||[]);setSusp(s.data||[])}).finally(()=>setL(false))
  },[])
  const stars=n=>'★'.repeat(Math.max(0,n||0))+'☆'.repeat(Math.max(0,5-(n||0)))
  return(
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:800,color:'#f0f4ff',letterSpacing:'-0.03em',marginBottom:4}}>Ratings Monitor</h2>
        <p style={{fontSize:13,color:'rgba(240,244,255,0.35)',fontFamily:"'DM Sans',sans-serif"}}>Monitor session ratings and detect suspicious patterns</p>
      </div>
      {susp.length>0&&<div style={{padding:'12px 16px',borderRadius:12,background:'rgba(245,158,11,0.08)',
        border:'1px solid rgba(245,158,11,0.28)',display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:'#fbbf24',boxShadow:'0 0 8px rgba(245,158,11,0.9)'}}/>
        <span style={{fontSize:13,color:'#fde68a',fontFamily:"'DM Sans',sans-serif"}}><strong>{susp.length}</strong> user{susp.length!==1?'s':''} flagged for suspicious rating activity</span>
      </div>}
      <div style={{display:'flex',gap:0,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:3,width:'fit-content'}}>
        {[['all',`All (${ratings.length})`,'99,102,241'],['susp',`Suspicious (${susp.length})`,'245,158,11']].map(([v,l,b])=>(
          <button key={v} onClick={()=>setTab(v)} className="tab-btn" style={{background:tab===v?`rgba(${b},0.18)`:'transparent',color:tab===v?`rgb(${b})`:'rgba(240,244,255,0.4)'}}>{l}</button>
        ))}
      </div>
      {loading?<div style={{display:'flex',justifyContent:'center',padding:60}}><Spin c='#818cf8' s={24}/></div>:(
        <div className="acard" style={{overflow:'hidden'}}>
          <table className="tbl">
            <thead><tr>{(tab==='all'?['#','User ID','Rating','Review','Date']:['#','User ID','Total Ratings']).map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {(tab==='all'?ratings:susp).length===0?(
                <tr><td colSpan={5} style={{padding:'48px',textAlign:'center',color:'rgba(240,244,255,0.2)',fontFamily:"'DM Sans',sans-serif"}}>No data</td></tr>
              ):(tab==='all'?ratings:susp).map((r,i)=>(
                <tr key={i} className="tr">
                  <td className="td" style={{color:'rgba(240,244,255,0.22)',width:40}}>{i+1}</td>
                  <td className="td" style={{fontFamily:'monospace',fontSize:12}}>{String(r.user_id||r._id||'—').slice(-12)}</td>
                  {tab==='all'?(
                    <><td className="td"><span style={{color:'#fbbf24',fontSize:15,letterSpacing:1}}>{stars(r.rating||0)}</span>
                    <span style={{fontSize:11,color:'rgba(240,244,255,0.28)',marginLeft:6}}>({r.rating||0}/5)</span></td>
                    <td className="td" style={{maxWidth:280,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'DM Sans',sans-serif"}}>{r.review||'—'}</td>
                    <td className="td" style={{fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>{r.created_at?new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—'}</td></>
                  ):(
                    <td className="td"><span style={{fontSize:18,fontWeight:800,color:'#fbbf24'}}>{r.total_ratings}</span><span style={{fontSize:12,color:'rgba(240,244,255,0.35)',marginLeft:6}}>ratings</span></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   FAKE USERS
══════════════════════════════════════════════════════ */
function FakePage(){
  const [data,setData]=useState({sameip:[],spam:[],bulk:[]})
  const [loading,setL]=useState(true)
  const [tab,setTab]=useState('sameip')
  useEffect(()=>{
    Promise.all([
      http.get('/admin/fake-users/same-ip').catch(()=>({data:[]})),
      http.get('/admin/fake-users/rating-spam').catch(()=>({data:[]})),
      http.get('/admin/fake-users/recent-bulk').catch(()=>({data:[]})),
    ]).then(([ip,sp,bk])=>setData({sameip:ip.data||[],spam:sp.data||[],bulk:bk.data||[]})).finally(()=>setL(false))
  },[])
  const TABS=[['sameip','Same IP','data.sameip.length','239,68,68'],['spam','Rating Spam','data.spam.length','245,158,11'],['bulk','Bulk Signups 24h','data.bulk.length','99,102,241']]
  const rows=data[tab]||[]
  const tabCounts={sameip:data.sameip.length,spam:data.spam.length,bulk:data.bulk.length}
  return(
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div><h2 style={{fontSize:22,fontWeight:800,color:'#f0f4ff',letterSpacing:'-0.03em',marginBottom:4}}>Fake User Detection</h2>
      <p style={{fontSize:13,color:'rgba(240,244,255,0.35)',fontFamily:"'DM Sans',sans-serif"}}>Detect suspicious registrations and activity</p></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {[['sameip','Same IP Accounts','239,68,68'],['spam','Rating Spam','245,158,11'],['bulk','Bulk Signups 24h','99,102,241']].map(([v,l,b])=>(
          <button key={v} onClick={()=>setTab(v)} style={{padding:'20px',borderRadius:14,cursor:'pointer',textAlign:'left',
            background:tab===v?`rgba(${b},0.15)`:`rgba(${b},0.05)`,
            border:`1.5px solid ${tab===v?`rgba(${b},0.38)`:`rgba(${b},0.15)`}`,
            transition:'all 0.2s',boxShadow:tab===v?`0 8px 28px rgba(${b},0.15)`:'none',fontFamily:"'Sora',sans-serif"}}>
            <div style={{fontSize:36,fontWeight:900,color:`rgb(${b})`,letterSpacing:'-0.05em',marginBottom:6,
              textShadow:`0 0 20px rgba(${b},0.5)`}}>{tabCounts[v]}</div>
            <div style={{fontSize:12.5,fontWeight:600,color:'rgba(240,244,255,0.55)'}}>{l}</div>
            {tabCounts[v]>0&&<div style={{fontSize:11,color:`rgba(${b},0.65)`,marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>Click to review</div>}
          </button>
        ))}
      </div>
      {loading?<div style={{display:'flex',justifyContent:'center',padding:60}}><Spin c='#f87171' s={24}/></div>:rows.length===0?(
        <div className="acard" style={{padding:'60px',textAlign:'center'}}>
          <div style={{fontSize:32,marginBottom:10}}>✅</div>
          <div style={{fontSize:15,fontWeight:700,color:'#34d399',marginBottom:6}}>No suspicious activity detected</div>
          <div style={{fontSize:13,color:'rgba(240,244,255,0.3)',fontFamily:"'DM Sans',sans-serif"}}>This category is clean</div>
        </div>
      ):(
        <div className="acard" style={{overflow:'hidden'}}>
          <table className="tbl">
            <thead><tr>{Object.keys(rows[0]||{}).slice(0,4).map(k=><th key={k} className="th">{k.replace(/_/g,' ')}</th>)}</tr></thead>
            <tbody>{rows.map((row,i)=>(
              <tr key={i} className="tr">{Object.values(row).slice(0,4).map((v,j)=>(
                <td key={j} className="td" style={{maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'DM Sans',sans-serif"}}>
                  {typeof v==='object'?JSON.stringify(v).slice(0,50):String(v||'—')}
                </td>
              ))}</tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   NOTIFICATIONS — Fixed: user picker instead of raw ObjectId
══════════════════════════════════════════════════════ */
function NotifsPage() {
  const [tab,     setTab]     = useState('all')
  const [title,   setTitle]   = useState('')
  const [msg,     setMsg]     = useState('')
  const [loading, setL]       = useState(false)
  const [history, setHistory] = useState([])
  const [loadH,   setLoadH]   = useState(true)

  // User picker state
  const [allUsers,    setAllUsers]    = useState([])
  const [userSearch,  setUserSearch]  = useState('')
  const [selectedUser,setSelected]    = useState(null)
  const [showPicker,  setShowPicker]  = useState(false)
  const pickerRef = useRef()

  useEffect(() => {
    http.get('/admin/notifications/all').catch(()=>({data:[]})).then(r=>setHistory(r.data||[])).finally(()=>setLoadH(false))
    // Load users for picker
    http.get('/admin/users/').then(r => setAllUsers(r.data||[])).catch(()=>{})
  }, [])

  // Close picker on outside click
  useEffect(() => {
    const h = e => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filteredUsers = allUsers.filter(u => {
    const q = userSearch.toLowerCase()
    return !q || (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q)
  }).slice(0, 8)

  const send = async e => {
    e.preventDefault()
    if (tab === 'user' && !selectedUser) { toast('Please select a user', 'error'); return }
    setL(true)
    try {
      if (tab === 'all')       await http.post(`/admin/notifications/send-all?title=${encodeURIComponent(title)}&message=${encodeURIComponent(msg)}`)
      else if (tab==='teachers') await http.post(`/admin/notifications/send-teachers?title=${encodeURIComponent(title)}&message=${encodeURIComponent(msg)}`)
      else await http.post(`/admin/notifications/send-user/${selectedUser._id}?title=${encodeURIComponent(title)}&message=${encodeURIComponent(msg)}`)
      toast('Notification sent!', 'success')
      setTitle(''); setMsg(''); setSelected(null); setUserSearch('')
      http.get('/admin/notifications/all').then(r=>setHistory(r.data||[]))
    } catch(e) { toast(e.response?.data?.detail||'Failed', 'error') }
    setL(false)
  }

  const bgMap = { all:'linear-gradient(135deg,#4f46e5,#6366f1)', teachers:'linear-gradient(135deg,#065f46,#10b981)', user:'linear-gradient(135deg,#0e7490,#0ea5e9)' }
  const TABS  = [['all','All Users','99,102,241'],['teachers','Teachers','16,185,129'],['user','Specific User','56,189,248']]

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:22, alignItems:'start' }}>
      <div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.03em', marginBottom:4 }}>Send Notifications</h2>
        <p style={{ fontSize:13, color:'rgba(240,244,255,0.35)', marginBottom:20, fontFamily:"'DM Sans',sans-serif" }}>
          Broadcast or targeted messages to users
        </p>

        <div style={{ display:'flex', gap:0, background:'rgba(255,255,255,0.04)',
          border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:3, marginBottom:18 }}>
          {TABS.map(([v,l,b])=>(
            <button key={v} onClick={()=>{setTab(v);setSelected(null);setUserSearch('')}} className="tab-btn" style={{
              flex:1, background:tab===v?`rgba(${b},0.18)`:'transparent',
              color:tab===v?`rgb(${b})`:'rgba(240,244,255,0.4)', fontSize:12.5 }}>{l}</button>
          ))}
        </div>

        <div className="acard" style={{ padding:'22px' }}>
          <form onSubmit={send} style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* User picker — replaces raw ObjectId input */}
            {tab === 'user' && (
              <div>
                <label style={{ display:'block', fontSize:10.5, fontWeight:700,
                  color:'rgba(240,244,255,0.3)', marginBottom:8, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  Select User *
                </label>
                {selectedUser ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'12px 14px', borderRadius:11, background:'rgba(56,189,248,0.08)',
                    border:'1.5px solid rgba(56,189,248,0.35)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#0e7490,#0ea5e9)',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                        {(selectedUser.name||'?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize:13.5, fontWeight:600, color:'#f0f4ff' }}>{selectedUser.name}</div>
                        <div style={{ fontSize:11.5, color:'rgba(240,244,255,0.4)', fontFamily:"'DM Sans',sans-serif" }}>{selectedUser.email}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelected(null)} style={{
                      background:'none', border:'none', cursor:'pointer', color:'rgba(240,244,255,0.4)',
                      display:'flex', alignItems:'center' }}
                      onMouseOver={e=>e.currentTarget.style.color='#f87171'}
                      onMouseOut={e=>e.currentTarget.style.color='rgba(240,244,255,0.4)'}>
                      <I d={IC.close} s={15}/>
                    </button>
                  </div>
                ) : (
                  <div ref={pickerRef} style={{ position:'relative' }}>
                    <div style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)',
                      color:'rgba(240,244,255,0.22)', pointerEvents:'none' }}><I d={IC.search} s={13}/></div>
                    <input className="adm-inp" placeholder="Search by name or email..."
                      value={userSearch}
                      onChange={e => { setUserSearch(e.target.value); setShowPicker(true) }}
                      onFocus={() => setShowPicker(true)}
                      style={{ paddingLeft:36 }}/>
                    {showPicker && (
                      <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, zIndex:50,
                        background:'rgba(5,8,24,0.98)', border:'1px solid rgba(255,255,255,0.1)',
                        borderRadius:12, overflow:'hidden', boxShadow:'0 16px 48px rgba(0,0,0,0.6)',
                        backdropFilter:'blur(20px)', maxHeight:260, overflowY:'auto' }}>
                        {filteredUsers.length === 0 ? (
                          <div style={{ padding:'16px', textAlign:'center', color:'rgba(240,244,255,0.3)',
                            fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>No users found</div>
                        ) : filteredUsers.map(u => (
                          <button key={u._id} type="button" onClick={() => { setSelected(u); setShowPicker(false); setUserSearch('') }}
                            style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                              background:'transparent', border:'none', cursor:'pointer', textAlign:'left',
                              transition:'background 0.15s', borderBottom:'1px solid rgba(255,255,255,0.05)' }}
                            onMouseOver={e=>e.currentTarget.style.background='rgba(56,189,248,0.1)'}
                            onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                            <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0,
                              background:'linear-gradient(135deg,#312e81,#4f46e5)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:13, fontWeight:700, color:'#f0f4ff' }}>
                              {(u.name||'?').charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:13.5, fontWeight:600, color:'#f0f4ff' }}>{u.name||'—'}</div>
                              <div style={{ fontSize:11.5, color:'rgba(240,244,255,0.4)', fontFamily:"'DM Sans',sans-serif",
                                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email||'—'}</div>
                            </div>
                            <span className="badge" style={{
                              color:u.role==='teacher'?'#34d399':'#818cf8',
                              background:u.role==='teacher'?'rgba(16,185,129,0.1)':'rgba(99,102,241,0.1)',
                              border:`1px solid ${u.role==='teacher'?'rgba(16,185,129,0.22)':'rgba(99,102,241,0.22)'}`,
                              textTransform:'capitalize', fontSize:10 }}>{u.role||'user'}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label style={{ display:'block', fontSize:10.5, fontWeight:700,
                color:'rgba(240,244,255,0.3)', marginBottom:8, letterSpacing:'0.1em', textTransform:'uppercase' }}>Title *</label>
              <input className="adm-inp" placeholder="Notification title" value={title} onChange={e=>setTitle(e.target.value)} required/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:10.5, fontWeight:700,
                color:'rgba(240,244,255,0.3)', marginBottom:8, letterSpacing:'0.1em', textTransform:'uppercase' }}>Message *</label>
              <textarea className="adm-inp" placeholder="Message content..." value={msg}
                onChange={e=>setMsg(e.target.value)} required rows={4} style={{ resize:'vertical', lineHeight:1.6 }}/>
            </div>

            <div style={{ padding:'11px 14px', borderRadius:10, fontSize:13,
              background:tab==='all'?'rgba(99,102,241,0.07)':tab==='teachers'?'rgba(16,185,129,0.07)':'rgba(56,189,248,0.07)',
              border:`1px solid ${tab==='all'?'rgba(99,102,241,0.2)':tab==='teachers'?'rgba(16,185,129,0.2)':'rgba(56,189,248,0.2)'}`,
              color:'rgba(240,244,255,0.45)', fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:15 }}>{tab==='all'?'📢':tab==='teachers'?'🎓':'👤'}</span>
              {tab==='all'?'Sends to ALL registered users.':tab==='teachers'?'Sends to all verified teachers only.':
                selectedUser?`Sends to ${selectedUser.name} only.`:'Select a user above to send.'}
            </div>

            <button type="submit" disabled={loading || (tab==='user'&&!selectedUser)} style={{
              width:'100%', padding:'13px', fontSize:14, fontWeight:700, fontFamily:"'Sora',sans-serif",
              background: (loading||(tab==='user'&&!selectedUser)) ? 'rgba(255,255,255,0.06)' : bgMap[tab],
              color: (loading||(tab==='user'&&!selectedUser)) ? 'rgba(240,244,255,0.3)' : '#fff',
              border:'none', borderRadius:11, cursor: (loading||(tab==='user'&&!selectedUser)) ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.22s' }}
              onMouseOver={e=>{ if(!loading&&!(tab==='user'&&!selectedUser)) e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseOut={e=>{ e.currentTarget.style.transform='' }}>
              {loading ? <Spin s={15}/> : <><I d={IC.send} s={14}/> Send Notification</>}
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div>
        <h3 style={{ fontSize:13.5, fontWeight:700, color:'rgba(240,244,255,0.45)', marginBottom:14, marginTop:50 }}>
          Sent History
        </h3>
        <div className="acard" style={{ overflow:'hidden', maxHeight:560, overflowY:'auto' }}>
          {loadH ? <div style={{ display:'flex', justifyContent:'center', padding:40 }}><Spin c='#818cf8' s={20}/></div>
            : history.length===0 ? <div style={{ padding:'48px', textAlign:'center',
              color:'rgba(240,244,255,0.2)', fontFamily:"'DM Sans',sans-serif" }}>No notifications sent yet</div>
            : history.map((n,i) => {
              const c = n.type==='all'?'99,102,241':n.type==='teacher'?'16,185,129':'56,189,248'
              return (
                <div key={i} style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)',
                  display:'flex', gap:12, background:i%2===0?'transparent':'rgba(255,255,255,0.01)' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', marginTop:6, flexShrink:0,
                    background:`rgb(${c})`, boxShadow:`0 0 6px rgba(${c},0.8)` }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#f0f4ff', marginBottom:3 }}>{n.title}</div>
                    <div style={{ fontSize:12, color:'rgba(240,244,255,0.38)', marginBottom:6,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      fontFamily:"'DM Sans',sans-serif" }}>{n.message}</div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:5,
                        textTransform:'capitalize', color:`rgb(${c})`, background:`rgba(${c},0.1)`,
                        border:`1px solid rgba(${c},0.2)` }}>
                        {n.type==='all'?'All Users':n.type==='teacher'?'Teachers':'Single User'}
                      </span>
                      {n.created_at&&<span style={{ fontSize:11, color:'rgba(240,244,255,0.2)',
                        fontFamily:"'DM Sans',sans-serif" }}>
                        {new Date(n.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                      </span>}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════ */
function LoginPage({ onLogin }) {
  const [tab,  setTab]  = useState('login')
  const [email,setEmail]= useState('')
  const [pass, setPass] = useState('')
  const [err,  setErr]  = useState('')
  const [load, setL]    = useState(false)
  const go = t => { setTab(t); setErr(''); setEmail(''); setPass('') }
  const submit = async e => {
    e.preventDefault(); setL(true); setErr('')
    try {
      const body = new URLSearchParams()
      body.append('email', email); body.append('password', pass)
      const r = await http.post(tab==='login'?'/admin/login':'/admin/signup', body,
        { headers: { 'Content-Type':'application/x-www-form-urlencoded' } })
      if (tab==='login') { localStorage.setItem('admin_token', r.data.access_token); toast('Welcome back!','success'); onLogin() }
      else { toast('Account created! Sign in now.','success'); go('login') }
    } catch(e) {
      if (!e.response) setErr(`Cannot connect to backend at ${BACKEND}`)
      else setErr(e.response.data?.detail || 'Invalid credentials')
    }
    setL(false)
  }
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, position:'relative', overflow:'hidden',
      background:'radial-gradient(ellipse at 20% 50%,rgba(239,68,68,0.08) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(99,102,241,0.07) 0%,transparent 50%),#030612' }}>
      <div style={{ position:'absolute', top:'-15%', left:'-10%', width:500, height:500, borderRadius:'50%', pointerEvents:'none',
        background:'radial-gradient(circle,rgba(239,68,68,0.1) 0%,transparent 65%)', animation:'afloat1 11s ease-in-out infinite' }}/>
      <div style={{ position:'absolute', bottom:'-10%', right:'-8%', width:420, height:420, borderRadius:'50%', pointerEvents:'none',
        background:'radial-gradient(circle,rgba(99,102,241,0.09) 0%,transparent 65%)', animation:'afloat2 14s ease-in-out infinite' }}/>
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)',
        backgroundSize:'30px 30px', pointerEvents:'none' }}/>
      <div style={{ width:'100%', maxWidth:440, animation:'afadeup 0.5s both', position:'relative' }}>
        <div style={{ textAlign:'center', marginBottom:26 }}>
          <img src="/logo.png" alt="" style={{ height:52, objectFit:'contain', marginBottom:12 }}/>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'4px 16px',
            borderRadius:100, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444',
              boxShadow:'0 0 8px rgba(239,68,68,0.9)', animation:'apulse 2.5s infinite' }}/>
            <span style={{ fontSize:11, fontWeight:700, color:'#f87171', letterSpacing:'0.1em', textTransform:'uppercase' }}>Admin Control Panel</span>
          </div>
        </div>
        <div style={{ borderRadius:20, overflow:'hidden', background:'rgba(7,9,28,0.98)',
          border:'1px solid rgba(255,255,255,0.08)',
          boxShadow:'0 32px 80px rgba(0,0,0,0.65),inset 0 1px 0 rgba(255,255,255,0.07)', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2.5,
            background:'linear-gradient(90deg,transparent,#ef4444,#a855f7,#6366f1,transparent)',
            backgroundSize:'300% 100%', animation:'aborrun 5s linear infinite' }}/>
          <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'4px 4px 0' }}>
            {[['login','Sign In'],['signup','Sign Up']].map(([v,l]) => (
              <button key={v} onClick={() => go(v)} style={{ flex:1, padding:'13px', border:'none', cursor:'pointer',
                fontSize:13.5, fontWeight:700, fontFamily:"'Sora',sans-serif", background:'transparent',
                borderRadius:'10px 10px 0 0', color:tab===v?'#f87171':'rgba(240,244,255,0.3)',
                borderBottom:tab===v?'2px solid #ef4444':'2px solid transparent', transition:'all 0.18s' }}>{l}</button>
            ))}
          </div>
          <div style={{ padding:'30px 36px 34px' }}>
            <h1 style={{ fontSize:24, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.03em', marginBottom:4 }}>
              {tab==='login'?'Welcome back':'Create admin account'}
            </h1>
            <p style={{ fontSize:13, color:'rgba(240,244,255,0.35)', marginBottom:26,
              fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
              {tab==='login'?'Sign in to the Point2Learn admin panel.':'Register a new administrator.'}
            </p>
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:15 }}>
              <div><label style={{ display:'block', fontSize:10.5, fontWeight:700,
                color:'rgba(240,244,255,0.3)', marginBottom:8, letterSpacing:'0.1em', textTransform:'uppercase' }}>Email Address</label>
                <input className="adm-inp" type="email" placeholder="admin@point2learn.com" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus/></div>
              <div><label style={{ display:'block', fontSize:10.5, fontWeight:700,
                color:'rgba(240,244,255,0.3)', marginBottom:8, letterSpacing:'0.1em', textTransform:'uppercase' }}>Password</label>
                <input className="adm-inp" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} required/></div>
              {err && <div style={{ padding:'11px 14px', borderRadius:10, fontSize:13,
                background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171',
                fontFamily:"'DM Sans',sans-serif" }}>{err}</div>}
              <button type="submit" disabled={load} style={{ width:'100%', padding:'14px', fontSize:14.5,
                fontWeight:700, fontFamily:"'Sora',sans-serif",
                background: load ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#991b1b,#dc2626,#ef4444)',
                color: load ? 'rgba(240,244,255,0.3)' : '#fff', border:'none', borderRadius:12,
                cursor: load ? 'not-allowed' : 'pointer',
                boxShadow: load ? 'none' : '0 8px 32px rgba(239,68,68,0.32)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4,
                transition:'all 0.22s' }}
                onMouseOver={e=>{ if(!load){ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 16px 44px rgba(239,68,68,0.5)' }}}
                onMouseOut={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=load?'none':'0 8px 32px rgba(239,68,68,0.32)' }}>
                {load ? <Spin s={16}/> : tab==='login' ? 'Sign In to Admin' : 'Create Admin Account'}
              </button>
            </form>
            <p style={{ textAlign:'center', marginTop:18, fontSize:13,
              color:'rgba(240,244,255,0.25)', fontFamily:"'DM Sans',sans-serif" }}>
              {tab==='login'?"New admin? ":"Have an account? "}
              <button onClick={() => go(tab==='login'?'signup':'login')} style={{
                background:'none', border:'none', cursor:'pointer', color:'#f87171',
                fontWeight:700, fontSize:13, fontFamily:"'Sora',sans-serif" }}>
                {tab==='login'?'Sign up':'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════ */
export default function App() {
  const [token,    setToken]   = useState(() => localStorage.getItem('admin_token'))
  const [page,     setPage]    = useState('dashboard')
  const [sideOpen, setSide]    = useState(false)

  const logout = async () => {
    try { await http.post('/admin/logout') } catch {}
    localStorage.removeItem('admin_token')
    setToken(null); setPage('dashboard')
    toast('Signed out', 'info')
  }

  const goPage = (pg) => { setPage(pg); setSide(false) }

  const NAV = [
    { id:'dashboard', icon:IC.dash,    label:'Dashboard'            },
    { id:'users',     icon:IC.users,   label:'User Management'      },
    { id:'teachers',  icon:IC.teacher, label:'Teacher Verification' },
    { id:'ratings',   icon:IC.rating,  label:'Ratings Monitor'      },
    { id:'fake',      icon:IC.fake,    label:'Fake Detection'       },
    { id:'notifs',    icon:IC.notif,   label:'Notifications'        },
    { id:'analytics', icon:IC.chart,   label:'Analytics'            },
  ]
  const TITLES = {
    dashboard:'Dashboard', users:'User Management', teachers:'Teacher Verification',
    ratings:'Ratings Monitor', fake:'Fake Detection', notifs:'Notifications', analytics:'Analytics'
  }

  if (!token) return (
    <><style>{CSS}</style><Toasts/><LoginPage onLogin={() => setToken(localStorage.getItem('admin_token'))}/></>
  )

  return (
    <>
      <style>{CSS}</style>
      <Toasts/>
      <div style={{ display:'flex', minHeight:'100vh', background:'#030612', position:'relative' }}>

        {/* BG */}
        <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', inset:0,
            background:'radial-gradient(ellipse at 10% 50%,rgba(239,68,68,0.05) 0%,transparent 45%),radial-gradient(ellipse at 90% 10%,rgba(99,102,241,0.06) 0%,transparent 45%),#030612' }}/>
          <div style={{ position:'absolute', inset:0,
            backgroundImage:'linear-gradient(rgba(255,255,255,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.014) 1px,transparent 1px)',
            backgroundSize:'60px 60px' }}/>
        </div>

        {/* Sidebar overlay */}
        {sideOpen && <div onClick={() => setSide(false)} style={{ position:'fixed', inset:0, zIndex:55,
          background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)' }}/>}

        {/* Sidebar */}
        <aside style={{ position:'fixed', top:0, left:0, bottom:0, width:244, zIndex:60,
          background:'rgba(3,4,16,0.98)', borderRight:'1px solid rgba(255,255,255,0.07)',
          display:'flex', flexDirection:'column', backdropFilter:'blur(28px)',
          boxShadow:'6px 0 40px rgba(0,0,0,0.5)',
          transform: sideOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition:'transform 0.28s cubic-bezier(0.4,0,0.2,1)' }}>

          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)',
            display:'flex', alignItems:'center', gap:10 }}>
            <img src="/logo.png" alt="" style={{ height:36, objectFit:'contain' }}/>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'3px 10px',
              borderRadius:100, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.28)' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#ef4444',
                boxShadow:'0 0 6px rgba(239,68,68,0.9)', animation:'apulse 2.5s infinite' }}/>
              <span style={{ fontSize:9.5, fontWeight:700, color:'#f87171', letterSpacing:'0.1em', textTransform:'uppercase' }}>Admin</span>
            </div>
          </div>

          <nav style={{ flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
            {NAV.map(({ id, icon, label }) => (
              <button key={id} className={`nav-btn${page===id?' act':''}`} onClick={() => goPage(id)}>
                <span style={{ opacity:0.7, flexShrink:0 }}><I d={icon} s={15}/></span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div style={{ padding:'8px 8px 14px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            <button className="nav-btn" onClick={logout}
              style={{ color:'rgba(248,113,113,0.6)', width:'100%' }}
              onMouseOver={e=>{e.currentTarget.style.background='rgba(239,68,68,0.08)';e.currentTarget.style.color='#f87171'}}
              onMouseOut={e=>{e.currentTarget.style.background='';e.currentTarget.style.color='rgba(248,113,113,0.6)'}}>
              <span><I d={IC.logout} s={15}/></span><span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex:1, position:'relative', zIndex:1 }}>
          {/* Topbar */}
          <header style={{ position:'fixed', top:0, left:0, right:0, height:58, zIndex:40,
            background:'rgba(3,4,16,0.93)', borderBottom:'1px solid rgba(255,255,255,0.07)',
            backdropFilter:'blur(28px)', display:'flex', alignItems:'center',
            justifyContent:'space-between', padding:'0 26px',
            boxShadow:'0 4px 24px rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={() => setSide(o => !o)} style={{ width:36, height:36, borderRadius:9,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)',
                color:'rgba(240,244,255,0.45)', cursor:'pointer', transition:'all 0.15s' }}
                onMouseOver={e=>{e.currentTarget.style.background='rgba(239,68,68,0.12)';e.currentTarget.style.color='#f87171';e.currentTarget.style.borderColor='rgba(239,68,68,0.3)'}}
                onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='rgba(240,244,255,0.45)';e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'}}>
                <I d={IC.menu} s={18}/>
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:10.5, fontWeight:700, color:'rgba(240,244,255,0.2)',
                  letterSpacing:'0.12em', textTransform:'uppercase' }}>Admin</span>
                <span style={{ color:'rgba(255,255,255,0.08)', fontSize:16 }}>·</span>
                <span style={{ fontSize:14.5, fontWeight:700, color:'#f0f4ff', letterSpacing:'-0.01em' }}>
                  {TITLES[page]}
                </span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 14px',
                borderRadius:100, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444',
                  boxShadow:'0 0 8px rgba(239,68,68,0.8)', animation:'apulse 2.5s infinite' }}/>
                <span style={{ fontSize:10, fontWeight:700, color:'#f87171',
                  letterSpacing:'0.08em', textTransform:'uppercase' }}>Admin</span>
              </div>
              <button onClick={logout} style={{ padding:'7px 16px', borderRadius:9, fontSize:12.5,
                fontWeight:600, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
                color:'rgba(248,113,113,0.65)', cursor:'pointer', transition:'all 0.15s',
                display:'flex', alignItems:'center', gap:6, fontFamily:"'Sora',sans-serif" }}
                onMouseOver={e=>{e.currentTarget.style.background='rgba(239,68,68,0.16)';e.currentTarget.style.color='#f87171'}}
                onMouseOut={e=>{e.currentTarget.style.background='rgba(239,68,68,0.08)';e.currentTarget.style.color='rgba(248,113,113,0.65)'}}>
                <I d={IC.logout} s={13}/> Sign Out
              </button>
            </div>
          </header>

          {/* Content */}
          <main key={page} style={{ padding:'72px 32px 48px', minHeight:'100vh', animation:'afadeup 0.35s both' }}>
            {page === 'dashboard'  && <Dashboard goPage={goPage}/>}
            {page === 'users'      && <UsersPage/>}
            {page === 'teachers'   && <TeachersPage/>}
            {page === 'ratings'    && <RatingsPage/>}
            {page === 'fake'       && <FakePage/>}
            {page === 'notifs'     && <NotifsPage/>}
            {page === 'analytics'  && <AnalyticsPage/>}
          </main>
        </div>
      </div>
    </>
  )
}
