import { useState, useEffect } from 'react'
import { adminApi } from '../../utils/api'
import { Search, Ban, Eye, ShieldCheck, Mail, Trash2, AlertTriangle } from 'lucide-react'
import { useToast } from '../../components/Toast'

export default function AdminUsers() {
  const toast = useToast()
  
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewUser, setViewUser] = useState(null)

  // Compose Email States (Individual)
  const [emailModal, setEmailModal] = useState(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailTitle, setEmailTitle] = useState('Platform Notice')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  // Broadcast Email States
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [broadcastTitle, setBroadcastTitle] = useState('Global System Announcement')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)

  // Custom Confirmation Modal State (For all actions)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger', // 'danger' | 'success' | 'warning'
    onConfirm: null
  })

  useEffect(() => {
    adminApi.users().then(u => { setUsers(u); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  // Ban/Unban Execution
  const performToggleUser = async (id) => {
    try {
      await adminApi.toggleUser(id)
      const u = await adminApi.users()
      setUsers(u)
      setViewUser(null)
      toast.success('User status updated successfully.', 'Status Modified')
    } catch (err) {
      toast.error(err.message, 'Operation Failed')
    }
  }

  // Delete Execution
  const performDeleteUser = async (id) => {
    try {
      await adminApi.deleteUser(id)
      const u = await adminApi.users()
      setUsers(u)
      toast.success('User account and all related database records successfully deleted.', 'Account Purged')
    } catch (err) {
      toast.error(err.message, 'Operation Failed')
    }
  }

  // Action Confirmation Triggers
  const triggerDeleteConfirm = (userToDelete) => {
    setConfirmModal({
      isOpen: true,
      title: 'Permanently Delete Account',
      message: `Are you absolutely sure you want to permanently delete ${userToDelete.fullName}'s account (${userToDelete.email}) along with all their associated deposits, withdrawals, and investment contract logs? This action is irreversible.`,
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => performDeleteUser(userToDelete.id)
    })
  }

  const triggerToggleConfirm = (userToToggle) => {
    const action = userToToggle.isActive ? 'ban' : 'unban'
    setConfirmModal({
      isOpen: true,
      title: userToToggle.isActive ? 'Ban User Account' : 'Restore User Account',
      message: `Are you sure you want to ${action} ${userToToggle.fullName}'s account (${userToToggle.email})? ${userToToggle.isActive ? 'Banned users are blocked from logging in or using platform resources.' : 'This will re-authorize complete spot wallet and compute access.'}`,
      confirmText: userToToggle.isActive ? 'Ban Account' : 'Restore Account',
      cancelText: 'Cancel',
      type: userToToggle.isActive ? 'danger' : 'success',
      onConfirm: () => performToggleUser(userToToggle.id)
    })
  }

  const handleSendEmail = async (e) => {
    e.preventDefault()
    if (!emailSubject || !emailMessage) return toast.error('Please enter both subject and message.', 'Validation Error')
    setSendingEmail(true)
    try {
      await adminApi.sendUserEmail(emailModal.id, {
        subject: emailSubject,
        title: emailTitle,
        message: emailMessage
      })
      toast.success(`Message successfully dispatched to ${emailModal.email}.`, 'Notice Dispatched')
      setEmailModal(null)
      setEmailSubject('')
      setEmailTitle('Platform Notice')
      setEmailMessage('')
    } catch (err) {
      toast.error(err.message, 'Transmission Failed')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSendBroadcast = async (e) => {
    e.preventDefault()
    if (!broadcastSubject || !broadcastMessage) return toast.error('Please enter both subject and message.', 'Validation Error')
    setBroadcasting(true)
    try {
      const res = await adminApi.broadcastEmail({
        subject: broadcastSubject,
        title: broadcastTitle,
        message: broadcastMessage
      })
      toast.success(res.message || 'Global broadcast initialized successfully.', 'Broadcast Active')
      setShowBroadcastModal(false)
      setBroadcastSubject('')
      setBroadcastTitle('Global System Announcement')
      setBroadcastMessage('')
    } catch (err) {
      toast.error(err.message, 'Broadcast Failed')
    } finally {
      setBroadcasting(false)
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const filtered = users.filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 320 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search users..." style={{ paddingLeft: 42 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowBroadcastModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'linear-gradient(135deg, #0ea5e9 0%, #0b3d91 100%)' }}>
            <Mail size={16} /> Broadcast Announcement
          </button>
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{filtered.length} users</div>
      </div>
      <div className="table-container"><table className="data-table">
        <thead><tr><th>User</th><th>USDT Balance</th><th>Active Plans</th><th>Total Deposited</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {filtered.map(u => (
            <tr key={u.id}>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div className="topbar-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{u.fullName[0]}</div><div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.fullName}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div></div></div></td>
              <td style={{ fontWeight: 700 }}>${(u.balanceUSDT || 0).toFixed(2)}</td>
              <td>{u._count?.userMinings || 0}</td>
              <td>${(u.totalDeposited || 0).toLocaleString()}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td><span className={`badge ${u.isActive ? 'badge-active' : 'badge-rejected'}`}>{u.isActive ? 'ACTIVE' : 'BANNED'}</span></td>
              <td><div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm" title="View details" onClick={() => setViewUser(u)}><Eye size={14} /></button>
                <button className="btn btn-secondary btn-sm" title="Email user" onClick={() => setEmailModal(u)} style={{ background: 'rgba(14, 165, 233,0.1)', color: 'var(--accent-cyan)' }}><Mail size={14} /></button>
                <button className="btn btn-sm" title={u.isActive ? "Ban user" : "Unban user"} style={{ background: u.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: u.isActive ? 'var(--danger)' : 'var(--success)' }} onClick={() => triggerToggleConfirm(u)}>
                  {u.isActive ? <Ban size={14} /> : <ShieldCheck size={14} />}
                </button>
                <button className="btn btn-sm" title="Delete user" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }} onClick={() => triggerDeleteConfirm(u)}><Trash2 size={14} /></button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table></div>

      {/* User Details Modal */}
      {viewUser && (
        <div className="modal-overlay" onClick={() => setViewUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>User Details</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}><div className="topbar-avatar" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>{viewUser.fullName[0]}</div><div><div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{viewUser.fullName}</div><div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{viewUser.email}</div></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[{ l: 'BTC', v: (viewUser.balanceBTC || 0).toFixed(4) }, { l: 'ETH', v: (viewUser.balanceETH || 0).toFixed(4) }, { l: 'USDT', v: (viewUser.balanceUSDT || 0).toFixed(2) }, { l: 'Total Deposited', v: `$${(viewUser.totalDeposited || 0).toLocaleString()}` }, { l: 'Total Earned', v: `$${(viewUser.totalEarned || 0).toFixed(2)}` }, { l: 'Joined', v: new Date(viewUser.createdAt).toLocaleDateString() }].map((item, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14 }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.l}</div><div style={{ fontWeight: 700 }}>{item.v}</div></div>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setViewUser(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Compose Message Email Modal (Individual) */}
      {emailModal && (
        <div className="modal-overlay" onClick={() => setEmailModal(null)}>
          <div className="modal" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', marginBottom: 6 }}>
              <Mail size={22} style={{ color: 'var(--accent-cyan)' }} /> Compose Message
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Directly dispatch a premium corporate notice to <strong>{emailModal.fullName} ({emailModal.email})</strong>.
            </p>
            <form onSubmit={handleSendEmail}>
              <div className="form-group">
                <label className="form-label">Email Subject</label>
                <input className="form-input" placeholder="e.g. Account Allocation Verification" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Message Heading / Title (Optional)</label>
                <input className="form-input" placeholder="e.g. Platform Notice" value={emailTitle} onChange={e => setEmailTitle(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Notice Message Content</label>
                <textarea className="form-input" rows={6} placeholder="Type your formal system notification here..." style={{ resize: 'vertical', padding: '10px 14px', lineHeight: 1.5 }} value={emailMessage} onChange={e => setEmailMessage(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEmailModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={sendingEmail}>
                  {sendingEmail ? 'Sending Notice...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compose Message Email Modal (Global Broadcast) */}
      {showBroadcastModal && (
        <div className="modal-overlay" onClick={() => setShowBroadcastModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', marginBottom: 6 }}>
              <Mail size={22} style={{ color: 'var(--accent-cyan)' }} /> Global Email Broadcast
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Broadcasting a formal, stylized corporate notice to <strong>all registered users</strong> on this platform.
            </p>
            <form onSubmit={handleSendBroadcast}>
              <div className="form-group">
                <label className="form-label">Broadcast Email Subject</label>
                <input className="form-input" placeholder="e.g. Scheduled Mission Control Maintenance" value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Broadcast Notice Heading (Optional)</label>
                <input className="form-input" placeholder="e.g. Global System Announcement" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Announcement Message Content</label>
                <textarea className="form-input" rows={8} placeholder="Type the global email announcement here. The system will cleanly dispatch in the background..." style={{ resize: 'vertical', padding: '10px 14px', lineHeight: 1.5 }} value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowBroadcastModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={broadcasting}>
                  {broadcasting ? 'Processing Broadcast...' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern SpaceX Themed Glassmorphic Action Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 460,
              textAlign: 'center',
              padding: '30px 24px',
              background: 'rgba(10, 10, 10, 0.85)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${confirmModal.type === 'danger' ? 'var(--danger)' : confirmModal.type === 'success' ? 'var(--success)' : 'var(--accent-cyan)'}`,
              boxShadow: `0 8px 32px rgba(${confirmModal.type === 'danger' ? '239, 68, 68' : confirmModal.type === 'success' ? '16, 185, 129' : '14, 165, 233'}, 0.15)`,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: confirmModal.type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : confirmModal.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <AlertTriangle size={28} style={{ color: confirmModal.type === 'danger' ? 'var(--danger)' : confirmModal.type === 'success' ? 'var(--success)' : 'var(--accent-cyan)' }} />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>
              {confirmModal.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: 24 }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                className={`btn ${confirmModal.type === 'danger' ? 'btn-danger' : confirmModal.type === 'success' ? 'btn-success' : 'btn-primary'}`}
                style={{ flex: 1 }}
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm()
                  setConfirmModal({ ...confirmModal, isOpen: false })
                }}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
