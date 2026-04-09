import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getProfile } from '@/api'
const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem('p2l_token'))
  const [loading, setLoading] = useState(true)
  const fetchProfile = useCallback(async () => {
    try { const r = await getProfile(); setUser(r.data.data) }
    catch { localStorage.removeItem('p2l_token'); setToken(null); setUser(null) }
  }, [])
  useEffect(() => {
    if (token) fetchProfile().finally(() => setLoading(false))
    else setLoading(false)
  }, [token, fetchProfile])
  const signin  = t => { localStorage.setItem('p2l_token',t); setToken(t) }
  const signout = ()  => { localStorage.removeItem('p2l_token'); setToken(null); setUser(null) }
  const refresh = ()  => fetchProfile()
  const verStatus = user?.teacher_verification?.status || 'not_requested'
  const isTeacher = verStatus === 'approved'
  const isAdmin   = user?.role === 'admin'
  return <Ctx.Provider value={{user,token,loading,signin,signout,refresh,verStatus,isTeacher,isAdmin}}>{children}</Ctx.Provider>
}