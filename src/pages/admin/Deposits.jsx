import { useState, useEffect } from 'react'
import { adminApi } from '../../utils/api'
import { Check, X, AlertTriangle } from 'lucide-react'

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    deposit: null,
    targetStatus: '' // 'CONFIRMED' or 'REJECTED'
  })

  const load = () => adminApi.deposits().then(d => { setDeposits(d); setLoading(false) })
  useEffect(() => { load() }, [])

  const triggerConfirmation = (deposit, status) => {
    setConfirmModal({
      isOpen: true,
      deposit,
      targetStatus: status
    })
  }

  const handleAction = async () => {
    const { deposit, targetStatus } = confirmModal
    if (!deposit) return
    setConfirmModal({ isOpen: false, deposit: null, targetStatus: '' })
    setLoading(true)
    try {
      await adminApi.updateDeposit(deposit.id, { status: targetStatus })
      await load()
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const filtered = filter === 'ALL' ? deposits : deposits.filter(d => d.status === filter)

  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {['ALL', 'PENDING', 'CONFIRMED', 'REJECTED'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f} {f === 'PENDING' && `(${deposits.filter(d => d.status === 'PENDING').length})`}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? <div className="card empty-state"><p>No deposits found.</p></div> : (
        <div className="table-container"><table className="data-table">
          <thead><tr><th>User</th><th>Crypto</th><th>Amount</th><th>TX Hash</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.user?.email}</td>
                <td style={{ fontWeight: 700 }}>{d.cryptoType}</td>
                <td style={{ fontWeight: 600 }}>{d.amount}</td>
                <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{d.txHash?.substring(0, 16)}...</span></td>
                <td style={{ fontSize: '0.82rem' }}>{new Date(d.createdAt).toLocaleString()}</td>
                <td><span className={`badge badge-${d.status.toLowerCase()}`}>{d.status}</span></td>
                <td>{d.status === 'PENDING' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-success" title="Approve Deposit" onClick={() => triggerConfirmation(d, 'CONFIRMED')}><Check size={14} /></button>
                    <button className="btn btn-sm btn-danger" title="Reject Deposit" onClick={() => triggerConfirmation(d, 'REJECTED')}><X size={14} /></button>
                  </div>
                ) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}

      {/* Modern SpaceX Themed Glassmorphic Confirmation Modal */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#0d0d0d',
            border: `1px solid ${confirmModal.targetStatus === 'CONFIRMED' ? 'var(--success)' : 'var(--danger)'}`,
            borderRadius: 'var(--radius-xl)',
            padding: 30,
            maxWidth: 450,
            width: '90%',
            boxShadow: `0 8px 32px rgba(${confirmModal.targetStatus === 'CONFIRMED' ? '16, 185, 129' : '239, 68, 68'}, 0.15)`,
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: confirmModal.targetStatus === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <AlertTriangle size={28} style={{ color: confirmModal.targetStatus === 'CONFIRMED' ? 'var(--success)' : 'var(--danger)' }} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              {confirmModal.targetStatus === 'CONFIRMED' ? 'Confirm Deposit Approval' : 'Confirm Deposit Rejection'}
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              Are you sure you want to {confirmModal.targetStatus === 'CONFIRMED' ? 'approve and credit' : 'reject'} this deposit request of{' '}
              <strong style={{ color: '#fff' }}>{confirmModal.deposit?.amount} {confirmModal.deposit?.cryptoType}</strong> for user{' '}
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{confirmModal.deposit?.user?.email}</span>?
              {confirmModal.targetStatus === 'CONFIRMED' && ' This will immediately fund their spot wallet balance.'}
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmModal({ isOpen: false, deposit: null, targetStatus: '' })}
                style={{ padding: '10px 20px', minWidth: 100, border: '1px solid rgba(255,255,255,0.06)' }}
              >
                Cancel
              </button>
              <button
                className={`btn ${confirmModal.targetStatus === 'CONFIRMED' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleAction}
                style={{ padding: '10px 20px', minWidth: 100, fontWeight: 700 }}
              >
                {confirmModal.targetStatus === 'CONFIRMED' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
