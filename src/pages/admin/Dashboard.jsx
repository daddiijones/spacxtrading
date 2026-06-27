import { useState, useEffect } from 'react'
import { adminApi } from '../../utils/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Users, DollarSign, Cpu, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Clock, Pencil, X } from 'lucide-react'

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

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(mining.id, form)
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14, background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-secondary)'
        }}><X size={18} /></button>

        <h3 style={{ marginBottom: 4 }}>Edit Mining</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
          {mining.user?.fullName} — {mining.plan?.name}
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Invested Amount ({mining.cryptoType})</label>
            <input className="form-input" type="number" step="any" value={form.investedAmount}
              onChange={e => setForm(f => ({ ...f, investedAmount: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Daily Earning ({mining.cryptoType})</label>
            <input className="form-input" type="number" step="any" value={form.dailyEarning}
              onChange={e => setForm(f => ({ ...f, dailyEarning: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Total Earned ({mining.cryptoType})</label>
            <input className="form-input" type="number" step="any" value={form.totalEarned}
              onChange={e => setForm(f => ({ ...f, totalEarned: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input className="form-input" type="datetime-local" value={form.endDate}
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [minings, setMinings] = useState([])
  const [miningsLoading, setMiningsLoading] = useState(true)
  const [editTarget, setEditTarget] = useState(null)

  useEffect(() => {
    adminApi.stats().then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
    adminApi.minings('ACTIVE').then(d => { setMinings(d); setMiningsLoading(false) }).catch(() => setMiningsLoading(false))
  }, [])

  async function handleSave(id, form) {
    const updated = await adminApi.updateMining(id, form)
    setMinings(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m))
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const stats = [
    { label: 'Total Users', value: data?.totalUsers || 0, icon: Users, color: 'cyan' },
    { label: 'Total Deposits', value: `$${(data?.totalDeposits || 0).toLocaleString()}`, icon: DollarSign, color: 'green' },
    { label: 'Active Minings', value: data?.activeMinings || 0, icon: Cpu, color: 'purple' },
    { label: 'Pending Deposits', value: data?.pendingDeposits || 0, icon: Clock, color: 'amber' },
  ]

  return (
    <div>
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-header">
              <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
              <div className={`stat-icon ${s.color}`}><s.icon size={20} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Minings */}
      <div className="section-header" style={{ marginTop: 28 }}><h3>Active Minings</h3></div>
      {miningsLoading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : minings.length === 0 ? (
        <div className="card empty-state"><p>No active minings.</p></div>
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
                  <td>{m.plan?.name}</td>
                  <td>{m.investedAmount} <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{m.cryptoType}</span></td>
                  <td>{m.dailyEarning} <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{m.cryptoType}</span></td>
                  <td>{m.totalEarned} <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{m.cryptoType}</span></td>
                  <td style={{ fontSize: 13 }}>{new Date(m.endDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${m.status === 'ACTIVE' ? 'badge-active' : m.status === 'COMPLETED' ? 'badge-completed' : 'badge-rejected'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setEditTarget(m)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--accent-cyan)', padding: '4px 6px', borderRadius: 6,
                        display: 'flex', alignItems: 'center'
                      }}
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

      {/* Recent Users */}
      <div className="section-header" style={{ marginTop: 28 }}><h3>Recent Users</h3></div>
      {(data?.recentUsers || []).length === 0 ? <div className="card empty-state"><p>No users yet.</p></div> : (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead>
            <tbody>
              {(data?.recentUsers || []).map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editTarget && (
        <EditMiningModal
          mining={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
