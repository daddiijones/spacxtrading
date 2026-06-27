import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { miningApi, userApi } from '../../utils/api'
import { useToast } from '../../components/Toast'
import { Check, Zap, Cpu, Wallet } from 'lucide-react'
import { AuthContext } from '../../App'
import { useExchangeRates, formatCurrency as fmtC, usdToLocal, localToUsd, currencySymbol } from '../../contexts/ExchangeRatesContext'

const TIER_FEATURES = {
  starter:      ['Falcon 1 Launch Architecture', 'Single Vehicle Flight Precision', 'Reusable Booster Deployment'],
  professional: ['Multi-Booster Interconnected Array', 'Falcon Heavy Payload Scaling', 'Dedicated Launch Pad'],
  enterprise:   ['Starship Super Heavy Infrastructure', 'Multi-Vehicle Fleet Scaling', 'Enterprise Mission Suite License'],
  vip:          ['Starbase Interplanetary Grid', 'Full Starbase Fleet Array', 'Infinite Orbital Parallel Accrual', '24/7 Mission Control Liaison support'],
}

export default function MiningPlans() {
  const { user, login } = useContext(AuthContext)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [freshUser, setFreshUser] = useState(null)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([miningApi.plans(), userApi.me()])
      .then(([p, u]) => { setPlans(p); setFreshUser(u); login(u); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const liveRates = useExchangeRates()
  const u = freshUser || user
  const balance = u?.balance || 0
  const fc = (val, shrink) => fmtC(val, u, liveRates, shrink)

  // amount state is in local currency; convert to USD for backend
  const amountUsd = amount ? localToUsd(parseFloat(amount), u, liveRates) : 0

  const validateAmount = (localVal, plan) => {
    const n = parseFloat(localVal)
    if (!localVal || isNaN(n)) return 'Please enter an amount.'
    const usd = localToUsd(n, u, liveRates)
    if (usd < plan.minDeposit) return `Minimum investment is ${fc(plan.minDeposit)}.`
    if (usd > plan.maxDeposit) return `Maximum investment is ${fc(plan.maxDeposit)}.`
    if (usd > balance) return `Insufficient balance. Your wallet has ${fc(balance)}.`
    return ''
  }

  const handleAmountChange = (val) => {
    setAmount(val)
    if (purchasing) setAmountError(validateAmount(val, purchasing))
  }

  const handleAmountBlur = () => {
    if (!purchasing || !amount) return
    const n = parseFloat(amount)
    if (!isNaN(n)) {
      const usd = localToUsd(n, u, liveRates)
      const clampedUsd = Math.min(Math.max(usd, purchasing.minDeposit), Math.min(purchasing.maxDeposit, balance))
      const clampedLocal = String(usdToLocal(clampedUsd, u, liveRates).toFixed(2))
      setAmount(clampedLocal)
      setAmountError(validateAmount(clampedLocal, purchasing))
    }
  }

  const handlePurchase = async () => {
    if (!purchasing || !amount) return
    const err = validateAmount(amount, purchasing)
    if (err) { setAmountError(err); return }
    setSubmitting(true)
    try {
      await miningApi.purchase({ planId: purchasing.id, amount: amountUsd })
      const nu = await userApi.me()
      setFreshUser(nu); login(nu)
      toast.success(
        `Your ${purchasing.name} mission is now live! Accruals started at ${fc(amountUsd * purchasing.dailyROI / 100)} daily.`,
        '🚀 Mission Launched!'
      )
      setPurchasing(null)
      setAmount('')
      setTimeout(() => navigate('/my-minings'), 2000)
    } catch (err) {
      toast.error(err.message, 'Deployment Failed')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header + Wallet Balance */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Launch a New Mission</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Mission fleets operate 24/7 on continuous flight schedules.</p>
        </div>
        <div style={{ background: 'rgba(14, 165, 233,0.08)', border: '1px solid rgba(14, 165, 233,0.2)', borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Wallet size={18} color="#0ea5e9" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Wallet Balance</div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0ea5e9' }}>{fc(balance)}</div>
          </div>
        </div>
      </div>

      {balance === 0 && (
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '0.85rem', color: 'var(--warning)' }}>
          ⚠️ Your wallet balance is {fc(0)}. <a href="/deposit" style={{ color: '#0ea5e9', fontWeight: 700 }}>Deposit funds</a> to launch a mission.
        </div>
      )}

      {plans.length === 0 ? <div className="card empty-state"><p>No mission contracts available yet.</p></div> : (
        <div className="plans-grid">
          {plans.map(plan => {
            const isPop = plan.tier === 'professional'
            const extras = TIER_FEATURES[plan.tier] || []
            return (
              <div key={plan.id} className={`plan-card card-glow ${isPop ? 'popular' : ''}`} style={{ background: 'rgba(13,13,13,0.7)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
                {isPop && <div className="plan-badge">⚡ Recommended Fleet</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: isPop ? 'var(--gradient-primary)' : 'rgba(14, 165, 233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Cpu size={18} style={{ color: isPop ? '#fff' : 'var(--accent-cyan)' }} />
                  </div>
                  <div className="plan-name" style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{plan.name}</div>
                </div>
                <div className="plan-price" style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', marginBottom: 14 }}>
                  {fc(plan.minDeposit, true)} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>– {fc(plan.maxDeposit, true)}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--success)' }}>{plan.dailyROI}%</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Daily ROI</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>{plan.totalROI}%</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total ROI</div>
                  </div>
                </div>
                <ul className="plan-features" style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><Check size={14} style={{ color: 'var(--accent-cyan)' }} /> {plan.hashRate} Vehicle Class</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><Check size={14} style={{ color: 'var(--accent-cyan)' }} /> {plan.durationDays} Day Allocation</li>
                  {extras.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><Check size={14} style={{ color: 'var(--accent-cyan)' }} /> {f}</li>
                  ))}
                </ul>
                <button className="btn btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: '0.85rem' }} onClick={() => {
                  setPurchasing(plan)
                  setAmount(String(usdToLocal(plan.minDeposit, u, liveRates).toFixed(2)))
                  setAmountError('')
                }}>
                  Launch Mission
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Purchase Modal */}
      {purchasing && (
        <div className="modal-overlay" onClick={() => setPurchasing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ background: '#0d0d0d', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ color: '#fff', fontWeight: 800 }}>Launch {purchasing.name} Mission</h3>

            {/* Wallet balance strip */}
            <div style={{ background: 'rgba(14, 165, 233,0.06)', border: '1px solid rgba(14, 165, 233,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Available Wallet Balance</span>
              <span style={{ fontWeight: 800, color: '#0ea5e9' }}>{fc(balance)}</span>
            </div>

            {balance === 0 && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, color: 'var(--danger)', fontSize: '0.85rem' }}>
                No balance available. <a href="/deposit" style={{ color: '#0ea5e9', fontWeight: 700 }}>Deposit funds</a> to launch a mission.
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>
                Investment Amount ({u?.currency || 'USD'})
                <span style={{ float: 'right', fontWeight: 400, color: 'var(--text-muted)' }}>
                  {fc(purchasing.minDeposit, true)} – {fc(purchasing.maxDeposit, true)}
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700, pointerEvents: 'none' }}>{currencySymbol(u)}</span>
                <input
                  className="form-input"
                  type="number"
                  value={amount}
                  onChange={e => handleAmountChange(e.target.value)}
                  onBlur={handleAmountBlur}
                  min={usdToLocal(purchasing.minDeposit, u)}
                  max={usdToLocal(Math.min(purchasing.maxDeposit, balance), u, liveRates)}
                  step="any"
                  style={{ paddingLeft: 28, ...(amountError ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}) }}
                />
              </div>
              {amountError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 6, fontWeight: 500 }}>{amountError}</div>
              )}
            </div>

            {amount && !amountError && (
              <div style={{ background: 'rgba(14, 165, 233,0.04)', border: '1px solid rgba(14, 165, 233,0.1)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Daily Earning</span>
                  <span style={{ fontWeight: 800, color: 'var(--success)' }}>+{fc(amountUsd * purchasing.dailyROI / 100)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Total Return ({purchasing.durationDays} days)</span>
                  <span style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>+{fc(amountUsd * purchasing.totalROI / 100)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Deducted from Wallet</span>
                  <span style={{ fontWeight: 800, color: 'var(--danger)' }}>-{fc(amountUsd)}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPurchasing(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} disabled={submitting || balance === 0 || !!amountError || !amount} onClick={handlePurchase}>
                {submitting ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Launch Mission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
