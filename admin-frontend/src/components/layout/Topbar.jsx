import { useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Logo from '@/components/Logo'

const META = {
  '/dashboard':        'Dashboard',
  '/profile':          'Profile',
  '/teacher-request':  'Teacher Request',
  '/wallet':           'Wallet',
  '/courses':          'All Courses',
  '/enrolled-courses': 'Enrolled Courses',
  '/create-course':    'Create Course',
  '/my-courses':       'My Courses',
  '/sessions':         'Sessions',
  '/ratings':          'Rating',
  '/notifications':    'Notifications',
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { user, verStatus, isTeacher, isAdmin } = useAuth()

  const roleLabel = isAdmin ? 'Admin' : isTeacher ? 'Teacher' : verStatus === 'pending' ? 'Pending' : 'Student'
  const roleCls   = isAdmin ? 'badge-purple' : isTeacher ? 'badge-green' : verStatus === 'pending' ? 'badge-yellow' : 'badge-blue'
  const title     = META[pathname] || 'Dashboard'

  return (
    <header className="topbar">
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>

        {/* ── Hamburger button ── */}
        <button
          onClick={onMenuClick}
          style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            width:36, height:36, borderRadius:9,
            background:'rgba(255,255,255,0.05)',
            border:'1px solid rgba(255,255,255,0.1)',
            color:'var(--text2)', cursor:'pointer',
            transition:'all 0.15s', flexShrink:0,
          }}
          onMouseOver={e => { e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.color='#a5b4fc'; e.currentTarget.style.borderColor='rgba(99,102,241,0.35)' }}
          onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='var(--text2)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)' }}
        >
          <HamburgerIcon />
        </button>

        {/* Logo + breadcrumb */}
        <Logo size="sm" />
        <span style={{ fontSize:13, color:'var(--text3)' }}>/</span>
        <span style={{ fontSize:13.5, fontWeight:500, color:'var(--text)' }}>{title}</span>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span className={'badge ' + roleCls}>{roleLabel}</span>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 12px 5px 6px',
          background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:24 }}>
          <div style={{ width:24, height:24, borderRadius:'50%', background:'#1d4ed8',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontWeight:600, color:'#fff' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{user?.name}</span>
        </div>
      </div>
    </header>
  )
}
