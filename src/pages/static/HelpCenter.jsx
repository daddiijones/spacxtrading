import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function HelpCenter() {
  const faqs = [
    { q: 'How do I launch my first contract?', a: 'Create an account, securely fund your account ledger balance, select from our enterprise-grade mission contract investment plans, and activate instantly. Your contract starts generating returns autonomously 24/7.' },
    { q: 'What cryptocurrencies can I deposit?', a: 'Our automated network gateways accept Bitcoin (BTC), Ethereum (ETH), Tether (USDT/TRC-20), Litecoin (LTC), Binance Coin (BNB/BSC), and Solana (SOL).' },
    { q: 'How long until my deposit is confirmed?', a: 'Deposits are audited and confirmed by our system queue upon getting sufficient blockchain network confirmations. This typically requires 10 to 45 minutes.' },
    { q: 'Can I request withdrawals at any time?', a: 'Absolutely. You are free to query a payout distribution at any moment. Withdrawal requests undergo automated ledger verification and process directly to your target wallet in 1-24 hours.' },
    { q: 'Do I earn returns while my devices are offline?', a: 'Yes! Your personal devices are completely uninvolved. Your mission contracts execute directly on the SpaceX Trading high-throughput investment infrastructure 24/7, continuously accumulating passive returns for your account.' },
    { q: 'How does the high-yield referral program work?', a: 'Every investor receives a unique referral code. You earn a 5% instant ledger credit commission on every contract purchase or deposit executed by investors registering through your code.' },
    { q: 'Are my investments secure?', a: 'We employ state-of-the-art cold-storage reserve custody, enterprise database session authentication, and mission control facility locations backed by redundant power grids.' },
    { q: 'What are the minimum deposit thresholds?', a: 'Minimum deposits are flexible and fluctuate dynamically based on transaction fee costs. Please visit the Deposit panel to see current minimums.' },
  ]

  return (
    <div className="landing-page" style={{ background: '#07090e', minHeight: '100vh', color: '#fff' }}>
      <div className="landing-container" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-cyan)', fontSize: '0.88rem', marginBottom: 32, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: 8, background: 'linear-gradient(135deg, #fff 30%, #0ea5e9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Help Center</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 48 }}>Find clear answers to common questions about the SpaceX Trading platform.</p>

        <div style={{ maxWidth: 800 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>Frequently Asked Questions</h2>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', marginBottom: 12 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 8, color: '#0ea5e9', fontSize: '1.05rem' }}>{f.q}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
