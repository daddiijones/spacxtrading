import { useState, useEffect } from 'react'
import { adminApi } from '../../utils/api'
import { TrendingUp, CheckCircle, XCircle, Clock, Edit2, X, Check, AlertCircle } from 'lucide-react'

function EditModal({ inv, onClose, onSaved }) {
  const [annualROI, setAnnualROI]     = useState(String(inv.annualROI))
  const [status, setStatus]           = useState(inv.status)
  const [contractEnd, setContractEnd] = useState(inv.contractEnd.slice(0, 10))
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const handleSave = async () => {
    setLoading(true); setError('')
    try {
      await adminApi.updateStockInvestment(inv.id, { annualROI: parseFloat(annualROI), status, contractEnd })
      onSaved()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        <h4 style={{ marginBottom: 4, color: '#fff', fontWeight: 700 }}>Edit Investment</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          {inv.user.fullName} · {inv.symbol} · ${Number(inv.investedAmount).toFixed(2)}
        </p>

        <div className="form-group">
          <label className="form-label">Annual ROI (%)</label>
          <input className="form-input" type="number" step="0.1" value={annualROI} onChange={e => setAnnualROI(e.target.value)} />
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>Changing ROI recalculates daily earnings automatically.</div>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Contract End Date</label>
          <input className="form-input" type="date" value={contractEnd} onChange={e => setContractEnd(e.target.value)} />
        </div>

        {error && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: 'var(--danger)', fontSize: '0.82rem' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : <><Check size={15} /> Save Changes</>}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function StockSettingsModal({ stock, onClose, onSaved }) {
  const [annualROI, setAnnualROI]         = useState(String(stock.annualROI))
  const [contractDays, setContractDays]   = useState(String(stock.contractDays))
  const [minInv, setMinInv]               = useState(String(stock.minInvestment))
  const [maxInv, setMaxInv]               = useState(String(stock.maxInvestment))
  const [fixedPrice, setFixedPrice]       = useState(String(stock.fixedPrice || ''))
  const [lastKnownPrice, setLastKnownPrice] = useState(String(stock.lastKnownPrice || ''))
  const [isActive, setIsActive]           = useState(stock.isActive)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const handleSave = async () => {
    setLoading(true); setError('')
    try {
      await adminApi.updateStock(stock.id, {
        annualROI: parseFloat(annualROI),
        contractDays: parseInt(contractDays),
        minInvestment: parseFloat(minInv),
        maxInvestment: parseFloat(maxInv),
        isActive,
        ...(fixedPrice ? { fixedPrice: parseFloat(fixedPrice) } : {}),
        ...(lastKnownPrice ? { lastKnownPrice: parseFloat(lastKnownPrice) } : {}),
      })
      onSaved()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        <h4 style={{ marginBottom: 4, color: '#fff', fontWeight: 700 }}>Edit Stock Settings</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>{stock.name} ({stock.symbol})</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Annual ROI (%)</label>
            <input className="form-input" type="number" step="0.1" value={annualROI} onChange={e => setAnnualROI(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Contract (days)</label>
            <input className="form-input" type="number" value={contractDays} onChange={e => setContractDays(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Min Investment ($)</label>
            <input className="form-input" type="number" value={minInv} onChange={e => setMinInv(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Max Investment ($)</label>
            <input className="form-input" type="number" value={maxInv} onChange={e => setMaxInv(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{stock.isPrivate ? 'Fixed Price ($/share)' : 'Reference Price ($/share)'}</label>
            <input className="form-input" type="number" step="0.01"
              value={stock.isPrivate ? fixedPrice : lastKnownPrice}
              onChange={e => stock.isPrivate ? setFixedPrice(e.target.value) : setLastKnownPrice(e.target.value)} />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {stock.isPrivate ? 'Set the secondary market price for this private stock.' : 'Update the displayed price when live data is unavailable.'}
            </div>
          </div>
          <div className="form-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label className="form-label">Status</label>
            <select className="form-input" value={isActive ? 'true' : 'false'} onChange={e => setIsActive(e.target.value === 'true')}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', margin: '14px 0', color: 'var(--danger)', fontSize: '0.82rem' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : <><Check size={15} /> Save</>}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminStockInvestments() {
  const [tab, setTab]               = useState('investments')
  const [investments, setInvestments] = useState([])
  const [stocks, setStocks]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('ALL')
  const [editInv, setEditInv]       = useState(null)
  const [editStock, setEditStock]   = useState(null)

  const reload = () => {
    setLoading(true)
    Promise.all([adminApi.stockInvestments(), adminApi.stocks()])
      .then(([invs, stks]) => { setInvestments(invs); setStocks(stks); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { reload() }, [])

  const filteredInvs = filter === 'ALL' ? investments : investments.filter(i => i.status === filter)

  const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0)
  const totalEarned   = investments.reduce((s, i) => s + i.totalEarned, 0)
  const activeCount   = investments.filter(i => i.status === 'ACTIVE').length

  const fmtUSD = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab ${tab === 'investments' ? 'active' : ''}`} onClick={() => setTab('investments')}>User Investments</button>
        <button className={`tab ${tab === 'stocks' ? 'active' : ''}`} onClick={() => setTab('stocks')}>Manage Stocks</button>
      </div>

      {tab === 'investments' && (
        <>
          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <div><div className="stat-value">{fmtUSD(totalInvested)}</div><div className="stat-label">Total Invested</div></div>
                <div className="stat-icon cyan"><TrendingUp size={20} /></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <div><div className="stat-value" style={{ color: 'var(--success)' }}>{fmtUSD(totalEarned)}</div><div className="stat-label">Total Paid Out</div></div>
                <div className="stat-icon green"><CheckCircle size={20} /></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <div><div className="stat-value">{activeCount}</div><div className="stat-label">Active Contracts</div></div>
                <div className="stat-icon amber"><Clock size={20} /></div>
              </div>
            </div>
          </div>

          <div className="tabs" style={{ marginBottom: 16 }}>
            {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(f => (
              <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>

          {filteredInvs.length === 0 ? (
            <div className="card empty-state"><p>No investments found.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredInvs.map(inv => {
                const end = new Date(inv.contractEnd)
                const daysLeft = Math.max(0, Math.ceil((end - new Date()) / 86400000))
                return (
                  <div key={inv.id} className="card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{inv.user.fullName}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{inv.user.email}</div>
                        </div>
                        <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.08)' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{inv.stockName}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{inv.symbol}</div>
                        </div>
                        <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.08)' }} />
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Invested</div>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{fmtUSD(inv.investedAmount)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Earned</div>
                            <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.88rem' }}>{fmtUSD(inv.totalEarned)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ROI</div>
                            <div style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '0.88rem' }}>{inv.annualROI}%/yr</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Ends</div>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>
                              {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                              {inv.status === 'ACTIVE' && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 4 }}>({daysLeft}d)</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
                          color: inv.status === 'ACTIVE' ? 'var(--success)' : inv.status === 'COMPLETED' ? 'var(--accent-cyan)' : 'var(--danger)',
                          background: inv.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : inv.status === 'COMPLETED' ? 'rgba(0,212,255,0.1)' : 'rgba(239,68,68,0.1)'
                        }}>{inv.status}</span>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setEditInv(inv)}>
                          <Edit2 size={13} /> Edit
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'stocks' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {stocks.map(stock => (
            <div key={stock.id} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{stock.symbol}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 200 }}>{stock.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{stock.sector}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                    color: stock.isActive ? 'var(--success)' : 'var(--danger)',
                    background: stock.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'
                  }}>{stock.isActive ? 'Active' : 'Inactive'}</span>
                  {stock.isPrivate && <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.12)', color: 'var(--warning)', fontWeight: 700 }}>PRIVATE</span>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Annual ROI</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{stock.annualROI}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Contract</div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{stock.contractDays}d</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Min</div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>${stock.minInvestment.toLocaleString()}</div>
                </div>
              </div>
              {stock.isPrivate && stock.fixedPrice && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Fixed price: <span style={{ color: '#fff', fontWeight: 700 }}>${stock.fixedPrice}/share</span>
                </div>
              )}
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }} onClick={() => setEditStock(stock)}>
                <Edit2 size={13} /> Edit Settings
              </button>
            </div>
          ))}
        </div>
      )}

      {editInv && <EditModal inv={editInv} onClose={() => setEditInv(null)} onSaved={reload} />}
      {editStock && <StockSettingsModal stock={editStock} onClose={() => setEditStock(null)} onSaved={reload} />}
    </div>
  )
}
