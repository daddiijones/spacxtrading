import { Link } from 'react-router-dom'
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { publicApi } from '../../utils/api'

export default function StatusPage() {
  const [status, setStatus] = useState('operational')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicApi.info().then(settings => {
      if (settings.system_status) setStatus(settings.system_status)
      if (settings.system_message) setMessage(settings.system_message)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const services = [
    { name: 'Falcon Launch Network', status, uptime: '99.99%' },
    { name: 'Dragon Mission Control', status, uptime: '99.99%' },
    { name: 'Starship Fleet Systems', status, uptime: '99.99%' },
    { name: 'Automated Deposit Processing Gateway', status, uptime: '99.95%' },
    { name: 'Instant Withdrawal Settlement Node', status, uptime: '99.90%' },
    { name: 'Client Console & Telemetry Feed', status, uptime: '99.99%' },
    { name: 'API Server Cluster Node', status, uptime: '99.98%' },
    { name: 'Access Authorization & OTP Gateway', status, uptime: '99.99%' },
  ]

  const statusConfig = {
    operational: { color: '#0ea5e9', label: 'Active', pulse: true, defaultMessage: 'All SpaceX Trading Systems Operational', icon: <CheckCircle size={18} /> },
    degraded: { color: '#eab308', label: 'Degraded', pulse: false, defaultMessage: 'Some systems are experiencing degraded performance', icon: <AlertCircle size={18} /> },
    maintenance: { color: '#f97316', label: 'Maintenance', pulse: true, defaultMessage: 'System is currently under maintenance', icon: <Clock size={18} /> },
    offline: { color: '#ef4444', label: 'Offline', pulse: false, defaultMessage: 'Major System Outage', icon: <AlertCircle size={18} /> }
  }

  const currentConfig = statusConfig[status] || statusConfig.operational
  const displayMessage = message || currentConfig.defaultMessage

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="landing-page" style={{ background: '#07090e', minHeight: '100vh', color: '#fff' }}>
      <div className="landing-container" style={{ paddingTop: 100, paddingBottom: 80, maxWidth: 800 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-cyan)', fontSize: '0.88rem', marginBottom: 32, textDecoration: 'none' }}><ArrowLeft size={16} /> Back to Home</Link>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: 8, background: 'linear-gradient(135deg, #fff 30%, #0ea5e9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>System Status</h1>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `rgba(${currentConfig.color === '#0ea5e9' ? '14, 165, 233' : currentConfig.color === '#eab308' ? '234,179,8' : currentConfig.color === '#f97316' ? '249,115,22' : '239,68,68'},0.1)`, border: `1px solid ${currentConfig.color}40`, borderRadius: 20, padding: '10px 20px', marginBottom: 48 }}>
          {currentConfig.pulse ? (
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: currentConfig.color, animation: 'pulse 2s infinite' }} />
          ) : (
            <span style={{ color: currentConfig.color }}>{currentConfig.icon}</span>
          )}
          <span style={{ color: currentConfig.color, fontWeight: 600, fontSize: '0.95rem' }}>{displayMessage}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {services.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: currentConfig.color }} />
                <span style={{ fontWeight: 600, color: '#fff' }}>{s.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Uptime: {s.uptime}</span>
                <span style={{ color: currentConfig.color, fontSize: '0.82rem', fontWeight: 600 }}>{currentConfig.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
