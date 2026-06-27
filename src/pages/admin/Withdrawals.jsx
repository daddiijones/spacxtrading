import { useState, useEffect } from 'react'
import { adminApi } from '../../utils/api'
import { Check, X } from 'lucide-react'

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  const load = () => adminApi.withdrawals().then(w => { setWithdrawals(w); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleAction = async (id, status) => {
    await adminApi.updateWithdrawal(id, { status })
    load()
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  const filtered = filter === 'ALL' ? withdrawals : withdrawals.filter(w => w.status === filter)

  return (
    <div>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f} {f === 'PENDING' && `(${withdrawals.filter(w => w.status === 'PENDING').length})`}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? <div className="card empty-state"><p>No withdrawals found.</p></div> : (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>User</th><th>Crypto</th><th>Amount</th><th>Wallet</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w.user?.email}</td>
                <td style={{ fontWeight: 700 }}>{w.cryptoType}</td>
                <td style={{ fontWeight: 600 }}>{w.amount}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{w.walletAddress?.substring(0, 16)}...</td>
                <td style={{ fontSize: '0.82rem' }}>{new Date(w.createdAt).toLocaleString()}</td>
                <td><span className={`badge badge-${w.status.toLowerCase()}`}>{w.status}</span></td>
                <td>{w.status === 'PENDING' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-success" onClick={() => handleAction(w.id, 'APPROVED')}><Check size={14} /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleAction(w.id, 'REJECTED')}><X size={14} /></button>
                  </div>
                ) : w.status === 'APPROVED' ? (
                  <button className="btn btn-sm btn-primary" onClick={() => handleAction(w.id, 'COMPLETED')}>Complete</button>
                ) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </div>
  )
}
