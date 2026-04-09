import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { validateResetToken, confirmResetPassword } from '@/api'
import Spin from '@/components/ui/Spin'
import Logo from '@/components/Logo'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
  @keyframes shimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  .rp-input { width:100%; padding:15px 18px; font-size:14.5px; font-family:'Sora',sans-serif;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);
    border-radius:12px; color:#f0f4ff; outline:none; transition:all 0.2s; }
  .rp-input:focus { border-color:rgba(99,102,241,0.6); background:rgba(99,102,241,0.07);
    box-shadow:0 0 0 4px rgba(99,102,241,0.12); }
  .rp-input::placeholder { color:rgba(240,244,255,0.2); }
  .rp-btn { width:100%; padding:16px; font-size:15px; font-weight:700;
    font-family:'Sora',sans-serif; background:linear-gradient(135deg,#4f46e5,#6366f1,#7c3aed);
    background-size:200% 200%; animation:shimmer 5s ease infinite;
    color:#fff; border:none; border-radius:12px; cursor:pointer;
    box-shadow:0 8px 32px rgba(99,102,241,0.45);
    display:flex; align-items:center; justify-content:center; gap:10px;
    transition:all 0.25s; border:1px solid rgba(255,255,255,0.15); }
  .rp-btn:hover { transform:translateY(-3px); box-shadow:0 20px 50px rgba(99,102,241,0.6); }
  .rp-btn:disabled { opacity:0.55; cursor:not-allowed; transform:none; }
`

// ✅ FIX: Wrapper moved OUTSIDE ResetPasswordPage.
// When defined inside, React treats it as a new component type on every
// render and unmounts/remounts children — causing the blank page bug.
function Wrapper({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#050818', color: '#f0f4ff', fontFamily: "'Sora',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{STYLES}</style>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-15%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.16) 0%,transparent 68%)', animation: 'float 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.035) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, width: '100%', padding: '0 24px', animation: 'fadeUp 0.6s both' }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}><Logo size="lg" /></div>
        {children}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  const { token } = useParams()

  const [validating, setValidating] = useState(true)
  const [email, setEmail] = useState('')
  const [remaining, setRemaining] = useState(0)
  const [error, setError] = useState('')

  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const timerRef = useRef(null)

  useEffect(() => {
    if (!token) {
      setError('No reset token found in the link.')
      setValidating(false)
      return
    }
    validateResetToken(token)
      .then(r => {
        setEmail(r.data.email)
        setRemaining(r.data.remaining_seconds)
      })
      .catch(err => {
        setError(err.response?.data?.detail || 'Invalid or expired reset link')
      })
      .finally(() => setValidating(false))
  }, [token])

  useEffect(() => {
    if (remaining <= 0 || done || error) return
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setError('Reset link has expired (5 min limit)')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [remaining, done, error])

  const fmt = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')

  const handleSubmit = async () => {
    setSubmitError('')
    if (!newPass || newPass.length < 6) { setSubmitError('Password must be at least 6 characters'); return }
    if (newPass !== confirmPass) { setSubmitError('Passwords do not match'); return }
    setSubmitting(true)
    try {
      await confirmResetPassword(token, newPass)
      setDone(true)
      clearInterval(timerRef.current)
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Failed to reset password')
    }
    setSubmitting(false)
  }

  if (validating) return (
    <Wrapper>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 60 }}>
        <Spin size={28} />
        <p style={{ fontSize: 14, color: 'rgba(240,244,255,0.4)' }}>Validating reset link...</p>
      </div>
    </Wrapper>
  )

  if (error) return (
    <Wrapper>
      <div style={{ textAlign: 'center', padding: '48px 32px', borderRadius: 20, background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.2)' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px', background: 'rgba(255,77,109,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Reset Failed</h2>
        <p style={{ fontSize: 14, color: 'rgba(240,244,255,0.45)', marginBottom: 28, lineHeight: 1.6 }}>{error}</p>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Back to Login</Link>
      </div>
    </Wrapper>
  )

  if (done) return (
    <Wrapper>
      <div style={{ textAlign: 'center', padding: '48px 32px', borderRadius: 20, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'checkPop 0.5s 0.2s both' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Password Updated!</h2>
        <p style={{ fontSize: 14, color: 'rgba(240,244,255,0.45)', marginBottom: 28, lineHeight: 1.6 }}>Your password has been changed successfully. You can now log in with your new password.</p>
        <Link to="/login" className="rp-btn" style={{ display: 'inline-flex', textDecoration: 'none', width: 'auto', padding: '14px 32px' }}>
          Go to Login
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" /></svg>
        </Link>
      </div>
    </Wrapper>
  )

  return (
    <Wrapper>
      <div style={{ padding: '40px 32px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100,
            background: remaining < 60 ? 'rgba(255,77,109,0.1)' : 'rgba(245,158,11,0.1)',
            border: '1px solid ' + (remaining < 60 ? 'rgba(255,77,109,0.25)' : 'rgba(245,158,11,0.25)'),
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={remaining < 60 ? '#ff4d6d' : '#fbbf24'} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: remaining < 60 ? '#ff4d6d' : '#fbbf24', fontFamily: "'JetBrains Mono', monospace" }}>{fmt(remaining)} remaining</span>
          </div>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Set New Password</h2>
        <p style={{ fontSize: 13, color: 'rgba(240,244,255,0.35)', textAlign: 'center', marginBottom: 32, fontFamily: "'DM Sans',sans-serif" }}>
          For <strong style={{ color: '#a5b4fc' }}>{email}</strong>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(240,244,255,0.35)', marginBottom: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>New Password</label>
            <input className="rp-input" type="password" placeholder="Min 6 characters" value={newPass} onChange={e => setNewPass(e.target.value)} autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(240,244,255,0.35)', marginBottom: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Confirm Password</label>
            <input className="rp-input" type="password" placeholder="Re-enter password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          {submitError && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)', fontSize: 13, color: '#ff6b8a' }}>{submitError}</div>
          )}
          <button onClick={handleSubmit} disabled={submitting} className="rp-btn" style={{ marginTop: 4 }}>
            {submitting ? <Spin size={17} /> : (<>Reset Password <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12" /></svg></>)}
          </button>
        </div>
      </div>
    </Wrapper>
  )
}
