import { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../App'
import { userApi } from '../../utils/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Wallet, TrendingUp, Cpu, DollarSign, ArrowDownToLine, ArrowUpFromLine, Rocket, Activity, Server, Zap } from 'lucide-react'
import { useExchangeRates, formatCurrency as fmtCurrencyLive } from '../../contexts/ExchangeRatesContext'

const PAYMENT_METHODS = [
  { symbol: 'BTC', name: 'Bitcoin', cls: 'crypto-btc' },
  { symbol: 'ETH', name: 'Ethereum', cls: 'crypto-eth' },
  { symbol: 'USDT', name: 'Tether', cls: 'crypto-usdt' },
  { symbol: 'LTC', name: 'Litecoin', cls: 'crypto-ltc' },
  { symbol: 'BNB', name: 'BNB', cls: 'crypto-bnb' },
  { symbol: 'SOL', name: 'Solana', cls: 'crypto-sol' },
]

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function CustomerDashboard() {
  const { user, login } = useContext(AuthContext)
  const liveRates = useExchangeRates()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userApi.dashboard().then(d => {
      setData(d)
      const { password, ...u } = d.user
      login(u)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const u = { ...(data?.user || {}), ...user }
  const usdBalance = u?.balance || 0
  const totalCapitalInvested = (data?.recentMinings || []).reduce((sum, m) => sum + (m.investedAmount || 0), 0)
  const fc = (val, shrink) => fmtCurrencyLive(val, u, liveRates, shrink)

  const chartData = (data?.recentMinings || []).slice(0, 7).reverse().map((m, i) => ({
    day: `Day ${i + 1}`, earnings: m.totalEarned || 0
  }))
  if (chartData.length === 0) for (let i = 1; i <= 7; i++) chartData.push({ day: `Day ${i}`, earnings: 0 })

  const stats = [
    { label: `Wallet Balance (USD)`, value: fc(usdBalance, true), icon: Wallet, color: 'green', desc: 'Available to invest or withdraw' },
    { label: 'Cumulative ROI Earnings', value: fc(u?.totalEarned || 0, true), icon: TrendingUp, color: 'green', desc: 'Accumulated ROI' },
    { label: 'Active Mission Contracts', value: data?.activeMinings || 0, icon: Server, color: 'green', desc: 'Active launch contracts' },
    { label: 'Total Capital Invested', value: fc(totalCapitalInvested, true), icon: Zap, color: 'green', desc: 'Active mission allocations' },
  ]

  // Build unified transaction list from all sources
  const allTx = [
    ...(data?.recentDeposits || []).map(d => ({
      id: d.id, type: 'deposit', direction: 'credit',
      label: `Deposit (${d.cryptoType})`, amount: d.amount,
      cryptoType: d.cryptoType, status: d.status, createdAt: d.createdAt
    })),
    ...(data?.recentWithdrawals || []).map(w => ({
      id: w.id, type: 'withdrawal', direction: 'debit',
      label: `Withdrawal (${w.cryptoType})`, amount: w.amount,
      cryptoType: w.cryptoType, status: w.status, createdAt: w.createdAt
    })),
    ...(data?.recentMinings || []).map(m => ({
      id: m.id, type: 'mining', direction: 'debit',
      label: `Mining Lease: ${m.plan?.name || 'Plan'}`, amount: m.investedAmount,
      cryptoType: m.cryptoType, status: m.status, createdAt: m.createdAt
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Premium Glassmorphic Welcome Card */}
      <div className="welcome-banner" style={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233,0.1) 0%, rgba(0,0,0,0.6) 100%)',
        border: '1px solid rgba(14, 165, 233,0.2)',
        boxShadow: '0 8px 32px rgba(14, 165, 233,0.05)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Futuristic glowing node indicator in background */}
        <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14, 165, 233,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(14, 165, 233,0.15)', border: '1px solid rgba(14, 165, 233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Activity size={22} style={{ color: 'var(--accent-cyan)', animation: 'pulse 2s infinite' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              Welcome back, {u?.fullName || 'Astronaut'}
              <span style={{ fontSize: '0.82rem', background: 'rgba(14, 165, 233,0.2)', border: '1px solid var(--accent-cyan)', borderRadius: 20, padding: '2px 10px', color: 'var(--accent-cyan)' }}>Active Mission</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>Monitor and launch active mission contracts in real time.</p>
          </div>
        </div>
        <div className="welcome-actions" style={{ display: 'flex', gap: 10, zIndex: 1 }}>
          <Link to="/deposit" className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}><ArrowDownToLine size={15} /> Deposit Funds</Link>
          <Link to="/plans" className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.1)' }}><Rocket size={15} /> Launch a New Mission</Link>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div className="stat-card" key={i} style={{ background: 'rgba(13,13,13,0.7)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <div className="stat-card-header">
              <div>
                <div className="stat-label" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '4px 0 2px' }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.desc}</div>
              </div>
              <div className={`stat-icon ${s.color}`} style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Split Interactive Dashboard Grid */}
      <div className="dashboard-grid" style={{ marginBottom: 28 }}>
        {/* SpaceX Trading Graph Card */}
        <div className="card chart-card" style={{ background: 'rgba(13,13,13,0.7)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
          <div className="chart-header" style={{ display: 'flex', alignItems: 'center', justify_content: 'space-between', marginBottom: 20 }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Mission ROI Yield Analytics</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Visual performance analysis of active mission contracts over the last 7 cycles</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'rgba(14, 165, 233,0.1)', border: '1px solid rgba(14, 165, 233,0.2)', padding: '4px 10px', borderRadius: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'pulse 1.5s infinite' }} /> Live System Accrual
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#707070', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#707070', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(14, 165, 233,0.3)', borderRadius: 8, color: '#fff' }}
                formatter={(v) => [fc(v), 'Accrued Profits']}
              />
              <Area type="monotone" dataKey="earnings" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#earnGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* USD Wallet Card */}
        <div className="card" style={{ padding: 22, background: 'rgba(13,13,13,0.7)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>Platform Wallet</h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 20 }}>Your central balance — fund via crypto, invest in missions, withdraw anytime</p>

          {/* Balance hero */}
          <div style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233,0.12), rgba(14, 165, 233,0.03))', border: '1px solid rgba(14, 165, 233,0.18)', borderRadius: 14, padding: '20px 22px', marginBottom: 18, textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Available Balance</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0ea5e9', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{fc(usdBalance)}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>USD · Updated live</div>
          </div>

          {/* Quick stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)' }}>{fc(u?.totalDeposited || 0, true)}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Deposited</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--danger)' }}>{fc(u?.totalWithdrawn || 0, true)}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Withdrawn</div>
            </div>
          </div>

          {/* Accepted payment methods */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Fund via crypto</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PAYMENT_METHODS.map(m => (
                <div key={m.symbol} className={`crypto-icon ${m.cls}`} style={{ width: 30, height: 30, fontSize: '0.65rem', fontWeight: 800, borderRadius: 6 }} title={m.name}>{m.symbol[0]}</div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
            <Link to="/deposit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '9px 0' }}><ArrowDownToLine size={14} /> Deposit</Link>
            <Link to="/withdraw" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '9px 0', border: '1px solid rgba(255,255,255,0.1)' }}><ArrowUpFromLine size={14} /> Withdraw</Link>
          </div>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Asset Ledger & Activities</h3>
        <Link to="/transactions" style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 700 }}>Full Activity Ledger →</Link>
      </div>

      {allTx.length === 0 ? (
        <div className="card empty-state" style={{ background: 'rgba(13,13,13,0.7)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
          <p>No activity recorded yet. Deposit assets to initialize mission systems.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {allTx.map(tx => {
            const isCredit = tx.direction === 'credit'
            return (
              <div key={tx.id} className="card tx-item" style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: 'rgba(13,13,13,0.7)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                transition: 'transform 0.2s ease'
              }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: tx.type === 'deposit' ? 'rgba(14, 165, 233,0.1)' : tx.type === 'mining' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${tx.type === 'deposit' ? 'rgba(14, 165, 233,0.2)' : tx.type === 'mining' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`
                }}>
                  {tx.type === 'deposit' ? <ArrowDownToLine size={15} style={{ color: 'var(--success)' }} />
                    : tx.type === 'mining' ? <Rocket size={15} style={{ color: 'var(--warning)' }} />
                    : <ArrowUpFromLine size={15} style={{ color: 'var(--danger)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>{new Date(tx.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isCredit ? 'var(--success)' : 'var(--danger)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                  {isCredit ? '+' : '-'}{fc(tx.amount)}
                </div>
                <span className={`badge badge-${tx.status.toLowerCase()}`} style={{ minWidth: 70, textAlign: 'center', padding: '3px 8px', fontSize: '0.68rem', borderRadius: 4, flexShrink: 0 }}>{tx.status}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
