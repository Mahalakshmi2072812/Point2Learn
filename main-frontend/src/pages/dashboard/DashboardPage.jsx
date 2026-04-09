import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWallet, getAllCourses, getEnrolledCourses, getMyCourses, getNotifications, getUnreadCount } from '@/api'
import { useAuth } from '@/context/AuthContext'
import Spin from '@/components/ui/Spin'

const I = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)
const IC = {
  wallet:  <><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 13a1 1 0 100 2 1 1 0 000-2z" fill="currentColor"/><path d="M2 10h20"/></>,
  book:    <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
  video:   <><polygon points="23,7 16,12 23,17 23,7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>,
  bell:    <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
  check:   <><polyline points="20,6 9,17 4,12"/></>,
  courses: <><path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12"/><path d="M4 19h16"/><path d="M9 7v6l3-2 3 2V7"/></>,
  profile: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  rating:  <><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></>,
  zap:     <><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></>,
  shield:  <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  trending:<><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></>,
  clock:   <><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>,
}

const ago = iso => {
  if (!iso) return ''
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

export default function DashboardPage() {
  const { user, verStatus, isTeacher } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getWallet().catch(() => null),
      getAllCourses().catch(() => ({ data: [] })),
      getEnrolledCourses().catch(() => ({ data: [] })),
      getMyCourses().catch(() => ({ data: [] })),
      getNotifications().catch(() => ({ data: [] })),
      getUnreadCount().catch(() => null),
    ]).then(([wallet, allC, enrolledC, myC, notifsR, unread]) => {
      const all      = allC?.data      || []
      const enrolled = enrolledC?.data || []
      const mine     = myC?.data       || []
      const notifs   = notifsR?.data   || []
      setData({
        wallet:   wallet?.data?.points ?? 0,
        allCount: all.length,
        enrolled, mine,
        notifs:   notifs.slice(0, 6),
        unread:   unread?.data?.count ?? unread?.data?.unread_count ?? notifs.filter(n => !n.is_read).length,
        recent:   all.slice(0, 5),
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <Spin/>
    </div>
  )

  const { wallet, allCount, enrolled, mine, notifs, unread, recent } = data
  const name    = user?.name || 'User'
  const initial = name.charAt(0).toUpperCase()
  const pct     = Math.min(Math.round((wallet / 500) * 100), 100)

  const ACTIONS = [
    { to:'/courses',          icon:IC.book,    label:'All Courses',    b:'99,102,241',  a:'#818cf8' },
    { to:'/sessions',         icon:IC.video,   label:'Live Sessions',  b:'16,185,129',  a:'#34d399' },
    { to:'/my-courses',       icon:IC.courses, label:'My Courses',     b:'245,158,11',  a:'#fbbf24' },
    { to:'/enrolled-courses', icon:IC.check,   label:'Enrolled',       b:'6,182,212',   a:'#67e8f9' },
    { to:'/ratings',          icon:IC.rating,  label:'Ratings',        b:'251,191,36',  a:'#fde68a' },
    { to:'/wallet',           icon:IC.wallet,  label:'Wallet',         b:'192,132,252', a:'#c084fc' },
    { to:'/notifications',    icon:IC.bell,    label:'Notifications',  b:'239,68,68',   a:'#f87171' },
    { to:'/profile',          icon:IC.profile, label:'Profile',        b:'45,212,191',  a:'#2dd4bf' },
    { to:'/create-course',    icon:IC.plus,    label:'Create Course',  b:'99,102,241',  a:'#818cf8' },
  ]

  const BARS = [35, 60, 45, 80, 55, 72, pct]
  const DAYS = ['M','T','W','T','F','S','T']

  return (
    <div style={{ maxWidth:1240, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes wBorder { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes wDot    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(1.6)} }
        @keyframes wOrb1   { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,-24px)} }
        @keyframes wOrb2   { 0%,100%{transform:translate(0,0)} 50%{transform:translate(16px,-18px)} }
        @keyframes wRing   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes rise    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .d-hover:hover { transform:translateY(-4px) !important; }
        .course-row:hover { background:rgba(255,255,255,0.04) !important; }
        .nc:hover { background:rgba(99,102,241,0.12) !important; color:#a5b4fc !important; border-color:rgba(99,102,241,0.28) !important; }
        .how-card:hover { transform:translateY(-4px) !important; }
      `}</style>

      {/* ══ WELCOME CARD ══ */}
      <div className="fade-up" style={{
        borderRadius:18, overflow:'hidden', position:'relative',
        background:'linear-gradient(135deg,#060a1f 0%,#0c1038 45%,#07091e 100%)',
        border:'1px solid rgba(255,255,255,0.08)',
        boxShadow:'0 16px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}>
        <div style={{ position:'absolute', top:-100, left:-80, width:500, height:500, borderRadius:'50%', pointerEvents:'none',
          background:'radial-gradient(circle,rgba(56,189,248,0.1) 0%,transparent 62%)', animation:'wOrb1 13s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', bottom:-80, right:40, width:420, height:420, borderRadius:'50%', pointerEvents:'none',
          background:'radial-gradient(circle,rgba(99,102,241,0.13) 0%,transparent 62%)', animation:'wOrb2 16s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', top:0, right:-20, width:300, height:300, borderRadius:'50%', pointerEvents:'none',
          background:'radial-gradient(circle,rgba(168,85,247,0.09) 0%,transparent 62%)' }}/>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'radial-gradient(rgba(255,255,255,0.038) 1px,transparent 1px)',
          backgroundSize:'26px 26px' }}/>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, pointerEvents:'none',
          background:'linear-gradient(90deg,transparent,rgba(56,189,248,0.85),rgba(99,102,241,0.95),rgba(168,85,247,0.7),transparent)',
          backgroundSize:'300% 100%', animation:'wBorder 5s linear infinite' }}/>

        <div style={{ position:'relative', padding:'36px 44px',
          display:'grid', gridTemplateColumns:'1fr auto', gap:40, alignItems:'start' }}>

          <div>
            {/* Role chips */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px',
                borderRadius:100, background:'rgba(56,189,248,0.1)', border:'1px solid rgba(56,189,248,0.25)' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#38bdf8',
                  boxShadow:'0 0 8px rgba(56,189,248,0.9)', animation:'wDot 2.5s infinite' }}/>
                <span style={{ fontSize:10.5, fontWeight:700, color:'#7dd3fc', letterSpacing:'0.09em', textTransform:'uppercase' }}>
                  {isTeacher ? 'Verified Teacher' : 'Student'}
                </span>
              </div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px',
                borderRadius:100, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.22)' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#10b981',
                  boxShadow:'0 0 8px rgba(16,185,129,0.9)', animation:'wDot 2.5s 0.5s infinite' }}/>
                <span style={{ fontSize:10.5, fontWeight:700, color:'#6ee7b7', letterSpacing:'0.09em', textTransform:'uppercase' }}>Active Account</span>
              </div>
              {verStatus === 'approved' && (
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px',
                  borderRadius:100, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.22)' }}>
                  <I d={IC.shield} s={10}/>
                  <span style={{ fontSize:10.5, fontWeight:700, color:'#6ee7b7', letterSpacing:'0.09em', textTransform:'uppercase' }}>Verified Teacher</span>
                </div>
              )}
              {verStatus === 'pending' && (
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px',
                  borderRadius:100, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.22)' }}>
                  <span style={{ fontSize:10.5, fontWeight:700, color:'#fcd34d', letterSpacing:'0.09em', textTransform:'uppercase' }}>Under Review</span>
                </div>
              )}
            </div>

            {/* Welcome back + Name */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11.5, fontWeight:600, color:'rgba(240,244,255,0.3)',
                letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8,
                fontFamily:"'DM Sans',sans-serif" }}>Welcome back</div>
              <h1 style={{ fontSize:44, fontWeight:900, letterSpacing:'-0.05em',
                lineHeight:0.95, margin:0, fontFamily:"'Sora',sans-serif" }}>
                <span style={{ background:'linear-gradient(135deg,#f0f4ff 0%,#cbd5e1 100%)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  {name}
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p style={{ fontSize:14, color:'rgba(240,244,255,0.4)', lineHeight:1.7,
              margin:'0 0 20px', fontFamily:"'DM Sans',sans-serif", maxWidth:500 }}>
              {isTeacher
                ? 'Your courses are live. Start a session, earn 10 credits per student, and grow your teaching reputation.'
                : 'Explore all live courses, join sessions with verified teachers, and build real-world skills every day.'}
            </p>

            {/* Platform highlights */}
            <div style={{ display:'flex', gap:12, marginBottom:22, flexWrap:'wrap' }}>
              {[
                { icon:IC.zap,    label:'10 credits',  sub:'per student taught',    c:'#fbbf24', b:'245,158,11' },
                { icon:IC.clock,  label:'5 hours',     sub:'wallet auto-refill',    c:'#34d399', b:'16,185,129' },
                { icon:IC.video,  label:'Jitsi Meet',  sub:'live browser sessions', c:'#7dd3fc', b:'56,189,248' },
                { icon:IC.shield, label:'Verified',    sub:'teachers only',         c:'#c084fc', b:'192,132,252' },
              ].map(({ icon, label, sub, c, b }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                  borderRadius:10, background:`rgba(${b},0.07)`, border:`1px solid rgba(${b},0.18)`,
                  flex:'1 1 auto', minWidth:110 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:`rgba(${b},0.14)`,
                    display:'flex', alignItems:'center', justifyContent:'center', color:c, flexShrink:0 }}>
                    <I d={icon} s={14}/>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:c, letterSpacing:'-0.02em', lineHeight:1 }}>{label}</div>
                    <div style={{ fontSize:10.5, color:'rgba(240,244,255,0.3)', marginTop:3,
                      fontFamily:"'DM Sans',sans-serif", lineHeight:1 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <Link to="/sessions" style={{ padding:'10px 24px', borderRadius:9, fontSize:13, fontWeight:700,
                background:'linear-gradient(135deg,rgba(56,189,248,0.16),rgba(99,102,241,0.12))',
                border:'1px solid rgba(56,189,248,0.3)', color:'#7dd3fc',
                textDecoration:'none', transition:'all 0.18s', letterSpacing:'-0.01em' }}
                onMouseOver={e => { e.currentTarget.style.background='rgba(56,189,248,0.26)'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseOut={e  => { e.currentTarget.style.background='linear-gradient(135deg,rgba(56,189,248,0.16),rgba(99,102,241,0.12))'; e.currentTarget.style.transform='' }}>
                {isTeacher ? 'Start Session' : 'Browse Sessions'}
              </Link>
              <Link to="/courses" style={{ padding:'10px 24px', borderRadius:9, fontSize:13, fontWeight:700,
                background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.26)',
                color:'#a5b4fc', textDecoration:'none', transition:'all 0.18s', letterSpacing:'-0.01em' }}
                onMouseOver={e => { e.currentTarget.style.background='rgba(99,102,241,0.22)'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseOut={e  => { e.currentTarget.style.background='rgba(99,102,241,0.1)'; e.currentTarget.style.transform='' }}>
                All Courses
              </Link>
              {(verStatus === 'not_requested' || verStatus === 'rejected') && (
                <Link to="/teacher-request" style={{ padding:'10px 24px', borderRadius:9, fontSize:13, fontWeight:700,
                  background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.28)',
                  color:'#d8b4fe', textDecoration:'none', transition:'all 0.18s', letterSpacing:'-0.01em' }}
                  onMouseOver={e => { e.currentTarget.style.background='rgba(168,85,247,0.22)'; e.currentTarget.style.transform='translateY(-2px)' }}
                  onMouseOut={e  => { e.currentTarget.style.background='rgba(168,85,247,0.1)'; e.currentTarget.style.transform='' }}>
                  Apply as Teacher
                </Link>
              )}
            </div>
          </div>

          {/* RIGHT - avatar + stats */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, minWidth:160 }}>
            <div style={{ position:'relative', width:86, height:86 }}>
              <div style={{ position:'absolute', inset:-3, borderRadius:'50%',
                background:'conic-gradient(from 0deg,#38bdf8,#6366f1,#a855f7,#38bdf8)',
                animation:'wRing 5s linear infinite', opacity:0.7 }}/>
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#060a1f' }}/>
              <div style={{ position:'absolute', inset:3, borderRadius:'50%',
                background:'linear-gradient(145deg,#1e3a5f,#1e1b4b,#3b0764)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:32, fontWeight:900, color:'#f0f4ff', fontFamily:"'Sora',sans-serif",
                boxShadow:'inset 0 2px 12px rgba(0,0,0,0.5)' }}>
                {initial}
              </div>
              <div style={{ position:'absolute', bottom:3, right:3, width:15, height:15,
                borderRadius:'50%', background:'#10b981', border:'2px solid #060a1f',
                boxShadow:'0 0 10px rgba(16,185,129,1)' }}/>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:13.5, fontWeight:700, color:'rgba(240,244,255,0.8)', letterSpacing:'-0.02em' }}>{name}</div>
              <div style={{ fontSize:11, color:'rgba(240,244,255,0.3)', marginTop:2, fontFamily:"'DM Sans',sans-serif" }}>
                {isTeacher ? 'Verified Teacher' : user?.role || 'Student'}
              </div>
            </div>
            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { label:'Total Courses', value:allCount, c:'#fbbf24', b:'245,158,11' },
                { label:'Platform Users', value:'500+',  c:'#7dd3fc', b:'56,189,248' },
                { label:'My Credits',     value:wallet,  c:'#818cf8', b:'99,102,241' },
              ].map(({ label, value, c, b }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'8px 12px', borderRadius:9,
                  background:`rgba(${b},0.07)`, border:`1px solid rgba(${b},0.16)` }}>
                  <span style={{ fontSize:11, color:'rgba(240,244,255,0.38)', fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
                  <span style={{ fontSize:13.5, fontWeight:800, color:c, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.03em' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ STAT CARDS ══ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        {[
          { label:'Wallet Credits',  value:wallet,          sub:'available to spend',  link:'/wallet',           b:'79,70,229',  a:'#818cf8' },
          { label:'Enrolled',        value:enrolled.length, sub:'courses you joined',  link:'/enrolled-courses', b:'16,185,129', a:'#34d399' },
          { label:'All Courses',     value:allCount,        sub:'on the platform',     link:'/courses',          b:'245,158,11', a:'#fbbf24' },
          { label:'Unread',          value:unread,          sub:'notifications',        link:'/notifications',    b:'239,68,68',  a:'#f87171' },
        ].map(({ label, value, sub, link, b, a }, idx) => (
          <Link key={label} to={link} style={{ textDecoration:'none' }}>
            <div className="d-hover" style={{ padding:'22px 20px', borderRadius:14, cursor:'pointer',
              background:`linear-gradient(150deg,rgba(${b},0.11) 0%,rgba(${b},0.03) 100%)`,
              border:`1px solid rgba(${b},0.17)`,
              boxShadow:`0 4px 20px rgba(${b},0.07), inset 0 1px 0 rgba(255,255,255,0.06)`,
              transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)', position:'relative', overflow:'hidden' }}
              onMouseOver={e => { e.currentTarget.style.borderColor=`rgba(${b},0.36)`; e.currentTarget.style.boxShadow=`0 18px 44px rgba(${b},0.2)` }}
              onMouseOut={e  => { e.currentTarget.style.borderColor=`rgba(${b},0.17)`; e.currentTarget.style.boxShadow=`0 4px 20px rgba(${b},0.07)` }}>
              <div style={{ position:'absolute', top:-24, right:-24, width:100, height:100, borderRadius:'50%',
                background:`radial-gradient(circle,rgba(${b},0.25) 0%,transparent 65%)`, pointerEvents:'none' }}/>
              <div style={{ position:'absolute', bottom:0, left:'12%', right:'12%', height:1,
                background:`linear-gradient(90deg,transparent,rgba(${b},0.55),transparent)`, pointerEvents:'none' }}/>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ fontSize:10, fontWeight:700, color:`rgba(${b},0.65)`, letterSpacing:'0.1em', textTransform:'uppercase' }}>{label}</div>
                <div style={{ width:30, height:30, borderRadius:8, background:`rgba(${b},0.13)`,
                  border:`1px solid rgba(${b},0.2)`, color:a, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {idx===0?<I d={IC.wallet} s={13}/>:idx===1?<I d={IC.check} s={13}/>:idx===2?<I d={IC.courses} s={13}/>:<I d={IC.bell} s={13}/>}
                </div>
              </div>
              <div style={{ fontSize:44, fontWeight:900, color:'#f0f4ff', letterSpacing:'-0.06em',
                lineHeight:1, fontVariantNumeric:'tabular-nums', marginBottom:6,
                textShadow:`0 0 24px rgba(${b},0.4)` }}>{value}</div>
              <div style={{ fontSize:11.5, color:'rgba(240,244,255,0.28)', fontWeight:500,
                fontFamily:"'DM Sans',sans-serif" }}>{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ══ ACTIONS + ACTIVITY + NOTIFS ══ */}
      <div style={{ display:'grid', gridTemplateColumns:'2.1fr 1.1fr 1fr', gap:18 }}>

        <div className="card" style={{ padding:'24px' }}>
          <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(240,244,255,0.28)',
            letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:18 }}>Quick Access</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {ACTIONS.map(({ to, icon, label, b, a }) => (
              <Link key={to} to={to} style={{ textDecoration:'none' }}>
                <div style={{ padding:'16px 14px', borderRadius:12,
                  background:`rgba(${b},0.06)`, border:`1px solid rgba(${b},0.13)`,
                  display:'flex', flexDirection:'column', gap:10, transition:'all 0.18s' }}
                  onMouseOver={e => { e.currentTarget.style.background=`rgba(${b},0.14)`; e.currentTarget.style.borderColor=`rgba(${b},0.3)`; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 10px 28px rgba(${b},0.18)` }}
                  onMouseOut={e  => { e.currentTarget.style.background=`rgba(${b},0.06)`; e.currentTarget.style.borderColor=`rgba(${b},0.13)`; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:`rgba(${b},0.16)`,
                    color:a, display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:`0 0 12px rgba(${b},0.2)` }}>
                    <I d={icon} s={14}/>
                  </div>
                  <div style={{ fontSize:12.5, fontWeight:600, color:'rgba(240,244,255,0.72)', letterSpacing:'-0.01em', lineHeight:1.3 }}>{label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:'24px', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(240,244,255,0.28)', letterSpacing:'0.12em', textTransform:'uppercase' }}>Activity</div>
            <span style={{ fontSize:10.5, color:'rgba(240,244,255,0.18)', fontFamily:"'DM Sans',sans-serif" }}>7 days</span>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:7, height:96, flex:1, marginBottom:16 }}>
            {BARS.map((h, i) => {
              const today = i === 6
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%', gap:5 }}>
                  <div style={{ width:'100%', borderRadius:'4px 4px 0 0', height:`${h}%`,
                    background:today?'linear-gradient(180deg,#7dd3fc,#38bdf8,#0ea5e9)':'rgba(56,189,248,0.15)',
                    border:`1px solid ${today?'rgba(56,189,248,0.5)':'rgba(56,189,248,0.08)'}`,
                    boxShadow:today?'0 0 16px rgba(56,189,248,0.45)':'none',
                    position:'relative', overflow:'hidden', transition:'all 0.18s' }}
                    onMouseOver={e => { e.currentTarget.style.background='linear-gradient(180deg,#bae6fd,#7dd3fc)'; e.currentTarget.style.boxShadow='0 0 18px rgba(56,189,248,0.5)' }}
                    onMouseOut={e  => { e.currentTarget.style.background=today?'linear-gradient(180deg,#7dd3fc,#38bdf8,#0ea5e9)':'rgba(56,189,248,0.15)'; e.currentTarget.style.boxShadow=today?'0 0 16px rgba(56,189,248,0.45)':'none' }}>
                    {today && <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(255,255,255,0.2),transparent)' }}/>}
                  </div>
                  <div style={{ fontSize:9, fontWeight:700, color:'rgba(240,244,255,0.2)', letterSpacing:'0.04em' }}>{DAYS[i]}</div>
                </div>
              )
            })}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:14 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'rgba(240,244,255,0.2)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>Credit Rules</div>
            {[
              { l:'Attend session', v:'-500', c:'#f87171' },
              { l:'Teach student',  v:'+10',  c:'#34d399' },
              { l:'Auto refill',    v:'+500', c:'#818cf8' },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize:12, color:'rgba(240,244,255,0.38)', fontFamily:"'DM Sans',sans-serif" }}>{l}</span>
                <span style={{ fontSize:14, fontWeight:800, color:c, fontFamily:'monospace' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:'24px', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(240,244,255,0.28)', letterSpacing:'0.12em', textTransform:'uppercase' }}>Notifications</div>
            <Link to="/notifications" className="nc" style={{ fontSize:10, color:'rgba(240,244,255,0.28)',
              textDecoration:'none', fontWeight:700, padding:'3px 10px', borderRadius:6,
              border:'1px solid rgba(255,255,255,0.07)', transition:'all 0.15s' }}>All</Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:7, flex:1 }}>
            {notifs.length === 0 ? (
              <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', gap:10, color:'rgba(240,244,255,0.15)', textAlign:'center', padding:'16px 0' }}>
                <I d={IC.bell} s={24}/>
                <span style={{ fontSize:12, fontFamily:"'DM Sans',sans-serif" }}>No notifications</span>
              </div>
            ) : notifs.map(n => (
              <div key={n.id} style={{ padding:'9px 11px', borderRadius:9,
                background:n.is_read?'rgba(255,255,255,0.02)':'rgba(56,189,248,0.07)',
                border:`1px solid ${n.is_read?'rgba(255,255,255,0.04)':'rgba(56,189,248,0.18)'}`,
                transition:'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                onMouseOut={e  => e.currentTarget.style.background=n.is_read?'rgba(255,255,255,0.02)':'rgba(56,189,248,0.07)'}>
                <div style={{ display:'flex', gap:9 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', marginTop:4, flexShrink:0,
                    background:n.is_read?'rgba(255,255,255,0.1)':'#38bdf8',
                    boxShadow:n.is_read?'none':'0 0 7px #38bdf8' }}/>
                  <div>
                    <div style={{ fontSize:12, fontWeight:n.is_read?400:600, lineHeight:1.4,
                      color:n.is_read?'rgba(240,244,255,0.3)':'#f0f4ff',
                      overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box',
                      WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{n.title}</div>
                    <div style={{ fontSize:10.5, color:'rgba(240,244,255,0.18)', marginTop:2, fontFamily:"'DM Sans',sans-serif" }}>{ago(n.created_at)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ HOW IT WORKS ══ */}
      <div>
        <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(240,244,255,0.28)',
          letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14 }}>How It Works</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {[
            { icon:IC.plus,     b:'99,102,241',  a:'#818cf8', n:'01', title:'Register & Activate', desc:'Create account, pay ₹500 once, get 500 credits instantly.' },
            { icon:IC.book,     b:'16,185,129',  a:'#34d399', n:'02', title:'Browse & Enroll',     desc:'Explore live courses from verified teachers, enroll using credits.' },
            { icon:IC.video,    b:'245,158,11',  a:'#fbbf24', n:'03', title:'Attend Live Sessions', desc:'Join Jitsi sessions directly in-browser. No app needed.' },
            { icon:IC.trending, b:'192,132,252', a:'#c084fc', n:'04', title:'Earn by Teaching',    desc:'Get verified, earn 10 credits per attending student every session.' },
          ].map(({ icon, b, a, n, title, desc }) => (
            <div key={title} className="how-card" style={{ padding:'22px 20px', borderRadius:14,
              background:`linear-gradient(145deg,rgba(${b},0.08),rgba(${b},0.02))`,
              border:`1px solid rgba(${b},0.14)`,
              transition:'all 0.2s', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-20, right:-20, width:90, height:90, borderRadius:'50%',
                background:`radial-gradient(circle,rgba(${b},0.18) 0%,transparent 65%)`, pointerEvents:'none' }}/>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`rgba(${b},0.15)`,
                  border:`1px solid rgba(${b},0.22)`, color:a, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <I d={icon} s={16}/>
                </div>
                <div style={{ fontSize:11, fontWeight:800, color:a, letterSpacing:'0.04em', opacity:0.6 }}>{n}</div>
              </div>
              <div style={{ fontSize:13.5, fontWeight:700, color:'#f0f4ff', marginBottom:8, letterSpacing:'-0.02em' }}>{title}</div>
              <div style={{ fontSize:12.5, color:'rgba(240,244,255,0.38)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ COURSES + PROFILE ══ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 0.85fr', gap:18 }}>

        <div className="card" style={{ padding:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(240,244,255,0.28)', letterSpacing:'0.12em', textTransform:'uppercase' }}>Enrolled Courses</div>
            <Link to="/enrolled-courses" className="nc" style={{ fontSize:10, color:'rgba(240,244,255,0.28)',
              textDecoration:'none', fontWeight:700, padding:'3px 10px', borderRadius:6,
              border:'1px solid rgba(255,255,255,0.07)', transition:'all 0.15s' }}>View all</Link>
          </div>
          {enrolled.length === 0 ? (
            <div style={{ textAlign:'center', padding:'28px 0', display:'flex', flexDirection:'column',
              alignItems:'center', gap:12, color:'rgba(240,244,255,0.18)' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'rgba(245,158,11,0.07)',
                border:'1px solid rgba(245,158,11,0.14)', display:'flex', alignItems:'center',
                justifyContent:'center', color:'rgba(245,158,11,0.35)' }}><I d={IC.book} s={18}/></div>
              <div style={{ fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>No enrolled courses</div>
              <Link to="/courses" style={{ fontSize:12, color:'#818cf8', textDecoration:'none', fontWeight:600 }}>Browse courses</Link>
            </div>
          ) : enrolled.slice(0,5).map(c => (
            <div key={c.id} className="course-row" style={{ display:'flex', alignItems:'center', gap:12,
              padding:'11px 12px', borderRadius:10, marginBottom:7,
              background:'rgba(245,158,11,0.04)', border:'1px solid rgba(245,158,11,0.09)', transition:'all 0.15s' }}>
              <div style={{ width:34, height:34, borderRadius:8, flexShrink:0,
                background:'linear-gradient(135deg,rgba(245,158,11,0.22),rgba(245,158,11,0.06))',
                border:'1px solid rgba(245,158,11,0.18)', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:14, fontWeight:800, color:'#fbbf24', fontFamily:"'Sora',sans-serif" }}>
                {(c.title||'?').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#f0f4ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</div>
                <div style={{ fontSize:11, color:'rgba(240,244,255,0.28)', marginTop:2, fontFamily:"'DM Sans',sans-serif" }}>{c.students_count??0} students</div>
              </div>
              <div style={{ fontSize:10.5, color:'#34d399', fontWeight:700, padding:'2px 8px', borderRadius:5,
                background:'rgba(16,185,129,0.09)', border:'1px solid rgba(16,185,129,0.18)', flexShrink:0 }}>Joined</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(240,244,255,0.28)', letterSpacing:'0.12em', textTransform:'uppercase' }}>
              {isTeacher ? 'My Courses' : 'Available Courses'}
            </div>
            <Link to={isTeacher?'/my-courses':'/courses'} className="nc" style={{ fontSize:10, color:'rgba(240,244,255,0.28)',
              textDecoration:'none', fontWeight:700, padding:'3px 10px', borderRadius:6,
              border:'1px solid rgba(255,255,255,0.07)', transition:'all 0.15s' }}>View all</Link>
          </div>
          {(isTeacher?mine:recent).length === 0 ? (
            <div style={{ textAlign:'center', padding:'28px 0', display:'flex', flexDirection:'column',
              alignItems:'center', gap:12, color:'rgba(240,244,255,0.18)' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'rgba(16,185,129,0.07)',
                border:'1px solid rgba(16,185,129,0.14)', display:'flex', alignItems:'center',
                justifyContent:'center', color:'rgba(16,185,129,0.35)' }}><I d={IC.courses} s={18}/></div>
              <div style={{ fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>{isTeacher?'No courses created':'No courses available'}</div>
              {isTeacher && <Link to="/create-course" style={{ fontSize:12, color:'#818cf8', textDecoration:'none', fontWeight:600 }}>Create first course</Link>}
            </div>
          ) : (isTeacher?mine:recent).slice(0,5).map(c => (
            <div key={c.id} className="course-row" style={{ display:'flex', alignItems:'center', gap:12,
              padding:'11px 12px', borderRadius:10, marginBottom:7,
              background:'rgba(16,185,129,0.04)', border:'1px solid rgba(16,185,129,0.09)', transition:'all 0.15s' }}>
              <div style={{ width:34, height:34, borderRadius:8, flexShrink:0,
                background:'linear-gradient(135deg,rgba(16,185,129,0.22),rgba(16,185,129,0.06))',
                border:'1px solid rgba(16,185,129,0.18)', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:14, fontWeight:800, color:'#34d399', fontFamily:"'Sora',sans-serif" }}>
                {(c.title||'?').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#f0f4ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</div>
                <div style={{ fontSize:11, color:'rgba(240,244,255,0.28)', marginTop:2, fontFamily:"'DM Sans',sans-serif" }}>{c.students_count??0} students</div>
              </div>
              {isTeacher && <div style={{ fontSize:10.5, color:'#818cf8', fontWeight:700, padding:'2px 8px', borderRadius:5,
                background:'rgba(99,102,241,0.09)', border:'1px solid rgba(99,102,241,0.18)', flexShrink:0 }}>Owner</div>}
            </div>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="card" style={{ padding:'20px' }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'rgba(240,244,255,0.28)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14 }}>Overview</div>
            {[
              { label:'Total Courses', value:allCount,        c:'#818cf8', i:IC.courses },
              { label:'Your Credits',  value:wallet,          c:'#fbbf24', i:IC.zap     },
              { label:'Enrolled',      value:enrolled.length, c:'#34d399', i:IC.check   },
              { label:'Unread',        value:unread,          c:'#f87171', i:IC.bell    },
            ].map(({ label, value, c, i: icon }, idx) => (
              <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'9px 0', borderBottom:idx<3?'1px solid rgba(255,255,255,0.05)':'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <div style={{ width:26, height:26, borderRadius:6, background:'rgba(255,255,255,0.04)',
                    border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', color:c }}>
                    <I d={icon} s={12}/>
                  </div>
                  <span style={{ fontSize:12, color:'rgba(240,244,255,0.4)', fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
                </div>
                <span style={{ fontSize:15, fontWeight:800, color:c, fontVariantNumeric:'tabular-nums' }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding:'18px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:11, padding:'11px 12px',
              borderRadius:10, background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.14)', marginBottom:11 }}>
              <div style={{ width:38, height:38, borderRadius:'50%', flexShrink:0,
                background:'linear-gradient(135deg,#164e63,#0e7490)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:15, fontWeight:800, color:'#f0f4ff', boxShadow:'0 4px 12px rgba(14,116,144,0.35)' }}>
                {initial}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13.5, fontWeight:700, color:'#f0f4ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
                <div style={{ fontSize:11.5, color:'rgba(240,244,255,0.3)', fontFamily:"'DM Sans',sans-serif" }}>
                  {isTeacher ? 'Verified Teacher' : user?.role || 'Student'}
                </div>
              </div>
            </div>
            <Link to="/profile" style={{ display:'flex', alignItems:'center', justifyContent:'center',
              padding:'9px', borderRadius:8, textDecoration:'none',
              background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
              color:'rgba(240,244,255,0.32)', fontSize:12.5, fontWeight:600, transition:'all 0.15s' }}
              onMouseOver={e => { e.currentTarget.style.background='rgba(56,189,248,0.08)'; e.currentTarget.style.color='#7dd3fc'; e.currentTarget.style.borderColor='rgba(56,189,248,0.2)' }}
              onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.color='rgba(240,244,255,0.32)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)' }}>
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
