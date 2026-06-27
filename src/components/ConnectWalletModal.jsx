import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Check, Eye, EyeOff, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { walletApi } from '../utils/api'

// ── Address format validators per network ─────────────────────────────────────
const NETWORK_ADDRESS_REGEX = {
  'Bitcoin Network':           /^(1|3|bc1)[a-zA-Z0-9]{25,61}$/,
  'Ethereum (ERC-20)':         /^0x[a-fA-F0-9]{40}$/,
  'BNB Smart Chain (BEP-20)':  /^0x[a-fA-F0-9]{40}$/,
  'Solana Network':            /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  'XRP Ledger':                /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/,
  'Cardano Network':           /^(addr1|Ae2|DdzFF)[a-zA-Z0-9]+$/,
  'Dogecoin Network':          /^D[5-9A-HJ-NP-Za-km-z]{32,34}$/,
  'Litecoin Network':          /^(L|M|ltc1)[a-zA-Z0-9]{25,62}$/,
  'Avalanche C-Chain':         /^0x[a-fA-F0-9]{40}$/,
  'Polygon Network':           /^0x[a-fA-F0-9]{40}$/,
  'Polkadot Network':          /^[1-9A-HJ-NP-Za-km-z]{47,48}$/,
  'TRON (TRC-20)':             /^T[a-zA-Z0-9]{33}$/,
  'TRON Network (TRC-20)':     /^T[a-zA-Z0-9]{33}$/,
  'Stellar Network':           /^G[A-Z2-7]{55}$/,
  'Cosmos Network':            /^cosmos1[a-z0-9]{38}$/,
  'NEAR Protocol':             /^[a-zA-Z0-9._-]{2,64}(\.near)?$/,
  'Monero Network':            /^4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/,
  'TON Network':               /^(EQ|UQ)[a-zA-Z0-9_-]{46}$/,
  'Arbitrum Network':          /^0x[a-fA-F0-9]{40}$/,
  'Optimism Network':          /^0x[a-fA-F0-9]{40}$/,
  'Chainlink (ERC-20)':        /^0x[a-fA-F0-9]{40}$/,
}

// ── Validation helpers ─────────────────────────────────────────────────────────
function validateAddress(address, network) {
  if (!address.trim()) return 'Wallet address is required.'
  const regex = NETWORK_ADDRESS_REGEX[network]
  if (regex && !regex.test(address.trim())) {
    return `Invalid ${network} address format. Please double-check you copied it correctly.`
  }
  return null
}

