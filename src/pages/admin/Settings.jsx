import { useState, useEffect } from 'react'
import { adminApi } from '../../utils/api'
import { Save, Wallet, Check } from 'lucide-react'

const CRYPTOS = [
  { symbol: 'BTC',  name: 'Bitcoin',           color: '#f7931a' },
  { symbol: 'ETH',  name: 'Ethereum (ERC-20)', color: '#627eea' },
  { symbol: 'USDT', name: 'Tether (TRC-20)',   color: '#26a17b' },
  { symbol: 'USDC', name: 'USD Coin (ERC-20)', color: '#2775ca' },
  { symbol: 'BNB',  name: 'BNB (BEP-20)',      color: '#f3ba2f' },
  { symbol: 'SOL',  name: 'Solana',             color: '#9945ff' },
  { symbol: 'XRP',  name: 'XRP',               color: '#00aae4' },
  { symbol: 'ADA',  name: 'Cardano',           color: '#3cc8c8' },
  { symbol: 'DOGE', name: 'Dogecoin',          color: '#c2a633' },
  { symbol: 'LTC',  name: 'Litecoin',          color: '#a0a0a0' },
  { symbol: 'AVAX', name: 'Avalanche',         color: '#e84142' },
  { symbol: 'MATIC',name: 'Polygon (MATIC)',   color: '#8247e5' },
  { symbol: 'DOT',  name: 'Polkadot',          color: '#e6007a' },
  { symbol: 'LINK', name: 'Chainlink',         color: '#375bd2' },
  { symbol: 'TRX',  name: 'TRON (TRC-20)',     color: '#ef0027' },
  { symbol: 'SHIB', name: 'Shiba Inu',         color: '#e75e0d' },
  { symbol: 'XLM',  name: 'Stellar',           color: '#7d00ff' },
  { symbol: 'ATOM', name: 'Cosmos',            color: '#8b95b5' },
  { symbol: 'NEAR', name: 'NEAR Protocol',     color: '#00c08b' },
  { symbol: 'XMR',  name: 'Monero',            color: '#f26822' },
  { symbol: 'TON',  name: 'Toncoin',           color: '#0098ea' },
  { symbol: 'ARB',  name: 'Arbitrum',          color: '#28a0f0' },
  { symbol: 'OP',   name: 'Optimism',          color: '#ff0420' },
]

export default function AdminSettings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminApi.settings().then(list => {
      const obj = {}
      list.forEach(s => { obj[s.key] = s.value })
      setSettings(obj)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const settingsArr = Object.entries(settings).map(([key, value]) => ({ key, value }))
    await adminApi.updateSettings({ settings: settingsArr })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="card" style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><Wallet size={20} /> Platform Wallet Addresses</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>These addresses are shown to users for deposits. Change them anytime.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {CRYPTOS.map(c => (
            <div className="form-group" key={c.symbol} style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="crypto-icon" style={{ width: 22, height: 22, fontSize: '0.55rem', background: `linear-gradient(135deg, ${c.color}, ${c.color}bb)`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, flexShrink: 0 }}>{c.symbol[0]}</div>
                {c.name} ({c.symbol})
              </label>
              <input className="form-input" style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
                value={settings[`wallet_${c.symbol}`] || ''} onChange={e => setSettings({ ...settings, [`wallet_${c.symbol}`]: e.target.value })} />
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 700, marginBottom: 20 }}>General Settings</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[{ k: 'min_deposit', l: 'Minimum Deposit (USD)' }, { k: 'min_withdrawal', l: 'Minimum Withdrawal (USD)' }, { k: 'withdrawal_fee', l: 'Withdrawal Fee (%)' }, { k: 'referral_bonus', l: 'Referral Bonus (%)' }].map(f => (
            <div className="form-group" key={f.k}><label className="form-label">{f.l}</label><input className="form-input" type="number" value={settings[f.k] || ''} onChange={e => setSettings({ ...settings, [f.k]: e.target.value })} /></div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 700, marginBottom: 20 }}>System Status Configuration</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Global Platform Status</label>
            <select className="form-input" value={settings.system_status || 'operational'} onChange={e => setSettings({ ...settings, system_status: e.target.value })}>
              <option value="operational">All Systems Operational (Green)</option>
              <option value="degraded">Degraded Performance (Yellow)</option>
              <option value="maintenance">Under Maintenance (Orange)</option>
              <option value="offline">Major Outage / Offline (Red)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status Custom Message</label>
            <input className="form-input" type="text" placeholder="e.g. All SpaceX Trading Systems Operational" value={settings.system_message || ''} onChange={e => setSettings({ ...settings, system_message: e.target.value })} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>Leave blank to use the default message based on status.</div>
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
        {saved ? <><Check size={18} /> Saved!</> : saving ? 'Saving...' : <><Save size={18} /> Save All Settings</>}
      </button>
    </div>
  )
}
