import { useState, useEffect } from 'react'
import { getAdminStats, getAdminUsers, getTeacherRequests, approveTeacher, rejectTeacher, sendAdminNotification, broadcastNotification } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/Toast'
import Spin from '@/components/ui/Spin'

function Ic({ d, size, stroke, fill }) {
  return (
    <svg width={size||16} height={size||16} viewBox="0 0 24 24" fill={fill||'none'}
      stroke={stroke||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
  )
}

var ICO = {
  users:    <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  shield:   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
  check:    <polyline points="20,6 9,17 4,12"/>,
  x:        <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  bell:     <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
  send:     <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></>,
  book:     <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
  zap:      <><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></>,
  grid:     <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  award:    <><circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/></>,
  search:   <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  mail:     <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  clock:    <><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>,
  globe:    <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></>,
  video:    <><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></>,
  activity: <><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></>,
  eye:      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  refresh:  <><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></>,
  user:     <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
}

var TABS = [
  { id:'overview',  label:'Overview',          icon:ICO.activity },
  { id:'users',     label:'User Management',   icon:ICO.users    },
  { id:'requests',  label:'Teacher Requests',  icon:ICO.award    },
  { id:'notify',    label:'Notifications',     icon:ICO.bell     },
]

function ago(iso) {
  if (!iso) return 'Never'
  var d = Date.now() - new Date(iso)
  var m = Math.floor(d / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return m + 'm ago'
  var h = Math.floor(m / 60)
  if (h < 24) return h + 'h ago'
  return Math.floor(h / 24) + 'd ago'
}

function fmtDate(iso) {
  if (!iso) return '--'
  try { return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) } catch(e) { return '--' }
}

export default function AdminPage() {
  var { isAdmin } = useAuth()
  var { toast } = useToast()
  var [tab, setTab] = useState('overview')
  var [stats, setStats] = useState(null)
  var [users, setUsers] = useState([])
  var [requests, setRequests] = useState([])
  var [loading, setLoading] = useState(true)
  var [search, setSearch] = useState('')
  var [filter, setFilter] = useState('all')
  var [busy, setBusy] = useState(null)
  var [nTarget, setNTarget] = useState('')
  var [nTitle, setNTitle] = useState('')
  var [nMsg, setNMsg] = useState('')
  var [bTitle, setBTitle] = useState('')
  var [bMsg, setBMsg] = useState('')

  function loadAll() {
    setLoading(true)
    Promise.all([
      getAdminStats().then(function(r) { setStats(r.data) }).catch(function() {}),
      getAdminUsers().then(function(r) { setUsers(r.data || []) }).catch(function() {}),
      getTeacherRequests().then(function(r) { setRequests(r.data || []) }).catch(function() {}),
    ]).finally(function() { setLoading(false) })
  }

  useEffect(function() { if (isAdmin) loadAll() }, [isAdmin])

  useEffect(function() {
    if (!isAdmin) return
    var t = setInterval(function() {
      getAdminUsers().then(function(r) { setUsers(r.data || []) }).catch(function() {})
      getAdminStats().then(function(r) { setStats(r.data) }).catch(function() {})
    }, 15000)
    return function() { clearInterval(t) }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div style={{ maxWidth:480 }} className="fade-up">
        <div className="card" style={{ padding:48, textAlign:'center' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'rgba(248,81,73,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
            <Ic d={ICO.shield} size={24} stroke="#f85149"/>
          </div>
          <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:8 }}>Admin Access Required</h3>
          <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7 }}>You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  function handleApprove(uid) {
    setBusy(uid + '_a')
    approveTeacher(uid).then(function() { toast('Teacher approved', 'success'); loadAll() })
      .catch(function(e) { toast(e.response?.data?.detail || 'Failed', 'error') })
      .finally(function() { setBusy(null) })
  }
  function handleReject(uid) {
    var reason = prompt('Rejection reason:')
    if (!reason) return
    setBusy(uid + '_r')
    rejectTeacher(uid, reason).then(function() { toast('Teacher rejected', 'success'); loadAll() })
      .catch(function(e) { toast(e.response?.data?.detail || 'Failed', 'error') })
      .finally(function() { setBusy(null) })
  }
  function handleSendNotif(e) {
    e.preventDefault()
    if (!nTarget || !nTitle || !nMsg) { toast('Fill all fields', 'error'); return }
    setBusy('send')
    sendAdminNotification(nTarget, nTitle, nMsg)
      .then(function() { toast('Notification sent', 'success'); setNTarget(''); setNTitle(''); setNMsg('') })
      .catch(function(e) { toast(e.response?.data?.detail || 'Failed', 'error') })
      .finally(function() { setBusy(null) })
  }
  function handleBroadcast(e) {
    e.preventDefault()
    if (!bTitle || !bMsg) { toast('Fill all fields', 'error'); return }
    setBusy('broadcast')
    broadcastNotification(bTitle, bMsg)
      .then(function(r) { toast('Broadcast sent to ' + (r.data?.count || 0) + ' users', 'success'); setBTitle(''); setBMsg('') })
      .catch(function(e) { toast(e.response?.data?.detail || 'Failed', 'error') })
      .finally(function() { setBusy(null) })
  }

  var filteredUsers = users.filter(function(u) {
    var matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    if (filter === 'all') return matchSearch
    if (filter === 'active') return matchSearch && u.is_online
    if (filter === 'inactive') return matchSearch && !u.is_online
    if (filter === 'teachers') return matchSearch && u.role === 'teacher'
    if (filter === 'paid') return matchSearch && u.payment_status === 'paid'
    if (filter === 'unpaid') return matchSearch && u.payment_status !== 'paid'
    return matchSearch
  })

  var activeCount = users.filter(function(u) { return u.is_online }).length
  var inactiveCount = users.length - activeCount

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', fontFamily:"'Sora',sans-serif" }} className="fade-up">
      <style>{"\
        @keyframes adPop{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}\
        @keyframes liveDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.6)}}\
        .ad-tab{padding:11px 22px;font-size:12.5px;font-weight:600;border:none;cursor:pointer;\
          color:rgba(240,244,255,0.3);display:flex;align-items:center;gap:7;transition:all 0.2s;\
          border-radius:10px;font-family:'Sora',sans-serif;background:none;}\
        .ad-tab.active{color:#f0f4ff;background:rgba(255,255,255,0.07);}\
        .ad-tab:hover:not(.active){color:rgba(240,244,255,0.55);background:rgba(255,255,255,0.03);}\
        .ad-input{width:100%;padding:11px 14px;font-size:13px;font-family:'Sora',sans-serif;\
          background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.08);\
          border-radius:10px;color:#f0f4ff;outline:none;transition:all 0.2s;}\
        .ad-input:focus{border-color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.06);}\
        .ad-input::placeholder{color:rgba(240,244,255,0.18);}\
        .ad-btn{padding:10px 20px;font-size:12.5px;font-weight:700;font-family:'Sora',sans-serif;\
          border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:7;transition:all 0.2s;}\
        .ad-btn:disabled{opacity:0.4;cursor:not-allowed;}\
        .ad-btn:hover:not(:disabled){transform:translateY(-1px);}\
        .ad-row{transition:all 0.15s;}\
        .ad-row:hover{background:rgba(255,255,255,0.025)!important;}\
        .ad-chip{padding:4px 10px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:0.03em;}\
        .ad-filter{padding:6px 14px;border-radius:8px;font-size:11px;font-weight:600;\
          cursor:pointer;transition:all 0.15s;font-family:'Sora',sans-serif;border:1px solid rgba(255,255,255,0.06);\
          background:rgba(255,255,255,0.02);color:rgba(240,244,255,0.3);}\
        .ad-filter.on{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.18);color:#f0f4ff;}\
        .ad-filter:hover:not(.on){background:rgba(255,255,255,0.04);color:rgba(240,244,255,0.5);}\
      "}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(99,102,241,0.15))', border:'1px solid rgba(168,85,247,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic d={ICO.shield} size={20} stroke="#a855f7"/>
          </div>
          <div>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.03em', marginBottom:2 }}>Admin Console</h2>
            <p style={{ fontSize:12, color:'rgba(240,244,255,0.3)', fontFamily:"'DM Sans',sans-serif" }}>
              System management and monitoring
            </p>
          </div>
        </div>
        {/* Live indicator */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:10, background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.15)' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 10px rgba(34,197,94,0.6)', animation:'liveDot 2s infinite' }}/>
          <span style={{ fontSize:12, fontWeight:700, color:'#34d399' }}>{activeCount} active</span>
          <span style={{ fontSize:11, color:'rgba(240,244,255,0.2)' }}>/</span>
          <span style={{ fontSize:12, color:'rgba(240,244,255,0.3)' }}>{users.length} total</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, padding:4, background:'rgba(255,255,255,0.02)', borderRadius:12, border:'1px solid rgba(255,255,255,0.04)' }}>
        {TABS.map(function(t) {
          return (
            <button key={t.id} className={'ad-tab' + (tab===t.id?' active':'')} onClick={function(){setTab(t.id)}}>
              <Ic d={t.icon} size={14}/> {t.label}
              {t.id === 'requests' && requests.length > 0 && (
                <span style={{ background:'rgba(245,158,11,0.2)', color:'#fbbf24', padding:'2px 8px', borderRadius:100, fontSize:10, fontWeight:800 }}>{requests.length}</span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spin/></div>
      ) : (
        <>
          {/* OVERVIEW */}
          {tab === 'overview' && stats && (
            <div style={{ animation:'adPop 0.3s both' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:28 }}>
                {[
                  { label:'Total Users',      val:stats.total_users,      icon:ICO.users,    color:'#818cf8', rgb:'129,140,248' },
                  { label:'Active Now',        val:stats.online_users,     icon:ICO.zap,      color:'#22c55e', rgb:'34,197,94'   },
                  { label:'Paid Users',        val:stats.paid_users,       icon:ICO.check,    color:'#38bdf8', rgb:'56,189,248'  },
                  { label:'Teachers',          val:stats.teachers,         icon:ICO.award,    color:'#fbbf24', rgb:'251,191,36'  },
                  { label:'Pending Requests',  val:stats.pending_requests, icon:ICO.clock,    color:'#f97316', rgb:'249,115,22'  },
                  { label:'Courses',           val:stats.total_courses,    icon:ICO.book,     color:'#c084fc', rgb:'192,132,252' },
                  { label:'Live Sessions',     val:stats.active_sessions,  icon:ICO.video,    color:'#fb7185', rgb:'251,113,133' },
                ].map(function(s, i) {
                  return (
                    <div key={s.label} style={{ padding:'18px 20px', borderRadius:14, background:'rgba(' + s.rgb + ',0.05)', border:'1px solid rgba(' + s.rgb + ',0.12)', animation:'adPop 0.3s ' + (i * 0.04) + 's both', position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', top:-8, right:-8, width:50, height:50, borderRadius:'50%', background:'rgba(' + s.rgb + ',0.08)', pointerEvents:'none' }}/>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, position:'relative' }}>
                        <Ic d={s.icon} size={17} stroke={s.color}/>
                        <span style={{ fontSize:26, fontWeight:900, color:s.color, letterSpacing:'-0.04em', fontVariantNumeric:'tabular-nums' }}>{s.val}</span>
                      </div>
                      <div style={{ fontSize:11, fontWeight:600, color:'rgba(240,244,255,0.4)', letterSpacing:'-0.01em' }}>{s.label}</div>
                    </div>
                  )
                })}
              </div>

              {/* Quick active users preview */}
              <div style={{ borderRadius:14, border:'1px solid rgba(255,255,255,0.06)', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#f0f4ff' }}>Recent Activity</span>
                  <button onClick={function(){setTab('users')}} style={{ fontSize:11, fontWeight:600, color:'rgba(240,244,255,0.35)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline', fontFamily:"'Sora',sans-serif" }}>View all users</button>
                </div>
                {users.slice(0, 5).map(function(u, i) {
                  return (
                    <div key={u.user_id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'rgba(240,244,255,0.4)', position:'relative', flexShrink:0 }}>
                        {(u.name||'?').charAt(0).toUpperCase()}
                        <div style={{ position:'absolute', bottom:-1, right:-1, width:9, height:9, borderRadius:'50%', background:u.is_online?'#22c55e':'rgba(255,255,255,0.12)', border:'2px solid #0a0e1a' }}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <span style={{ fontSize:12.5, fontWeight:600, color:'#f0f4ff' }}>{u.name}</span>
                      </div>
                      <span className="ad-chip" style={{ background:u.is_online?'rgba(34,197,94,0.12)':'rgba(255,255,255,0.04)', color:u.is_online?'#22c55e':'rgba(240,244,255,0.2)', border:'1px solid '+(u.is_online?'rgba(34,197,94,0.25)':'rgba(255,255,255,0.06)') }}>
                        {u.is_online ? 'Active' : 'Inactive'}
                      </span>
                      <span style={{ fontSize:10.5, color:'rgba(240,244,255,0.2)', fontFamily:"'DM Sans',sans-serif", minWidth:50, textAlign:'right' }}>{ago(u.last_active)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div style={{ animation:'adPop 0.3s both' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, flexWrap:'wrap' }}>
                <div style={{ position:'relative', flex:1, minWidth:200 }}>
                  <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(240,244,255,0.2)', pointerEvents:'none' }}><Ic d={ICO.search} size={14}/></span>
                  <input className="ad-input" placeholder="Search by name or email..." value={search} onChange={function(e){setSearch(e.target.value)}} style={{ paddingLeft:36 }}/>
                </div>
                <button onClick={function(){loadAll()}} style={{ padding:'9px 12px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(240,244,255,0.4)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Ic d={ICO.refresh} size={14}/>
                </button>
              </div>

              {/* Filters */}
              <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
                {[
                  { id:'all', label:'All (' + users.length + ')' },
                  { id:'active', label:'Active (' + activeCount + ')' },
                  { id:'inactive', label:'Inactive (' + inactiveCount + ')' },
                  { id:'teachers', label:'Teachers' },
                  { id:'paid', label:'Paid' },
                  { id:'unpaid', label:'Unpaid' },
                ].map(function(f) {
                  return <button key={f.id} className={'ad-filter' + (filter===f.id?' on':'')} onClick={function(){setFilter(f.id)}}>{f.label}</button>
                })}
              </div>

              {/* Table */}
              <div style={{ borderRadius:14, border:'1px solid rgba(255,255,255,0.06)', overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'2.5fr 2fr 1fr 1fr 1fr 1.2fr', padding:'10px 20px', background:'rgba(255,255,255,0.025)', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:10, fontWeight:700, color:'rgba(240,244,255,0.25)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  <span>User</span><span>Email</span><span>Status</span><span>Role</span><span>Payment</span><span>Last Seen</span>
                </div>
                {filteredUsers.length === 0 ? (
                  <div style={{ padding:50, textAlign:'center', fontSize:13, color:'rgba(240,244,255,0.2)' }}>No users match your criteria</div>
                ) : filteredUsers.map(function(u, i) {
                  return (
                    <div key={u.user_id} className="ad-row" style={{ display:'grid', gridTemplateColumns:'2.5fr 2fr 1fr 1fr 1fr 1.2fr', padding:'13px 20px', borderBottom:'1px solid rgba(255,255,255,0.025)', alignItems:'center', animation:'adPop 0.2s ' + (i * 0.015) + 's both' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:9, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'rgba(240,244,255,0.45)', flexShrink:0, position:'relative' }}>
                          {(u.name || '?').charAt(0).toUpperCase()}
                          <div style={{ position:'absolute', bottom:-2, right:-2, width:10, height:10, borderRadius:'50%', border:'2px solid #0a0e1a', background:u.is_online?'#22c55e':'rgba(255,255,255,0.12)', boxShadow:u.is_online?'0 0 8px rgba(34,197,94,0.5)':'none' }}/>
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:'#f0f4ff', lineHeight:1.2 }}>{u.name || 'Unknown'}</div>
                          {u.role === 'admin' && <span style={{ fontSize:9, color:'#a855f7', fontWeight:700, letterSpacing:'0.04em' }}>ADMIN</span>}
                        </div>
                      </div>
                      <span style={{ fontSize:12, color:'rgba(240,244,255,0.35)', fontFamily:"'DM Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</span>
                      <div>
                        <span className="ad-chip" style={{
                          background: u.is_online ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
                          color: u.is_online ? '#22c55e' : 'rgba(240,244,255,0.2)',
                          border: '1px solid ' + (u.is_online ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.06)'),
                          display:'inline-flex', alignItems:'center', gap:5,
                        }}>
                          <div style={{ width:5, height:5, borderRadius:'50%', background:u.is_online?'#22c55e':'rgba(255,255,255,0.15)' }}/>
                          {u.is_online ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <span className="ad-chip" style={{
                          background: u.role==='teacher'?'rgba(251,191,36,0.1)':u.role==='admin'?'rgba(168,85,247,0.1)':'rgba(255,255,255,0.03)',
                          color: u.role==='teacher'?'#fbbf24':u.role==='admin'?'#a855f7':'rgba(240,244,255,0.25)',
                          border:'1px solid '+(u.role==='teacher'?'rgba(251,191,36,0.2)':u.role==='admin'?'rgba(168,85,247,0.2)':'rgba(255,255,255,0.05)'),
                        }}>{u.role}</span>
                      </div>
                      <div>
                        <span className="ad-chip" style={{
                          background: u.payment_status==='paid'?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.08)',
                          color: u.payment_status==='paid'?'#34d399':'#f87171',
                          border:'1px solid '+(u.payment_status==='paid'?'rgba(52,211,153,0.2)':'rgba(248,113,113,0.15)'),
                        }}>{u.payment_status || 'unpaid'}</span>
                      </div>
                      <span style={{ fontSize:11, color:'rgba(240,244,255,0.2)', fontFamily:"'DM Sans',sans-serif" }}>{u.is_online ? 'Online now' : ago(u.last_active)}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ marginTop:10, fontSize:11, color:'rgba(240,244,255,0.18)', textAlign:'right' }}>
                {filteredUsers.length} of {users.length} users shown. Auto-refreshes every 15s.
              </div>
            </div>
          )}

          {/* TEACHER REQUESTS */}
          {tab === 'requests' && (
            <div style={{ animation:'adPop 0.3s both' }}>
              {requests.length === 0 ? (
                <div style={{ padding:60, textAlign:'center', borderRadius:16, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>
                  <Ic d={ICO.check} size={32} stroke="rgba(52,211,153,0.4)"/>
                  <div style={{ fontSize:15, fontWeight:700, color:'rgba(240,244,255,0.5)', marginTop:12 }}>No pending requests</div>
                  <div style={{ fontSize:13, color:'rgba(240,244,255,0.25)', marginTop:4 }}>All teacher verification requests have been processed.</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {requests.map(function(r, i) {
                    var bd = r.basic_details || {}
                    var pd = r.professional_details || {}
                    var ins = r.institution_details || {}
                    var links = r.professional_links || {}
                    return (
                      <div key={r.user_id} style={{ borderRadius:16, border:'1px solid rgba(245,158,11,0.12)', background:'rgba(245,158,11,0.03)', padding:'22px 24px', animation:'adPop 0.3s ' + (i * 0.06) + 's both' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:44, height:44, borderRadius:12, background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:900, color:'#fbbf24' }}>
                              {(r.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize:15, fontWeight:700, color:'#f0f4ff' }}>{r.name}</div>
                              <div style={{ fontSize:12, color:'rgba(240,244,255,0.35)' }}>{r.email}</div>
                            </div>
                          </div>
                          <div style={{ fontSize:11, color:'rgba(240,244,255,0.2)' }}>Submitted {ago(r.submitted_at)}</div>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
                          {[
                            { l:'Qualification', v:pd.qualification },
                            { l:'University', v:pd.university_name },
                            { l:'Experience', v:pd.experience_years ? pd.experience_years + ' years' : '' },
                            { l:'Institution', v:ins.institution_name },
                            { l:'Country', v:bd.country },
                            { l:'Phone', v:pd.phone },
                          ].map(function(item) {
                            if (!item.v) return null
                            return (
                              <div key={item.l} style={{ padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.04)' }}>
                                <div style={{ fontSize:9, fontWeight:700, color:'rgba(240,244,255,0.2)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:3 }}>{item.l}</div>
                                <div style={{ fontSize:12, fontWeight:600, color:'rgba(240,244,255,0.6)' }}>{item.v}</div>
                              </div>
                            )
                          })}
                        </div>
                        {r.bio && (
                          <div style={{ fontSize:12, color:'rgba(240,244,255,0.3)', lineHeight:1.6, marginBottom:16, padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)', fontFamily:"'DM Sans',sans-serif" }}>{r.bio}</div>
                        )}
                        {(links.linkedin_url || links.demo_video_url) && (
                          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
                            {links.linkedin_url && <a href={links.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'#38bdf8', textDecoration:'none', padding:'4px 10px', borderRadius:6, background:'rgba(56,189,248,0.08)', border:'1px solid rgba(56,189,248,0.2)' }}>LinkedIn</a>}
                            {links.demo_video_url && <a href={links.demo_video_url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'#c084fc', textDecoration:'none', padding:'4px 10px', borderRadius:6, background:'rgba(192,132,252,0.08)', border:'1px solid rgba(192,132,252,0.2)' }}>Demo Video</a>}
                            {links.github_url && <a href={links.github_url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'rgba(240,244,255,0.5)', textDecoration:'none', padding:'4px 10px', borderRadius:6, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>GitHub</a>}
                            {links.portfolio_url && <a href={links.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'rgba(240,244,255,0.5)', textDecoration:'none', padding:'4px 10px', borderRadius:6, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>Portfolio</a>}
                          </div>
                        )}
                        <div style={{ display:'flex', gap:10 }}>
                          <button className="ad-btn" onClick={function(){handleApprove(r.user_id)}} disabled={busy===r.user_id+'_a'}
                            style={{ background:'rgba(52,211,153,0.12)', color:'#34d399', border:'1px solid rgba(52,211,153,0.25)', flex:1, justifyContent:'center' }}>
                            {busy===r.user_id+'_a' ? <Spin size={14}/> : <><Ic d={ICO.check} size={14} stroke="#34d399"/> Approve</>}
                          </button>
                          <button className="ad-btn" onClick={function(){handleReject(r.user_id)}} disabled={busy===r.user_id+'_r'}
                            style={{ background:'rgba(248,113,113,0.08)', color:'#f87171', border:'1px solid rgba(248,113,113,0.2)', flex:1, justifyContent:'center' }}>
                            {busy===r.user_id+'_r' ? <Spin size={14}/> : <><Ic d={ICO.x} size={14} stroke="#f87171"/> Reject</>}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === 'notify' && (
            <div style={{ animation:'adPop 0.3s both', display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
              <div style={{ borderRadius:16, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', padding:24 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                  <Ic d={ICO.send} size={16} stroke="#38bdf8"/>
                  <span style={{ fontSize:14, fontWeight:700, color:'#f0f4ff' }}>Send to User</span>
                </div>
                <form onSubmit={handleSendNotif} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <select className="ad-input" value={nTarget} onChange={function(e){setNTarget(e.target.value)}} style={{ cursor:'pointer' }}>
                    <option value="">Select user...</option>
                    {users.filter(function(u){return u.role !== 'admin'}).map(function(u) {
                      return <option key={u.user_id} value={u.user_id}>{u.name} ({u.email})</option>
                    })}
                  </select>
                  <input className="ad-input" placeholder="Notification title" value={nTitle} onChange={function(e){setNTitle(e.target.value)}}/>
                  <textarea className="ad-input" placeholder="Message..." value={nMsg} onChange={function(e){setNMsg(e.target.value)}} rows={4} style={{ resize:'vertical' }}/>
                  <button type="submit" className="ad-btn" disabled={busy==='send'} style={{ background:'rgba(56,189,248,0.12)', color:'#38bdf8', border:'1px solid rgba(56,189,248,0.25)', justifyContent:'center', width:'100%' }}>
                    {busy==='send' ? <Spin size={14}/> : <><Ic d={ICO.send} size={14} stroke="#38bdf8"/> Send Notification</>}
                  </button>
                </form>
              </div>
              <div style={{ borderRadius:16, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', padding:24 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                  <Ic d={ICO.globe} size={16} stroke="#c084fc"/>
                  <span style={{ fontSize:14, fontWeight:700, color:'#f0f4ff' }}>Broadcast to All</span>
                </div>
                <form onSubmit={handleBroadcast} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <input className="ad-input" placeholder="Broadcast title" value={bTitle} onChange={function(e){setBTitle(e.target.value)}}/>
                  <textarea className="ad-input" placeholder="Broadcast message..." value={bMsg} onChange={function(e){setBMsg(e.target.value)}} rows={4} style={{ resize:'vertical' }}/>
                  <div style={{ fontSize:11, color:'rgba(240,244,255,0.2)', padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)' }}>
                    Sends to all {users.filter(function(u){return u.payment_status==='paid'}).length} paid users.
                  </div>
                  <button type="submit" className="ad-btn" disabled={busy==='broadcast'} style={{ background:'rgba(192,132,252,0.12)', color:'#c084fc', border:'1px solid rgba(192,132,252,0.25)', justifyContent:'center', width:'100%' }}>
                    {busy==='broadcast' ? <Spin size={14}/> : <><Ic d={ICO.globe} size={14} stroke="#c084fc"/> Broadcast Now</>}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
