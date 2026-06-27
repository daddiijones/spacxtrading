import { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../App'
import { authApi } from '../../utils/api'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Gift, Cpu, Globe, DollarSign, Clock, ShieldCheck, ArrowLeft } from 'lucide-react'
import { COUNTRIES_DATA } from '../../utils/countriesData'

export default function Register() {
  const { login } = useContext(AuthContext)
  
  // Sort countries alphabetically
  const countries = [...COUNTRIES_DATA].sort((a, b) => a.name.localeCompare(b.name))
  
  // Extract unique currencies sorted alphabetically
  const currencies = Array.from(new Set(COUNTRIES_DATA.map(c => c.currency)))
    .map(curr => {
      const match = COUNTRIES_DATA.find(c => c.currency === curr)
      return { code: curr, symbol: match?.symbol || '$', name: match?.name || '' }
    })
    .sort((a, b) => a.code.localeCompare(b.code))
    
  // Extract unique timezones sorted alphabetically
  const timezones = Array.from(new Set(COUNTRIES_DATA.map(c => c.timezone)))
    .sort((a, b) => a.localeCompare(b))

  const [form, setForm] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    referralCode: '',
    country: 'US',
    currency: 'USD',
    timezone: 'America/New_York'
  })
  
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // OTP Verification States
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [verifyingLoading, setVerifyingLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('')

  // Dynamically auto-detect browser language or country context if possible
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const refCode = urlParams.get('ref')
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz && timezones.includes(tz)) {
        const match = COUNTRIES_DATA.find(c => c.timezone === tz)
        setForm(prev => ({
          ...prev,
          referralCode: refCode || prev.referralCode,
          timezone: tz,
          country: match ? match.code : prev.country,
          currency: match ? match.currency : prev.currency
        }))
      } else if (refCode) {
        setForm(prev => ({ ...prev, referralCode: refCode }))
      }
    } catch (e) {
      console.log('Detection bypassed')
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('ref')) {
        setForm(prev => ({ ...prev, referralCode: urlParams.get('ref') }))
      }
    }
  }, [])

  const handleCountryChange = (countryCode) => {
    const match = COUNTRIES_DATA.find(c => c.code === countryCode)
    setForm(prev => ({
      ...prev,
      country: countryCode,
      currency: match ? match.currency : prev.currency,
      timezone: match ? match.timezone : prev.timezone
    }))
  }

  // Phase 1: Request Registration & Send OTP
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.fullName || !form.email || !form.password) return setError('Please fill in all required fields')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      const data = await authApi.register(form)
      if (data.requiresVerification) {
        setRequiresVerification(true)
        setOtpSuccessMsg(`We have successfully dispatched a verification code to ${form.email}.`)
      }
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  // Phase 2: Verify Registration OTP & Finalize
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setOtpError('')
    if (!otpCode) return setOtpError('Please enter the 6-digit verification code')
    setVerifyingLoading(true)
    try {
      const data = await authApi.verifyRegisterOtp({ email: form.email, code: otpCode })
      localStorage.setItem('miningToken', data.token)
      login(data.user)
    } catch (err) {
      setOtpError(err.message)
    } finally { setVerifyingLoading(false) }
  }

  // Resend code helper
  const handleResendOtp = async () => {
    setOtpError('')
    setOtpSuccessMsg('')
    try {
      await authApi.register(form)
      setOtpSuccessMsg('A new verification code has been dispatched to your email address.')
    } catch (err) {
      setOtpError(err.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card register-card slide-in">
        
        {/* Verification Screen */}
        {requiresVerification ? (
          <div style={{ padding: '10px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(14, 165, 233,0.1)', border: '1px solid rgba(14, 165, 233,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <ShieldCheck size={28} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <h2>Email Verification Required</h2>
              <p className="auth-subtitle" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 360, margin: '6px auto 0' }}>
                For absolute mission security, please verify your email address to complete registration.
              </p>
            </div>

            {otpError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: 'var(--danger)', fontSize: '0.85rem' }}>{otpError}</div>}
            {otpSuccessMsg && <div style={{ background: 'rgba(14, 165, 233,0.1)', border: '1px solid rgba(14, 165, 233,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>{otpSuccessMsg}</div>}

            <form onSubmit={handleVerifyOtp}>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">6-Digit Verification Code</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" type="text" placeholder="Enter code (e.g. 123456)" style={{ paddingLeft: 42, letterSpacing: 4, fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}
                    value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={verifyingLoading} style={{ width: '100%', marginBottom: 14 }}>
                {verifyingLoading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Verify & Complete Registration <ArrowRight size={18} /></>}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <button type="button" onClick={() => setRequiresVerification(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
                  <ArrowLeft size={14} /> Back / Edit Form
                </button>
                <button type="button" onClick={handleResendOtp} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Registration Form Screen */
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(14, 165, 233,0.1)', border: '1px solid rgba(14, 165, 233,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Cpu size={24} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <h2>Initialize Launch Access</h2>
              <p className="auth-subtitle" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 0 }}>Deploy your mission identity on SpaceX Trading systems.</p>
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="register-form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" type="text" placeholder="John Doe" style={{ paddingLeft: 42 }}
                    value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" type="email" placeholder="you@example.com" style={{ paddingLeft: 42 }}
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" style={{ paddingLeft: 42, paddingRight: 42 }}
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" type="password" placeholder="Confirm your password" style={{ paddingLeft: 42 }}
                    value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Country</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select className="form-input" style={{ paddingLeft: 42, appearance: 'none', background: 'rgba(255,255,255,0.03)', color: '#fff' }}
                    value={form.country} onChange={e => handleCountryChange(e.target.value)}>
                    {countries.map(c => (
                      <option key={c.code} value={c.code} style={{ background: '#0a0a0a', color: '#fff' }}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Currency</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select className="form-input" style={{ paddingLeft: 42, appearance: 'none', background: 'rgba(255,255,255,0.03)', color: '#fff' }}
                    value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                    {currencies.map(curr => (
                      <option key={curr.code} value={curr.code} style={{ background: '#0a0a0a', color: '#fff' }}>{curr.code} ({curr.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Local Timezone</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select className="form-input" style={{ paddingLeft: 42, appearance: 'none', background: 'rgba(255,255,255,0.03)', color: '#fff' }}
                    value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}>
                    {timezones.map(tz => (
                      <option key={tz} value={tz} style={{ background: '#0a0a0a', color: '#fff' }}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Referral Code (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <Gift size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" type="text" placeholder="Enter referral code" style={{ paddingLeft: 42 }}
                    value={form.referralCode} onChange={e => setForm({ ...form, referralCode: e.target.value })} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg register-span-2" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
                {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Initialize Launch Access <ArrowRight size={18} /></>}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
