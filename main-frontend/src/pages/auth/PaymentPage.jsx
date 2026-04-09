import Logo from '@/components/Logo'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authActivate } from '@/api'
import { useToast } from '@/context/Toast'
import Spin from '@/components/ui/Spin'

var CSS = "\
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');\
  *{box-sizing:border-box;margin:0;padding:0;}\
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}\
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}\
  @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}\
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}\
  @keyframes processing{0%{width:0%}100%{width:100%}}\
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}\
  @keyframes checkDraw{0%{stroke-dashoffset:24}100%{stroke-dashoffset:0}}\
  @keyframes circleDraw{0%{stroke-dashoffset:283}100%{stroke-dashoffset:0}}\
  @keyframes scaleIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}\
  @keyframes ringPulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.35)}70%{box-shadow:0 0 0 18px rgba(16,185,129,0)}}\
  @keyframes floatSlow{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}\
  .pm-tab{padding:13px 0;font-size:13px;font-weight:600;font-family:'Outfit',sans-serif;\
    border:none;background:none;cursor:pointer;transition:all 0.22s;border-bottom:2px solid transparent;\
    color:rgba(240,244,255,0.3);flex:1;display:flex;align-items:center;justify-content:center;gap:7;letter-spacing:-0.01em;}\
  .pm-tab.active{color:#f0f4ff;border-bottom-color:#f0f4ff;}\
  .pm-tab:hover:not(.active){color:rgba(240,244,255,0.6);}\
  .pm-input{width:100%;padding:13px 16px;font-size:14px;font-family:'Outfit',sans-serif;\
    background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.08);\
    border-radius:12px;color:#f0f4ff;outline:none;transition:all 0.2s;letter-spacing:-0.01em;}\
  .pm-input:focus{border-color:rgba(255,255,255,0.25);background:rgba(255,255,255,0.06);box-shadow:0 0 0 3px rgba(255,255,255,0.04);}\
  .pm-input::placeholder{color:rgba(240,244,255,0.18);}\
  .pm-opt{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;\
    border:1.5px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);\
    cursor:pointer;transition:all 0.2s;}\
  .pm-opt:hover{border-color:rgba(255,255,255,0.15);background:rgba(255,255,255,0.04);transform:translateY(-1px);}\
  .pm-opt.selected{border-color:rgba(255,255,255,0.28);background:rgba(255,255,255,0.06);box-shadow:0 0 0 3px rgba(255,255,255,0.03);}\
  .pm-btn{width:100%;padding:16px;font-size:15px;font-weight:700;font-family:'Outfit',sans-serif;\
    background:#f0f4ff;color:#0a0e1a;border:none;border-radius:14px;cursor:pointer;\
    box-shadow:0 4px 20px rgba(240,244,255,0.15);\
    display:flex;align-items:center;justify-content:center;gap:10;transition:all 0.25s;letter-spacing:-0.02em;}\
  .pm-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 40px rgba(240,244,255,0.2);}\
  .pm-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none!important;}\
"

