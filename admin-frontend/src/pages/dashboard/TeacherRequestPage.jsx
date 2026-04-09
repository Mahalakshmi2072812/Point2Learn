import { useState } from 'react'
import { requestTeacher } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/Toast'
import Spin from '@/components/ui/Spin'

const BLANK = {
  first_name:'',last_name:'',work_email:'',country:'India',profile_photo_url:'',
  institution_name:'',institution_website:'',institution_type:'University',
  qualification:'',university_name:'',graduation_year:new Date().getFullYear()-2,
  experience_years:1,previous_company:'',phone:'',
  government_id_number:'',id_proof_url:'',
  linkedin_url:'',portfolio_url:'',github_url:'',demo_video_url:'',bio:''
}

const I = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)

function Field({ label, name, value, onChange, type='text', placeholder, required }) {
  return (
    <div>
      <label className="label">
        {label}{required && <span style={{ color:'#f87171', marginLeft:2 }}>*</span>}
      </label>
      <input className="input" name={name} type={type} value={value}
        onChange={e => onChange(name, type === 'number' ? +e.target.value : e.target.value)}
        placeholder={placeholder} required={required}/>
    </div>
  )
}

function Section({ icon, title, children }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:14, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'16px 22px',
        borderBottom:'1px solid rgba(255,255,255,0.07)',
        background:'rgba(99,102,241,0.06)' }}>
        <div style={{ width:28, height:28, borderRadius:7, background:'rgba(99,102,241,0.15)',
          border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center',
          justifyContent:'center', color:'#a5b4fc' }}>
          <I d={icon} s={13}/>
        </div>
        <span style={{ fontSize:12, fontWeight:700, color:'rgba(240,244,255,0.7)',
          letterSpacing:'0.04em', textTransform:'uppercase' }}>{title}</span>
      </div>
      <div style={{ padding:'20px 22px' }}>{children}</div>
    </div>
  )
}

