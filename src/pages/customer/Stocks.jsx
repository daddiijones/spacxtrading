import { useState, useEffect, useContext } from 'react'
import { stockApi } from '../../utils/api'
import { AuthContext } from '../../App'
import { useExchangeRates, formatCurrency as fmtC } from '../../contexts/ExchangeRatesContext'
import { TrendingUp, TrendingDown, Search, X, Lock, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react'

const SECTOR_COLORS = {
  'Technology':      '#627eea', 'E-Commerce':     '#f7931a', 'Social Media':   '#1877f2',
  'Automotive/EV':   '#e31937', 'Finance':        '#26a17b', 'Fintech':        '#2775ca',
  'Banking':         '#003087', 'Healthcare':     '#00a651', 'Retail':         '#0071ce',
  'Consumer Goods':  '#0033a0', 'Energy':         '#ff6900', 'Beverages':      '#f40009',
  'Streaming':       '#e50914', 'SaaS':           '#00a1e0', 'Software':       '#ff0000',
  'Mobility':        '#000000', 'AI / Defense':   '#6e3fb9', 'Cloud / Data':   '#29b5e8',
  'EV':              '#1db954', 'Aerospace / Defense': '#003366',
}

function BuyModal({ stock, livePrice, user, liveRates, onClose, onSuccess }) {
  const fc = (val, shrink) => fmtC(val, user, liveRates, shrink)
  const [amount, setAmount]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  const price      = livePrice || stock.fixedPrice || 0
  const amountNum  = parseFloat(amount) || 0
  const shares     = price > 0 ? amountNum / price : 0
  const dailyROI   = amountNum * (stock.annualROI / 100 / 365)
  const totalROI   = amountNum * (stock.annualROI / 100)

  const endDate = new Date()
  endDate.setDate(endDate.getDate() + stock.contractDays)

  const handleBuy = async () => {
    if (amountNum < stock.minInvestment) return setError(`Minimum is $${stock.minInvestment.toLocaleString()}`)
    if (amountNum > stock.maxInvestment) return setError(`Maximum is $${stock.maxInvestment.toLocaleString()}`)
    setLoading(true); setError('')
    try {
      await stockApi.invest({ stockId: stock.id, amount: amountNum })
      setDone(true)
      setTimeout(() => { onSuccess(); onClose() }, 2000)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${SECTOR_COLORS[stock.sector] || '#627eea'}, ${SECTOR_COLORS[stock.sector] || '#627eea'}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
            {stock.symbol.slice(0, 3)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{stock.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stock.symbol} · {stock.sector}</div>
          </div>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <CheckCircle size={56} style={{ color: 'var(--success)', marginBottom: 16 }} />
            <h3 style={{ color: '#fff', marginBottom: 8 }}>Investment Activated!</h3>
            <p style={{ color: 'var(--text-muted)' }}>Your stock contract is now live. Check My Stocks for details.</p>
          </div>
        ) : (
          <>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>Current Price</div>
                <div style={{ fontWeight: 800, color: '#fff' }}>${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                {user?.currency !== 'USD' && liveRates && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)' }}>≈ {fc(price)}</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>Annual ROI</div>
                <div style={{ fontWeight: 800, color: 'var(--accent-green)' }}>{stock.annualROI}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>Contract Duration</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{stock.contractDays} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>Contract Ends</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Investment Amount (USD)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>$</span>
                <input
                  className="form-input"
                  type="number"
                  placeholder={`Min: $${stock.minInvestment.toLocaleString()}`}
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setError('') }}
                  style={{ paddingLeft: 28 }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Min: ${stock.minInvestment.toLocaleString()} · Max: ${stock.maxInvestment.toLocaleString()}
              </div>
            </div>

            {amountNum > 0 && (
              <div style={{ background: 'rgba(14, 165, 233,0.06)', border: '1px solid rgba(14, 165, 233,0.15)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: 'var(--accent-green)', marginBottom: 12, fontSize: '0.85rem' }}>Investment Summary</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['Shares to Own', `${shares.toFixed(6)} ${stock.symbol}${stock.isPrivate ? ' (secondary mkt)' : ''}`],
                    ['Daily Earnings', `$${dailyROI.toFixed(4)}`],
                    ['Monthly Earnings', `$${(dailyROI * 30).toFixed(2)}`],
                    ['Total ROI over Contract', `$${totalROI.toFixed(2)} (${stock.annualROI}% × ${(stock.contractDays/365).toFixed(2)}yr)`],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--danger)', fontSize: '0.82rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleBuy}
              disabled={loading || !amountNum}
            >
              {loading ? 'Processing...' : `Invest $${amountNum > 0 ? amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'} in ${stock.symbol}`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function Stocks() {
  const { user } = useContext(AuthContext)
  const liveRates = useExchangeRates()
  const fc = (val, shrink) => fmtC(val, user, liveRates, shrink)

  const [stocks, setStocks]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [sector, setSector]       = useState('ALL')
  const [selected, setSelected]   = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    stockApi.list()
      .then(data => { setStocks(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [refreshKey])

  const sectors = ['ALL', ...Array.from(new Set(stocks.map(s => s.sector))).sort()]

  const filtered = stocks.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.symbol.toLowerCase().includes(search.toLowerCase())
    const matchSector = sector === 'ALL' || s.sector === sector
    return matchSearch && matchSector
  })

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontWeight: 800, color: '#fff', margin: 0 }}>Stock Market</h3>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.85rem' }}>{stocks.length} stocks available · Live prices · Fixed-rate contracts</p>
        </div>
        <a href="/my-stocks" style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          My Portfolio <ChevronRight size={14} />
        </a>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            placeholder="Search stocks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
        <select className="form-input" value={sector} onChange={e => setSector(e.target.value)} style={{ flex: '0 0 auto' }}>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Stock Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map(stock => {
          const color  = SECTOR_COLORS[stock.sector] || '#627eea'
          const change = stock.changePercent || 0
          const price  = stock.currentPrice

          return (
            <div
              key={stock.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'border-color 0.2s', border: '1px solid var(--border-color)' }}
              onClick={() => setSelected(stock)}
              onMouseEnter={e => e.currentTarget.style.borderColor = color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              {/* Stock header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `linear-gradient(135deg, ${color}, ${color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '0.7rem', flexShrink: 0, letterSpacing: '-0.5px' }}>
                    {stock.symbol.slice(0, 4)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', lineHeight: 1.2 }}>{stock.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{stock.sector}</div>
                  </div>
                </div>
                {stock.isPrivate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 6, padding: '2px 8px', fontSize: '0.68rem', color: 'var(--warning)', fontWeight: 700 }}>
                    <Lock size={10} /> PRIVATE
                  </span>
                )}
              </div>

              {/* Price */}
              <div style={{ marginBottom: 14 }}>
                {price != null ? (
                  <>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>
                      ${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {user?.currency !== 'USD' && liveRates && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-green)', marginTop: 2 }}>≈ {fc(price)}</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      {stock.priceIsLive ? (
                        <>
                          {change >= 0
                            ? <TrendingUp size={13} style={{ color: 'var(--success)' }} />
                            : <TrendingDown size={13} style={{ color: 'var(--danger)' }} />}
                          <span style={{ fontSize: '0.78rem', color: change >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                            {change >= 0 ? '+' : ''}{change.toFixed(2)}% today
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {stock.isPrivate ? 'Secondary market price' : 'Reference price'}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Price unavailable</div>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: 2 }}>Annual ROI</div>
                  <div style={{ fontWeight: 800, color: 'var(--accent-green)', fontSize: '0.9rem' }}>{stock.annualROI}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: 2 }}>Contract</div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>{stock.contractDays}d</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: 2 }}>Min Invest</div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>${stock.minInvestment.toLocaleString()}</div>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', marginTop: 14, fontSize: '0.82rem' }}
                onClick={e => { e.stopPropagation(); setSelected(stock) }}>
                Buy Contract
              </button>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card empty-state">
          <p>No stocks match your search.</p>
        </div>
      )}

      {selected && (
        <BuyModal
          stock={selected}
          livePrice={selected.currentPrice}
          user={user}
          liveRates={liveRates}
          onClose={() => setSelected(null)}
          onSuccess={() => { setRefreshKey(k => k + 1); setSelected(null) }}
        />
      )}
    </div>
  )
}
