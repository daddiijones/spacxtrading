import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function ApiDocs() {
  return (
    <div className="landing-page" style={{ background: '#07090e', minHeight: '100vh', color: '#fff' }}>
      <div className="landing-container" style={{ paddingTop: 100, paddingBottom: 80, maxWidth: 800 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-cyan)', fontSize: '0.88rem', marginBottom: 32, textDecoration: 'none' }}><ArrowLeft size={16} /> Back to Home</Link>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: 8, background: 'linear-gradient(135deg, #fff 30%, #0ea5e9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>API Documentation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 48 }}>Programmatically interface with the SpaceX Trading platform.</p>

        <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 32, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#0ea5e9' }}>REST API v1</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>Our accelerated API lets you monitor your mission contracts, track real-time performance outputs, verify ledgers, and trigger withdrawals.</p>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 16, fontFamily: 'monospace', fontSize: '0.85rem', color: '#0ea5e9' }}>
            Base URL: https://api.spacxtrading.online/v1
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 32 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#fff' }}>Available Endpoint Directory</h3>
          {[
            { method: 'POST', path: '/auth/login', desc: 'Authenticate account access and retrieve JWT token' },
            { method: 'GET', path: '/user/me', desc: 'Fetch user active investment balance and records' },
            { method: 'GET', path: '/mining/plans', desc: 'List active high-yield mission contract tiers' },
            { method: 'POST', path: '/mining/purchase', desc: 'Initiate a new mission contract investment' },
            { method: 'GET', path: '/mining/my-minings', desc: 'List active mission contracts' },
            { method: 'POST', path: '/deposits', desc: 'Initiate a ledger deposit' },
            { method: 'POST', path: '/withdrawals', desc: 'Query a payout distribution' },
          ].map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ background: e.method === 'GET' ? 'rgba(14, 165, 233,0.15)' : 'rgba(59,130,246,0.15)', color: e.method === 'GET' ? '#0ea5e9' : '#3b82f6', padding: '3px 8px', borderRadius: 6, fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700 }}>{e.method}</span>
              <code style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{e.path}</code>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{e.desc}</span>
            </div>
          ))}
          <p style={{ marginTop: 20, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Detailed payload validation rules coming soon. Contact our developer support office for credentials.</p>
        </div>
      </div>
    </div>
  )
}
