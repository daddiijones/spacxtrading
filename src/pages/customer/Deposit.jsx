import { useState, useEffect, useRef, useContext } from 'react'
import { publicApi, depositApi } from '../../utils/api'
import { useToast } from '../../components/Toast'
import { Copy, Check, ArrowRight, ArrowLeft, CheckCircle, RefreshCw, TrendingUp } from 'lucide-react'
import { AuthContext } from '../../App'
import { useExchangeRates, formatCurrency as fmtC } from '../../contexts/ExchangeRatesContext'

const CRYPTO_META = {
  BTC:  { name: 'Bitcoin',       color: '#f7931a', cls: 'crypto-btc',  network: 'Bitcoin Network',         minDeposit: 50,  geckoId: 'bitcoin' },
  ETH:  { name: 'Ethereum',      color: '#627eea', cls: 'crypto-eth',  network: 'Ethereum (ERC-20)',        minDeposit: 50,  geckoId: 'ethereum' },
  USDT: { name: 'Tether',        color: '#26a17b', cls: 'crypto-usdt', network: 'TRC-20 / ERC-20',         minDeposit: 10,  geckoId: 'tether' },
  USDC: { name: 'USD Coin',      color: '#2775ca', cls: 'crypto-usdc', network: 'Ethereum (ERC-20)',        minDeposit: 10,  geckoId: 'usd-coin' },
  BNB:  { name: 'BNB',          color: '#f3ba2f', cls: 'crypto-bnb',  network: 'BSC (BEP-20)',             minDeposit: 50,  geckoId: 'binancecoin' },
  SOL:  { name: 'Solana',        color: '#9945ff', cls: 'crypto-sol',  network: 'Solana Network',           minDeposit: 50,  geckoId: 'solana' },
  XRP:  { name: 'XRP',           color: '#00aae4', cls: 'crypto-xrp',  network: 'XRP Ledger',               minDeposit: 20,  geckoId: 'ripple' },
  ADA:  { name: 'Cardano',       color: '#3cc8c8', cls: 'crypto-ada',  network: 'Cardano Network',          minDeposit: 20,  geckoId: 'cardano' },
  DOGE: { name: 'Dogecoin',      color: '#c2a633', cls: 'crypto-doge', network: 'Dogecoin Network',         minDeposit: 20,  geckoId: 'dogecoin' },
  LTC:  { name: 'Litecoin',      color: '#a0a0a0', cls: 'crypto-ltc',  network: 'Litecoin Network',         minDeposit: 50,  geckoId: 'litecoin' },
  AVAX: { name: 'Avalanche',     color: '#e84142', cls: 'crypto-avax', network: 'Avalanche C-Chain',        minDeposit: 50,  geckoId: 'avalanche-2' },
  MATIC:{ name: 'Polygon',       color: '#8247e5', cls: 'crypto-matic',network: 'Polygon Network',          minDeposit: 20,  geckoId: 'matic-network' },
  DOT:  { name: 'Polkadot',      color: '#e6007a', cls: 'crypto-dot',  network: 'Polkadot Network',         minDeposit: 20,  geckoId: 'polkadot' },
  LINK: { name: 'Chainlink',     color: '#375bd2', cls: 'crypto-link', network: 'Ethereum (ERC-20)',        minDeposit: 20,  geckoId: 'chainlink' },
  TRX:  { name: 'TRON',          color: '#ef0027', cls: 'crypto-trx',  network: 'TRON (TRC-20)',            minDeposit: 20,  geckoId: 'tron' },
  SHIB: { name: 'Shiba Inu',     color: '#e75e0d', cls: 'crypto-shib', network: 'Ethereum (ERC-20)',        minDeposit: 10,  geckoId: 'shiba-inu' },
  XLM:  { name: 'Stellar',       color: '#7d00ff', cls: 'crypto-xlm',  network: 'Stellar Network',          minDeposit: 20,  geckoId: 'stellar' },
  ATOM: { name: 'Cosmos',        color: '#8b95b5', cls: 'crypto-atom', network: 'Cosmos Network',           minDeposit: 20,  geckoId: 'cosmos' },
  NEAR: { name: 'NEAR Protocol', color: '#00c08b', cls: 'crypto-near', network: 'NEAR Protocol',            minDeposit: 20,  geckoId: 'near' },
  XMR:  { name: 'Monero',        color: '#f26822', cls: 'crypto-xmr',  network: 'Monero Network',           minDeposit: 50,  geckoId: 'monero' },
  TON:  { name: 'Toncoin',       color: '#0098ea', cls: 'crypto-ton',  network: 'TON Network',              minDeposit: 20,  geckoId: 'the-open-network' },
  ARB:  { name: 'Arbitrum',      color: '#28a0f0', cls: 'crypto-arb',  network: 'Arbitrum Network',         minDeposit: 20,  geckoId: 'arbitrum' },
  OP:   { name: 'Optimism',      color: '#ff0420', cls: 'crypto-op',   network: 'Optimism Network',         minDeposit: 20,  geckoId: 'optimism' },
}

