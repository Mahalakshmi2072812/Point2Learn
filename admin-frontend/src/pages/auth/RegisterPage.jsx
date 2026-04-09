import Logo from '@/components/Logo'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authRegister } from '@/api'
import { useToast } from '@/context/Toast'
import Spin from '@/components/ui/Spin'

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
  @keyframes float2  { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(4deg)} }
  @keyframes pulse2  { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
  @keyframes shimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes borderGlow { 0%,100%{border-color:rgba(99,102,241,0.3)} 50%{border-color:rgba(99,102,241,0.7)} }
  .auth-input { width:100%; padding:15px 18px; font-size:14.5px; font-family:'Sora',sans-serif;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);
    border-radius:12px; color:#f0f4ff; outline:none; transition:all 0.2s; }
  .auth-input:focus { border-color:rgba(99,102,241,0.6); background:rgba(99,102,241,0.07);
    box-shadow:0 0 0 4px rgba(99,102,241,0.12); }
  .auth-input::placeholder { color:rgba(240,244,255,0.2); }
  .submit-btn { width:100%; padding:16px; font-size:15px; font-weight:700;
    font-family:'Sora',sans-serif; background:linear-gradient(135deg,#4f46e5,#6366f1,#7c3aed);
    background-size:200% 200%; animation:shimmer 5s ease infinite;
    color:#fff; border:1px solid rgba(255,255,255,0.15); border-radius:12px; cursor:pointer;
    box-shadow:0 8px 32px rgba(99,102,241,0.45); letter-spacing:-0.02em;
    display:flex; align-items:center; justify-content:center; gap:10; transition:all 0.25s; }
  .submit-btn:hover { transform:translateY(-3px); box-shadow:0 20px 50px rgba(99,102,241,0.6); }
  .submit-btn:disabled { opacity:0.55; cursor:not-allowed; transform:none; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:#050818; }
  ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.4); border-radius:3px; }
`

export default function RegisterPage() {
  const [name,  setName]  = useState('')
  const [email, setEmail] = useState('')
  const [pass,  setPass]  = useState('')
  const [loading, setL]   = useState(false)
  const { toast }  = useToast()
  const navigate   = useNavigate()

  const submit = async e => {
    e.preventDefault(); setL(true)
    try {
      await authRegister(name, email, pass)
      toast('Account created! Complete ₹500 payment to activate.', 'success')
      navigate(`/payment?email=${encodeURIComponent(email)}`)
    } catch(err) {
      toast(err.response?.data?.detail || 'Registration failed', 'error')
    }
    setL(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#050818', color:'#f0f4ff',
      fontFamily:"'Sora','Plus Jakarta Sans',sans-serif", display:'flex', overflow:'hidden' }}>
      <style>{SHARED_STYLES}</style>

      {/* ── BACKGROUND ── */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-20%', left:'-15%', width:750, height:750,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.16) 0%,transparent 68%)',
          animation:'float 9s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', top:'40%', right:'-12%', width:550, height:550,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.11) 0%,transparent 68%)',
          animation:'float2 13s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', inset:0,
          backgroundImage:'linear-gradient(rgba(99,102,241,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.035) 1px,transparent 1px)',
          backgroundSize:'60px 60px' }}/>
      </div>

      {/* ── LEFT: FORM ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'60px 80px', minHeight:'100vh', position:'relative', zIndex:1 }}>

        <div style={{ marginBottom:48, animation:'fadeUp 0.5s both' }}>
          <Logo size="lg" />
        </div>

        <div style={{ maxWidth:460, animation:'fadeUp 0.6s 0.05s both' }}>
          <div style={{ marginBottom:36 }}>
            <h1 style={{ fontSize:38, fontWeight:800, color:'#f0f4ff',
              letterSpacing:'-0.045em', lineHeight:1, marginBottom:12 }}>
              Create account
            </h1>
            <p style={{ fontSize:15, color:'rgba(240,244,255,0.38)', lineHeight:1.7,
              fontFamily:"'DM Sans',sans-serif" }}>
              Register, then complete the one-time{' '}
              <strong style={{ color:'#fbbf24', fontWeight:600 }}>₹500 payment</strong>{' '}
              to activate your account and receive 500 credits.
            </p>
          </div>

          {/* Steps */}
          <div style={{ display:'flex', alignItems:'center', marginBottom:40 }}>
            {[
              { n:'1', l:'Register', active:true  },
              { n:'2', l:'Pay ₹500', active:false },
              { n:'3', l:'Sign In',  active:false },
            ].map(({ n, l, active }, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{
                    width:36, height:36, borderRadius:'50%', display:'flex',
                    alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700,
                    background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                    color: active ? '#a5b4fc' : 'rgba(240,244,255,0.2)',
                    border: active ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: active ? '0 0 22px rgba(99,102,241,0.3)' : 'none',
                  }}>{n}</div>
                  <div style={{ fontSize:11, fontWeight:600, whiteSpace:'nowrap', letterSpacing:'0.03em',
                    color: active ? '#c7d2fe' : 'rgba(240,244,255,0.22)' }}>{l}</div>
                </div>
                {i < 2 && (
                  <div style={{ width:60, height:1, margin:'0 8px 20px',
                    background:'rgba(255,255,255,0.07)' }}/>
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700,
                color:'rgba(240,244,255,0.35)', marginBottom:10,
                letterSpacing:'0.1em', textTransform:'uppercase' }}>Full Name</label>
              <input className="auth-input" placeholder="Your full name"
                value={name} onChange={e=>setName(e.target.value)} required autoFocus />
            </div>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700,
                color:'rgba(240,244,255,0.35)', marginBottom:10,
                letterSpacing:'0.1em', textTransform:'uppercase' }}>Email Address</label>
              <input className="auth-input" type="email" placeholder="you@email.com"
                value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:700,
                color:'rgba(240,244,255,0.35)', marginBottom:10,
                letterSpacing:'0.1em', textTransform:'uppercase' }}>Password</label>
              <input className="auth-input" type="password" placeholder="Create a strong password"
                value={pass} onChange={e=>setPass(e.target.value)} required />
            </div>

            <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop:6 }}>
              {loading ? <Spin size={17}/> : <>
                Create Account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
              </>}
            </button>
          </form>

          <p style={{ marginTop:28, fontSize:14, color:'rgba(240,244,255,0.28)', textAlign:'center',
            fontFamily:"'DM Sans',sans-serif" }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#818cf8', fontWeight:600, textDecoration:'none' }}
              onMouseOver={e=>e.currentTarget.style.color='#a5b4fc'}
              onMouseOut={e=>e.currentTarget.style.color='#818cf8'}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT: BENEFITS ── */}
      <div style={{ width:'46%', minHeight:'100vh', position:'relative', zIndex:1,
        display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 68px',
        borderLeft:'1px solid rgba(255,255,255,0.06)',
        background:'rgba(255,255,255,0.018)', backdropFilter:'blur(12px)', overflow:'hidden' }}>

        <div style={{ position:'absolute', top:'-5%', right:'-8%', width:400, height:400,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.1),transparent)',
          pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'8%', left:'-5%', width:300, height:300,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.08),transparent)',
          pointerEvents:'none' }}/>

        <div style={{ animation:'fadeUp 0.7s 0.2s both' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px',
            borderRadius:100, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)',
            fontSize:11, fontWeight:700, color:'#a5b4fc', letterSpacing:'0.08em',
            textTransform:'uppercase', marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#6366f1',
              boxShadow:'0 0 8px #6366f1', animation:'pulse2 2s infinite' }}/>
            What You Get
          </div>

          <h2 style={{ fontSize:34, fontWeight:800, color:'#f0f4ff',
            letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:14 }}>
            One account.<br/>
            <span style={{ background:'linear-gradient(135deg,#6366f1,#06b6d4)',
              backgroundSize:'200% 200%', animation:'shimmer 4s ease infinite',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              Endless skills.
            </span>
          </h2>
          <p style={{ fontSize:14, color:'rgba(240,244,255,0.36)', lineHeight:1.85, marginBottom:40,
            fontFamily:"'DM Sans',sans-serif" }}>
            Register and pay ₹500 once. Get full access, 500 time credits, and start learning or teaching immediately.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { title:'500 Time Credits',         desc:'Instant on activation. Use on any live session right away.',   c:'#fbbf24', rgb:'245,158,11' },
              { title:'All Live Courses Access',  desc:'Learn from verified teachers via Jitsi Meet — no app needed.',  c:'#818cf8', rgb:'99,102,241' },
              { title:'Earn Credits by Teaching', desc:'Apply as teacher, earn 10 credits per attending student.',      c:'#34d399', rgb:'16,185,129' },
              { title:'Wallet Auto-Refills',      desc:'500 credits added automatically every 5 hours — never run dry.',c:'#c084fc', rgb:'192,132,252' },
            ].map(({ title, desc, c, rgb }) => (
              <div key={title} style={{ display:'flex', alignItems:'flex-start', gap:16,
                padding:'18px 20px', borderRadius:14,
                background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)',
                transition:'all 0.18s', cursor:'default' }}
                onMouseOver={e=>{ e.currentTarget.style.background=`rgba(${rgb},0.06)`; e.currentTarget.style.borderColor=`rgba(${rgb},0.2)` }}
                onMouseOut={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)' }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:c,
                  flexShrink:0, marginTop:5, boxShadow:`0 0 14px rgba(${rgb},0.7)` }}/>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#f0f4ff', marginBottom:4,
                    letterSpacing:'-0.015em' }}>{title}</div>
                  <div style={{ fontSize:12.5, color:'rgba(240,244,255,0.35)', lineHeight:1.6,
                    fontFamily:"'DM Sans',sans-serif" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
