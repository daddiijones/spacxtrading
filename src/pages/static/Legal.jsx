import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function LegalPage({ title, children }) {
  return (
    <div className="landing-page" style={{ background: '#07090e', minHeight: '100vh', color: '#fff' }}>
      <div className="landing-container" style={{ paddingTop: 100, paddingBottom: 80, maxWidth: 800 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-cyan)', fontSize: '0.88rem', marginBottom: 32, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: 8, background: 'linear-gradient(135deg, #fff 30%, #0ea5e9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 40 }}>Last updated: June 1, 2026</p>
        <div className="legal-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>{children}</div>
      </div>
    </div>
  )
}

export function TermsOfService() {
  return (
    <LegalPage title="Terms of Service">
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#0ea5e9' }}>1.</span> Acceptance of Terms
        </h3>
        <p>By accessing and utilizing the SpaceX Trading platform ("the Platform"), you hereby covenant and agree to be bound by these Terms of Service in their entirety. If you do not consent to all conditions specified herein, you must immediately terminate usage of our investment systems.</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#0ea5e9' }}>2.</span> Account Registration & Mission Identity
        </h3>
        <p>Investors must provide complete, authentic information during the security-cleared onboarding sequence. You bear sole administrative responsibility for preserving access key confidentiality and safeguarding all activities executing under your account.</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#0ea5e9' }}>3.</span> Accelerated Mission Contract Investments
        </h3>
        <p>SpaceX Trading activates mission contracts instantly upon launch, granting time-bound access to our fixed-term investment vehicles. Real-time returns are computed continuously throughout the contract term. Past performance does not guarantee future returns due to market adjustment factors.</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#0ea5e9' }}>4.</span> Ledger Verification (Deposits & Withdrawals)
        </h3>
        <p>All cryptographic deposits must execute validation via the global blockchain before assignment to our high-throughput arrays. Withdrawal distributions undergo system-cleared verification sequences and dispatch to your registered crypto address within 1 to 24 hours.</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#0ea5e9' }}>5.</span> Limitation of Liability
        </h3>
        <p>SpaceX Trading and its mission infrastructure partners represent zero liability for direct or indirect losses arising from external blockchain congestion, transaction fees, or general cryptocurrency volatility. Users accept all systemic investment risks.</p>
      </div>
    </LegalPage>
  )
}

export function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy">
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>Information Collection</h3>
        <p>We process registered accounts, email coordinates, full legal names, country specifications, and transactional ledgers strictly to facilitate mission contract investing. Your telemetry and user data remain entirely confidential.</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>How We Apply Your Data</h3>
        <p>Your security credentials process transaction logs, communicate system alarms, initialize mission contract rosters, enforce account access tokens, and facilitate local regional legal compliance.</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>Enterprise-Grade Security Architecture</h3>
        <p>We leverage high-throughput AES-256 standard database protection and end-to-end user session tokenization to secure all digital balances, wallets, and administrative settings.</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>User Rights & Sovereignty</h3>
        <p>Investors preserve full rights to examine, correct, or request deletion of their database records. Dynamic profile revisions take place instantly from the account dashboard profile center.</p>
      </div>
    </LegalPage>
  )
}

export function RefundPolicy() {
  return (
    <LegalPage title="Refund Policy">
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>Ledger Deposit Distributions</h3>
        <p>Due to the absolute, immutable execution of global blockchain transactions, confirmed deposits applied to user accounts cannot be reversed or refunded. Staging deposits pending verification can be canceled upon written request.</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>Mission Contract Cancellation</h3>
        <p>Active mission contracts are immediate. Once a contract starts executing (e.g. Falcon Heavy or Starship Super Heavy fleets), capital is committed and cannot be refunded. Unused balances inside staging accounts may be refunded under specific cases.</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>Support Dispute Channels</h3>
        <p>For transactional reviews, reach our administrative dispatch desk at <span style={{ color: '#0ea5e9', fontWeight: 600 }}>admin@spacxtrading.online</span> with transaction details. We review and resolve queries within 48 to 72 hours.</p>
      </div>
    </LegalPage>
  )
}

export function AmlPolicy() {
  return (
    <LegalPage title="AML Policy">
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>Anti-Money Laundering Framework</h3>
        <p>SpaceX Trading is committed to complying with global AML protocols and preventing terrorist financing channels. We enforce structured ledger reviews and audit tracking records across our systems.</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>Identity Authentication (KYC)</h3>
        <p>For administrative transparency and verification, we preserve the right to demand formal identification credentials for large account actions or withdrawal queries.</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#fff' }}>Ledger Telemetry Analysis</h3>
        <p>Our security layer audits wallet addresses and deposits. We preserve the administrative right to suspend accounts or hold actions violating global security policies or showing fraudulent signs.</p>
      </div>
    </LegalPage>
  )
}
