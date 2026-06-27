import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../App'
import { authApi } from '../../utils/api'
import { useToast } from '../../components/Toast'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react'

export default function Login() {
  const { login } = useContext(AuthContext)
  const toast = useToast()
  
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Login OTP state
  const [otpMode, setOtpMode] = useState(false)
  const [otpData, setOtpData] = useState({ userId: '', email: '', code: '' })

  // Forgot Password state
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [forgotVerifyMode, setForgotVerifyMode] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return setError('Please fill in all fields')
    setLoading(true)
    setError('')
    try {
      const data = await authApi.login(form)
      if (data.requiresOtp) {
        setOtpData({ userId: data.userId, email: data.email, code: '' })
        setOtpMode(true)
      } else {
        localStorage.setItem('miningToken', data.token)
        login(data.user)
        toast.success('Successfully logged in')
      }
    } catch (err) {
      setError(err.message)
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otpData.code) return setError('Please enter the verification code')
    setLoading(true)
    setError('')
    try {
      const data = await authApi.verifyOtp({ userId: otpData.userId, code: otpData.code })
      localStorage.setItem('miningToken', data.token)
      login(data.user)
      toast.success('Security authorization successful')
    } catch (err) {
      setError(err.message)
      toast.error(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault()
    if (!forgotEmail) return setError('Email address is required')
    setLoading(true)
    setError('')
    try {
      await authApi.forgotPassword({ email: forgotEmail })
      toast.success('Verification code has been successfully dispatched to your email')
      setForgotVerifyMode(true)
      setForgotMode(false)
    } catch (err) {
      setError(err.message)
      toast.error(err.message || 'Failed to request reset')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault()
    if (!forgotOtp || !newPassword || !confirmNewPassword) {
      return setError('Please fill in all fields')
    }
    if (newPassword !== confirmNewPassword) {
      return setError('New passwords do not match')
    }
    setLoading(true)
    setError('')
    try {
      const data = await authApi.resetPassword({
        email: forgotEmail,
        code: forgotOtp,
        newPassword
      })
      toast.success(data.message || 'Password successfully reset!')
      // Clear forms
      setForm({ email: forgotEmail, password: '' })
      setForgotEmail('')
      setForgotOtp('')
      setNewPassword('')
      setConfirmNewPassword('')
      // Back to sign in
      setForgotVerifyMode(false)
      setForgotMode(false)
    } catch (err) {
      setError(err.message)
      toast.error(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card slide-in">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--gradient-primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', marginBottom: 16,
            color: '#fff'
          }}>🚀</div>
          
          {otpMode ? (
            <>
              <h2>Verify Identity</h2>
              <p className="auth-subtitle" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Security Authentication Active</p>
            </>
          ) : forgotMode ? (
            <>
              <h2>Forgot Password</h2>
              <p className="auth-subtitle">Recover your access key credentials</p>
            </>
          ) : forgotVerifyMode ? (
            <>
              <h2>Reset Password</h2>
              <p className="auth-subtitle">Verify code and set a new password</p>
            </>
          ) : (
            <>
              <h2>Welcome Back</h2>
              <p className="auth-subtitle">Sign in to your SpaceX Trading account</p>
            </>
          )}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 18,
            color: 'var(--danger)', fontSize: '0.85rem'
          }}>{error}</div>
        )}

        {otpMode ? (
          /* OTP Entry Flow */
          <form onSubmit={handleVerifyOtp}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                We have dispatched a 6-digit authorization security code to your registered email:
              </p>
              <div style={{ margin: '8px 0', fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                {otpData.email}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Please check your inbox or spam folder.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Verification Security Code</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)' }} />
                <input className="form-input" type="text" placeholder="Enter 6-digit code"
                  maxLength={6}
                  style={{ paddingLeft: 42, textAlign: 'center', letterSpacing: 4, fontWeight: 800, fontSize: '1.1rem' }}
                  value={otpData.code} onChange={e => setOtpData({ ...otpData, code: e.target.value })} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Verify & Connect <ArrowRight size={18} /></>}
            </button>

            <button type="button" className="btn btn-secondary" onClick={() => { setOtpMode(false); setError(''); }} 
              style={{ width: '100%', marginTop: 12, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </form>
        ) : forgotMode ? (
          /* Forgot Password Request Flow */
          <form onSubmit={handleForgotPasswordRequest}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Enter your registered email address below. We will send you a 6-digit verification code to reset your account password.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type="email" placeholder="you@example.com"
                  style={{ paddingLeft: 42 }}
                  value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Send Reset Code <ArrowRight size={18} /></>}
            </button>

            <button type="button" className="btn btn-secondary" onClick={() => { setForgotMode(false); setError(''); }} 
              style={{ width: '100%', marginTop: 12, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </form>
        ) : forgotVerifyMode ? (
          /* OTP Verification and New Password Setting Flow */
          <form onSubmit={handleResetPasswordSubmit}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Enter the 6-digit password reset security code sent to:
              </p>
              <div style={{ margin: '8px 0', fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                {forgotEmail}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Verification Security Code</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)' }} />
                <input className="form-input" type="text" placeholder="Enter 6-digit code"
                  maxLength={6}
                  style={{ paddingLeft: 42, textAlign: 'center', letterSpacing: 4, fontWeight: 800, fontSize: '1.1rem' }}
                  value={forgotOtp} onChange={e => setForgotOtp(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type={showNewPass ? 'text' : 'password'} placeholder="Create new password"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type={showNewPass ? 'text' : 'password'} placeholder="Confirm new password"
                  style={{ paddingLeft: 42 }}
                  value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Reset Password & Connect <ArrowRight size={18} /></>}
            </button>

            <button type="button" className="btn btn-secondary" onClick={() => { setForgotVerifyMode(false); setForgotMode(true); setError(''); }} 
              style={{ width: '100%', marginTop: 12, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ArrowLeft size={16} /> Back
            </button>
          </form>
        ) : (
          /* Standard Credentials Flow */
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type="email" placeholder="you@example.com"
                  style={{ paddingLeft: 42 }}
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <button type="button" onClick={() => { setForgotMode(true); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 20 }}>
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Create Account</Link>
        </p>
      </div>
    </div>
  )
}
