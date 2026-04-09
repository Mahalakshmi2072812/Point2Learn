import { useEffect } from 'react'
export default function Modal({ open, onClose, title, children, size='md' }) {
  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose()
    if (open) { document.body.style.overflow='hidden'; window.addEventListener('keydown',h) }
    return () => { document.body.style.overflow=''; window.removeEventListener('keydown',h) }
  }, [open, onClose])
  if (!open) return null
  const maxW = {sm:'440px', md:'560px', lg:'760px'}
  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:'80px',padding:'80px 16px 16px'}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)'}} onClick={onClose}/>
      <div className="card" style={{position:'relative',width:'100%',maxWidth:maxW[size]||maxW.md,maxHeight:'80vh',display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
          <h3 style={{fontSize:'15px',fontWeight:700,color:'#e8edf5'}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#8b96a8',cursor:'pointer',fontSize:'18px',lineHeight:1}} onMouseOver={e=>e.target.style.color='#e8edf5'} onMouseOut={e=>e.target.style.color='#8b96a8'}>✕</button>
        </div>
        <div style={{overflowY:'auto',padding:'24px'}}>{children}</div>
      </div>
    </div>
  )
}