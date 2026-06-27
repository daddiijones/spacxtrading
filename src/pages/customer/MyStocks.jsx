import { useState, useEffect, useContext } from 'react'
import { stockApi } from '../../utils/api'
import { AuthContext } from '../../App'
import { useExchangeRates, formatCurrency as fmtC } from '../../contexts/ExchangeRatesContext'
import { TrendingUp, Clock, CheckCircle, XCircle, BarChart2 } from 'lucide-react'

const SECTOR_COLORS = {
  'Technology':      '#627eea', 'E-Commerce':     '#f7931a', 'Social Media':   '#1877f2',
  'Automotive/EV':   '#e31937', 'Finance':        '#26a17b', 'Fintech':        '#2775ca',
  'Banking':         '#003087', 'Healthcare':     '#00a651', 'Retail':         '#0071ce',
  'Consumer Goods':  '#0033a0', 'Energy':         '#ff6900', 'Beverages':      '#f40009',
  'Streaming':       '#e50914', 'SaaS':           '#00a1e0', 'Software':       '#ff0000',
  'Mobility':        '#000000', 'AI / Defense':   '#6e3fb9', 'Cloud / Data':   '#29b5e8',
  'EV':              '#1db954', 'Aerospace / Defense': '#003366',
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE:    { color: 'var(--success)',  bg: 'rgba(16,185,129,0.1)',  icon: <TrendingUp size={12} />,    label: 'Active'    },
    COMPLETED: { color: 'var(--accent-cyan)', bg: 'rgba(0,212,255,0.1)', icon: <CheckCircle size={12} />,  label: 'Completed' },
    CANCELLED: { color: 'var(--danger)',   bg: 'rgba(239,68,68,0.1)',   icon: <XCircle size={12} />,      label: 'Cancelled' },
  }
  const cfg = map[status] || map.ACTIVE
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: cfg.bg, color: cfg.color, borderRadius: 6, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

export default function MyStocks() {
  const { user } = useContext(AuthContext)
  const liveRates = useExchangeRates()
  const fc = (val, shrink) => fmtC(val, user, liveRates, shrink)
  const fmtUSD = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const [investments, setInvestments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('ALL')

  useEffect(() => {
    stockApi.myStocks()
      .then(data => { setInvestments(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const filtered = filter === 'ALL' ? investments : investments.filter(i => i.status === filter)

  const totalInvested  = investments.reduce((s, i) => s + i.investedAmount, 0)
  const totalEarned    = investments.reduce((s, i) => s + i.totalEarned, 0)
  const activeCount    = investments.filter(i => i.status === 'ACTIVE').length

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-value">{fmtUSD(totalInvested)}</div>
              {user?.currency !== 'USD' && liveRates && <div style={{ fontSize: '0.78rem', color: 'var(--accent-green)' }}>≈ {fc(totalInvested)}</div>}
              <div className="stat-label">Total Invested</div>
            </div>
            <div className="stat-icon cyan"><BarChart2 size={20} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>+{fmtUSD(totalEarned)}</div>
              {user?.currency !== 'USD' && liveRates && <div style={{ fontSize: '0.78rem', color: 'var(--accent-green)' }}>≈ {fc(totalEarned)}</div>}
              <div className="stat-label">Total Earned</div>
            </div>
            <div className="stat-icon green"><TrendingUp size={20} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div><div className="stat-value">{activeCount}</div><div className="stat-label">Active Contracts</div></div>
            <div className="stat-icon amber"><Clock size={20} /></div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <TrendingUp size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
            {investments.length === 0 ? 'You have no stock investments yet.' : 'No investments match this filter.'}
          </p>
          {investments.length === 0 && (
            <a href="/stocks" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              Browse Stocks
            </a>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(inv => {
            const color      = SECTOR_COLORS[inv.stock?.sector] || '#627eea'
            const start      = new Date(inv.contractStart)
            const end        = new Date(inv.contractEnd)
            const now        = new Date()
            const totalDays  = (end - start) / 86400000
            const elapsed    = Math.min((now - start) / 86400000, totalDays)
            const progress   = totalDays > 0 ? Math.min(100, (elapsed / totalDays) * 100) : 100
            const daysLeft   = Math.max(0, Math.ceil((end - now) / 86400000))
            const projected  = inv.investedAmount * (inv.annualROI / 100 / 365) * totalDays

            return (
              <div key={inv.id} className="card">
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(135deg, ${color}, ${color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '0.7rem', flexShrink: 0, letterSpacing: '-0.5px' }}>
                      {inv.symbol.slice(0, 4)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{inv.stockName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{inv.symbol} · {inv.stock?.sector}</div>
                    </div>
                  </div>
                  <StatusBadge status={inv.status} />
                </div>

                {/* Key numbers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Invested', value: fmtUSD(inv.investedAmount), local: fc(inv.investedAmount) },
                    { label: 'Earned', value: fmtUSD(inv.totalEarned), local: fc(inv.totalEarned), green: true },
                    { label: 'Daily Earning', value: fmtUSD(inv.dailyEarning), local: fc(inv.dailyEarning), green: true },
                    { label: 'Projected Total', value: fmtUSD(projected), local: fc(projected) },
                    { label: 'Annual ROI', value: `${inv.annualROI}%`, noLocal: true },
                    { label: 'Price at Buy', value: `$${Number(inv.priceAtPurchase).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, noLocal: true },
                    { label: 'Shares Owned', value: `${Number(inv.sharesOwned).toFixed(6)} ${inv.symbol}`, noLocal: true },
                  ].map(({ label, value, local, green, noLocal }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontWeight: 700, color: green ? 'var(--accent-green)' : '#fff', fontSize: '0.85rem' }}>{value}</div>
                      {!noLocal && user?.currency !== 'USD' && liveRates && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--accent-green)', marginTop: 1 }}>≈ {local}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span>Contract Progress</span>
                    <span>
                      {inv.status === 'ACTIVE' ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining` : `Ended ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: inv.status === 'COMPLETED' ? 'var(--accent-cyan)' : 'var(--accent-green)', borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    <span>{start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>{end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