function Ic({ d, size, stroke }) {
  return (
    <svg width={size||16} height={size||16} viewBox="0 0 24 24" fill="none"
      stroke={stroke||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  )
}

var ICO = {
  shield:   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
  lock:     <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
  check:    <polyline points="20,6 9,17 4,12"/>,
  card:     <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
  bank:     <><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12,2 2,7 22,7"/></>,
  upi:      <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
  login:    <><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/></>,
  book:     <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
  video:    <><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></>,
  award:    <><circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/></>,
  refresh:  <><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></>,
  zap:      <><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></>,
  verified: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></>,
}

function GPay(){ return <svg viewBox="0 0 512 512" width="34" height="34"><rect width="512" height="512" rx="90" fill="#fff"/><text x="256" y="310" textAnchor="middle" fontSize="200" fontFamily="Product Sans,Arial,sans-serif" fontWeight="700"><tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">P</tspan><tspan fill="#FBBC05">a</tspan><tspan fill="#34A853">y</tspan></text></svg> }
function PhonePe(){ return <svg viewBox="0 0 512 512" width="34" height="34"><rect width="512" height="512" rx="90" fill="#5f259f"/><text x="256" y="330" textAnchor="middle" fontSize="220" fontFamily="Arial,sans-serif" fontWeight="900" fill="#fff">P</text><circle cx="380" cy="160" r="55" fill="#fff"/></svg> }
function PaytmLogo(){ return <svg viewBox="0 0 512 512" width="34" height="34"><rect width="512" height="512" rx="90" fill="#00baf2"/><text x="256" y="300" textAnchor="middle" fontSize="130" fontFamily="Arial,sans-serif" fontWeight="900" fill="#fff">Paytm</text></svg> }
function BhimLogo(){ return <svg viewBox="0 0 512 512" width="34" height="34"><rect width="512" height="512" rx="90" fill="#00539d"/><text x="256" y="290" textAnchor="middle" fontSize="150" fontFamily="Arial,sans-serif" fontWeight="900" fill="#fff">BHIM</text><rect x="80" y="320" width="352" height="12" rx="6" fill="#ff6600"/></svg> }

var UPI_APPS = [
  { id:'gpay',    name:'Google Pay',  sub:'Instant UPI',    Logo:GPay     },
  { id:'phonepe', name:'PhonePe',     sub:'UPI Payment',    Logo:PhonePe  },
  { id:'paytm',   name:'Paytm',       sub:'Wallet & UPI',   Logo:PaytmLogo},
  { id:'bhim',    name:'BHIM UPI',    sub:'NPCI Official',  Logo:BhimLogo },
]

function SuccessScreen({ email, onContinue }) {
  var txId = 'P2L' + Math.random().toString(36).slice(2,10).toUpperCase()
  var receiptRows = [
    { k:'Transaction ID', v:txId,         mono:true },
    { k:'Amount',         v:'500.00',     mono:false },
    { k:'Status',         v:'Confirmed',  mono:false, green:true },
    { k:'Credits Added',  v:'500 credits',mono:false },
    { k:'Auto Refill',    v:'Every 5hrs', mono:false },
  ]
  var features = [
    { icon:ICO.book,   title:'Browse Courses', desc:'Explore all available courses',   color:'#818cf8' },
    { icon:ICO.video,  title:'Join Sessions',  desc:'500 credits per live session',    color:'#38bdf8' },
    { icon:ICO.award,  title:'Earn Credits',   desc:'Teach and earn 10cr per student', color:'#fbbf24' },
    { icon:ICO.refresh,title:'Auto Refill',    desc:'+500 credits every 5 hours',      color:'#34d399' },
  ]
  return (
    <div style={{ minHeight:'100vh', background:'#060a14', display:'flex', fontFamily:"'Outfit',sans-serif", position:'relative', overflow:'hidden' }}>
      <style>{CSS}</style>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'40%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 60%)' }}/>
      </div>
      <div style={{ width:380, background:'rgba(16,185,129,0.03)', borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'60px 44px', position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:52, fontWeight:900, color:'#34d399', letterSpacing:'-0.05em', lineHeight:1, marginBottom:6, animation:'scaleIn 0.5s 0.6s both' }}>500</div>
          <div style={{ fontSize:13, color:'rgba(240,244,255,0.3)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>credits added to wallet</div>
        </div>
        <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8 }}>
          {receiptRows.map(function(item) {
            return (
              <div key={item.k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 14px', borderRadius:10, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize:12, color:'rgba(240,244,255,0.3)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{item.k}</span>
                <span style={{ fontSize:12, fontWeight:600, color:item.green?'#34d399':'rgba(240,244,255,0.7)', fontFamily:item.mono?"'Courier New',monospace":"'Outfit',sans-serif", display:'flex', alignItems:'center', gap:5 }}>
                  {item.green && <Ic d={ICO.verified} size={12} stroke="#34d399"/>}
                  {item.v}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 80px', position:'relative', zIndex:1 }}>
        <div style={{ position:'relative', width:120, height:120, margin:'0 auto 40px', animation:'scaleIn 0.5s 0.2s both' }}>
          <div style={{ width:120, height:120, borderRadius:'50%', background:'rgba(16,185,129,0.1)', border:'2px solid rgba(16,185,129,0.4)', display:'flex', alignItems:'center', justifyContent:'center', animation:'ringPulse 2.5s 1s ease-out infinite' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" style={{ strokeDasharray:283, animation:'circleDraw 0.6s 0.3s ease-out both' }}/>
              <polyline points="9,12 11.5,14.5 16,9" style={{ strokeDasharray:24, animation:'checkDraw 0.4s 0.8s ease-out both' }}/>
            </svg>
          </div>
        </div>
        <div style={{ textAlign:'center', animation:'slideUp 0.5s 0.4s both' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:100, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', fontSize:11, fontWeight:700, color:'#34d399', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:20 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'#10b981' }}/> Payment Successful
          </div>
          <h1 style={{ fontSize:36, fontWeight:900, color:'#f0f4ff', letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:14 }}>Account Activated</h1>
          <p style={{ fontSize:15, color:'rgba(240,244,255,0.38)', lineHeight:1.8, marginBottom:8, fontFamily:"'Plus Jakarta Sans',sans-serif", maxWidth:380 }}>
            Your Point2Learn account is now fully activated with <strong style={{color:'#34d399'}}>500 learning credits</strong>.
          </p>
          <p style={{ fontSize:13, color:'rgba(240,244,255,0.22)', marginBottom:36, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{email}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:32, textAlign:'left' }}>
            {features.map(function(f) {
              return (
                <div key={f.title} style={{ padding:'14px 16px', borderRadius:12, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)', transition:'all 0.18s' }}
                  onMouseOver={function(e){e.currentTarget.style.background='rgba(255,255,255,0.05)'}}
                  onMouseOut={function(e){e.currentTarget.style.background='rgba(255,255,255,0.025)'}}>
                  <div style={{ marginBottom:8, color:f.color }}><Ic d={f.icon} size={20} stroke={f.color}/></div>
                  <div style={{ fontSize:12.5, fontWeight:700, color:'#f0f4ff', marginBottom:3 }}>{f.title}</div>
                  <div style={{ fontSize:11.5, color:'rgba(240,244,255,0.28)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{f.desc}</div>
                </div>
              )
            })}
          </div>
          <button onClick={onContinue} className="pm-btn">
            <Ic d={ICO.login} size={17} stroke="#0a0e1a"/> Sign In to Start Learning
          </button>
        </div>
      </div>
    </div>
  )
}

function ProcessingScreen({ method }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:150, background:'rgba(6,10,20,0.98)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', backdropFilter:'blur(20px)', animation:'fadeIn 0.3s both', fontFamily:"'Outfit',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ textAlign:'center', maxWidth:340 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', animation:'floatSlow 2.5s ease-in-out infinite' }}>
          <Ic d={ICO.shield} size={34} stroke="rgba(240,244,255,0.6)"/>
        </div>
        <div style={{ fontSize:20, fontWeight:800, color:'#f0f4ff', marginBottom:8, letterSpacing:'-0.03em' }}>Processing Payment</div>
        <div style={{ fontSize:14, color:'rgba(240,244,255,0.35)', marginBottom:36, fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1.7 }}>
          Verifying your payment via <strong style={{color:'#f0f4ff'}}>{method}</strong>
        </div>
        <div style={{ width:280, height:4, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden', margin:'0 auto 16px' }}>
          <div style={{ height:'100%', borderRadius:99, background:'linear-gradient(90deg,rgba(240,244,255,0.3),rgba(240,244,255,0.8),rgba(240,244,255,0.3))', backgroundSize:'200%', animation:'processing 2.8s ease-out forwards' }}/>
        </div>
        <div style={{ fontSize:12, color:'rgba(240,244,255,0.18)', animation:'blink 1.5s infinite', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Please do not close this window</div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  var params = new URLSearchParams(window.location.search)
  var emailFromURL = params.get('email') || ''
  var [tab, setTab] = useState('upi')
  var [upiApp, setUpiApp] = useState('gpay')
  var [upiId, setUpiId] = useState('')
  var [cardNum, setCardNum] = useState('')
  var [cardName, setCardName] = useState('')
  var [cardExp, setCardExp] = useState('')
  var [cardCvv, setCardCvv] = useState('')
  var [bank, setBank] = useState('')
  var [email, setEmail] = useState(emailFromURL)
  var [step, setStep] = useState('form')
  var [loading, setL] = useState(false)
  var { toast } = useToast()
  var navigate = useNavigate()

  function fmtCard(v) { return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim() }
  function fmtExp(v) { var d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d }

  function handlePay(e) {
    e.preventDefault()
    if (!email) { toast('Please enter your registered email', 'error'); return }
    setStep('processing'); setL(true)
    setTimeout(function() {
      authActivate(email).then(function() { setStep('success') })
        .catch(function(err) { toast(err.response?.data?.detail || 'Activation failed.', 'error'); setStep('form') })
        .finally(function() { setL(false) })
    }, 2800)
  }

  var methodName = tab === 'upi' ? (UPI_APPS.find(function(a){return a.id===upiApp})?.name || 'UPI') : tab === 'card' ? 'Card' : 'Net Banking'
  if (step === 'success') return <><style>{CSS}</style><SuccessScreen email={email} onContinue={function(){navigate('/login')}}/></>
  if (step === 'processing') return <><style>{CSS}</style><ProcessingScreen method={methodName}/></>

  var steps = [{n:'1',l:'Registered',done:true},{n:'2',l:'Pay',active:true},{n:'3',l:'Sign In'}]
  var tabs = [{ id:'upi', label:'UPI', icon:ICO.upi },{ id:'card', label:'Card', icon:ICO.card },{ id:'netbank', label:'Net Banking', icon:ICO.bank }]
  var banks = [
    { id:'sbi', name:'SBI', abbr:'SBI', color:'#4a90d9' },{ id:'hdfc', name:'HDFC Bank', abbr:'HDFC', color:'#6ba3d6' },
    { id:'icici', name:'ICICI Bank', abbr:'ICIC', color:'#e8965a' },{ id:'axis', name:'Axis Bank', abbr:'AXIS', color:'#c47070' },
    { id:'kotak', name:'Kotak', abbr:'KMB', color:'#d46b6b' },{ id:'other', name:'Other Bank', abbr:'BANK', color:'#8a8a8a' },
  ]
  var benefits = [
    { label:'Starter Credits', val:'500', desc:'Credited immediately after payment', c:'rgba(240,244,255,0.8)' },
    { label:'Session Cost', val:'500cr', desc:'Per live session you attend', c:'rgba(248,113,113,0.8)' },
    { label:'Teach and Earn', val:'+10cr', desc:'Credits earned per attending student', c:'rgba(52,211,153,0.8)' },
    { label:'Auto Refill', val:'+500', desc:'Free credits every 5 hours', c:'rgba(129,140,248,0.8)' },
    { label:'Full Access', val:'All', desc:'Every course and verified teacher', c:'rgba(125,211,252,0.8)' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#060a14', color:'#f0f4ff', fontFamily:"'Outfit',sans-serif", display:'flex', overflow:'hidden' }}>
      <style>{CSS}</style>
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-10%', right:'-8%', width:550, height:550, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,255,255,0.025) 0%,transparent 65%)', animation:'floatSlow 14s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', bottom:'-15%', left:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,255,255,0.02) 0%,transparent 65%)' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)', backgroundSize:'64px 64px' }}/>
      </div>

      {/* LEFT */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 64px', position:'relative', zIndex:1, maxWidth:620 }}>
        <div style={{ marginBottom:36, animation:'fadeUp 0.5s both' }}><Logo size="lg"/></div>
        <div style={{ animation:'fadeUp 0.6s 0.05s both' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
            <div>
              <h1 style={{ fontSize:26, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.04em', lineHeight:1, marginBottom:6 }}>Complete Payment</h1>
              <p style={{ fontSize:13, color:'rgba(240,244,255,0.32)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Secure one-time activation. No recurring charges.</p>
            </div>
            <div style={{ padding:'14px 22px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', textAlign:'right' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(240,244,255,0.25)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Total</div>
              <div style={{ fontSize:30, fontWeight:900, letterSpacing:'-0.04em', color:'#f0f4ff' }}><span style={{ fontSize:18, fontWeight:600, opacity:0.5, marginRight:2 }}>&#8377;</span>500</div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display:'flex', alignItems:'center', marginBottom:26 }}>
            {steps.map(function(s, i) {
              return (
                <div key={i} style={{ display:'flex', alignItems:'center' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                    <div style={{ width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700,
                      background:s.done?'rgba(16,185,129,0.12)':s.active?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.03)',
                      color:s.done?'#34d399':s.active?'#f0f4ff':'rgba(240,244,255,0.18)',
                      border:s.done?'1px solid rgba(16,185,129,0.3)':s.active?'1px solid rgba(255,255,255,0.2)':'1px solid rgba(255,255,255,0.06)' }}>
                      {s.done ? <Ic d={ICO.check} size={12} stroke="#34d399"/> : s.n}
                    </div>
                    <div style={{ fontSize:10, fontWeight:600, whiteSpace:'nowrap', color:s.done?'#34d399':s.active?'rgba(240,244,255,0.7)':'rgba(240,244,255,0.18)' }}>{s.l}</div>
                  </div>
                  {i < 2 && <div style={{ width:44, height:1, margin:'0 8px 18px', background:s.done?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.06)' }}/>}
                </div>
              )
            })}
          </div>

          {/* Payment Card */}
          <div style={{ background:'rgba(255,255,255,0.02)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, overflow:'hidden' }}>
            <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.015)', padding:'0 20px' }}>
              {tabs.map(function(t) {
                return <button key={t.id} className={'pm-tab'+(tab===t.id?' active':'')} onClick={function(){setTab(t.id)}}><Ic d={t.icon} size={16}/> {t.label}</button>
              })}
            </div>
            <div style={{ padding:'24px 26px 22px' }}>
              {tab === 'upi' && (
                <div style={{ animation:'slideUp 0.25s both' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                    {UPI_APPS.map(function(app) {
                      return (
                        <div key={app.id} className={'pm-opt'+(upiApp===app.id?' selected':'')} onClick={function(){setUpiApp(app.id)}}>
                          <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, overflow:'hidden', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}><app.Logo/></div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:700, color:'#f0f4ff' }}>{app.name}</div>
                            <div style={{ fontSize:11, color:'rgba(240,244,255,0.3)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{app.sub}</div>
                          </div>
                          <div style={{ width:16, height:16, borderRadius:'50%', flexShrink:0, border:'2px solid '+(upiApp===app.id?'#f0f4ff':'rgba(255,255,255,0.12)'), background:upiApp===app.id?'#f0f4ff':'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {upiApp===app.id && <div style={{ width:6, height:6, borderRadius:'50%', background:'#0a0e1a' }}/>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {upiApp === 'bhim' ? (
                    <div><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(240,244,255,0.3)', marginBottom:8, letterSpacing:'0.1em', textTransform:'uppercase' }}>UPI ID / VPA</label>
                    <input className="pm-input" placeholder="yourname@upi" value={upiId} onChange={function(e){setUpiId(e.target.value)}}/></div>
                  ) : (
                    <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:10, fontSize:13, color:'rgba(240,244,255,0.4)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                      <Ic d={ICO.shield} size={16} stroke="rgba(240,244,255,0.25)"/>
                      A payment request will be sent to your <strong style={{color:'rgba(240,244,255,0.7)'}}>{UPI_APPS.find(function(a){return a.id===upiApp})?.name}</strong> app.
                    </div>
                  )}
                </div>
              )}
              {tab === 'card' && (
                <div style={{ animation:'slideUp 0.25s both' }}>
                  <div style={{ borderRadius:16, padding:'22px 24px', marginBottom:20, position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#111827,#1e2740,#111827)', border:'1px solid rgba(255,255,255,0.08)', height:155 }}>
                    <div style={{ width:34, height:26, borderRadius:5, background:'linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.08))', border:'1px solid rgba(255,255,255,0.1)', marginBottom:16, position:'relative', zIndex:1 }}/>
                    <div style={{ fontSize:16, fontWeight:500, color:'rgba(255,255,255,0.7)', letterSpacing:'0.18em', fontFamily:"'Courier New',monospace", marginBottom:12, position:'relative', zIndex:1 }}>{cardNum || '---- ---- ---- ----'}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', position:'relative', zIndex:1 }}>
                      <div><div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>Holder</div><div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>{cardName || 'YOUR NAME'}</div></div>
                      <div style={{ textAlign:'right' }}><div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>Expires</div><div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>{cardExp || 'MM/YY'}</div></div>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    <div><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(240,244,255,0.3)', marginBottom:8, letterSpacing:'0.1em', textTransform:'uppercase' }}>Card Number</label><input className="pm-input" placeholder="1234 5678 9012 3456" value={cardNum} onChange={function(e){setCardNum(fmtCard(e.target.value))}} maxLength={19} style={{ letterSpacing:'0.1em', fontFamily:"'Courier New',monospace", fontSize:15 }}/></div>
                    <div><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(240,244,255,0.3)', marginBottom:8, letterSpacing:'0.1em', textTransform:'uppercase' }}>Card Holder Name</label><input className="pm-input" placeholder="Name as on card" value={cardName} onChange={function(e){setCardName(e.target.value.toUpperCase())}} style={{ textTransform:'uppercase', letterSpacing:'0.04em' }}/></div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(240,244,255,0.3)', marginBottom:8, letterSpacing:'0.1em', textTransform:'uppercase' }}>Expiry</label><input className="pm-input" placeholder="MM/YY" value={cardExp} onChange={function(e){setCardExp(fmtExp(e.target.value))}} maxLength={5}/></div>
                      <div><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(240,244,255,0.3)', marginBottom:8, letterSpacing:'0.1em', textTransform:'uppercase' }}>CVV</label><input className="pm-input" placeholder="---" type="password" value={cardCvv} onChange={function(e){setCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))}} maxLength={3}/></div>
                    </div>
                  </div>
                </div>
              )}
              {tab === 'netbank' && (
                <div style={{ animation:'slideUp 0.25s both' }}>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(240,244,255,0.3)', marginBottom:10, letterSpacing:'0.1em', textTransform:'uppercase' }}>Select Your Bank</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                    {banks.map(function(b) {
                      return (
                        <div key={b.id} className={'pm-opt'+(bank===b.id?' selected':'')} onClick={function(){setBank(b.id)}} style={{ padding:'12px 14px', gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:9, flexShrink:0, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:900, color:b.color, letterSpacing:'0.04em' }}>{b.abbr}</div>
                          <span style={{ fontSize:13, fontWeight:600, color:'rgba(240,244,255,0.65)' }}>{b.name}</span>
                        </div>
                      )
                    })}
                  </div>
                  {bank && <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', fontSize:13, color:'rgba(240,244,255,0.4)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>You will be redirected to your bank's secure portal to complete the payment.</div>}
                </div>
              )}
              <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(240,244,255,0.3)', marginBottom:8, letterSpacing:'0.1em', textTransform:'uppercase' }}>Registered Email</label>
                <input className="pm-input" type="email" placeholder="you@email.com" value={email} onChange={function(e){setEmail(e.target.value)}} required/>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:18, marginTop:14, marginBottom:16 }}>
                {[{icon:ICO.lock, t:'256-bit SSL'},{icon:ICO.verified, t:'PCI DSS'},{icon:ICO.shield, t:'100% Secure'}].map(function(item) {
                  return <div key={item.t} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'rgba(240,244,255,0.22)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}><Ic d={item.icon} size={12} stroke="rgba(240,244,255,0.2)"/>{item.t}</div>
                })}
              </div>
              <button onClick={handlePay} disabled={loading} className="pm-btn">
                {loading ? <Spin size={16}/> : <><Ic d={ICO.lock} size={16} stroke="#0a0e1a"/> Pay Securely</>}
              </button>
            </div>
          </div>
          <p style={{ marginTop:14, textAlign:'center', fontSize:13, color:'rgba(240,244,255,0.2)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            <Link to="/login" style={{ color:'rgba(240,244,255,0.28)', textDecoration:'none', transition:'color 0.15s' }}
              onMouseOver={function(e){e.currentTarget.style.color='rgba(240,244,255,0.5)'}}
              onMouseOut={function(e){e.currentTarget.style.color='rgba(240,244,255,0.28)'}}>Back to Sign In</Link>
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 56px', position:'relative', zIndex:1, borderLeft:'1px solid rgba(255,255,255,0.04)', background:'rgba(255,255,255,0.01)', overflow:'hidden' }}>
        <div style={{ animation:'fadeUp 0.7s 0.15s both' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:100, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', fontSize:10, fontWeight:700, color:'rgba(240,244,255,0.45)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:28 }}>
            <Ic d={ICO.zap} size={11} stroke="rgba(240,244,255,0.4)"/> What You Get
          </div>
          <h2 style={{ fontSize:30, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.04em', lineHeight:1.15, marginBottom:12 }}>One payment.<br/><span style={{ color:'rgba(240,244,255,0.4)' }}>Unlimited learning.</span></h2>
          <p style={{ fontSize:14, color:'rgba(240,244,255,0.3)', lineHeight:1.85, marginBottom:30, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>500 credits instantly. Attend live sessions, earn by teaching, and get auto-refills every 5 hours.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:26 }}>
            {benefits.map(function(item) {
              return (
                <div key={item.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', borderRadius:12, transition:'all 0.18s', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)' }}
                  onMouseOver={function(e){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}
                  onMouseOut={function(e){e.currentTarget.style.background='rgba(255,255,255,0.02)';e.currentTarget.style.borderColor='rgba(255,255,255,0.04)'}}>
                  <div><div style={{ fontSize:13, fontWeight:600, color:'rgba(240,244,255,0.65)', marginBottom:2 }}>{item.label}</div><div style={{ fontSize:11, color:'rgba(240,244,255,0.22)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{item.desc}</div></div>
                  <div style={{ fontSize:17, fontWeight:800, color:item.c, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums' }}>{item.val}</div>
                </div>
              )
            })}
          </div>
          <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(16,185,129,0.04)', border:'1px solid rgba(16,185,129,0.1)', fontSize:13, color:'rgba(240,244,255,0.35)', lineHeight:1.7, fontFamily:"'Plus Jakarta Sans',sans-serif", display:'flex', gap:10, alignItems:'flex-start' }}>
            <span style={{ marginTop:2, flexShrink:0 }}><Ic d={ICO.verified} size={15} stroke="#34d399"/></span>
            <span>Pay via UPI, card or net banking. Credits appear in your wallet within seconds of payment.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
