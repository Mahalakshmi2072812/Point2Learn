import { useState, useEffect } from 'react'
import { getWallet } from '@/api'
import { useToast } from '@/context/Toast'
import Spin from '@/components/ui/Spin'

const fmt = iso => { try { return new Date(iso).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}) } catch { return '—' } }
const countdown = iso => {
  if (!iso) return '—'
  const d = new Date(iso) - Date.now()
  if (d <= 0) return 'Refilling soon'
  const h = Math.floor(d / 3600000), m = Math.floor((d % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const RULES = [
  { action: 'Attend a session',    when: 'Per live class joined',      val: '-500',  neg: true  },
  { action: 'Teach 1 student',     when: 'Student joins your session', val: '+10',   neg: false },
  { action: 'Auto-refill',         when: 'Every 5 hours automatically',val: '+500',  neg: false },
  { action: 'Registration bonus',  when: 'After account activation',   val: '+500',  neg: false },
]

export default function WalletPage() {
  const [wallet, setWallet]   = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    getWallet().then(r => setWallet(r.data)).catch(err => toast(err.response?.data?.detail || 'Failed', 'error')).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin /></div>
  if (!wallet) return null

  const pct = Math.min(100, Math.round((wallet.points / 500) * 100))

  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }} className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <h2 className="section-title" style={{ fontFamily: "'Syne', sans-serif" }}>Wallet</h2>
        <p className="section-sub">Your time-banking currency — teach to earn, spend to learn</p>
      </div>

      {/* Balance card */}
      <div style={{
        position: 'relative', borderRadius: 24, padding: '36px 40px', marginBottom: 20, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a1a3a 0%, #0f2550 40%, #091830 100%)',
        border: '1px solid rgba(79,142,255,0.25)',
        boxShadow: '0 0 0 1px rgba(79,142,255,0.1), 0 40px 80px rgba(0,0,0,0.5)',
      }} className="fade-up-1">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.04, pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #4f8eff 40%, #00d4b1 70%, transparent)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Available Credits</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 6 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 60, fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {wallet.points}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', paddingBottom: 8 }}>/ 500 max</div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              <span>Credit level</span><span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{
                width: pct + '%', height: '100%', borderRadius: 10, transition: 'width 1s ease',
                background: pct > 60 ? 'linear-gradient(90deg, #4f8eff, #00d4b1)' : pct > 30 ? 'linear-gradient(90deg, #f0b429, #4f8eff)' : 'linear-gradient(90deg, #ff4d6d, #f0b429)',
              }}/>
            </div>
          </div>

          {/* Refill info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['Last Refill', fmt(wallet.last_refill)], ['Next Refill In', countdown(wallet.next_refill_at)]].map(([l, v]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '13px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Syne', sans-serif" }}>{l}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'white', fontFamily: "'JetBrains Mono', monospace" }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rules table */}
      <div className="card fade-up-2" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="label" style={{ margin: 0 }}>Credit Rules</span>
          <span className="badge badge-blue">How it works</span>
        </div>
        <table className="tbl">
          <thead><tr>
            <th className="tbl-head">Action</th>
            <th className="tbl-head">When</th>
            <th className="tbl-head" style={{ textAlign: 'right' }}>Change</th>
          </tr></thead>
          <tbody>
            {RULES.map((r, i) => (
              <tr key={i} className="tbl-row">
                <td className="tbl-cell" style={{ fontWeight: 600, color: 'var(--text)' }}>{r.action}</td>
                <td className="tbl-cell" style={{ fontSize: 12 }}>{r.when}</td>
                <td className="tbl-cell" style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14, color: r.neg ? '#ff4d6d' : '#00e5a0' }}>{r.val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
