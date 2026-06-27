import { useState, useEffect } from 'react'
import { adminApi } from '../../utils/api'
import { Pencil, Plus, X } from 'lucide-react'

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
const STATUS_FILTERS = ['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED']

function EditMiningModal({ mining, onClose, onSave }) {
  const [form, setForm] = useState({
    investedAmount: mining.investedAmount,
    dailyEarning: mining.dailyEarning,
    totalEarned: mining.totalEarned,
    endDate: new Date(mining.endDate).toISOString().slice(0, 16),
    status: mining.status,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)

  async function handleConfirm() {
    setSaving(true)
    setError('')
    try {
      await onSave(mining.id, form)
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
      setConfirming(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, position: 'relative', background: '#0d0d0d' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
        <h3 style={{ marginBottom: 4 }}>Mission Management</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
          {mining.user?.fullName} ({mining.user?.email}) — {mining.plan?.name}
        </p>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', color: 'var(--danger)', fontSize: '0.82rem', marginBottom: 16 }}>{error}</div>}

        {/* Confirmation step */}
        {confirming ? (
          <div>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '16px 18px', marginBottom: 20 }}>
              <p style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: 6, fontSize: '0.92rem' }}>Confirm Update</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.5 }}>
                You are about to update the mission record for <strong style={{ color: '#fff' }}>{mining.user?.fullName}</strong> on plan <strong style={{ color: '#fff' }}>{mining.plan?.name}</strong>. This will take effect immediately.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setConfirming(false)} disabled={saving}>Go Back</button>
              <button className="btn btn-primary" onClick={handleConfirm} disabled={saving}>
                {saving ? 'Saving…' : 'Yes, Update Mission'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); setConfirming(true) }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Invested Amount ({mining.cryptoType})</label>
              <input className="form-input" type="number" step="any" value={form.investedAmount} onChange={e => setForm(f => ({ ...f, investedAmount: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Daily Earning ({mining.cryptoType})</label>
              <input className="form-input" type="number" step="any" value={form.dailyEarning} onChange={e => setForm(f => ({ ...f, dailyEarning: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Total Earned ({mining.cryptoType})</label>
              <input className="form-input" type="number" step="any" value={form.totalEarned} onChange={e => setForm(f => ({ ...f, totalEarned: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">End Date</label>
              <input className="form-input" type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function AddMiningModal({ onClose, onSave }) {
  const [users, setUsers] = useState([])
  const [plans, setPlans] = useState([])
  const [form, setForm] = useState({ userId: '', planId: '', investedAmount: '', cryptoType: 'USDT', dailyEarning: '', totalEarned: '0', endDate: '', status: 'ACTIVE' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.users().then(setUsers).catch(() => {})
    adminApi.plans().then(setPlans).catch(() => {})
  }, [])

  const selectedPlan = plans.find(p => p.id === form.planId)

  const handlePlanChange = (planId) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) { setForm(f => ({ ...f, planId })); return }
    const days = plan.durationDays
    const end = new Date()
    end.setDate(end.getDate() + days)
    setForm(f => ({
      ...f, planId,
      cryptoType: plan.cryptoType || 'USDT',
      endDate: end.toISOString().slice(0, 16),
      dailyEarning: f.investedAmount ? String((parseFloat(f.investedAmount) * plan.dailyROI / 100).toFixed(6)) : '',
    }))
  }

  const handleAmountChange = (val) => {
    const plan = plans.find(p => p.id === form.planId)
    setForm(f => ({
      ...f,
      investedAmount: val,
      dailyEarning: plan && val ? String((parseFloat(val) * plan.dailyROI / 100).toFixed(6)) : f.dailyEarning,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, position: 'relative', background: '#0d0d0d', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
        <h3 style={{ marginBottom: 4 }}>Add Mission</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>Manually assign an investment plan to a user.</p>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', color: 'var(--danger)', fontSize: '0.82rem', marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">User</label>
            <select className="form-input" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} required>
              <option value="">Select user…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Plan</label>
            <select className="form-input" value={form.planId} onChange={e => handlePlanChange(e.target.value)} required>
              <option value="">Select plan…</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Invested Amount</label>
              <input className="form-input" type="number" step="any" value={form.investedAmount} onChange={e => handleAmountChange(e.target.value)} required placeholder={selectedPlan ? `${selectedPlan.minDeposit}–${selectedPlan.maxDeposit}` : ''} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Crypto</label>
              <select className="form-input" value={form.cryptoType} onChange={e => setForm(f => ({ ...f, cryptoType: e.target.value }))}>
                {['BTC','ETH','USDT','LTC','BNB','SOL'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Daily Earning</label>
              <input className="form-input" type="number" step="any" value={form.dailyEarning} onChange={e => setForm(f => ({ ...f, dailyEarning: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Total Earned</label>
              <input className="form-input" type="number" step="any" value={form.totalEarned} onChange={e => setForm(f => ({ ...f, totalEarned: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">End Date</label>
              <input className="form-input" type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Mission'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminActiveMinings() {
  const [minings, setMinings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ACTIVE')
  const [editTarget, setEditTarget] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const load = (status) => {
    setLoading(true)
    adminApi.minings(status === 'ALL' ? undefined : status)
      .then(d => { setMinings(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load(statusFilter) }, [statusFilter])

  async function handleSave(id, form) {
    const updated = await adminApi.updateMining(id, form)
    setMinings(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m))
  }

  async function handleCreate(form) {
    const created = await adminApi.createMining(form)
    if (statusFilter === 'ALL' || statusFilter === created.status) {
      setMinings(prev => [created, ...prev])
    }
  }

  const badgeClass = (s) => s === 'ACTIVE' ? 'badge-active' : s === 'COMPLETED' ? 'badge-completed' : 'badge-rejected'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontWeight: 800, marginBottom: 2 }}>Mission Management</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>View and edit all user minings. Use the edit icon to modify any record.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: 8 }} onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Mission
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {STATUS_FILTERS.map(s => (
          <button key={s} className={`tab ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : minings.length === 0 ? (
        <div className="card empty-state"><p>No {statusFilter === 'ALL' ? '' : statusFilter.toLowerCase()} minings found.</p></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Invested</th>
                <th>Daily</th>
                <th>Earned</th>
                <th>Start</th>
                <th>Ends</th>
                <th>Status</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {minings.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.user?.fullName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.user?.email}</div>
                  </td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{m.plan?.name}</td>
                  <td>{fmt(m.investedAmount)} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{m.cryptoType}</span></td>
                  <td>{fmt(m.dailyEarning)} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{m.cryptoType}</span></td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>{fmt(m.totalEarned)} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{m.cryptoType}</span></td>
                  <td style={{ fontSize: 12 }}>{new Date(m.startDate).toLocaleDateString()}</td>
                  <td style={{ fontSize: 12 }}>{new Date(m.endDate).toLocaleDateString()}</td>
                  <td><span className={`badge ${badgeClass(m.status)}`}>{m.status}</span></td>
                  <td>
                    <button
                      onClick={() => setEditTarget(m)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', padding: '4px 6px', borderRadius: 6, display: 'flex', alignItems: 'center' }}
                      title="Edit mining"
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editTarget && <EditMiningModal mining={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} />}
      {showAdd && <AddMiningModal onClose={() => setShowAdd(false)} onSave={handleCreate} />}
    </div>
  )
}