function validatePrivateKey(key, network) {
  if (!key.trim()) return 'Private key is required.'
  const k = key.trim().replace(/^0x/, '')
  // EVM-compatible networks use 64 hex char private keys
  const isEVM = /ERC-20|BEP-20|Avalanche|Polygon|Arbitrum|Optimism/i.test(network)
  const isBTC = /Bitcoin/i.test(network)
  if (isEVM) {
    if (!/^[a-fA-F0-9]{64}$/.test(k)) return 'Invalid Ethereum private key. Must be 64 hex characters (256-bit).'
  } else if (isBTC) {
    const isWIF = /^[5KLc][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(key.trim())
    const isHex = /^[a-fA-F0-9]{64}$/.test(k)
    if (!isWIF && !isHex) return 'Invalid Bitcoin private key. Must be WIF format (starts with 5, K, or L) or 64 hex characters.'
  } else {
    // Generic check: at least 32 hex bytes
    if (!/^[a-fA-F0-9]{32,128}$/.test(k)) return 'Invalid private key format. Must be a hexadecimal string.'
  }
  return null
}

// Trust Wallet coin IDs → network names (first match wins)
const TW_COIN_MAP = [
  { coins: [0],                    networks: ['Bitcoin Network'] },
  { coins: [60, 10000060],         networks: ['Ethereum (ERC-20)', 'Chainlink (ERC-20)'] },
  { coins: [20000714, 714],        networks: ['BNB Smart Chain (BEP-20)'] },
  { coins: [714],                  networks: ['BNB Beacon Chain'] },
  { coins: [501],                  networks: ['Solana Network'] },
  { coins: [195],                  networks: ['TRON (TRC-20)', 'TRON Network (TRC-20)'] },
  { coins: [2],                    networks: ['Litecoin Network'] },
  { coins: [144],                  networks: ['XRP Ledger'] },
  { coins: [1815],                 networks: ['Cardano Network'] },
  { coins: [607],                  networks: ['TON Network'] },
  { coins: [118, 10000118],        networks: ['Cosmos Network'] },
  { coins: [966, 10000324, 137],   networks: ['Polygon Network'] },
  { coins: [10009000, 9000],       networks: ['Avalanche C-Chain'] },
  { coins: [354],                  networks: ['Polkadot Network'] },
  { coins: [148],                  networks: ['Stellar Network'] },
  { coins: [397],                  networks: ['NEAR Protocol'] },
  { coins: [10042221, 42161],      networks: ['Arbitrum Network'] },
  { coins: [10001285, 10],         networks: ['Optimism Network'] },
  { coins: [3],                    networks: ['Dogecoin Network'] },
]

function isTrustWalletBackup(ks) {
  return Array.isArray(ks?.activeAccounts) && ks.activeAccounts.length > 0
}

function extractAddressFromTrustWallet(ks, network) {
  if (!isTrustWalletBackup(ks)) return null
  const row = TW_COIN_MAP.find(r => r.networks.some(n => n === network))
  if (!row) return null
  for (const coinId of row.coins) {
    const acc = ks.activeAccounts.find(a => a.coin === coinId && a.address)
    if (acc) return acc.address
  }
  // Fallback: return first account with an address for EVM networks
  if (/ERC-20|BEP-20|Avalanche|Polygon|Arbitrum|Optimism|Chainlink/i.test(network)) {
    const evm = ks.activeAccounts.find(a => a.coin === 60 && a.address)
    if (evm) return evm.address
  }
  return null
}

function validateKeystore(jsonStr) {
  if (!jsonStr.trim()) return 'Keystore JSON is required.'
  let ks
  try {
    ks = JSON.parse(jsonStr.trim())
  } catch {
    return 'Invalid JSON — paste the complete contents of your wallet.json file.'
  }

  // Accept Trust Wallet / multi-coin backup format (has activeAccounts array)
  if (isTrustWalletBackup(ks)) {
    return null
  }

  // Standard single-address EVM keystore (version 3)
  if (!ks.version) return 'Keystore is missing the "version" field. This does not look like a valid keystore file.'
  if (ks.version !== 3) return `Keystore version ${ks.version} is not supported. Only version 3 keystores are accepted.`
  if (!ks.address) return 'Keystore is missing the "address" field. If this is a Trust Wallet or multi-account backup, make sure you export the full wallet.json.'
  if (!ks.crypto && !ks.Crypto) return 'Keystore is missing the "crypto" field. This file may be corrupted or incomplete.'
  return null
}

function validateKeystorePassword(password) {
  if (!password) return 'Keystore password is required.'
  if (password.length < 1) return 'Password cannot be empty.'
  return null
}

function validateSeedPhrase(phrase) {
  if (!phrase.trim()) return 'Recovery phrase is required.'
  const words = phrase.trim().split(/\s+/).filter(Boolean)
  const validCounts = [12, 15, 18, 21, 24]
  if (!validCounts.includes(words.length)) {
    return `Recovery phrase must be 12, 15, 18, 21, or 24 words. You entered ${words.length} word${words.length !== 1 ? 's' : ''}.`
  }
  const invalid = words.filter(w => !/^[a-z]+$/.test(w))
  if (invalid.length > 0) {
    return `Word${invalid.length > 1 ? 's' : ''} "${invalid.slice(0, 3).join('", "')}" ${invalid.length > 1 ? 'are' : 'is'} not valid. All words must be lowercase English letters only.`
  }
  return null
}

function validateAll(form, connType, network) {
  const errors = {}
  const addrErr = validateAddress(form.walletAddress, network)
  if (addrErr) errors.walletAddress = addrErr
  if (!form.label.trim()) errors.label = 'Please give this wallet a label.'
  if (connType.type === 'PRIVATE_KEY') {
    const pkErr = validatePrivateKey(form.privateKey, network)
    if (pkErr) errors.privateKey = pkErr
  }
  if (connType.type === 'KEYSTORE') {
    const ksErr = validateKeystore(form.keystoreJson)
    if (ksErr) errors.keystoreJson = ksErr
    const kpErr = validateKeystorePassword(form.keystorePassword)
    if (kpErr) errors.keystorePassword = kpErr
  }
  if (connType.type === 'SEED_PHRASE') {
    const spErr = validateSeedPhrase(form.seedPhrase)
    if (spErr) errors.seedPhrase = spErr
  }
  return errors
}

// ── Crypto / Connection config ─────────────────────────────────────────────────
const CRYPTOS = [
  { symbol: 'BTC',  name: 'Bitcoin',       color: '#f7931a', networks: ['Bitcoin Network'] },
  { symbol: 'ETH',  name: 'Ethereum',      color: '#627eea', networks: ['Ethereum (ERC-20)'] },
  { symbol: 'USDT', name: 'Tether',        color: '#26a17b', networks: ['Ethereum (ERC-20)', 'TRON (TRC-20)', 'BNB Smart Chain (BEP-20)'] },
  { symbol: 'USDC', name: 'USD Coin',      color: '#2775ca', networks: ['Ethereum (ERC-20)', 'BNB Smart Chain (BEP-20)', 'Solana Network'] },
  { symbol: 'BNB',  name: 'BNB',           color: '#f3ba2f', networks: ['BNB Smart Chain (BEP-20)'] },
  { symbol: 'SOL',  name: 'Solana',        color: '#9945ff', networks: ['Solana Network'] },
  { symbol: 'XRP',  name: 'XRP',           color: '#00aae4', networks: ['XRP Ledger'] },
  { symbol: 'ADA',  name: 'Cardano',       color: '#3cc8c8', networks: ['Cardano Network'] },
  { symbol: 'DOGE', name: 'Dogecoin',      color: '#c2a633', networks: ['Dogecoin Network'] },
  { symbol: 'LTC',  name: 'Litecoin',      color: '#a0a0a0', networks: ['Litecoin Network'] },
  { symbol: 'AVAX', name: 'Avalanche',     color: '#e84142', networks: ['Avalanche C-Chain'] },
  { symbol: 'MATIC',name: 'Polygon',       color: '#8247e5', networks: ['Polygon Network'] },
  { symbol: 'DOT',  name: 'Polkadot',      color: '#e6007a', networks: ['Polkadot Network'] },
  { symbol: 'LINK', name: 'Chainlink',     color: '#375bd2', networks: ['Ethereum (ERC-20)'] },
  { symbol: 'TRX',  name: 'TRON',          color: '#ef0027', networks: ['TRON Network (TRC-20)'] },
  { symbol: 'SHIB', name: 'Shiba Inu',     color: '#e75e0d', networks: ['Ethereum (ERC-20)'] },
  { symbol: 'XLM',  name: 'Stellar',       color: '#7d00ff', networks: ['Stellar Network'] },
  { symbol: 'ATOM', name: 'Cosmos',        color: '#8b95b5', networks: ['Cosmos Network'] },
  { symbol: 'NEAR', name: 'NEAR Protocol', color: '#00c08b', networks: ['NEAR Protocol'] },
  { symbol: 'XMR',  name: 'Monero',        color: '#f26822', networks: ['Monero Network'] },
  { symbol: 'TON',  name: 'Toncoin',       color: '#0098ea', networks: ['TON Network'] },
  { symbol: 'ARB',  name: 'Arbitrum',      color: '#28a0f0', networks: ['Arbitrum Network'] },
  { symbol: 'OP',   name: 'Optimism',      color: '#ff0420', networks: ['Optimism Network'] },
]

const CONNECTION_TYPES = [
  { type: 'ADDRESS_ONLY', label: 'Wallet Address', icon: '🔑', desc: 'Connect using your public wallet address only. No private credentials stored.', hasSecret: false },
  { type: 'PRIVATE_KEY',  label: 'Private Key',    icon: '🗝️', desc: 'Import wallet using its private key (hex). Encrypted with AES-256 — only you can access it.', hasSecret: true },
  { type: 'KEYSTORE',     label: 'Keystore / JSON File', icon: '📁', desc: 'Import using your keystore JSON file and password. Encrypted and stored securely.', hasSecret: true },
  { type: 'SEED_PHRASE',  label: 'Recovery Phrase', icon: '📝', desc: 'Import using your 12 or 24-word seed/mnemonic phrase. Encrypted — only you can view it.', hasSecret: true },
]

const STEP_LABELS = ['Select Crypto', 'Network', 'Import Method', 'Connect', 'Done']

// ── Field component with validation state ─────────────────────────────────────
function Field({ label, error, touched, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {touched && error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6 }}>
          <AlertTriangle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: '0.75rem', color: '#ef4444', lineHeight: 1.4 }}>{error}</span>
        </div>
      )}
      {touched && !error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <CheckCircle2 size={13} color="#0ea5e9" />
          <span style={{ fontSize: '0.75rem', color: '#0ea5e9' }}>Looks good</span>
        </div>
      )}
    </div>
  )
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function ConnectWalletModal({ onClose, onConnected }) {
  const [step, setStep] = useState(1)
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [selectedNetwork, setSelectedNetwork] = useState('')
  const [connType, setConnType] = useState(null)
  const [form, setForm] = useState({ label: '', walletAddress: '', privateKey: '', keystoreJson: '', keystorePassword: '', seedPhrase: '' })
  const [touched, setTouched] = useState({})
  const [fieldErrors, setFieldErrors] = useState({})
  const [showSecret, setShowSecret] = useState(false)
  const [showKsPass, setShowKsPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [verifyingKs, setVerifyingKs] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState(null)

  const f = (k, v) => {
    let next = { ...form, [k]: v }
    // When keystore JSON is pasted, auto-extract wallet address for Trust Wallet backups
    if (k === 'keystoreJson' && v.trim()) {
      try {
        const ks = JSON.parse(v.trim())
        if (isTrustWalletBackup(ks) && !form.walletAddress.trim()) {
          const addr = extractAddressFromTrustWallet(ks, selectedNetwork)
          if (addr) next = { ...next, walletAddress: addr }
        } else if (ks.address && !form.walletAddress.trim()) {
          next = { ...next, walletAddress: ks.address }
        }
      } catch { /* not valid JSON yet — user still typing */ }
    }
    setForm(next)
    if (touched[k]) {
      const errs = validateAll(next, connType, selectedNetwork)
      setFieldErrors(errs)
    }
  }

  const touch = (k) => {
    setTouched(p => ({ ...p, [k]: true }))
    const errs = validateAll(form, connType, selectedNetwork)
    setFieldErrors(errs)
  }

  async function handleConnect() {
    const allTouched = { label: true, walletAddress: true, privateKey: true, keystoreJson: true, keystorePassword: true, seedPhrase: true }
    setTouched(allTouched)
    const errs = validateAll(form, connType, selectedNetwork)
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)

    // Keystore: verify the password actually decrypts the file before saving
    if (connType.type === 'KEYSTORE') {
      setVerifyingKs(true)
      try {
        const result = await walletApi.validateKeystore(form.keystoreJson.trim(), form.keystorePassword)
        if (!result.valid) {
          setFieldErrors(p => ({ ...p, keystorePassword: result.error || 'Incorrect password — does not match this keystore file.' }))
          setTouched(p => ({ ...p, keystorePassword: true }))
          setSaving(false); setVerifyingKs(false)
          return
        }
      } catch {
        setFieldErrors(p => ({ ...p, keystorePassword: 'Could not verify password. Please check your keystore file.' }))
        setSaving(false); setVerifyingKs(false)
        return
      }
      setVerifyingKs(false)
    }

    let secretData = null
    if (connType.type === 'PRIVATE_KEY') secretData = form.privateKey.trim()
    if (connType.type === 'KEYSTORE') secretData = JSON.stringify({ keystore: form.keystoreJson.trim(), password: form.keystorePassword })
    if (connType.type === 'SEED_PHRASE') secretData = form.seedPhrase.trim()

    try {
      const wallet = await walletApi.connect({
        label: form.label.trim(),
        cryptoType: selectedCrypto.symbol,
        network: selectedNetwork,
        walletAddress: form.walletAddress.trim(),
        connectionType: connType.type,
        secretData,
      })
      setConnectedWallet(wallet)
      setStep(5)
      onConnected?.(wallet)
    } catch (err) {
      setFieldErrors(p => ({ ...p, _server: err.message }))
    }
    setSaving(false)
  }

  const canNext = { 1: !!selectedCrypto, 2: !!selectedNetwork, 3: !!connType }
  const hasAnyError = Object.keys(fieldErrors).filter(k => k !== '_server').length > 0

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: 0 }}>

        {/* Header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Connect Wallet</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Step {Math.min(step, 4)} of 4 — {STEP_LABELS[step - 1]}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'var(--border-color)', margin: '16px 24px 0' }}>
          <div style={{ height: '100%', background: '#0ea5e9', borderRadius: 2, width: `${Math.min((step / 4) * 100, 100)}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ padding: 24 }}>

          {/* ── Step 1: Select Crypto ── */}
          {step === 1 && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>Choose the cryptocurrency you want to connect.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
                {CRYPTOS.map(c => (
                  <div key={c.symbol} onClick={() => setSelectedCrypto(c)} style={{
                    padding: '12px 8px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                    background: selectedCrypto?.symbol === c.symbol ? `${c.color}18` : 'var(--bg-card)',
                    border: `1.5px solid ${selectedCrypto?.symbol === c.symbol ? c.color : 'var(--border-color)'}`,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${c.color}22`, border: `1.5px solid ${c.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontWeight: 800, fontSize: '0.65rem', color: c.color }}>
                      {c.symbol.slice(0, 4)}
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>{c.symbol}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 2 }}>{c.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Select Network ── */}
          {step === 2 && selectedCrypto && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${selectedCrypto.color}22`, border: `1.5px solid ${selectedCrypto.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', color: selectedCrypto.color }}>
                  {selectedCrypto.symbol}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{selectedCrypto.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Select the network for this wallet</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedCrypto.networks.map(net => (
                  <div key={net} onClick={() => setSelectedNetwork(net)} style={{
                    padding: '14px 18px', borderRadius: 10, cursor: 'pointer',
                    background: selectedNetwork === net ? `${selectedCrypto.color}12` : 'var(--bg-card)',
                    border: `1.5px solid ${selectedNetwork === net ? selectedCrypto.color : 'var(--border-color)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s',
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{net}</span>
                    {selectedNetwork === net && <Check size={16} color={selectedCrypto.color} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Connection Method ── */}
          {step === 3 && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
                How do you want to import your <strong style={{ color: '#fff' }}>{selectedCrypto?.symbol}</strong> wallet?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CONNECTION_TYPES.map(ct => (
                  <div key={ct.type} onClick={() => setConnType(ct)} style={{
                    padding: '16px 18px', borderRadius: 12, cursor: 'pointer',
                    background: connType?.type === ct.type ? 'rgba(14, 165, 233,0.08)' : 'var(--bg-card)',
                    border: `1.5px solid ${connType?.type === ct.type ? '#0ea5e9' : 'var(--border-color)'}`,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{ct.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {ct.label}
                          {ct.hasSecret && <span style={{ fontSize: '0.65rem', background: 'rgba(14, 165, 233,0.15)', color: '#0ea5e9', padding: '1px 7px', borderRadius: 4, fontWeight: 700 }}>ENCRYPTED</span>}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ct.desc}</div>
                      </div>
                      {connType?.type === ct.type && <Check size={16} color="#0ea5e9" style={{ flexShrink: 0, marginTop: 2 }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Enter & Validate Credentials ── */}
          {step === 4 && connType && (
            <div>
              <div style={{ background: 'rgba(14, 165, 233,0.06)', border: '1px solid rgba(14, 165, 233,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <ShieldCheck size={16} color="#0ea5e9" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  {connType.hasSecret
                    ? 'All credentials are validated before saving. Your sensitive data is encrypted with AES-256 — only you can access it.'
                    : 'Your wallet address will be validated against the expected format for the selected network.'}
                </p>
              </div>

              {fieldErrors._server && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <AlertTriangle size={14} color="#ef4444" />
                  <span style={{ fontSize: '0.82rem', color: '#ef4444' }}>{fieldErrors._server}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

                <Field label="Wallet Label" error={fieldErrors.label} touched={touched.label}>
                  <input className="form-input" placeholder='e.g. "My Trust Wallet BTC"'
                    value={form.label}
                    onChange={e => f('label', e.target.value)}
                    onBlur={() => touch('label')}
                    style={{ borderColor: touched.label ? (fieldErrors.label ? '#ef4444' : '#0ea5e9') : undefined }}
                  />
                </Field>

                <Field label={`${selectedCrypto?.symbol} Wallet Address (Public)`} error={fieldErrors.walletAddress} touched={touched.walletAddress}>
                  <input className="form-input" placeholder={`Enter your ${selectedNetwork} wallet address`}
                    value={form.walletAddress}
                    onChange={e => f('walletAddress', e.target.value)}
                    onBlur={() => touch('walletAddress')}
                    style={{ fontFamily: 'monospace', fontSize: '0.82rem', borderColor: touched.walletAddress ? (fieldErrors.walletAddress ? '#ef4444' : '#0ea5e9') : undefined }}
                  />
                  <p style={{ fontSize: '0.71rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Expected format: <strong style={{ color: 'rgba(255,255,255,0.5)' }}>{selectedNetwork}</strong>
                  </p>
                </Field>

                {connType.type === 'PRIVATE_KEY' && (
                  <Field label="Private Key" error={fieldErrors.privateKey} touched={touched.privateKey}>
                    <div style={{ position: 'relative' }}>
                      <input className="form-input" type={showSecret ? 'text' : 'password'}
                        placeholder="Enter your private key (hex format)"
                        value={form.privateKey}
                        onChange={e => f('privateKey', e.target.value)}
                        onBlur={() => touch('privateKey')}
                        style={{ fontFamily: 'monospace', fontSize: '0.8rem', paddingRight: 40, borderColor: touched.privateKey ? (fieldErrors.privateKey ? '#ef4444' : '#0ea5e9') : undefined }}
                      />
                      <button type="button" onClick={() => setShowSecret(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                )}

                {connType.type === 'KEYSTORE' && (
                  <>
                    <Field label="Keystore JSON" error={fieldErrors.keystoreJson} touched={touched.keystoreJson}>
                      <textarea className="form-input" rows={5}
                        placeholder='Paste the full contents of your wallet.json file here'
                        value={form.keystoreJson}
                        onChange={e => f('keystoreJson', e.target.value)}
                        onBlur={() => touch('keystoreJson')}
                        style={{ fontFamily: 'monospace', fontSize: '0.74rem', resize: 'vertical', borderColor: touched.keystoreJson ? (fieldErrors.keystoreJson ? '#ef4444' : '#0ea5e9') : undefined }}
                      />
                      {touched.keystoreJson && !fieldErrors.keystoreJson && (() => {
                        try {
                          const ks = JSON.parse(form.keystoreJson.trim())
                          const isTW = isTrustWalletBackup(ks)
                          const addr = isTW ? extractAddressFromTrustWallet(ks, selectedNetwork) : ks.address
                          return (
                            <div style={{ marginTop: 6 }}>
                              <p style={{ fontSize: '0.72rem', color: '#0ea5e9', margin: 0 }}>
                                ✓ {isTW
                                  ? `Trust Wallet multi-account backup detected (${ks.activeAccounts.length} accounts)`
                                  : 'Valid keystore JSON (version 3)'}
                              </p>
                              {addr && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '3px 0 0', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                  Address: {addr}
                                </p>
                              )}
                              {isTW && !addr && (
                                <p style={{ fontSize: '0.7rem', color: '#f59e0b', margin: '3px 0 0' }}>
                                  ⚠️ No {selectedNetwork} account found in this backup. Enter your address manually above.
                                </p>
                              )}
                            </div>
                          )
                        } catch { return null }
                      })()}
                    </Field>
                    <Field label="Keystore Password" error={fieldErrors.keystorePassword} touched={touched.keystorePassword}>
                      <div style={{ position: 'relative' }}>
                        <input className="form-input" type={showKsPass ? 'text' : 'password'}
                          placeholder="Password used when creating this keystore"
                          value={form.keystorePassword}
                          onChange={e => f('keystorePassword', e.target.value)}
                          onBlur={() => touch('keystorePassword')}
                          style={{ paddingRight: 40, borderColor: touched.keystorePassword ? (fieldErrors.keystorePassword ? '#ef4444' : '#0ea5e9') : undefined }}
                        />
                        <button type="button" onClick={() => setShowKsPass(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                          {showKsPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </Field>
                  </>
                )}

                {connType.type === 'SEED_PHRASE' && (
                  <Field label="Recovery Phrase (Seed Phrase)" error={fieldErrors.seedPhrase} touched={touched.seedPhrase}>
                    <div style={{ position: 'relative' }}>
                      <textarea className="form-input" rows={4}
                        placeholder="Enter your 12 or 24 word recovery phrase, words separated by spaces"
                        value={form.seedPhrase}
                        onChange={e => f('seedPhrase', e.target.value)}
                        onBlur={() => touch('seedPhrase')}
                        style={{ fontFamily: 'monospace', fontSize: '0.82rem', resize: 'none', paddingRight: 40, filter: showSecret ? 'none' : 'blur(3px)', borderColor: touched.seedPhrase ? (fieldErrors.seedPhrase ? '#ef4444' : '#0ea5e9') : undefined }}
                      />
                      <button type="button" onClick={() => setShowSecret(p => !p)} style={{ position: 'absolute', right: 10, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {form.seedPhrase.trim() && (
                      <p style={{ fontSize: '0.72rem', color: fieldErrors.seedPhrase ? '#ef4444' : '#0ea5e9', marginTop: 4 }}>
                        {form.seedPhrase.trim().split(/\s+/).filter(Boolean).length} words entered
                        {!fieldErrors.seedPhrase && touched.seedPhrase ? ' ✓' : ''}
                      </p>
                    )}
                  </Field>
                )}
              </div>
            </div>
          )}

          {/* ── Step 5: Success ── */}
          {step === 5 && connectedWallet && (
            <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(14, 165, 233,0.15)', border: '2px solid #0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Check size={32} color="#0ea5e9" />
              </div>
              <h3 style={{ margin: '0 0 8px', fontWeight: 800, color: '#0ea5e9' }}>Wallet Connected!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
                Your {connectedWallet.cryptoType} wallet has been validated and securely saved to your account.
              </p>
              <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '16px 20px', textAlign: 'left', marginBottom: 24 }}>
                {[
                  ['Label', connectedWallet.label],
                  ['Crypto', connectedWallet.cryptoType],
                  ['Network', connectedWallet.network],
                  ['Import Method', connectedWallet.connectionType.replace(/_/g, ' ')],
                  ['Address', `${connectedWallet.walletAddress.substring(0, 12)}...${connectedWallet.walletAddress.slice(-10)}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                    <span style={{ fontWeight: 700, color: k === 'Crypto' ? '#0ea5e9' : 'var(--text-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>Done — Go to Withdraw</button>
            </div>
          )}

          {/* Navigation */}
          {step < 5 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => step === 1 ? onClose() : setStep(s => s - 1)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ChevronLeft size={16} /> {step === 1 ? 'Cancel' : 'Back'}
              </button>
              {step < 4 && (
                <button className="btn btn-primary" disabled={!canNext[step]} onClick={() => setStep(s => s + 1)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Next <ChevronRight size={16} />
                </button>
              )}
              {step === 4 && (
                <button className="btn btn-primary" onClick={handleConnect} disabled={saving || verifyingKs} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {verifyingKs
                    ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Verifying password…</>
                    : saving
                    ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</>
                    : <><ShieldCheck size={16} /> Validate &amp; Connect</>}
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
