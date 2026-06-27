import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../../App'
import { referralApi } from '../../utils/api'
import { Copy, Check, Users, DollarSign, UserPlus, Gift } from 'lucide-react'
import { useExchangeRates, formatCurrency as fmtC } from '../../contexts/ExchangeRatesContext'

export default function Referrals() {
  const { user } = useContext(AuthContext)
  const liveRates = useExchangeRates()
  const fc = (val) => fmtC(val, user, liveRates)
  const [data, setData] = useState({ referrals: [], totalBonus: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode || ''}`

  useEffect(() => {
    referralApi.list().then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const copyLink = () => { navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-card-header"><div><div className="stat-value">{data.count}</div><div className="stat-label">Total Referrals</div></div><div className="stat-icon cyan"><Users size={20} /></div></div></div>
        <div className="stat-card"><div className="stat-card-header"><div><div className="stat-value">{fc(data.totalBonus)}</div><div className="stat-label">Total Bonus Earned</div></div><div className="stat-icon green"><DollarSign size={20} /></div></div></div>
        <div className="stat-card"><div className="stat-card-header"><div><div className="stat-value">{data.commissionRate || 5}%</div><div className="stat-label">Commission Rate</div></div><div className="stat-icon purple"><Gift size={20} /></div></div></div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><UserPlus size={20} /> Your Referral Link</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 16 }}>Share your link and earn <strong style={{ color: 'var(--success)' }}>{data.commissionRate || 5}%</strong> commission on every deposit your referrals make.</p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input className="form-input" readOnly value={referralLink} style={{ fontFamily: 'monospace', fontSize: '0.82rem', flex: 1 }} />
          <button className="btn btn-primary" onClick={copyLink}>{copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}</button>
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(0,212,255,0.06)', borderRadius: 10 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Your Code: </span>
          <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{user?.referralCode}</span>
        </div>
      </div>

      <div className="section-header"><h3>Referred Users</h3></div>
      {data.referrals.length === 0 ? <div className="card empty-state"><p>No referrals yet. Share your link to start earning!</p></div> : (
        <div className="table-container"><table className="data-table"><thead><tr><th>User</th><th>Email</th><th>Joined</th><th>Bonus Earned</th></tr></thead><tbody>
          {data.referrals.map(r => (<tr key={r.id}><td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.referred?.fullName}</td><td>{r.referred?.email?.replace(/(.{3}).*(@.*)/, '$1***$2')}</td><td>{new Date(r.createdAt).toLocaleDateString()}</td><td style={{ fontWeight: 700, color: 'var(--success)' }}>{fc(r.bonusEarned)}</td></tr>))}
        </tbody></table></div>
      )}
    </div>
  )
}