export default function TeacherRequestPage() {
  const { user, verStatus, refresh } = useAuth()
  const { toast } = useToast()
  const [form, setForm]       = useState(BLANK)
  const [submitting, setSub]  = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const canApply = verStatus === 'not_requested' || verStatus === 'rejected'

  if (!canApply) {
    const approved = verStatus === 'approved'
    return (
      <div style={{ maxWidth:540, margin:'0 auto', padding:'40px 0' }} className="fade-up">
        <div style={{ background:'rgba(255,255,255,0.025)', border:`1px solid ${approved?'rgba(16,185,129,0.25)':'rgba(245,158,11,0.25)'}`,
          borderRadius:18, padding:'52px 40px', textAlign:'center',
          boxShadow:'0 16px 50px rgba(0,0,0,0.4)' }}>
          {/* Icon */}
          <div style={{ width:72, height:72, borderRadius:'50%', margin:'0 auto 24px',
            background: approved ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.1)',
            border: `1px solid ${approved?'rgba(16,185,129,0.3)':'rgba(245,158,11,0.25)'}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: approved ? '0 0 28px rgba(16,185,129,0.2)' : '0 0 28px rgba(245,158,11,0.15)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke={approved ? '#4ade80' : '#fbbf24'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {approved
                ? <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></>
                : <><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>}
            </svg>
          </div>
          {/* Status line */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'4px 16px',
            borderRadius:100, marginBottom:16,
            background: approved ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
            border: `1px solid ${approved?'rgba(16,185,129,0.25)':'rgba(245,158,11,0.22)'}` }}>
            <div style={{ width:6, height:6, borderRadius:'50%',
              background: approved ? '#10b981' : '#f59e0b',
              boxShadow: `0 0 8px ${approved?'rgba(16,185,129,0.9)':'rgba(245,158,11,0.9)'}` }}/>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase',
              color: approved ? '#6ee7b7' : '#fcd34d' }}>
              {approved ? 'Verified Teacher' : 'Under Review'}
            </span>
          </div>
          <h3 style={{ fontSize:20, fontWeight:800, color:'#f0f4ff', marginBottom:12,
            letterSpacing:'-0.03em', fontFamily:"'Sora',sans-serif" }}>
            {approved ? 'You are a Verified Teacher!' : 'Application Under Review'}
          </h3>
          <p style={{ fontSize:14, color:'rgba(240,244,255,0.4)', lineHeight:1.75,
            fontFamily:"'DM Sans',sans-serif", maxWidth:360, margin:'0 auto' }}>
            {approved
              ? 'You can now create courses and start live sessions. Go to My Courses to get started.'
              : 'Our admin team is reviewing your request. You will be notified once processed — usually within 2–3 business days.'}
          </p>
        </div>
      </div>
    )
  }

  const submit = async e => {
    e.preventDefault(); setSub(true)
    try {
      await requestTeacher(form)
      toast('Application submitted! We will review within 2-3 business days.', 'success')
      refresh()
    } catch (err) { toast(err.response?.data?.detail || 'Submission failed', 'error') }
    setSub(false)
  }

  return (
    <div style={{ maxWidth:820, margin:'0 auto' }} className="fade-up">
      {/* Page header */}
      <div style={{ textAlign:'center', marginBottom:32, paddingBottom:28,
        borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'4px 16px',
          borderRadius:100, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)',
          marginBottom:14 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#6366f1',
            boxShadow:'0 0 8px rgba(99,102,241,0.9)' }}/>
          <span style={{ fontSize:10.5, fontWeight:700, color:'#a5b4fc',
            letterSpacing:'0.1em', textTransform:'uppercase' }}>Teacher Application</span>
        </div>
        <h2 style={{ fontSize:28, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.04em',
          marginBottom:10, fontFamily:"'Sora',sans-serif" }}>Apply as a Teacher</h2>
        <p style={{ fontSize:14, color:'rgba(240,244,255,0.38)', fontFamily:"'DM Sans',sans-serif",
          lineHeight:1.65, maxWidth:460, margin:'0 auto' }}>
          Complete the form below to request teacher verification. Fields marked <span style={{ color:'#f87171' }}>*</span> are required.
        </p>
      </div>

      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>

        <Section icon={<><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>} title="Personal Details">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Field label="First Name"        name="first_name"         value={form.first_name}         onChange={set} placeholder="First name"           required/>
            <Field label="Last Name"         name="last_name"          value={form.last_name}          onChange={set} placeholder="Last name"            required/>
            <Field label="Work Email"        name="work_email" type="email" value={form.work_email}    onChange={set} placeholder="work@institution.edu" required/>
            <Field label="Country"           name="country"            value={form.country}            onChange={set} placeholder="India"                required/>
            <Field label="Phone"             name="phone"              value={form.phone}              onChange={set} placeholder="+91 XXXXXXXXXX"        required/>
            <Field label="Profile Photo URL" name="profile_photo_url"  value={form.profile_photo_url}  onChange={set} placeholder="https://..."          required/>
          </div>
        </Section>

        <Section icon={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>} title="Institution Details">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Field label="Institution Name" name="institution_name"    value={form.institution_name}    onChange={set} placeholder="Your college / company" required/>
            <Field label="Website"          name="institution_website" value={form.institution_website} onChange={set} placeholder="https://..."            required/>
            <div>
              <label className="label">Institution Type <span style={{ color:'#f87171' }}>*</span></label>
              <select className="input" value={form.institution_type}
                onChange={e => set('institution_type', e.target.value)} required
                style={{ appearance:'none', cursor:'pointer' }}>
                {['University','College','Company','Institute','Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <Section icon={<><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>} title="Professional Background">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Field label="Qualification"      name="qualification"   value={form.qualification}   onChange={set} placeholder="B.Tech / M.Sc / MBA" required/>
            <Field label="University"         name="university_name" value={form.university_name} onChange={set} placeholder="University name"     required/>
            <Field label="Graduation Year"    name="graduation_year" type="number" value={form.graduation_year} onChange={set} required/>
            <Field label="Experience (Years)" name="experience_years" type="number" value={form.experience_years} onChange={set} required/>
            <Field label="Previous Company"   name="previous_company" value={form.previous_company} onChange={set} placeholder="Optional"/>
          </div>
        </Section>

        <Section icon={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>} title="Identity Verification">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Field label="Govt. ID Number" name="government_id_number" value={form.government_id_number} onChange={set} placeholder="Aadhaar / PAN" required/>
            <Field label="ID Proof URL"    name="id_proof_url"         value={form.id_proof_url}         onChange={set} placeholder="Document link"  required/>
          </div>
        </Section>

        <Section icon={<><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>} title="Professional Links">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Field label="LinkedIn"       name="linkedin_url"   value={form.linkedin_url}   onChange={set} placeholder="https://linkedin.com/in/..." required/>
            <Field label="Demo Video URL" name="demo_video_url" value={form.demo_video_url} onChange={set} placeholder="YouTube teaching video"      required/>
            <Field label="Portfolio"      name="portfolio_url"  value={form.portfolio_url}  onChange={set} placeholder="Optional"/>
            <Field label="GitHub"         name="github_url"     value={form.github_url}     onChange={set} placeholder="Optional"/>
          </div>
          <div style={{ marginTop:14 }}>
            <label className="label">Bio <span style={{ color:'#f87171' }}>*</span></label>
            <textarea className="input" rows={4} value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="Describe your expertise and what you plan to teach..."
              required style={{ resize:'vertical' }}/>
          </div>
        </Section>

        <button type="submit" disabled={submitting} style={{
          width:'100%', padding:'15px', fontSize:14.5, fontWeight:700,
          fontFamily:"'Sora',sans-serif", letterSpacing:'-0.01em',
          background:'linear-gradient(135deg,#4f46e5,#6366f1)',
          color:'#fff', border:'none', borderRadius:12, cursor:submitting?'not-allowed':'pointer',
          boxShadow:'0 6px 24px rgba(99,102,241,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          opacity:submitting?0.6:1, transition:'all 0.2s' }}
          onMouseOver={e => { if(!submitting){ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(99,102,241,0.55)' }}}
          onMouseOut={e  => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 6px 24px rgba(99,102,241,0.4)' }}>
          {submitting ? <Spin size={16}/> : 'Submit Teacher Verification Request'}
        </button>
      </form>
    </div>
  )
}
