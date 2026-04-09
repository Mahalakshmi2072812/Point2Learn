import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authActivate } from '@/api'
import { useToast } from '@/context/Toast'
import Spin from '@/components/ui/Spin'

export default function ActivatePage() {
  const params = new URLSearchParams(window.location.search)
  const [email, setEmail] = useState(params.get('email') || '')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      // POST /api/auth/activate-payment → { success, message }
      await authActivate(email)
      toast('Account activated! You can now sign in.', 'success')
      navigate('/login')
    } catch (err) {
      toast(err.response?.data?.detail || 'Activation failed', 'error')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto mb-3">P2</div>
          <h1 className="text-xl font-bold text-gray-900">Activate your account</h1>
          <p className="text-sm text-gray-500 mt-1">Complete your one-time registration</p>
        </div>
        <div className="card p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5">
            <p className="text-sm font-semibold text-yellow-800 mb-1">Payment Required</p>
            <p className="text-xs text-yellow-700 leading-relaxed">
              Pay ₹99 via UPI/card to your institution, then click Activate below.
              You will receive <strong>500 time credits</strong> upon activation.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Registered email</label>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/>
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading && <Spin sm/>} Activate account
            </button>
          </form>
          <p className="text-sm text-center text-gray-500 mt-6">
            <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}