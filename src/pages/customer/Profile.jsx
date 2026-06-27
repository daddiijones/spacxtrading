import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../../App'
import { userApi } from '../../utils/api'
import { useToast } from '../../components/Toast'
import { UserCircle, Lock, Shield, Globe, DollarSign, Clock } from 'lucide-react'
import { COUNTRIES_DATA } from '../../utils/countriesData'

export default function Profile() {
  const { user, login } = useContext(AuthContext)
  const toast = useToast()

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
    fullName: user?.fullName || '',
    country: user?.country || 'US',
    currency: user?.currency || 'USD',
    timezone: user?.timezone || 'America/New_York'
  })
  
  const [saving, setSaving] = useState(false)

  // Password reset state hooks
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const [passSaving, setPassSaving] = useState(false)

  // Keep state in sync with updated context user values
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        country: user.country || 'US',
        currency: user.currency || 'USD',
        timezone: user.timezone || 'America/New_York'
      })
    }
  }, [user])

  const handleCountryChange = (countryCode) => {
    const match = COUNTRIES_DATA.find(c => c.code === countryCode)
    setForm(prev => ({
      ...prev,
      country: countryCode,
      currency: match ? match.currency : prev.currency,
      timezone: match ? match.timezone : prev.timezone
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await userApi.updateProfile({
        fullName: form.fullName,
        country: form.country,
        currency: form.currency,
        timezone: form.timezone
      })
      login({ ...user, ...updated })
      toast.success('Profile details updated successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    }
    setSaving(false)
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmNewPassword) {
      toast.error('New passwords do not match')
      return
    }
    setPassSaving(true)
    try {
      await userApi.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      })
      toast.success('Your password has been successfully updated')
      setPassForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
    }
    setPassSaving(false)
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserCircle size={20} /> Profile Information
        </h4>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Globe size={14} style={{ color: 'var(--accent-cyan)' }} /> Country
              </label>
              <select className="form-input" style={{ appearance: 'none', background: 'rgba(255,255,255,0.03)', color: '#fff' }}
                value={form.country} onChange={e => handleCountryChange(e.target.value)}>
                {countries.map(c => (
                  <option key={c.code} value={c.code} style={{ background: '#0a0a0a' }}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <DollarSign size={14} style={{ color: 'var(--accent-cyan)' }} /> Currency
              </label>
              <select className="form-input" style={{ appearance: 'none', background: 'rgba(255,255,255,0.03)', color: '#fff' }}
                value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code} style={{ background: '#0a0a0a' }}>{curr.code} ({curr.symbol})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} style={{ color: 'var(--accent-cyan)' }} /> Timezone
            </label>
            <select className="form-input" style={{ appearance: 'none', background: 'rgba(255,255,255,0.03)', color: '#fff' }}
              value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}>
              {timezones.map(tz => (
                <option key={tz} value={tz} style={{ background: '#0a0a0a' }}>{tz}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={20} /> Change Password</h4>
        <form onSubmit={handleUpdatePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="Enter current password" 
              value={passForm.currentPassword}
              onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="Enter new password" 
              value={passForm.newPassword}
              onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="Confirm new password" 
              value={passForm.confirmNewPassword}
              onChange={e => setPassForm({ ...passForm, confirmNewPassword: e.target.value })}
              required 
            />
          </div>
          <button type="submit" className="btn btn-secondary" disabled={passSaving}>
            {passSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="card">
        <h4 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={20} /> Security</h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}><div><div style={{ fontWeight: 600, marginBottom: 2 }}>Two-Factor Authentication</div><div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Add an extra layer of security</div></div><span className="badge badge-pending">Coming Soon</span></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}><div><div style={{ fontWeight: 600, marginBottom: 2 }}>KYC Verification</div><div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Verify your identity for higher limits</div></div><span className="badge badge-pending">Not Verified</span></div>
      </div>
    </div>
  )
}
