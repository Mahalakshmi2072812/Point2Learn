import Logo from '@/components/Logo'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div style={{ fontFamily:"'Sora','Plus Jakarta Sans',sans-serif", minHeight:'100vh', background:'#050818', color:'#f0f4ff', overflowX:'hidden' }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        * { margin:0; padding:0; box-sizing:border-box; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes float    { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-18px)} }
        @keyframes float2   { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
        @keyframes pulse2   { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes glow     { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.3)} 50%{box-shadow:0 0 60px rgba(99,102,241,0.7)} }

        .nav-link-hover:hover { color:#f0f4ff !important; }
        .btn-primary { transition:all 0.25s cubic-bezier(0.4,0,0.2,1) !important; }
        .btn-primary:hover { transform:translateY(-3px) !important; box-shadow:0 20px 60px rgba(99,102,241,0.55) !important; }
        .btn-ghost:hover { background:rgba(255,255,255,0.08) !important; color:#f0f4ff !important; }
        .feature-card:hover { transform:translateY(-6px) !important; border-color:rgba(99,102,241,0.4) !important; box-shadow:0 24px 60px rgba(0,0,0,0.5) !important; }
        .step-card:hover { transform:translateY(-4px) !important; }
        .stat-item:hover .stat-num { transform:scale(1.08); }
        .stat-num { transition:transform 0.2s; display:inline-block; }
        .credit-row:hover { background:rgba(255,255,255,0.06) !important; border-color:rgba(99,102,241,0.25) !important; }

        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#050818; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.4); border-radius:3px; }
      `}</style>

      {/* ═══════════ BACKGROUND MESH ═══════════ */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>
        {/* Primary orb */}
        <div style={{ position:'absolute', top:'-15%', left:'-10%', width:700, height:700,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)',
          animation:'float 8s ease-in-out infinite', filter:'blur(1px)' }}/>
        {/* Secondary orb */}
        <div style={{ position:'absolute', top:'20%', right:'-12%', width:600, height:600,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(6,182,212,0.14) 0%,transparent 70%)',
          animation:'float2 10s ease-in-out infinite' }}/>
        {/* Bottom orb */}
        <div style={{ position:'absolute', bottom:'-10%', left:'30%', width:500, height:500,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)',
          animation:'float 12s ease-in-out infinite reverse' }}/>
        {/* Grid overlay */}
        <div style={{ position:'absolute', inset:0,
          backgroundImage:'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)',
          backgroundSize:'60px 60px' }}/>
        {/* Noise grain */}
        <div style={{ position:'absolute', inset:0, opacity:0.025,
          backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize:'200px 200px' }}/>
      </div>

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:1000,
        height:70, display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 60px', backdropFilter:'blur(28px) saturate(180%)',
        background:'rgba(5,8,24,0.75)', borderBottom:'1px solid rgba(255,255,255,0.07)',
        animation:'fadeIn 0.6s both' }}>
        <Logo size="sm" />
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Link to="/login" className="nav-link-hover" style={{
            padding:'8px 22px', borderRadius:8, fontSize:14, fontWeight:500,
            color:'rgba(255,255,255,0.45)', textDecoration:'none', transition:'color 0.15s',
            letterSpacing:'-0.01em' }}>
            Sign In
          </Link>
          <Link to="/register" className="btn-primary" style={{
            padding:'9px 26px', borderRadius:9, fontSize:14, fontWeight:600,
            background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff',
            textDecoration:'none', boxShadow:'0 4px 24px rgba(99,102,241,0.4)',
            letterSpacing:'-0.01em', border:'1px solid rgba(255,255,255,0.15)' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section style={{ position:'relative', zIndex:1, minHeight:'100vh',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        textAlign:'center', padding:'120px 32px 80px' }}>

        {/* Announcement badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'7px 20px',
          borderRadius:100, background:'rgba(99,102,241,0.1)',
          border:'1px solid rgba(99,102,241,0.3)', marginBottom:52,
          animation:'fadeUp 0.6s 0.1s both' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5,
            fontSize:11, fontWeight:700, color:'#a5b4fc', letterSpacing:'0.08em',
            textTransform:'uppercase' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#6366f1',
              boxShadow:'0 0 12px #6366f1', display:'inline-block', animation:'pulse2 2s infinite' }}/>
            India's First Peer-to-Peer Skill Exchange Platform
          </span>
        </div>

        {/* Main headline */}
        <h1 style={{ fontSize:'clamp(48px,7vw,96px)', fontWeight:800,
          letterSpacing:'-0.05em', lineHeight:0.95, marginBottom:32,
          animation:'fadeUp 0.7s 0.2s both' }}>
          <span style={{ display:'block', color:'#f0f4ff' }}>Learn any skill.</span>
          <span style={{ display:'block', marginTop:8,
            background:'linear-gradient(135deg,#6366f1 0%,#06b6d4 50%,#a78bfa 100%)',
            backgroundSize:'200% 200%', animation:'shimmer 4s ease infinite',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            Teach what you know.
          </span>
        </h1>

        {/* Sub */}
        <p style={{ fontSize:18, color:'rgba(240,244,255,0.45)', maxWidth:560,
          lineHeight:1.8, marginBottom:20, animation:'fadeUp 0.7s 0.3s both',
          fontFamily:"'DM Sans',sans-serif", fontWeight:400 }}>
          A credit-based platform where your time and knowledge are the only currency.
          No subscriptions. No gatekeeping. Just pure learning.
        </p>

        {/* Trust badges */}
        <div style={{ display:'flex', gap:28, marginBottom:52,
          animation:'fadeUp 0.7s 0.35s both', flexWrap:'wrap', justifyContent:'center' }}>
          {[
            { icon:'✦', text:'500 Credits on Signup' },
            { icon:'✦', text:'Verified Teachers Only' },
            { icon:'✦', text:'Live Jitsi Sessions' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display:'flex', alignItems:'center', gap:7,
              fontSize:13, color:'rgba(240,244,255,0.38)', fontWeight:500 }}>
              <span style={{ color:'#6366f1', fontSize:10 }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display:'flex', gap:14, marginBottom:80, flexWrap:'wrap',
          justifyContent:'center', animation:'fadeUp 0.7s 0.4s both' }}>
          <Link to="/register" className="btn-primary" style={{
            display:'inline-flex', alignItems:'center', gap:10,
            padding:'16px 44px', borderRadius:12, fontSize:16, fontWeight:700,
            background:'linear-gradient(135deg,#4f46e5,#6366f1,#7c3aed)',
            backgroundSize:'200% 200%', animation:'shimmer 5s ease infinite',
            color:'#fff', textDecoration:'none',
            boxShadow:'0 8px 32px rgba(99,102,241,0.45)',
            letterSpacing:'-0.02em', border:'1px solid rgba(255,255,255,0.18)' }}>
            Start Learning Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
          </Link>
          <Link to="/login" className="btn-ghost" style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'16px 36px', borderRadius:12, fontSize:16, fontWeight:500,
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)',
            color:'rgba(240,244,255,0.55)', textDecoration:'none', transition:'all 0.2s',
            letterSpacing:'-0.01em' }}>
            Sign In
          </Link>
        </div>

        {/* Stats strip */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)',
          maxWidth:700, width:'100%',
          background:'rgba(255,255,255,0.025)',
          border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:20, overflow:'hidden',
          backdropFilter:'blur(20px)',
          animation:'fadeUp 0.7s 0.5s both' }}>
          {[
            { val:'500',  label:'Free Credits',        color:'#818cf8' },
            { val:'₹500', label:'One-time Only',        color:'#fbbf24' },
            { val:'Live', label:'Real-time Sessions',   color:'#34d399' },
            { val:'+10',  label:'Credits per Student',  color:'#c084fc' },
          ].map(({ val, label, color }, i) => (
            <div key={label} className="stat-item" style={{ padding:'28px 16px', textAlign:'center',
              borderLeft:i>0?'1px solid rgba(255,255,255,0.06)':'none',
              cursor:'default' }}>
              <div className="stat-num" style={{ fontSize:26, fontWeight:800, color,
                letterSpacing:'-0.04em', marginBottom:6, fontVariantNumeric:'tabular-nums' }}>
                {val}
              </div>
              <div style={{ fontSize:11, color:'rgba(240,244,255,0.28)', fontWeight:500,
                textTransform:'uppercase', letterSpacing:'0.09em', fontFamily:"'DM Sans',sans-serif" }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:8,
          opacity:0.3, animation:'fadeIn 1s 1.2s both' }}>
          <span style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase',
            color:'rgba(240,244,255,0.6)', fontWeight:500 }}>Scroll</span>
          <div style={{ width:1, height:40,
            background:'linear-gradient(to bottom,rgba(99,102,241,0.8),transparent)' }}/>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section style={{ position:'relative', zIndex:1, padding:'120px 60px',
        borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>

          <div style={{ textAlign:'center', marginBottom:80 }}>
            <div style={{ display:'inline-block', padding:'5px 18px', borderRadius:100,
              background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)',
              fontSize:11, fontWeight:700, color:'#a5b4fc', letterSpacing:'0.1em',
              textTransform:'uppercase', marginBottom:20 }}>
              How It Works
            </div>
            <h2 style={{ fontSize:'clamp(32px,4vw,54px)', fontWeight:800,
              letterSpacing:'-0.04em', lineHeight:1.05, marginBottom:16,
              color:'#f0f4ff' }}>
              From signup to your first session<br/>
              <span style={{ color:'rgba(240,244,255,0.35)' }}>in under 10 minutes</span>
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {[
              {
                n:'01', gradient:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.05))',
                border:'rgba(99,102,241,0.25)', glow:'rgba(99,102,241,0.12)',
                accent:'#818cf8',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
                title:'Register & Activate',
                desc:'Create your free account in 2 minutes. Complete the one-time ₹500 platform fee and receive 500 time credits instantly in your wallet.',
                tags:['2-min signup','Instant 500 credits','No recurring fees'],
              },
              {
                n:'02', gradient:'linear-gradient(135deg,rgba(6,182,212,0.15),rgba(6,182,212,0.05))',
                border:'rgba(6,182,212,0.25)', glow:'rgba(6,182,212,0.12)',
                accent:'#22d3ee',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V7a2 2 0 012-2h12a2 2 0 012 2v12"/><path d="M4 19h16"/></svg>,
                title:'Browse, Enroll & Teach',
                desc:'Explore live courses from verified teachers. Join sessions with credits — or apply as a teacher and earn 10 credits per student per session.',
                tags:['Browse live courses','Apply as teacher','10 credits/student'],
              },
              {
                n:'03', gradient:'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))',
                border:'rgba(245,158,11,0.25)', glow:'rgba(245,158,11,0.12)',
                accent:'#fbbf24',
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
                title:'Rate, Grow & Earn',
                desc:'After every session, rate your instructor. Build your teaching profile, collect verified reviews, and watch your credit balance grow.',
                tags:['Rate instructors','Earn reviews','Auto-refill wallet'],
              },
            ].map(({ n, gradient, border, accent, icon, title, desc, tags }) => (
              <div key={n} className="step-card" style={{ padding:'40px 32px', borderRadius:20,
                background:gradient, border:`1px solid ${border}`,
                position:'relative', overflow:'hidden', transition:'all 0.25s ease',
                cursor:'default' }}>
                {/* Big number watermark */}
                <div style={{ position:'absolute', bottom:-20, right:10,
                  fontSize:110, fontWeight:900, color:'rgba(255,255,255,0.03)',
                  letterSpacing:'-0.06em', lineHeight:1, pointerEvents:'none',
                  fontVariantNumeric:'tabular-nums', userSelect:'none' }}>{n}</div>
                {/* Step badge */}
                <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
                  width:48, height:48, borderRadius:14,
                  background:`rgba(255,255,255,0.06)`, border:`1px solid ${border}`,
                  color:accent, marginBottom:24 }}>{icon}</div>
                <h3 style={{ fontSize:20, fontWeight:700, color:'#f0f4ff',
                  marginBottom:14, letterSpacing:'-0.03em' }}>{title}</h3>
                <p style={{ fontSize:14, color:'rgba(240,244,255,0.4)',
                  lineHeight:1.8, marginBottom:24, fontFamily:"'DM Sans',sans-serif" }}>{desc}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {tags.map(t => (
                    <span key={t} style={{ padding:'4px 12px', borderRadius:100,
                      background:`rgba(255,255,255,0.06)`,
                      border:`1px solid ${border}`,
                      fontSize:11.5, fontWeight:600, color:accent,
                      letterSpacing:'-0.01em' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES BENTO GRID ═══════════ */}
      <section style={{ position:'relative', zIndex:1, padding:'0 60px 120px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:72 }}>
            <div style={{ display:'inline-block', padding:'5px 18px', borderRadius:100,
              background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.25)',
              fontSize:11, fontWeight:700, color:'#67e8f9', letterSpacing:'0.1em',
              textTransform:'uppercase', marginBottom:20 }}>
              Platform Features
            </div>
            <h2 style={{ fontSize:'clamp(30px,4vw,50px)', fontWeight:800,
              letterSpacing:'-0.04em', color:'#f0f4ff' }}>
              Built for serious learners<br/>
              <span style={{ color:'rgba(240,244,255,0.32)' }}>and passionate teachers</span>
            </h2>
          </div>

          {/* Bento grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gridTemplateRows:'auto auto', gap:18 }}>
            {[
              {
                title:'Zero Subscription Fees', span:'1',
                color:'99,102,241', accent:'#818cf8',
                desc:'Pay ₹500 once to activate. No monthly charges, no hidden costs. Your entire budget goes towards actual learning.',
                icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 13a1 1 0 100 2 1 1 0 000-2z" fill="currentColor"/><path d="M2 10h20"/></svg>,
              },
              {
                title:'Live Interactive Sessions', span:'1',
                color:'6,182,212', accent:'#22d3ee',
                desc:'All sessions run on Jitsi Meet — open source, browser-based. No app needed. Join from any device, anywhere.',
                icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23,7 16,12 23,17 23,7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
              },
              {
                title:'Earn by Teaching', span:'1',
                color:'139,92,246', accent:'#c084fc',
                desc:'Every skill you have is valuable. Start a session, teach students, and earn 10 credits per attending student — automatically.',
                icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
              },
              {
                title:'Auto-Refilling Wallet', span:'1',
                color:'245,158,11', accent:'#fbbf24',
                desc:'Credit wallet refills automatically to 500 every 5 hours. You always have credits ready — never miss a learning opportunity.',
                icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>,
              },
              {
                title:'Verified Teachers Only', span:'1',
                color:'16,185,129', accent:'#34d399',
                desc:'Every teacher completes a thorough platform verification process before going live. Your learning time and credits are fully protected.',
                icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
              },
              {
                title:'Transparent Ratings', span:'1',
                color:'239,68,68', accent:'#f87171',
                desc:'Students rate teachers after every session. Full review history is publicly visible. Choose instructors based on real feedback, not marketing.',
                icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
              },
            ].map(({ title, color, accent, desc, icon }) => (
              <div key={title} className="feature-card" style={{ padding:'32px 28px', borderRadius:18,
                background:'rgba(255,255,255,0.025)',
                border:'1px solid rgba(255,255,255,0.07)',
                backdropFilter:'blur(12px)',
                transition:'all 0.25s ease', cursor:'default' }}>
                <div style={{ width:50, height:50, borderRadius:14,
                  background:`rgba(${color},0.12)`, border:`1px solid rgba(${color},0.25)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:accent, marginBottom:20 }}>{icon}</div>
                <h4 style={{ fontSize:16, fontWeight:700, color:'#f0f4ff',
                  marginBottom:10, letterSpacing:'-0.025em' }}>{title}</h4>
                <p style={{ fontSize:13.5, color:'rgba(240,244,255,0.37)', lineHeight:1.8,
                  fontFamily:"'DM Sans',sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CREDIT SYSTEM ═══════════ */}
      <section style={{ position:'relative', zIndex:1, padding:'100px 60px',
        borderTop:'1px solid rgba(255,255,255,0.05)',
        borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto',
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>

          <div>
            <div style={{ display:'inline-block', padding:'5px 18px', borderRadius:100,
              background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)',
              fontSize:11, fontWeight:700, color:'#c084fc', letterSpacing:'0.1em',
              textTransform:'uppercase', marginBottom:24 }}>
              The Credit System
            </div>
            <h2 style={{ fontSize:'clamp(28px,3vw,46px)', fontWeight:800,
              letterSpacing:'-0.04em', color:'#f0f4ff', marginBottom:20, lineHeight:1.08 }}>
              Knowledge is the<br/>only currency here
            </h2>
            <p style={{ fontSize:15, color:'rgba(240,244,255,0.4)', lineHeight:1.9,
              marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>
              Point2Learn runs on time credits — a fair, transparent system where your time as a learner
              and your expertise as a teacher hold equal value. No one can buy their way to the top.
            </p>
            <p style={{ fontSize:14, color:'rgba(240,244,255,0.28)', lineHeight:1.9,
              marginBottom:36, fontFamily:"'DM Sans',sans-serif" }}>
              Every session you teach adds credits. Every session you attend deducts them.
              The system auto-refills so learning never stops.
            </p>
            <Link to="/register" style={{
              display:'inline-flex', alignItems:'center', gap:9,
              padding:'12px 26px', borderRadius:10, fontSize:14, fontWeight:600,
              background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.3)',
              color:'#c084fc', textDecoration:'none', transition:'all 0.18s' }}
              onMouseOver={e=>e.currentTarget.style.background='rgba(139,92,246,0.22)'}
              onMouseOut={e=>e.currentTarget.style.background='rgba(139,92,246,0.12)'}>
              Start with 500 free credits
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
            </Link>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { action:'Account Activation', change:'+500', rgb:'16,185,129',  note:'Credited instantly after payment confirmation' },
              { action:'Attend a Session',   change:'−500', rgb:'239,68,68',   note:'Deducted when you join a live class session' },
              { action:'Teach One Student',  change:'+10',  rgb:'99,102,241',  note:'Earned per student attending your session' },
              { action:'Wallet Auto-Refill', change:'+500', rgb:'245,158,11',  note:'Automatic every 5 hours when balance is low' },
            ].map(({ action, change, rgb, note }) => (
              <div key={action} className="credit-row" style={{
                display:'flex', alignItems:'center', gap:18,
                padding:'18px 22px', borderRadius:14,
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.07)',
                transition:'all 0.18s', cursor:'default' }}>
                <div style={{ minWidth:58, fontSize:17, fontWeight:800,
                  color:`rgb(${rgb})`, textAlign:'center',
                  fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em' }}>{change}</div>
                <div style={{ width:1, height:36, background:'rgba(255,255,255,0.06)', flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#f0f4ff', marginBottom:3,
                    letterSpacing:'-0.01em' }}>{action}</div>
                  <div style={{ fontSize:12, color:'rgba(240,244,255,0.3)',
                    fontFamily:"'DM Sans',sans-serif" }}>{note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ STUDENTS vs TEACHERS ═══════════ */}
      <section style={{ position:'relative', zIndex:1, padding:'120px 60px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:72 }}>
            <div style={{ display:'inline-block', padding:'5px 18px', borderRadius:100,
              background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.2)',
              fontSize:11, fontWeight:700, color:'#67e8f9', letterSpacing:'0.1em',
              textTransform:'uppercase', marginBottom:20 }}>
              Who It's For
            </div>
            <h2 style={{ fontSize:'clamp(28px,4vw,50px)', fontWeight:800,
              letterSpacing:'-0.04em', color:'#f0f4ff' }}>
              Whether you're here to learn or teach
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
            {/* Students */}
            <div style={{ padding:'44px 40px', borderRadius:22,
              background:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(99,102,241,0.03))',
              border:'1px solid rgba(99,102,241,0.2)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-30, right:-30, width:160, height:160,
                borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.12),transparent)',
                pointerEvents:'none' }}/>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:30 }}>
                <div style={{ width:52, height:52, borderRadius:16,
                  background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)',
                  display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                </div>
                <div>
                  <div style={{ fontSize:20, fontWeight:700, color:'#f0f4ff', letterSpacing:'-0.025em' }}>For Students</div>
                  <div style={{ fontSize:13, color:'rgba(240,244,255,0.35)', fontFamily:"'DM Sans',sans-serif" }}>Learn from verified experts</div>
                </div>
              </div>
              {['Browse live courses across any skill', 'Enroll using credits — no real money per class', 'Join sessions via browser, no software needed', 'Rate teachers and leave honest reviews', 'Wallet auto-refills every 5 hours', 'Learn at your own pace — no fixed schedules'].map(t => (
                <div key={t} style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:14 }}>
                  <span style={{ color:'#6366f1', flexShrink:0, marginTop:2 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
                  </span>
                  <span style={{ fontSize:14, color:'rgba(240,244,255,0.5)', lineHeight:1.55,
                    fontFamily:"'DM Sans',sans-serif" }}>{t}</span>
                </div>
              ))}
              <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:8,
                marginTop:24, padding:'12px 24px', borderRadius:10, fontSize:14, fontWeight:600,
                background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)',
                color:'#a5b4fc', textDecoration:'none', transition:'all 0.18s' }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(99,102,241,0.28)'}
                onMouseOut={e=>e.currentTarget.style.background='rgba(99,102,241,0.15)'}>
                Start learning
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
              </Link>
            </div>

            {/* Teachers */}
            <div style={{ padding:'44px 40px', borderRadius:22,
              background:'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.03))',
              border:'1px solid rgba(16,185,129,0.2)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-30, right:-30, width:160, height:160,
                borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.12),transparent)',
                pointerEvents:'none' }}/>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:30 }}>
                <div style={{ width:52, height:52, borderRadius:16,
                  background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)',
                  display:'flex', alignItems:'center', justifyContent:'center', color:'#34d399' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                </div>
                <div>
                  <div style={{ fontSize:20, fontWeight:700, color:'#f0f4ff', letterSpacing:'-0.025em' }}>For Teachers</div>
                  <div style={{ fontSize:13, color:'rgba(240,244,255,0.35)', fontFamily:"'DM Sans',sans-serif" }}>Earn from what you know</div>
                </div>
              </div>
              {["Apply for teacher verification — free to apply", "Create courses in any skill you're proficient in", "Start live sessions directly from your dashboard", "Earn 10 credits for every attending student", "Build a public rating and review profile", "Reach students actively seeking your skills"].map(t => (
                <div key={t} style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:14 }}>
                  <span style={{ color:'#10b981', flexShrink:0, marginTop:2 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
                  </span>
                  <span style={{ fontSize:14, color:'rgba(240,244,255,0.5)', lineHeight:1.55,
                    fontFamily:"'DM Sans',sans-serif" }}>{t}</span>
                </div>
              ))}
              <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:8,
                marginTop:24, padding:'12px 24px', borderRadius:10, fontSize:14, fontWeight:600,
                background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)',
                color:'#34d399', textDecoration:'none', transition:'all 0.18s' }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(16,185,129,0.28)'}
                onMouseOut={e=>e.currentTarget.style.background='rgba(16,185,129,0.15)'}>
                Apply as teacher
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section style={{ position:'relative', zIndex:1, padding:'100px 60px',
        borderTop:'1px solid rgba(255,255,255,0.05)', textAlign:'center', overflow:'hidden' }}>
        {/* CTA background glow */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          width:800, height:400, borderRadius:'50%',
          background:'radial-gradient(ellipse,rgba(99,102,241,0.12) 0%,transparent 70%)',
          pointerEvents:'none' }}/>
        <div style={{ maxWidth:640, margin:'0 auto', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'7px 20px',
            borderRadius:100, background:'rgba(99,102,241,0.1)',
            border:'1px solid rgba(99,102,241,0.3)', marginBottom:28 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#a5b4fc', letterSpacing:'0.08em',
              textTransform:'uppercase' }}>Get Started Today</span>
          </div>
          <h2 style={{ fontSize:'clamp(32px,5vw,60px)', fontWeight:800,
            letterSpacing:'-0.045em', color:'#f0f4ff', marginBottom:20, lineHeight:1.0 }}>
            Your next skill is<br/>
            <span style={{ background:'linear-gradient(135deg,#6366f1,#06b6d4,#a78bfa)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              one session away
            </span>
          </h2>
          <p style={{ fontSize:16, color:'rgba(240,244,255,0.38)', lineHeight:1.9,
            marginBottom:52, fontFamily:"'DM Sans',sans-serif" }}>
            Join Point2Learn today. One-time ₹500 activation.<br/>
            500 free credits. Start learning immediately.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:32 }}>
            <Link to="/register" className="btn-primary" style={{
              display:'inline-flex', alignItems:'center', gap:10,
              padding:'17px 48px', borderRadius:12, fontSize:16, fontWeight:700,
              background:'linear-gradient(135deg,#4f46e5,#6366f1,#7c3aed)',
              color:'#fff', textDecoration:'none',
              boxShadow:'0 8px 40px rgba(99,102,241,0.5)',
              letterSpacing:'-0.02em', border:'1px solid rgba(255,255,255,0.18)',
              animation:'glow 3s ease-in-out infinite' }}>
              Create Your Account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
            </Link>
            <Link to="/login" className="btn-ghost" style={{
              display:'inline-flex', alignItems:'center',
              padding:'17px 36px', borderRadius:12, fontSize:16, fontWeight:500,
              background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)',
              color:'rgba(240,244,255,0.5)', textDecoration:'none', transition:'all 0.2s' }}>
              Sign In
            </Link>
          </div>
          <p style={{ fontSize:12.5, color:'rgba(240,244,255,0.18)', fontFamily:"'DM Sans',sans-serif",
            letterSpacing:'0.02em' }}>
            One-time ₹500 activation · No monthly charges · Auto-refilling credits
          </p>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ position:'relative', zIndex:1,
        borderTop:'1px solid rgba(255,255,255,0.06)',
        padding:'32px 60px',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <Logo size="md" />
        <div style={{ display:'flex', alignItems:'center', gap:32 }}>
          {[['Sign In','/login'],['Register','/register']].map(([l,t]) => (
            <Link key={l} to={t} className="nav-link-hover" style={{ fontSize:13,
              color:'rgba(240,244,255,0.22)', textDecoration:'none', transition:'color 0.15s',
              fontWeight:500 }}>{l}</Link>
          ))}
        </div>
        <span style={{ fontSize:12, color:'rgba(240,244,255,0.14)', fontFamily:"'DM Sans',sans-serif" }}>
          © 2026 Point2Learn — Final Year Project, Tamil Nadu
        </span>
      </footer>

    </div>
  )
}
