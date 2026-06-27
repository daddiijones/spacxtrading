import { useState, useEffect, useContext } from 'react'
import { miningApi } from '../../utils/api'
import { Orbit, DollarSign, TrendingUp, Zap, Activity } from 'lucide-react'
import { AuthContext } from '../../App'
import { useExchangeRates, formatCurrency as fmtC } from '../../contexts/ExchangeRatesContext'

const fmt4 = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })

export default function MyMinings() {
  const { user } = useContext(AuthContext)
  const liveRates = useExchangeRates()
  const fc = (val, shrink) => fmtC(val, user, liveRates, shrink)
  const [minings, setMinings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')
  const [earnings, setEarnings] = useState({})
  const [tick, setTick] = useState(0)

  useEffect(() => {
    miningApi.myMinings().then(m => { setMinings(m); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  // Fast visual tick every 200ms for active mining animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
      setEarnings(prev => {
        const next = { ...prev }
        minings.filter(m => m.status === 'ACTIVE').forEach(m => {
          const perTick = m.dailyEarning / 86400 * 0.2 // 200ms worth
          next[m.id] = (next[m.id] || m.totalEarned) + perTick
        })
        return next
      })
    }, 200)
    return () => clearInterval(interval)
  }, [minings])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const filtered = minings.filter(m => tab === 'active' ? m.status === 'ACTIVE' : m.status === 'COMPLETED')
  const totalActive = minings.filter(m => m.status === 'ACTIVE').reduce((s, m) => s + m.investedAmount, 0)
  const totalEarnedAll = minings.reduce((s, m) => s + (earnings[m.id] || m.totalEarned), 0)

  return (
    <div>
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-card-header"><div><div className="stat-value">{minings.filter(m => m.status === 'ACTIVE').length}</div><div className="stat-label">Active Missions</div></div><div className="stat-icon cyan"><Orbit size={20} /></div></div></div>
        <div className="stat-card"><div className="stat-card-header"><div><div className="stat-value">{fc(totalActive, true)}</div><div className="stat-label">Total Invested</div></div><div className="stat-icon purple"><DollarSign size={20} /></div></div></div>
        <div className="stat-card"><div className="stat-card-header"><div><div className="stat-value" style={{ color: 'var(--success)' }}>{fc(totalEarnedAll, true)}</div><div className="stat-label">Total Earned</div></div><div className="stat-icon green"><TrendingUp size={20} /></div></div></div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>Active ({minings.filter(m => m.status === 'ACTIVE').length})</button>
        <button className={`tab ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>Completed ({minings.filter(m => m.status === 'COMPLETED').length})</button>
      </div>

      {filtered.length === 0 ? <div className="card empty-state"><p>No {tab} missions.</p></div> : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filtered.map(m => {
            const start = new Date(m.startDate)
            const end = new Date(m.endDate)
            const now = new Date()
            const totalDays = (end - start) / (1000 * 60 * 60 * 24)
            const elapsed = Math.min((now - start) / (1000 * 60 * 60 * 24), totalDays)
            const progress = (elapsed / totalDays) * 100
            const currentEarned = earnings[m.id] || m.totalEarned
            const isActive = m.status === 'ACTIVE'

            return (
              <div key={m.id} className="card card-glow" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Active mining pulse overlay */}
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: 'var(--gradient-primary)',
                    animation: 'miningPulse 1.5s ease-in-out infinite'
                  }} />
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: isActive ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: isActive ? 'miningIconPulse 2s ease-in-out infinite' : 'none',
                      boxShadow: isActive ? '0 0 20px rgba(0,212,255,0.3)' : 'none'
                    }}>
                      <Zap size={22} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{m.plan?.name || 'Plan'}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {m.plan?.hashRate} • {m.cryptoType}
                        {isActive && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600,
                            animation: 'blink 1s ease-in-out infinite'
                          }}>
                            <Activity size={12} /> Live
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`badge badge-${m.status.toLowerCase()}`}>{m.status}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '20px 0' }}>
                  {[
                    { l: 'Invested', v: fc(m.investedAmount, true) },
                    { l: 'Daily', v: fc(m.dailyEarning, true), c: 'var(--success)' },
                    { l: 'Earned', v: fc(currentEarned, true), c: 'var(--accent-cyan)' },
                    { l: 'Duration', v: `${Math.floor(elapsed)}/${Math.floor(totalDays)}d` }
                  ].map((s, i) => (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12, textAlign: 'center',
                      ...(i === 2 && isActive ? { border: '1px solid rgba(0,212,255,0.2)', animation: 'earningGlow 2s ease-in-out infinite' } : {})
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.l}</div>
                      <div style={{
                        fontWeight: 700, fontSize: '0.95rem', color: s.c || 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums'
                      }}>{s.v}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${progress}%`,
                      ...(isActive ? { animation: 'progressShimmer 2s linear infinite', backgroundSize: '200% 100%' } : {})
                    }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Mining animations CSS */}
      <style>{`
        @keyframes miningPulse {
          0%, 100% { opacity: 0.4; transform: scaleX(0.3); }
          50% { opacity: 1; transform: scaleX(1); }
        }
        @keyframes miningIconPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(0,212,255,0.3); }
          50% { transform: scale(1.08); box-shadow: 0 0 30px rgba(0,212,255,0.5); }
        }
        @keyframes earningGlow {
          0%, 100% { border-color: rgba(0,212,255,0.15); background: rgba(255,255,255,0.03); }
          50% { border-color: rgba(0,212,255,0.35); background: rgba(0,212,255,0.04); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes progressShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .progress-fill {
          background-image: linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-purple) 25%, var(--accent-cyan) 50%, var(--accent-purple) 75%, var(--accent-cyan) 100%);
        }
      `}</style>
    </div>
  )
}
