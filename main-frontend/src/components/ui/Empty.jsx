const ICONS = {
  default: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
  user:    <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  course:  <><path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12"/><path d="M4 19h16"/><path d="M9 7v6l3-2 3 2V7"/></>,
  notif:   <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
  search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  wallet:  <><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 13a1 1 0 100 2 1 1 0 000-2z" fill="currentColor"/><path d="M2 10h20"/></>,
  session: <><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></>,
  rating:  <><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></>,
}

const THEME = {
  default: { rgb:'99,102,241',  hex:'#818cf8' },
  user:    { rgb:'56,189,248',  hex:'#7dd3fc' },
  course:  { rgb:'245,158,11',  hex:'#fbbf24' },
  notif:   { rgb:'239,68,68',   hex:'#f87171' },
  search:  { rgb:'99,102,241',  hex:'#818cf8' },
  wallet:  { rgb:'16,185,129',  hex:'#34d399' },
  session: { rgb:'99,102,241',  hex:'#818cf8' },
  rating:  { rgb:'251,191,36',  hex:'#fde68a' },
}

export default function Empty({ title, desc, action, type = 'default' }) {
  const icon  = ICONS[type]  || ICONS.default
  const theme = THEME[type]  || THEME.default
  const { rgb, hex } = theme

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:'64px 24px', textAlign:'center' }}>
      {/* Icon box with glow */}
      <div style={{ position:'relative', marginBottom:24 }}>
        <div style={{ width:72, height:72, borderRadius:20,
          background:`linear-gradient(135deg,rgba(${rgb},0.12),rgba(${rgb},0.04))`,
          border:`1px solid rgba(${rgb},0.22)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:`0 0 40px rgba(${rgb},0.12)`, color:hex }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </div>
        {/* Decorative ring */}
        <div style={{ position:'absolute', inset:-6, borderRadius:26,
          border:`1px solid rgba(${rgb},0.1)`, pointerEvents:'none' }}/>
        <div style={{ position:'absolute', inset:-12, borderRadius:32,
          border:`1px solid rgba(${rgb},0.05)`, pointerEvents:'none' }}/>
      </div>

      <p style={{ fontSize:16, fontWeight:700, color:'#f0f4ff', marginBottom:8,
        letterSpacing:'-0.025em', fontFamily:"'Sora',sans-serif" }}>
        {title}
      </p>
      {desc && (
        <p style={{ fontSize:13, color:'rgba(240,244,255,0.35)', maxWidth:300,
          lineHeight:1.7, marginBottom: action ? 0 : 0,
          fontFamily:"'DM Sans',sans-serif" }}>
          {desc}
        </p>
      )}
      {action && (
        <div style={{ marginTop:22 }}>{action}</div>
      )}
    </div>
  )
}
