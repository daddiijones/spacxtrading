import { useState, useEffect } from 'react'
import { adminApi } from '../../utils/api'
import { Plus, Edit, Eye, EyeOff, Check } from 'lucide-react'

export default function ManagePlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})

  const load = () => adminApi.plans().then(p => { setPlans(p); setLoading(false) })
  useEffect(() => { load() }, [])

  const openEdit = (plan) => {
    setEditing(plan ? plan.id : 'new')
    setForm(plan || { name: '', hashRate: '', dailyROI: '', totalROI: '', durationDays: 30, minDeposit: '', maxDeposit: '', cryptoType: 'USDT', tier: 'starter', description: '' })
  }

  const handleSave = async () => {
    const data = { ...form, dailyROI: parseFloat(form.dailyROI), totalROI: parseFloat(form.totalROI), durationDays: parseInt(form.durationDays), minDeposit: parseFloat(form.minDeposit), maxDeposit: parseFloat(form.maxDeposit) }
    if (editing === 'new') await adminApi.createPlan(data)
    else await adminApi.updatePlan(editing, data)
    setEditing(null)
    load()
  }

  const toggleActive = async (plan) => {
    await adminApi.updatePlan(plan.id, { isActive: !plan.isActive })
    load()
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700 }}>Investment Plans ({plans.length})</h3>
        <button className="btn btn-primary" onClick={() => openEdit(null)}><Plus size={16} /> Add Plan</button>
      </div>
      <div className="table-container"><table className="data-table">
        <thead><tr><th>Plan</th><th>Thrust Class</th><th>Daily ROI</th><th>Total ROI</th><th>Duration</th><th>Min-Max</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {plans.map(p => (
            <tr key={p.id} style={{ opacity: p.isActive ? 1 : 0.5 }}>
              <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</td>
              <td>{p.hashRate}</td>
              <td style={{ color: 'var(--success)', fontWeight: 600 }}>{p.dailyROI}%</td>
              <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{p.totalROI}%</td>
              <td>{p.durationDays} days</td>
              <td>${p.minDeposit?.toLocaleString()} - ${p.maxDeposit?.toLocaleString()}</td>
              <td><span className={`badge ${p.isActive ? 'badge-active' : 'badge-rejected'}`}>{p.isActive ? 'ACTIVE' : 'HIDDEN'}</span></td>
              <td><div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><Edit size={14} /></button>
                <button className="btn btn-sm" onClick={() => toggleActive(p)} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{p.isActive ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table></div>

      {editing !== null && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing === 'new' ? 'Create Plan' : 'Edit Plan'}</h3>
            {[{ k: 'name', l: 'Plan / Vehicle Name', t: 'text' }, { k: 'hashRate', l: 'Thrust / Capacity Class', t: 'text' }, { k: 'dailyROI', l: 'Daily ROI (%)', t: 'number' }, { k: 'totalROI', l: 'Total ROI (%)', t: 'number' }, { k: 'durationDays', l: 'Duration (Days)', t: 'number' }, { k: 'minDeposit', l: 'Min Allocation ($)', t: 'number' }, { k: 'maxDeposit', l: 'Max Allocation ($)', t: 'number' }].map(f => (
              <div className="form-group" key={f.k}><label className="form-label">{f.l}</label><input className="form-input" type={f.t} value={form[f.k] || ''} onChange={e => setForm({ ...form, [f.k]: e.target.value })} /></div>
            ))}
            <div className="form-group"><label className="form-label">Fleet Tier</label><select className="form-input" value={form.tier || 'starter'} onChange={e => setForm({ ...form, tier: e.target.value })}><option value="starter">Falcon 9 (Starter)</option><option value="professional">Falcon Heavy (Professional)</option><option value="enterprise">Starship Super Heavy (Enterprise)</option><option value="vip">Starbase Mars Fleet (VIP)</option></select></div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}><Check size={16} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
