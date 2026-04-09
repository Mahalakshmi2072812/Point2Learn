import { createContext, useContext, useState, useCallback } from 'react'
const Ctx = createContext(null)
export const useToast = () => useContext(Ctx)
export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const toast = useCallback((msg, type='info') => {
    const id = Date.now()
    setItems(p => [...p, {id,msg,type}])
    setTimeout(() => setItems(p => p.filter(x => x.id !== id)), 4000)
  }, [])
  const colors = {
    success:'rgba(34,197,94,0.1)  border-green-500/30  text-green-400',
    error:  'rgba(239,68,68,0.1)  border-red-500/30    text-red-400',
    info:   'rgba(59,130,246,0.1) border-blue-500/30   text-blue-400',
    warning:'rgba(245,158,11,0.1) border-yellow-500/30 text-yellow-400',
  }
  return (
    <Ctx.Provider value={{toast}}>
      {children}
      <div style={{position:'fixed',bottom:'24px',right:'24px',zIndex:9999,display:'flex',flexDirection:'column',gap:'8px',width:'320px'}}>
        {items.map(t => (
          <div key={t.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px 16px',borderRadius:'12px',border:'1px solid',backdropFilter:'blur(20px)',fontSize:'13px',
            background: t.type==='success'?'rgba(34,197,94,0.1)':t.type==='error'?'rgba(239,68,68,0.1)':t.type==='warning'?'rgba(245,158,11,0.1)':'rgba(59,130,246,0.1)',
            borderColor: t.type==='success'?'rgba(34,197,94,0.3)':t.type==='error'?'rgba(239,68,68,0.3)':t.type==='warning'?'rgba(245,158,11,0.3)':'rgba(59,130,246,0.3)',
            color: t.type==='success'?'#4ade80':t.type==='error'?'#f87171':t.type==='warning'?'#fbbf24':'#60a5fa',
          }}>
            <span style={{fontWeight:700}}>{t.type==='success'?'✓':t.type==='error'?'✕':t.type==='warning'?'!':'i'}</span>
            <span style={{flex:1,color:'#e8edf5'}}>{t.msg}</span>
            <button style={{background:'none',border:'none',color:'inherit',cursor:'pointer',opacity:0.5}} onClick={()=>setItems(p=>p.filter(x=>x.id!==t.id))}>✕</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}