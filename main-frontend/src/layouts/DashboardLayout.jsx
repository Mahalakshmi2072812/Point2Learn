import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar  from '@/components/layout/Topbar'
import { getUnreadCount, sendHeartbeat } from '@/api'

export default function DashboardLayout() {
  const [unread,      setUnread]  = useState(0)
  const [sidebarOpen, setSidebar] = useState(false)

  useEffect(() => {
    const load = () => getUnreadCount()
      .then(r => setUnread(r.data?.unread_notifications || 0))
      .catch(() => {})
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [])

  // Heartbeat - track user online status
  useEffect(() => {
    sendHeartbeat().catch(() => {})
    const hb = setInterval(() => sendHeartbeat().catch(() => {}), 60000)
    return () => clearInterval(hb)
  }, [])

  const close = () => setSidebar(false)

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)', position:'relative' }}>

      {/* Premium background */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0,
          background:'linear-gradient(135deg,#04061a 0%,#060920 50%,#070b24 100%)' }}/>
        <div style={{ position:'absolute', top:'-12%', left:'-8%', width:650, height:650, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 68%)',
          animation:'dbFloat1 13s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', top:'5%', right:'-8%', width:520, height:520, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 68%)',
          animation:'dbFloat2 16s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', bottom:'-15%', left:'15%', width:580, height:580, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(139,92,246,0.09) 0%,transparent 68%)',
          animation:'dbFloat3 19s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', inset:0,
          backgroundImage:'linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)',
          backgroundSize:'64px 64px' }}/>
        <div style={{ position:'absolute', inset:0,
          background:'radial-gradient(ellipse 100% 100% at 50% 50%,transparent 55%,rgba(4,6,26,0.6) 100%)' }}/>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div onClick={close} style={{
          position:'fixed', inset:0, zIndex:55,
          background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)',
          animation:'dbFadeIn 0.2s both',
        }}/>
      )}

      <Sidebar unread={unread} open={sidebarOpen} onClose={close}/>

      {/* Main - full width */}
      <div style={{ flex:1, marginLeft:0, position:'relative', zIndex:1 }}>
        <Topbar onMenuClick={() => setSidebar(o => !o)}/>
        <main style={{ paddingTop:62, padding:'78px 40px 48px', minHeight:'100vh' }}>
          <Outlet/>
        </main>
      </div>

      <style>{`
        @keyframes dbFloat1 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-28px) scale(1.03)} }
        @keyframes dbFloat2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(3deg)} }
        @keyframes dbFloat3 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-16px) translateX(14px)} }
        @keyframes dbFadeIn { from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  )
}
