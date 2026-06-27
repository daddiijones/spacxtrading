import { useState, useEffect, useContext } from 'react'
import { userApi } from '../../utils/api'
import { ArrowDownToLine, ArrowUpFromLine, Pickaxe, TrendingUp, Filter } from 'lucide-react'
import { AuthContext } from '../../App'
import { useExchangeRates, formatCurrency as fmtC } from '../../contexts/ExchangeRatesContext'

const ICONS = {
  deposit: { icon: ArrowDownToLine, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
  withdrawal: { icon: ArrowUpFromLine, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
  mining: { icon: Pickaxe, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
  'mining-earning': { icon: TrendingUp, color: 'var(--accent-cyan)', bg: 'rgba(0,212,255,0.1)' },
}

export default function Transactions() {
  const { user } = useContext(AuthContext)
  const liveRates = useExchangeRates()
  const fc = (val) => fmtC(val, user, liveRates)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    userApi.transactions().then(t => { setTransactions(t); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const filtered = filter === 'ALL' ? transactions
    : filter === 'CREDITS' ? transactions.filter(t => t.direction === 'credit')
    : filter === 'DEBITS' ? transactions.filter(t => t.direction === 'debit')
    : transactions.filter(t => t.type === filter.toLowerCase())

  const totalCredits = transactions.filter(t => t.direction === 'credit').reduce((s, t) => s + t.amount, 0)
  const totalDebits = transactions.filter(t => t.direction === 'debit').reduce((s, t) => s + t.amount, 0)

  return (
    <div>
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div><div className="stat-value" style={{ color: 'var(--success)' }}>+{fc(totalCredits)}</div><div className="stat-label">Total Credits</div></div>
            <div className="stat-icon green"><ArrowDownToLine size={20} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div><div className="stat-value" style={{ color: 'var(--danger)' }}>-{fc(totalDebits)}</div><div className="stat-label">Total Debits</div></div>
            <div className="stat-icon amber"><ArrowUpFromLine size={20} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div><div className="stat-value">{transactions.length}</div><div className="stat-label">Total Transactions</div></div>
            <div className="stat-icon cyan"><Filter size={20} /></div>
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {['ALL', 'CREDITS', 'DEBITS', 'DEPOSIT', 'WITHDRAWAL', 'MINING'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state"><p>No transactions found.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(tx => {
            const cfg = ICONS[tx.type] || ICONS.deposit
            const Icon = cfg.icon
            const isCredit = tx.direction === 'credit'
            return (
              <div key={tx.id} className="card tx-item">
                <div className="tx-icon" style={{ background: cfg.bg }}>
                  <Icon size={18} style={{ color: cfg.color }} />
                </div>
                <div className="tx-info">
                  <div className="tx-label">{tx.label}</div>
                  <div className="tx-detail">{tx.detail}</div>
                </div>
                <div className="tx-amount" style={{ color: isCredit ? 'var(--success)' : 'var(--danger)' }}>
                  {isCredit ? '+' : '-'}{fc(tx.amount)}
                  <span className="tx-crypto">{tx.cryptoType}</span>
                </div>
                <div className="tx-status">
                  <span className={`badge badge-${tx.status.toLowerCase()}`}>{tx.status}</span>
                  <div className="tx-date">{new Date(tx.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .tx-item { display: flex; align-items: center; gap: 14px; padding: 14px 18px; }
        .tx-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tx-info { flex: 1; min-width: 0; }
        .tx-label { font-weight: 700; font-size: 0.9rem; color: var(--text-primary); margin-bottom: 2px; }
        .tx-detail { font-size: 0.76rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tx-amount { text-align: right; flex-shrink: 0; font-weight: 800; font-size: 0.92rem; }
        .tx-crypto { display: block; font-size: 0.72rem; color: var(--text-muted); font-weight: 500; }
        .tx-status { flex-shrink: 0; min-width: 75px; text-align: right; }
        .tx-date { font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; }

        @media (max-width: 640px) {
          .tx-item { flex-wrap: wrap; padding: 12px 14px; gap: 10px; }
          .tx-icon { width: 34px; height: 34px; }
          .tx-info { flex: 1; min-width: calc(100% - 50px); }
          .tx-label { font-size: 0.82rem; }
          .tx-amount { font-size: 0.85rem; order: 3; }
          .tx-status { order: 4; min-width: auto; }
          .tx-detail { white-space: normal; }
        }
      `}</style>
    </div>
  )
}
