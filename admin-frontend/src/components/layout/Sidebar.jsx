import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { authLogout } from '@/api'
import { useToast } from '@/context/Toast'
import Logo from '@/components/Logo'

function Icon({ name, size = 15 }) {
  const d = {
    dashboard:    <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    user:         <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>,
    wallet:       <><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 13a1 1 0 100 2 1 1 0 000-2z" fill="currentColor"/><path d="M2 10h20"/></>,
    courses:      <><path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12"/><path d="M4 19h16"/></>,
    sessions:     <><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></>,
    rating:       <><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></>,
    bell:         <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    logout:       <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    profile:      <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    teacherReq:   <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    createCourse: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    allCourses:   <><path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12"/><path d="M4 19h16"/></>,
    myCourses:    <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
    check:        <><polyline points="20,6 9,17 4,12"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d[name]}</svg>
}

function NavGroup({ icon, label, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
        borderRadius:7, fontSize:13.5, fontWeight:450,
        color: open ? 'var(--text)' : 'var(--text2)',
        cursor:'pointer', width:'100%', background:'none', border:'none',
        transition:'all 0.12s', letterSpacing:'-0.01em',
      }}>
        <span style={{ opacity:0.7, flexShrink:0 }}><Icon name={icon}/></span>
        <span style={{ flex:1, textAlign:'left' }}>{label}</span>
        <span style={{ fontSize:10, fontWeight:700, transition:'all 0.2s',
          color: open ? 'rgba(240,244,255,0.4)' : 'rgba(240,244,255,0.15)' }}>
          {open ? '−' : '+'}
        </span>
      </button>
      <div style={{ maxHeight: open ? '230px' : '0', overflow:'hidden', transition:'max-height 0.25s ease' }}>
        <div style={{ paddingLeft:8, paddingBottom:4, display:'flex', flexDirection:'column', gap:1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ unread = 0, open = false, onClose = () => {} }) {
  const { user, signout } = useAuth()
  const { toast }  = useToast()
  const navigate   = useNavigate()
  const location   = useLocation()
  const isUser     = ['/profile','/teacher-request'].includes(location.pathname)
  const isCourse   = ['/courses','/create-course','/my-courses','/enrolled-courses'].includes(location.pathname)

  const handleLogout = async () => {
    try { await authLogout() } catch {}
    signout(); navigate('/login'); onClose()
  }

  // close sidebar whenever any nav link is clicked
  const nc = onClose

  return (
    <aside className="sidebar" style={{
      transform: open ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Logo */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)',
        display:'flex', alignItems:'center' }}>
        <Logo size="md"/>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'8px 6px', overflowY:'auto',
        display:'flex', flexDirection:'column', gap:1 }}>

        <NavLink to="/dashboard" onClick={nc} className={({ isActive }) => 'nav-link'+(isActive?' active':'')}>
          <span style={{ opacity:0.7 }}><Icon name="dashboard"/></span><span>Dashboard</span>
        </NavLink>

        <NavGroup icon="user" label="User" defaultOpen={isUser}>
          <NavLink to="/profile" onClick={nc} className={({ isActive }) => 'nav-link'+(isActive?' active':'')} style={{ paddingLeft:14, fontSize:13 }}>
            <span style={{ opacity:0.6 }}><Icon name="profile" size={13}/></span><span>Profile</span>
          </NavLink>
          <NavLink to="/teacher-request" onClick={nc} className={({ isActive }) => 'nav-link'+(isActive?' active':'')} style={{ paddingLeft:14, fontSize:13 }}>
            <span style={{ opacity:0.6 }}><Icon name="teacherReq" size={13}/></span><span>Teacher Request</span>
          </NavLink>
        </NavGroup>

        <NavLink to="/wallet" onClick={nc} className={({ isActive }) => 'nav-link'+(isActive?' active':'')}>
          <span style={{ opacity:0.7 }}><Icon name="wallet"/></span><span>Wallet</span>
        </NavLink>

        <NavGroup icon="courses" label="Courses" defaultOpen={isCourse}>
          <NavLink to="/create-course" onClick={nc} className={({ isActive }) => 'nav-link'+(isActive?' active':'')} style={{ paddingLeft:14, fontSize:13 }}>
            <span style={{ opacity:0.6 }}><Icon name="createCourse" size={13}/></span><span>Create Course</span>
          </NavLink>
          <NavLink to="/my-courses" onClick={nc} className={({ isActive }) => 'nav-link'+(isActive?' active':'')} style={{ paddingLeft:14, fontSize:13 }}>
            <span style={{ opacity:0.6 }}><Icon name="myCourses" size={13}/></span><span>My Courses</span>
          </NavLink>
          <NavLink to="/courses" onClick={nc} className={({ isActive }) => 'nav-link'+(isActive?' active':'')} style={{ paddingLeft:14, fontSize:13 }}>
            <span style={{ opacity:0.6 }}><Icon name="allCourses" size={13}/></span><span>All Courses</span>
          </NavLink>
          <NavLink to="/enrolled-courses" onClick={nc} className={({ isActive }) => 'nav-link'+(isActive?' active':'')} style={{ paddingLeft:14, fontSize:13 }}>
            <span style={{ opacity:0.6 }}><Icon name="check" size={13}/></span><span>Enrolled Courses</span>
          </NavLink>
        </NavGroup>

        <NavLink to="/sessions" onClick={nc} className={({ isActive }) => 'nav-link'+(isActive?' active':'')}>
          <span style={{ opacity:0.7 }}><Icon name="sessions"/></span><span>Sessions</span>
        </NavLink>
        <NavLink to="/ratings" onClick={nc} className={({ isActive }) => 'nav-link'+(isActive?' active':'')}>
          <span style={{ opacity:0.7 }}><Icon name="rating"/></span><span>Rating</span>
        </NavLink>
        <NavLink to="/notifications" onClick={nc} className={({ isActive }) => 'nav-link'+(isActive?' active':'')}>
          <span style={{ opacity:0.7 }}><Icon name="bell"/></span>
          <span style={{ flex:1 }}>Notifications</span>
          {unread > 0 && (
            <span style={{ background:'#6366f1', color:'#fff', fontSize:10, fontWeight:700,
              minWidth:17, height:17, borderRadius:8, display:'flex', alignItems:'center',
              justifyContent:'center', padding:'0 4px' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </NavLink>
      </nav>

      {/* User footer */}
      <div style={{ padding:'8px 6px 10px', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 12px',
          borderRadius:8, background:'var(--surface)', marginBottom:4 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex:1, overflow:'hidden' }}>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--text)',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize:11, color:'var(--text3)',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="nav-link"
          style={{ color:'rgba(248,113,113,0.7)', width:'100%' }}
          onMouseOver={e => { e.currentTarget.style.background='rgba(239,68,68,0.07)'; e.currentTarget.style.color='#f87171' }}
          onMouseOut={e  => { e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(248,113,113,0.7)' }}>
          <span><Icon name="logout"/></span><span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
