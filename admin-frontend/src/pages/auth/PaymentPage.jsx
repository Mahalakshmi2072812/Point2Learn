import Logo from '@/components/Logo'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authActivate } from '@/api'
import { useToast } from '@/context/Toast'
import Spin from '@/components/ui/Spin'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }

  @keyframes fadeUp     { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
  @keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
  @keyframes float2     { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-16px) rotate(4deg)} }
  @keyframes pulse2     { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
  @keyframes goldShimmer{ 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes checkPop   { 0%{transform:scale(0) rotate(-30deg);opacity:0} 60%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
  @keyframes ringExpand { 0%{transform:scale(0.5);opacity:1} 100%{transform:scale(2.5);opacity:0} }
  @keyframes slideUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scanLine   { 0%{top:-10%} 100%{top:110%} }
  @keyframes cardFlip   { 0%{transform:rotateY(0deg)} 100%{transform:rotateY(10deg)} }
  @keyframes processing { 0%{width:0%} 100%{width:100%} }
  @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .pay-tab { padding:11px 0; font-size:13.5px; font-weight:600; font-family:'Sora',sans-serif;
    border:none; background:none; cursor:pointer; transition:all 0.2s; border-bottom:2px solid transparent;
    color:rgba(240,244,255,0.35); flex:1; display:flex; align-items:center; justify-content:center; gap:7; }
  .pay-tab.active { color:#fbbf24; border-bottom-color:#fbbf24; }
  .pay-tab:hover:not(.active) { color:rgba(240,244,255,0.6); }

  .pay-input { width:100%; padding:14px 18px; font-size:14px; font-family:'Sora',sans-serif;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
    border-radius:11px; color:#f0f4ff; outline:none; transition:all 0.2s; letter-spacing:0.02em; }
  .pay-input:focus { border-color:rgba(245,158,11,0.6); background:rgba(245,158,11,0.05);
    box-shadow:0 0 0 3px rgba(245,158,11,0.1); }
  .pay-input::placeholder { color:rgba(240,244,255,0.18); }
  .pay-input-card { letter-spacing:0.12em; font-family:'Courier New',monospace; font-size:15px; }

  .upi-option { display:flex; align-items:center; gap:14; padding:15px 18px; border-radius:12px;
    border:1.5px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.025);
    cursor:pointer; transition:all 0.2s; }
  .upi-option:hover { border-color:rgba(245,158,11,0.35); background:rgba(245,158,11,0.04); }
  .upi-option.selected { border-color:rgba(245,158,11,0.6); background:rgba(245,158,11,0.07);
    box-shadow:0 0 0 3px rgba(245,158,11,0.08); }

  .pay-btn { width:100%; padding:17px; font-size:15.5px; font-weight:700;
    font-family:'Sora',sans-serif;
    background:linear-gradient(135deg,#d97706,#f59e0b,#fbbf24,#f59e0b,#d97706);
    background-size:300% 300%; animation:goldShimmer 4s ease infinite;
    color:#1a0800; border:none; border-radius:13px; cursor:pointer;
    box-shadow:0 8px 32px rgba(245,158,11,0.45); letter-spacing:-0.01em;
    display:flex; align-items:center; justify-content:center; gap:10; transition:all 0.25s; }
  .pay-btn:hover:not(:disabled) { transform:translateY(-3px); box-shadow:0 20px 50px rgba(245,158,11,0.6); }
  .pay-btn:disabled { opacity:0.55; cursor:not-allowed; transform:none !important; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:#050818; }
  ::-webkit-scrollbar-thumb { background:rgba(245,158,11,0.35); border-radius:3px; }
`

const UPI_APPS = [
  { id:'gpay',    name:'Google Pay',  color:'#4285f4', logo:'G', sub:'UPI' },
  { id:'phonepe', name:'PhonePe',     color:'#5f259f', logo:'₱', sub:'UPI' },
  { id:'paytm',   name:'Paytm',       color:'#00b9f1', logo:'P', sub:'UPI' },
  { id:'upi',     name:'Other UPI',   color:'#ff6600', logo:'⊕', sub:'VPA' },
]

function CardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}
function UPIIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  )
}
function NetBankIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
      <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
      <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12,2 2,7 22,7"/>
    </svg>
  )
}

function SuccessScreen({ email, onContinue }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', background:'#050818', fontFamily:"'Sora',sans-serif",
      position:'fixed', inset:0, zIndex:200, animation:'fadeIn 0.4s both' }}>
      <style>{CSS}</style>

      {/* Background */}
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          width:600, height:600, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(16,185,129,0.14) 0%,transparent 70%)' }}/>
        <div style={{ position:'absolute', inset:0,
          backgroundImage:'linear-gradient(rgba(16,185,129,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.025) 1px,transparent 1px)',
          backgroundSize:'60px 60px' }}/>
      </div>

      <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:420, padding:'0 32px' }}>
        {/* Ring animation */}
        <div style={{ position:'relative', width:120, height:120, margin:'0 auto 36px' }}>
          <div style={{ position:'absolute', inset:0, borderRadius:'50%',
            border:'2px solid rgba(16,185,129,0.4)',
            animation:'ringExpand 1.2s ease-out both' }}/>
          <div style={{ position:'absolute', inset:0, borderRadius:'50%',
            border:'2px solid rgba(16,185,129,0.3)',
            animation:'ringExpand 1.2s ease-out 0.2s both' }}/>
          <div style={{ width:120, height:120, borderRadius:'50%',
            background:'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.08))',
            border:'2px solid rgba(16,185,129,0.5)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 50px rgba(16,185,129,0.3)',
            animation:'checkPop 0.6s 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
        </div>

        <div style={{ animation:'slideUp 0.5s 0.6s both' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#34d399', letterSpacing:'0.1em',
            textTransform:'uppercase', marginBottom:12 }}>Payment Successful</div>
          <h1 style={{ fontSize:52, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.05em',
            lineHeight:1, marginBottom:8 }}>
            ₹500
            <span style={{ fontSize:18, fontWeight:500, color:'rgba(240,244,255,0.4)',
              letterSpacing:'-0.02em' }}> paid</span>
          </h1>
          <p style={{ fontSize:15, color:'rgba(240,244,255,0.38)', lineHeight:1.7, marginBottom:12,
            fontFamily:"'DM Sans',sans-serif" }}>
            Your account has been activated!<br/>500 time credits added to your wallet.
          </p>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 18px',
            borderRadius:100, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)',
            fontSize:12.5, color:'#34d399', fontWeight:600, marginBottom:36 }}>
            ✦ {email}
          </div>

          {/* Mini receipt */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:16, padding:'20px 24px', marginBottom:32, textAlign:'left' }}>
            {[
              { k:'Transaction ID', v:'P2L'+Math.random().toString(36).slice(2,10).toUpperCase() },
              { k:'Amount',         v:'₹500.00' },
              { k:'Status',         v:'Confirmed ✓' },
              { k:'Credits Added',  v:'500 credits' },
            ].map(({ k, v }) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize:12.5, color:'rgba(240,244,255,0.35)', fontFamily:"'DM Sans',sans-serif" }}>{k}</span>
                <span style={{ fontSize:13, fontWeight:600, color: k==='Status'?'#34d399':'rgba(240,244,255,0.7)',
                  letterSpacing: k==='Transaction ID'?'0.04em':'-0.01em' }}>{v}</span>
              </div>
            ))}
          </div>

          <button onClick={onContinue} style={{ width:'100%', padding:'16px', borderRadius:13,
            background:'linear-gradient(135deg,#059669,#10b981)',
            border:'1px solid rgba(255,255,255,0.15)', color:'#fff',
            fontSize:15, fontWeight:700, fontFamily:"'Sora',sans-serif",
            cursor:'pointer', boxShadow:'0 8px 32px rgba(16,185,129,0.4)',
            letterSpacing:'-0.01em', transition:'all 0.25s', display:'flex',
            alignItems:'center', justifyContent:'center', gap:9 }}
            onMouseOver={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(16,185,129,0.55)' }}
            onMouseOut={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 8px 32px rgba(16,185,129,0.4)' }}>
            Go to Sign In
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function ProcessingScreen({ method }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:150, background:'rgba(5,8,24,0.95)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      backdropFilter:'blur(16px)', animation:'fadeIn 0.3s both', fontFamily:"'Sora',sans-serif" }}>
      <div style={{ textAlign:'center', maxWidth:360 }}>
        <div style={{ width:80, height:80, borderRadius:'50%',
          background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 28px', boxShadow:'0 0 40px rgba(245,158,11,0.2)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div style={{ fontSize:20, fontWeight:700, color:'#f0f4ff', marginBottom:10, letterSpacing:'-0.03em' }}>
          Processing Payment
        </div>
        <div style={{ fontSize:14, color:'rgba(240,244,255,0.38)', marginBottom:32,
          fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
          Please wait while we verify your<br/>₹500 payment via {method}...
        </div>
        {/* Progress bar */}
        <div style={{ width:280, height:4, background:'rgba(255,255,255,0.08)',
          borderRadius:2, overflow:'hidden', margin:'0 auto' }}>
          <div style={{ height:'100%', borderRadius:2,
            background:'linear-gradient(90deg,#f59e0b,#fbbf24)',
            animation:'processing 2.5s ease-out forwards',
            boxShadow:'0 0 12px rgba(245,158,11,0.6)' }}/>
        </div>
        <div style={{ fontSize:12, color:'rgba(240,244,255,0.25)', marginTop:16,
          animation:'blink 1.5s infinite', fontFamily:"'DM Sans',sans-serif" }}>
          Securing your transaction...
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  const params = new URLSearchParams(window.location.search)
  const emailFromURL = params.get('email') || ''

  const [tab,       setTab]     = useState('upi')
  const [upiApp,    setUpiApp]  = useState('gpay')
  const [upiId,     setUpiId]   = useState('')
  const [cardNum,   setCardNum] = useState('')
  const [cardName,  setCardName]= useState('')
  const [cardExp,   setCardExp] = useState('')
  const [cardCvv,   setCardCvv] = useState('')
  const [bank,      setBank]    = useState('')
  const [email,     setEmail]   = useState(emailFromURL)
  const [step,      setStep]    = useState('form')   // form | processing | success
  const [loading,   setL]       = useState(false)
  const { toast }  = useToast()
  const navigate   = useNavigate()

  const formatCard = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  const formatExp  = v => { const d=v.replace(/\D/g,'').slice(0,4); return d.length>2?d.slice(0,2)+'/'+d.slice(2):d }

  const handlePay = async e => {
    e.preventDefault()
    if (!email) { toast('Please enter your registered email', 'error'); return }
    setStep('processing')
    setL(true)
    // Simulate processing delay then activate
    await new Promise(r => setTimeout(r, 2800))
    try {
      await authActivate(email)
      setStep('success')
    } catch(err) {
      toast(err.response?.data?.detail || 'Activation failed. Please retry.', 'error')
      setStep('form')
    }
    setL(false)
  }

  if (step === 'success') return <><style>{CSS}</style><SuccessScreen email={email} onContinue={()=>navigate('/login')} /></>
  if (step === 'processing') return <><style>{CSS}</style><ProcessingScreen method={tab==='upi'?UPI_APPS.find(a=>a.id===upiApp)?.name:'Card'} /></>

  return (
    <div style={{ minHeight:'100vh', background:'#050818', color:'#f0f4ff',
      fontFamily:"'Sora','Plus Jakarta Sans',sans-serif", display:'flex', overflow:'hidden' }}>
      <style>{CSS}</style>

      {/* ── BACKGROUND ── */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-15%', right:'-10%', width:700, height:700,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(245,158,11,0.1) 0%,transparent 68%)',
          animation:'float 10s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', bottom:'-20%', left:'-12%', width:650, height:650,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 68%)',
          animation:'float2 12s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', inset:0,
          backgroundImage:'linear-gradient(rgba(245,158,11,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.025) 1px,transparent 1px)',
          backgroundSize:'60px 60px' }}/>
      </div>

      {/* ── LEFT: PAYMENT GATEWAY ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'60px 80px', minHeight:'100vh', position:'relative', zIndex:1,
        maxWidth:660 }}>

        <div style={{ marginBottom:44, animation:'fadeUp 0.5s both' }}>
          <Logo size="lg" />
        </div>

        <div style={{ animation:'fadeUp 0.6s 0.05s both' }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32 }}>
            <div>
              <h1 style={{ fontSize:30, fontWeight:800, color:'#f0f4ff',
                letterSpacing:'-0.04em', lineHeight:1, marginBottom:6 }}>
                Complete Payment
              </h1>
              <p style={{ fontSize:13.5, color:'rgba(240,244,255,0.38)', fontFamily:"'DM Sans',sans-serif" }}>
                Secure one-time activation fee
              </p>
            </div>
            {/* Amount badge */}
            <div style={{ textAlign:'right', padding:'14px 22px', borderRadius:14,
              background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(245,158,11,0.6)',
                letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Amount Due</div>
              <div style={{ fontSize:32, fontWeight:800, color:'#fbbf24', letterSpacing:'-0.04em',
                animation:'goldShimmer 3s ease infinite',
                background:'linear-gradient(135deg,#d97706,#fbbf24,#fde68a)',
                backgroundSize:'200%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                backgroundClip:'text' }}>
                ₹500
              </div>
            </div>
          </div>

          {/* Step tracker */}
          <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
            {[
              { n:'✓', l:'Registered', done:true },
              { n:'2', l:'Pay ₹500',   active:true },
              { n:'3', l:'Sign In',    active:false },
            ].map(({ n, l, done, active }, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', display:'flex',
                    alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700,
                    background: done?'rgba(16,185,129,0.15)':active?'rgba(245,158,11,0.18)':'rgba(255,255,255,0.05)',
                    color: done?'#34d399':active?'#fbbf24':'rgba(240,244,255,0.2)',
                    border: done?'1px solid rgba(16,185,129,0.35)':active?'1px solid rgba(245,158,11,0.5)':'1px solid rgba(255,255,255,0.07)',
                    boxShadow:active?'0 0 18px rgba(245,158,11,0.3)':'none' }}>
                    {n}
                  </div>
                  <div style={{ fontSize:10.5, fontWeight:600, whiteSpace:'nowrap', letterSpacing:'0.03em',
                    color:done?'#34d399':active?'#fde68a':'rgba(240,244,255,0.22)' }}>{l}</div>
                </div>
                {i < 2 && <div style={{ width:52, height:1, margin:'0 8px 18px',
                  background:done?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.07)' }}/>}
              </div>
            ))}
          </div>

          {/* ──── PAYMENT CARD ──── */}
          <div style={{ background:'rgba(255,255,255,0.025)', backdropFilter:'blur(20px)',
            border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, overflow:'hidden' }}>

            {/* Tab bar */}
            <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)',
              background:'rgba(255,255,255,0.02)', padding:'0 20px' }}>
              {[
                { id:'upi',     label:'UPI',       icon:<UPIIcon/> },
                { id:'card',    label:'Card',       icon:<CardIcon/> },
                { id:'netbank', label:'Net Banking', icon:<NetBankIcon/> },
              ].map(({ id, label, icon }) => (
                <button key={id} className={`pay-tab${tab===id?' active':''}`}
                  onClick={()=>setTab(id)}>
                  {icon} {label}
                </button>
              ))}
            </div>

            <div style={{ padding:'28px 28px 24px' }}>
              {/* ── UPI TAB ── */}
              {tab === 'upi' && (
                <div style={{ animation:'slideUp 0.3s both' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
                    {UPI_APPS.map(app => (
                      <div key={app.id} className={`upi-option${upiApp===app.id?' selected':''}`}
                        onClick={()=>setUpiApp(app.id)}>
                        <div style={{ width:38, height:38, borderRadius:10, flexShrink:0,
                          background:`${app.color}22`, border:`1px solid ${app.color}44`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:16, fontWeight:800, color:app.color }}>
                          {app.logo}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:'#f0f4ff',
                            letterSpacing:'-0.01em' }}>{app.name}</div>
                          <div style={{ fontSize:11, color:'rgba(240,244,255,0.35)',
                            fontFamily:"'DM Sans',sans-serif" }}>{app.sub}</div>
                        </div>
                        <div style={{ marginLeft:'auto', width:18, height:18, borderRadius:'50%',
                          border:`2px solid ${upiApp===app.id?'#fbbf24':'rgba(255,255,255,0.15)'}`,
                          background:upiApp===app.id?'#fbbf24':'transparent',
                          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {upiApp===app.id && <div style={{ width:7, height:7, borderRadius:'50%', background:'#1a0800' }}/>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {upiApp === 'upi' ? (
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700,
                        color:'rgba(240,244,255,0.35)', marginBottom:9,
                        letterSpacing:'0.1em', textTransform:'uppercase' }}>
                        UPI ID / VPA
                      </label>
                      <input className="pay-input" placeholder="yourname@upi"
                        value={upiId} onChange={e=>setUpiId(e.target.value)} />
                    </div>
                  ) : (
                    <div style={{ padding:'14px 18px', borderRadius:12,
                      background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)',
                      display:'flex', alignItems:'center', gap:12,
                      fontSize:13, color:'rgba(240,244,255,0.5)', fontFamily:"'DM Sans',sans-serif" }}>
                      <span style={{ fontSize:18 }}>📱</span>
                      A payment request will be sent to your{' '}
                      <strong style={{ color:'#fbbf24' }}>{UPI_APPS.find(a=>a.id===upiApp)?.name}</strong> app.
                    </div>
                  )}
                </div>
              )}

              {/* ── CARD TAB ── */}
              {tab === 'card' && (
                <div style={{ animation:'slideUp 0.3s both' }}>
                  {/* Visual card */}
                  <div style={{ borderRadius:16, padding:'22px 24px', marginBottom:24, position:'relative', overflow:'hidden',
                    background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)',
                    boxShadow:'0 12px 40px rgba(0,0,0,0.5)', height:160 }}>
                    {/* Chip */}
                    <div style={{ width:36, height:28, borderRadius:6, background:'linear-gradient(135deg,#d4a017,#fbbf24)',
                      marginBottom:16, position:'relative', zIndex:1,
                      boxShadow:'inset 0 0 4px rgba(0,0,0,0.3)' }}>
                      <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, background:'rgba(0,0,0,0.2)' }}/>
                      <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1, background:'rgba(0,0,0,0.2)' }}/>
                    </div>
                    <div style={{ fontSize:18, fontWeight:600, color:'rgba(255,255,255,0.9)',
                      letterSpacing:'0.18em', fontFamily:'Courier New,monospace',
                      marginBottom:12, position:'relative', zIndex:1 }}>
                      {cardNum || '•••• •••• •••• ••••'}
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', position:'relative', zIndex:1 }}>
                      <div>
                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Card Holder</div>
                        <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)', letterSpacing:'0.05em' }}>{cardName || 'YOUR NAME'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3, textAlign:'right' }}>Expires</div>
                        <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{cardExp || 'MM/YY'}</div>
                      </div>
                    </div>
                    {/* Shine overlay */}
                    <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'40%',
                      background:'linear-gradient(135deg,transparent,rgba(255,255,255,0.04),transparent)',
                      pointerEvents:'none' }}/>
                    {/* Circles decoration */}
                    <div style={{ position:'absolute', right:-15, top:'50%', transform:'translateY(-50%)',
                      width:80, height:80, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.08)' }}/>
                    <div style={{ position:'absolute', right:25, top:'50%', transform:'translateY(-50%)',
                      width:80, height:80, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.05)' }}/>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700,
                        color:'rgba(240,244,255,0.35)', marginBottom:9,
                        letterSpacing:'0.1em', textTransform:'uppercase' }}>Card Number</label>
                      <input className="pay-input pay-input-card" placeholder="1234 5678 9012 3456"
                        value={cardNum} onChange={e=>setCardNum(formatCard(e.target.value))} maxLength={19}/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700,
                        color:'rgba(240,244,255,0.35)', marginBottom:9,
                        letterSpacing:'0.1em', textTransform:'uppercase' }}>Card Holder Name</label>
                      <input className="pay-input" placeholder="Name as on card"
                        value={cardName} onChange={e=>setCardName(e.target.value.toUpperCase())}
                        style={{ textTransform:'uppercase', letterSpacing:'0.05em' }}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:700,
                          color:'rgba(240,244,255,0.35)', marginBottom:9,
                          letterSpacing:'0.1em', textTransform:'uppercase' }}>Expiry</label>
                        <input className="pay-input" placeholder="MM/YY"
                          value={cardExp} onChange={e=>setCardExp(formatExp(e.target.value))} maxLength={5}/>
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:700,
                          color:'rgba(240,244,255,0.35)', marginBottom:9,
                          letterSpacing:'0.1em', textTransform:'uppercase' }}>CVV</label>
                        <input className="pay-input" placeholder="•••" type="password"
                          value={cardCvv} onChange={e=>setCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))} maxLength={3}/>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── NET BANKING TAB ── */}
              {tab === 'netbank' && (
                <div style={{ animation:'slideUp 0.3s both' }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700,
                    color:'rgba(240,244,255,0.35)', marginBottom:12,
                    letterSpacing:'0.1em', textTransform:'uppercase' }}>Select Your Bank</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
                    {[
                      { id:'sbi',  name:'SBI',        color:'#003087' },
                      { id:'hdfc', name:'HDFC Bank',   color:'#004c97' },
                      { id:'icici',name:'ICICI Bank',  color:'#f47721' },
                      { id:'axis', name:'Axis Bank',   color:'#880000' },
                      { id:'kotak',name:'Kotak',       color:'#cc0000' },
                      { id:'other',name:'Other Bank',  color:'#555' },
                    ].map(b => (
                      <div key={b.id} className={`upi-option${bank===b.id?' selected':''}`}
                        onClick={()=>setBank(b.id)}
                        style={{ padding:'12px 16px' }}>
                        <div style={{ width:32, height:32, borderRadius:8, flexShrink:0,
                          background:`${b.color}22`, border:`1px solid ${b.color}44`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:10, fontWeight:800, color:b.color }}>
                          {b.name.slice(0,3).toUpperCase()}
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, color:'rgba(240,244,255,0.75)',
                          letterSpacing:'-0.01em' }}>{b.name}</span>
                      </div>
                    ))}
                  </div>
                  {bank && (
                    <div style={{ padding:'13px 16px', borderRadius:12,
                      background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)',
                      fontSize:13, color:'rgba(240,244,255,0.45)', fontFamily:"'DM Sans',sans-serif" }}>
                      🏦 You'll be redirected to your bank's secure portal to complete the payment.
                    </div>
                  )}
                </div>
              )}

              {/* ── EMAIL FIELD ── */}
              <div style={{ marginTop:22, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700,
                  color:'rgba(240,244,255,0.35)', marginBottom:9,
                  letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  Registered Email (for activation)
                </label>
                <input className="pay-input" type="email" placeholder="you@email.com"
                  value={email} onChange={e=>setEmail(e.target.value)} required />
              </div>

              {/* Security badges */}
              <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:18, marginBottom:20 }}>
                {[
                  { icon:'🔒', text:'256-bit SSL' },
                  { icon:'✅', text:'PCI DSS Secure' },
                  { icon:'🛡️', text:'100% Safe' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display:'flex', alignItems:'center', gap:6,
                    fontSize:11.5, color:'rgba(240,244,255,0.28)', fontFamily:"'DM Sans',sans-serif",
                    fontWeight:500 }}>
                    <span style={{ fontSize:12 }}>{icon}</span>{text}
                  </div>
                ))}
              </div>

              {/* PAY BUTTON */}
              <button onClick={handlePay} disabled={loading} className="pay-btn">
                {loading ? <Spin size={18}/> : <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Pay ₹500 Securely
                </>}
              </button>
            </div>
          </div>

          <p style={{ marginTop:16, textAlign:'center', fontSize:13,
            color:'rgba(240,244,255,0.22)', fontFamily:"'DM Sans',sans-serif" }}>
            <Link to="/login" style={{ color:'rgba(240,244,255,0.32)', textDecoration:'none',
              transition:'color 0.15s' }}
              onMouseOver={e=>e.currentTarget.style.color='rgba(240,244,255,0.55)'}
              onMouseOut={e=>e.currentTarget.style.color='rgba(240,244,255,0.32)'}>
              ← Back to Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT: WHY ₹500 ── */}
      <div style={{ flex:1, minHeight:'100vh', position:'relative', zIndex:1,
        display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 68px',
        borderLeft:'1px solid rgba(255,255,255,0.06)',
        background:'rgba(255,255,255,0.018)', backdropFilter:'blur(12px)', overflow:'hidden' }}>

        <div style={{ position:'absolute', top:'5%', right:'-8%', width:380, height:380,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(245,158,11,0.1),transparent)',
          pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'10%', left:'-5%', width:280, height:280,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.08),transparent)',
          pointerEvents:'none' }}/>

        <div style={{ animation:'fadeUp 0.7s 0.2s both' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px',
            borderRadius:100, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)',
            fontSize:11, fontWeight:700, color:'#fde68a', letterSpacing:'0.08em',
            textTransform:'uppercase', marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#f59e0b',
              boxShadow:'0 0 8px #f59e0b', animation:'pulse2 2s infinite' }}/>
            What You Get
          </div>

          <h2 style={{ fontSize:32, fontWeight:800, color:'#f0f4ff',
            letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:14 }}>
            One payment.<br/>
            <span style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24,#fde68a)',
              backgroundSize:'200% 200%', animation:'goldShimmer 3s ease infinite',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              Unlimited learning.
            </span>
          </h2>
          <p style={{ fontSize:14, color:'rgba(240,244,255,0.36)', lineHeight:1.85, marginBottom:36,
            fontFamily:"'DM Sans',sans-serif" }}>
            This keeps Point2Learn serious — every member is committed. You receive 500 credits instantly, covering your first session right away.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:32 }}>
            {[
              { label:'Time Credits',      val:'500',   desc:'Spend on any live session',         c:'#fbbf24', rgb:'245,158,11' },
              { label:'Platform Access',   val:'Full',  desc:'All courses & verified teachers',    c:'#818cf8', rgb:'99,102,241' },
              { label:'Session Cost',      val:'500cr', desc:'Per live session attended',          c:'#f87171', rgb:'248,113,113' },
              { label:'Teacher Earnings',  val:'+10cr', desc:'Per attending student',              c:'#34d399', rgb:'52,211,153'  },
              { label:'Auto Refill',       val:'+500',  desc:'Every 5 hours automatically',        c:'#c084fc', rgb:'192,132,252' },
            ].map(({ label, val, desc, c, rgb }, i) => (
              <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'14px 18px', borderRadius:12, transition:'all 0.18s', cursor:'default',
                background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)' }}
                onMouseOver={e=>{ e.currentTarget.style.background=`rgba(${rgb},0.06)`; e.currentTarget.style.borderColor=`rgba(${rgb},0.22)` }}
                onMouseOut={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:600, color:'rgba(240,244,255,0.75)', marginBottom:2 }}>{label}</div>
                  <div style={{ fontSize:11.5, color:'rgba(240,244,255,0.28)', fontFamily:"'DM Sans',sans-serif" }}>{desc}</div>
                </div>
                <div style={{ fontSize:20, fontWeight:800, color:c, letterSpacing:'-0.02em',
                  fontFamily:'monospace', fontVariantNumeric:'tabular-nums' }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ padding:'16px 20px', borderRadius:12,
            background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)',
            fontSize:13.5, color:'rgba(240,244,255,0.45)', lineHeight:1.7,
            fontFamily:"'DM Sans',sans-serif", display:'flex', gap:10, alignItems:'flex-start' }}>
            <span style={{ fontSize:16, marginTop:1 }}>✅</span>
            <span>Pay via UPI, card, or net banking. After payment, enter your email and click Activate — credits appear instantly.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
