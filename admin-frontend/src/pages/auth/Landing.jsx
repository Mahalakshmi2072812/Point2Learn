import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white text-xs font-bold">P2</div>
            <span className="text-sm font-bold text-gray-900">Point2Learn</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Sign in</Link>
            <Link to="/register" className="btn-primary text-xs px-4 py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-6">
            India's Time-Banking Skill Platform
          </span>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-5">
            Exchange skills using<br/><span className="text-indigo-600">time as currency</span>
          </h1>
          <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-lg">
            No money needed. Teach what you know, earn time credits. Spend them to learn something new.
            Peer-to-peer skill exchange with live sessions, ratings, and verified teachers.
          </p>
          <div className="flex gap-3">
            <Link to="/register" className="btn-primary px-6 py-2.5">Create Account</Link>
            <Link to="/login" className="btn-secondary px-6 py-2.5">Sign In</Link>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-10">How it works</h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { step:'01', title:'Register', desc:'Sign up with a one-time ₹99 fee. Get 500 starting time credits.' },
              { step:'02', title:'Learn & Teach', desc:'Enroll in courses. Attend live Jitsi sessions. Earn credits by teaching.' },
              { step:'03', title:'Grow Together', desc:'Rate teachers. Build reputation. Exchange skills — no money needed.' },
            ].map(s => (
              <div key={s.step}>
                <div className="text-3xl font-black text-gray-100 mb-2">{s.step}</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-4 gap-6 text-center">
          {[['500','Starting Credits'],['10 min','Join Window'],['5h','Auto-Refill'],['1:5','Earn:Spend Ratio']].map(([v,l]) => (
            <div key={l}>
              <div className="text-2xl font-bold text-indigo-600">{v}</div>
              <div className="text-xs text-gray-500 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">© 2025 Point2Learn — Final Year Project</p>
          <Link to="/register" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Get started →</Link>
        </div>
      </footer>
    </div>
  )
}