import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'

const STATUS = {
  not_requested: { label: 'Not Applied',  cls: 'badge-gray',   color: '120,130,150' },
  pending:       { label: 'Under Review', cls: 'badge-yellow', color: '245,158,11'  },
  approved:      { label: 'Verified',     cls: 'badge-green',  color: '16,185,129'  },
  rejected:      { label: 'Rejected',     cls: 'badge-red',    color: '239,68,68'   },
}

function Icon({ name, size = 16 }) {
  const d = {
    user:    <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>,
    mail:    <><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></>,
    shield:  <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    wallet:  <><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 13a1 1 0 100 2 1 1 0 000-2z" fill="currentColor"/><path d="M2 10h20"/></>,
    credit:  <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    calendar:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    star:    <><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></>,
    role:    <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    check:   <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></>,
    arrow:   <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{d[name]}</svg>
  )
}

export default function ProfilePage() {
  const { user, verStatus } = useAuth()
  const st = STATUS[verStatus] || STATUS.not_requested
  const initial = user?.name?.[0]?.toUpperCase() || 'U'
  const credits = user?.wallet_points ?? 500
  const pct = Math.min(100, Math.round((credits / 500) * 100))
  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })
    : '—'

  const infoRows = [
    { icon: 'user',     label: 'Full Name',      value: user?.name || '—',               special: null },
    { icon: 'mail',     label: 'Email',           value: user?.email || '—',              special: null },
    { icon: 'role',     label: 'Role',            value: user?.role || 'user',            special: 'capitalize' },
    { icon: 'credit',   label: 'Payment Status',  value: user?.payment_status || '—',     special: 'capitalize' },
    { icon: 'shield',   label: 'Teacher Status',  value: null,                            special: 'badge' },
    { icon: 'calendar', label: 'Member Since',    value: joined,                          special: null },
  ]

  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }} className="fade-up">

      {/* ── HERO PROFILE CARD ── */}
      <div style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden',
        marginBottom: 20, padding: '32px 36px',
        background: 'linear-gradient(135deg, rgba(10,18,50,0.97) 0%, rgba(8,14,40,0.99) 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Glow top line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6) 40%, rgba(99,102,241,0.5) 70%, transparent)',
          pointerEvents: 'none' }} />
        {/* Background glow */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #60a5fa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, fontWeight: 700, color: '#fff',
              boxShadow: '0 0 0 4px rgba(59,130,246,0.2), 0 8px 32px rgba(59,130,246,0.3)',
            }}>
              {initial}
            </div>
            {/* Online dot */}
            <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14,
              borderRadius: '50%', background: '#10b981',
              border: '2px solid #04081a', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }} />
          </div>

          {/* Name + email + badge */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                {user?.name || 'User'}
              </h2>
              <span className={'badge ' + st.cls} style={{ fontSize: 11 }}>{st.label}</span>
            </div>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>{user?.email}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                <Icon name="role" size={12} />
                <span style={{ textTransform: 'capitalize' }}>{user?.role || 'user'}</span>
              </div>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                <Icon name="calendar" size={12} />
                <span>Joined {joined}</span>
              </div>
            </div>
          </div>

          {/* Credits widget */}
          <div style={{
            flexShrink: 0, padding: '18px 24px', borderRadius: 14,
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            minWidth: 150, textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Time Credits
            </div>
            <div style={{ fontSize: 42, fontWeight: 700, color: '#f1f5f9',
              letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>
              {credits}
            </div>
            {/* Credit bar */}
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 10, width: pct + '%',
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                transition: 'width 1s ease',
              }} />
            </div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
              {pct}% of 500 max
            </div>
          </div>
        </div>
      </div>

      {/* ── ACCOUNT INFO GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {infoRows.map(({ icon, label, value, special }) => (
          <div key={label} style={{
            padding: '16px 20px', borderRadius: 12,
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', gap: 14,
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; e.currentTarget.style.background = 'rgba(59,130,246,0.04)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}>
            {/* Icon box */}
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#60a5fa',
            }}>
              <Icon name={icon} size={15} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>
                {label}
              </div>
              {special === 'badge'
                ? <span className={'badge ' + st.cls} style={{ fontSize: 11 }}>{st.label}</span>
                : <div style={{
                    fontSize: 14, fontWeight: 600, color: '#f1f5f9',
                    textTransform: special === 'capitalize' ? 'capitalize' : 'none',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{value}</div>
              }
            </div>
          </div>
        ))}
      </div>

      {/* ── STATS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { icon: 'wallet', label: 'Balance',       value: credits + ' pts', color: '59,130,246' },
          { icon: 'check',  label: 'Account Status', value: 'Active',         color: '16,185,129' },
          { icon: 'star',   label: 'Teacher Status', value: st.label,         color: st.color },
        ].map(s => (
          <div key={s.label} style={{
            padding: '16px 20px', borderRadius: 12,
            background: `rgba(${s.color},0.07)`,
            border: `1px solid rgba(${s.color},0.18)`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ color: `rgb(${s.color})`, opacity: 0.8 }}><Icon name={s.icon} size={18} /></div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 3,
                textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ACTIONS ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {(verStatus === 'not_requested' || verStatus === 'rejected') && (
          <Link to="/teacher-request" className="btn btn-primary" style={{ textDecoration: 'none', gap: 8 }}>
            <Icon name="star" size={14} /> Apply as Teacher
          </Link>
        )}
        {verStatus === 'pending' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px',
            borderRadius: 9, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            fontSize: 13.5, color: '#fbbf24', fontWeight: 500 }}>
            <Icon name="shield" size={15} /> Application under review
          </div>
        )}
        {verStatus === 'approved' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px',
            borderRadius: 9, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            fontSize: 13.5, color: '#34d399', fontWeight: 500 }}>
            <Icon name="check" size={15} /> Verified Teacher
          </div>
        )}
        <Link to="/wallet" className="btn btn-ghost" style={{ textDecoration: 'none', gap: 8 }}>
          <Icon name="wallet" size={14} /> View Wallet
        </Link>
      </div>

    </div>
  )
}