const FALLBACK_PRICES = {
  BTC: 105000, ETH: 3800, USDT: 1, USDC: 1, BNB: 680, SOL: 175,
  XRP: 2.4, ADA: 0.75, DOGE: 0.18, LTC: 95, AVAX: 38, MATIC: 0.55,
  DOT: 7.5, LINK: 18, TRX: 0.26, SHIB: 0.000025, XLM: 0.38,
  ATOM: 7.2, NEAR: 4.5, XMR: 165, TON: 5.8, ARB: 0.65, OP: 1.1,
}

const GECKO_IDS = 'bitcoin,ethereum,tether,usd-coin,binancecoin,solana,ripple,cardano,dogecoin,litecoin,avalanche-2,matic-network,polkadot,chainlink,tron,shiba-inu,stellar,cosmos,near,monero,the-open-network,arbitrum,optimism'
const SYMBOL_MAP = {
  bitcoin: 'BTC', ethereum: 'ETH', tether: 'USDT', 'usd-coin': 'USDC',
  binancecoin: 'BNB', solana: 'SOL', ripple: 'XRP', cardano: 'ADA',
  dogecoin: 'DOGE', litecoin: 'LTC', 'avalanche-2': 'AVAX', 'matic-network': 'MATIC',
  polkadot: 'DOT', chainlink: 'LINK', tron: 'TRX', 'shiba-inu': 'SHIB',
  stellar: 'XLM', cosmos: 'ATOM', near: 'NEAR', monero: 'XMR',
  'the-open-network': 'TON', arbitrum: 'ARB', optimism: 'OP',
}

function fmtCrypto(n, symbol) {
  if (!n || isNaN(n)) return '—'
  if (['USDT', 'USDC'].includes(symbol)) return n.toFixed(2)
  if (symbol === 'BTC') return n.toFixed(8)
  if (symbol === 'SHIB') return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return n.toFixed(6)
}

function fmtUSD(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Deposit() {
  const { user } = useContext(AuthContext)
  const liveRates = useExchangeRates()
  const fc = (val, shrink) => fmtC(val, user, liveRates, shrink)
  const [step, setStep] = useState(1)
  const [wallets, setWallets] = useState({})
  const [deposits, setDeposits] = useState([])
  const [selected, setSelected] = useState(null)
  const [amount, setAmount] = useState('')
  const [txHash, setTxHash] = useState('')
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [prices, setPrices] = useState(FALLBACK_PRICES)
  const [pricesLoading, setPricesLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const priceInterval = useRef(null)
  const toast = useToast()

  const fetchPrices = async () => {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${GECKO_IDS}&vs_currencies=usd`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      const mapped = {}
      for (const [id, val] of Object.entries(data)) {
        const sym = SYMBOL_MAP[id]
        if (sym) mapped[sym] = val.usd
      }
      setPrices(prev => ({ ...FALLBACK_PRICES, ...prev, ...mapped }))
      setLastUpdated(new Date())
    } catch {
      // keep fallback prices silently
    } finally {
      setPricesLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([publicApi.wallets(), depositApi.list()])
      .then(([w, d]) => { setWallets(w); setDeposits(d); setLoading(false) })
      .catch(() => setLoading(false))
    fetchPrices()
    priceInterval.current = setInterval(fetchPrices, 30000)
    return () => clearInterval(priceInterval.current)
  }, [])

  const cryptoOptions = Object.entries(wallets).map(([symbol, address]) => ({
    symbol, address, ...CRYPTO_META[symbol]
  })).filter(c => c.name)

  const copyAddress = () => {
    navigator.clipboard.writeText(selected.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await depositApi.create({ amount: parseFloat(amount), cryptoType: selected.symbol, txHash })
      const d = await depositApi.list()
      setDeposits(d)
      setStep(4)
      toast.success('Your deposit is being reviewed by our team.', 'Deposit Submitted!')
    } catch (err) { toast.error(err.message) }
    setSubmitting(false)
  }

  const resetForm = () => { setStep(1); setSelected(null); setAmount(''); setTxHash('') }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const steps = ['Select Crypto', 'Enter Amount', 'Send Payment', 'Confirm']

  return (
    <div>
      <div className="deposit-steps">
        {steps.map((s, i) => (
          <div key={i} className={`deposit-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'completed' : ''}`}>
            <div className="step-num">{step > i + 1 ? <Check size={12} /> : i + 1}</div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="fade-in">
          <div className="section-header"><h3>Select Payment Method</h3></div>
          {cryptoOptions.length === 0 ? (
            <div className="card empty-state"><p>No payment methods configured. Contact admin.</p></div>
          ) : (
            <div className="crypto-grid">
              {cryptoOptions.map(c => (
                <div key={c.symbol} className={`crypto-option ${selected?.symbol === c.symbol ? 'selected' : ''}`} onClick={() => setSelected(c)}>
                  <div className="crypto-icon" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}bb)` }}>{c.symbol[0]}</div>
                  <div className="crypto-name">{c.name}</div>
                  <div className="crypto-symbol">{c.symbol}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{c.network}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" disabled={!selected} onClick={() => setStep(2)}>Continue <ArrowRight size={16} /></button>
          </div>
        </div>
      )}

      {step === 2 && selected && (() => {
        const usd = parseFloat(amount) || 0
        const price = prices[selected.symbol] || 1
        const cryptoAmt = usd > 0 ? usd / price : null
        return (
          <div className="fade-in">
            <div className="card deposit-form-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="crypto-icon" style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.color}bb)` }}>{selected.symbol[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{selected.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Network: {selected.network}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {pricesLoading
                    ? <><RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> Loading rates...</>
                    : <><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                        Live rate · 1 {selected.symbol} = ${fmtUSD(price)}{user?.currency && user.currency !== 'USD' && ` · ${fc(price)}`}
                        {lastUpdated && <span style={{ marginLeft: 4, color: 'var(--text-muted)', opacity: 0.6 }}>({lastUpdated.toLocaleTimeString()})</span>}
                      </>
                  }
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Deposit Amount (USD)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '1rem', pointerEvents: 'none' }}>$</span>
                  <input
                    className="form-input"
                    type="number"
                    placeholder={`${selected.minDeposit}.00`}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    step="any"
                    style={{ paddingLeft: 28 }}
                  />
                </div>
              </div>

              {/* Live conversion card */}
              <div style={{
                marginTop: 14,
                borderRadius: 12,
                overflow: 'hidden',
                border: `1px solid rgba(14, 165, 233,${cryptoAmt ? '0.25' : '0.08'})`,
                transition: 'border-color 0.3s ease'
              }}>
                <div style={{ background: 'rgba(14, 165, 233,0.05)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={13} style={{ color: '#0ea5e9' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Live Conversion</span>
                </div>
                <div style={{ padding: '16px 18px', background: 'rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    {/* USD side */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>You deposit</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                        {usd > 0 ? `$${fmtUSD(usd)}` : <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>$0.00</span>}
                      </div>
                      {usd > 0 && user?.currency && user.currency !== 'USD' && (
                        <div style={{ fontSize: '0.72rem', color: '#0ea5e9', marginTop: 3, fontWeight: 600 }}>≈ {fc(usd)}</div>
                      )}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>US Dollar</div>
                    </div>

                    {/* Arrow */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(14, 165, 233,0.12)', border: '1px solid rgba(14, 165, 233,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowRight size={13} style={{ color: '#0ea5e9' }} />
                      </div>
                    </div>

                    {/* Crypto side */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>You send</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1, color: cryptoAmt ? '#0ea5e9' : 'var(--text-muted)', transition: 'color 0.3s ease' }}>
                        {cryptoAmt ? fmtCrypto(cryptoAmt, selected.symbol) : '—'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>{selected.symbol} · {selected.network}</div>
                    </div>
                  </div>

                  {/* Rate row */}
                  {!pricesLoading && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', gap: 16, fontSize: '0.72rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>1 {selected.symbol} = <strong style={{ color: '#fff' }}>${fmtUSD(price)}</strong>{user?.currency && user.currency !== 'USD' && <span style={{ color: '#0ea5e9' }}> · {fc(price)}</span>}</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>Rate refreshes every 30s</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={!amount || parseFloat(amount) < selected.minDeposit}
                  onClick={() => setStep(3)}
                >
                  Continue — ${fmtUSD(usd)}{user?.currency && user.currency !== 'USD' ? ` (${fc(usd)})` : ''} {cryptoAmt ? `≈ ${fmtCrypto(cryptoAmt, selected.symbol)} ${selected.symbol}` : ''} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {step === 3 && selected && (() => {
        const usd = parseFloat(amount) || 0
        const price = prices[selected.symbol] || 1
        const cryptoAmt = usd > 0 ? usd / price : null
        return (
        <div className="fade-in">
          <div className="card deposit-form-card">
            <h4 style={{ fontWeight: 700, marginBottom: 4 }}>Send payment to complete deposit</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
              Send the equivalent of <strong style={{ color: '#fff' }}>${fmtUSD(usd)}</strong>{user?.currency && user.currency !== 'USD' && <> (<strong style={{ color: '#0ea5e9' }}>{fc(usd)}</strong>)</>} in {selected.symbol} to the address below.
            </p>

            {/* Amount summary bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, background: 'rgba(14, 165, 233,0.07)', border: '1px solid rgba(14, 165, 233,0.18)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 3 }}>Wallet credit</div>
                <div style={{ fontWeight: 900, color: 'var(--success)', fontSize: '1.1rem' }}>{fc(usd)}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>USD</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>≈</div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 3 }}>You send</div>
                <div style={{ fontWeight: 900, color: '#0ea5e9', fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' }}>
                  {cryptoAmt ? fmtCrypto(cryptoAmt, selected.symbol) : '—'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{selected.symbol}</div>
              </div>
            </div>
            <div className="wallet-box">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>{selected.name} ({selected.network}) Address</p>
              <div className="wallet-address">{selected.address}</div>
              <button className="btn btn-secondary btn-sm" onClick={copyAddress}>
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Address</>}
              </button>
            </div>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '0.82rem', color: 'var(--warning)' }}>
              ⚠️ Only send {selected.symbol} on the {selected.network} network.
            </div>
            <div className="form-group">
              <label className="form-label">Transaction Hash (TX ID)</label>
              <input className="form-input" type="text" placeholder="Paste your transaction hash here" value={txHash} onChange={e => setTxHash(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} disabled={!txHash || submitting} onClick={handleSubmit}>
                {submitting ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <>Submit Deposit <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>
        )
      })()}

      {step === 4 && selected && (
        <div className="fade-in" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <CheckCircle size={40} style={{ color: 'var(--success)' }} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Deposit Submitted!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
            Your deposit of <strong>{fc(parseFloat(amount) || 0)}</strong> (via {selected.symbol}) is being reviewed. Funds will be credited to your wallet balance once confirmed.
          </p>
          <button className="btn btn-primary" onClick={resetForm}>Make Another Deposit</button>
        </div>
      )}

      {step === 1 && deposits.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div className="section-header"><h3>Deposit History</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {deposits.map(d => (
              <div key={d.id} className="card tx-item">
                <div className="tx-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <ArrowLeft size={16} style={{ color: 'var(--success)', transform: 'rotate(180deg)' }} />
                </div>
                <div className="tx-info">
                  <div className="tx-label">{d.cryptoType} Deposit</div>
                  <div className="tx-detail">{d.txHash ? `TX: ${d.txHash.substring(0, 20)}...` : 'Pending'}</div>
                </div>
                <div className="tx-amount" style={{ color: 'var(--success)' }}>
                  +${fmtUSD(d.amount)}
                  {user?.currency && user.currency !== 'USD' && (
                    <span style={{ fontSize: '0.72rem', color: '#0ea5e9', display: 'block', fontWeight: 600 }}>≈ {fc(d.amount)}</span>
                  )}
                  <span className="tx-crypto">USD · via {d.cryptoType}</span>
                </div>
                <div className="tx-status">
                  <span className={`badge badge-${d.status.toLowerCase()}`}>{d.status}</span>
                  <div className="tx-date">{new Date(d.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .deposit-form-card { max-width: 560px; }
        .tx-item { display: flex; align-items: center; gap: 14px; padding: 14px 18px; }
        .tx-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tx-info { flex: 1; min-width: 0; }
        .tx-label { font-weight: 700; font-size: 0.88rem; color: var(--text-primary); }
        .tx-detail { font-size: 0.75rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tx-amount { text-align: right; flex-shrink: 0; font-weight: 800; font-size: 0.9rem; }
        .tx-crypto { display: block; font-size: 0.72rem; color: var(--text-muted); font-weight: 500; }
        .tx-status { flex-shrink: 0; min-width: 70px; text-align: right; }
        .tx-date { font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; }

        @media (max-width: 640px) {
          .deposit-form-card { max-width: 100%; }
          .tx-item { flex-wrap: wrap; padding: 12px; gap: 8px; }
          .tx-info { min-width: calc(100% - 50px); }
          .tx-detail { white-space: normal; }
        }
      `}</style>
    </div>
  )
}
