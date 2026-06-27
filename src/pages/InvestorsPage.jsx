import { Link } from 'react-router-dom'
import LiveChatWidget from '../components/LiveChatWidget'

// ── SVG Logo Components ──────────────────────────────────────────────────────

function NvidiaLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M50 8C27 8 8 27 8 50s19 42 42 42 42-19 42-42S73 8 50 8z" fill="#0ea5e9"/>
      <path d="M38 34v32l8-8V42l16 16 8-8L50 30l-12 4z" fill="#fff"/>
      <path d="M58 62V44l-8 8v12l8-2z" fill="#c8e6a0"/>
    </svg>
  )
}

function TeslaLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M50 20c-13.3 0-24 1.8-30 4.5 1.5 3.5 4.5 6 8 6.5C33 28.5 40 27 50 27s17 1.5 22 4c3.5-.5 6.5-3 8-6.5C74 22 63.3 20 50 20z" fill="#cc0000"/>
      <path d="M50 27L38.5 78h6L50 45l5.5 33h6L50 27z" fill="#cc0000"/>
      <path d="M50 20v7l-11.5 1.5C40 27 44 27 50 27c6 0 10 0 11.5 1.5L50 27v-7z" fill="#cc0000"/>
    </svg>
  )
}

function AmazonLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <text x="13" y="52" fontSize="28" fontWeight="900" fill="#ff9900" fontFamily="Arial Black,sans-serif">amazon</text>
      <path d="M18 62 Q50 75 82 62" stroke="#ff9900" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M79 58 L84 62 L79 66" stroke="#ff9900" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MicrosoftLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="10" y="10" width="37" height="37" fill="#f25022" rx="2"/>
      <rect x="53" y="10" width="37" height="37" fill="#7fba00" rx="2"/>
      <rect x="10" y="53" width="37" height="37" fill="#00a4ef" rx="2"/>
      <rect x="53" y="53" width="37" height="37" fill="#ffb900" rx="2"/>
    </svg>
  )
}

function GoogleLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M90 50c0-2.5-.2-5-.7-7.3H50v13.8h22.5C71.4 62.7 67 68 60.5 71.3v9h13.7C82 74 90 63 90 50z" fill="#4285f4"/>
      <path d="M50 92c11.7 0 21.5-3.9 28.7-10.5l-13.7-9C61.1 75.8 55.8 77 50 77c-11.2 0-20.7-7.6-24.1-17.8H12v9.3C19.1 84.1 33.5 92 50 92z" fill="#34a853"/>
      <path d="M25.9 59.2C25 56.5 24.5 53.8 24.5 51s.5-5.5 1.4-8.2v-9.3H12C8.9 39.7 7 45.2 7 51s1.9 11.3 5 16.5l13.9-8.3z" fill="#fbbc05"/>
      <path d="M50 24c6.3 0 12 2.2 16.4 6.5l12.3-12.3C70.5 10.9 60.7 7 50 7 33.5 7 19.1 14.9 12 28.5l13.9 9.3C29.3 27.6 38.8 24 50 24z" fill="#ea4335"/>
    </svg>
  )
}

function AppleLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M68.5 53c-.1-8 6.5-11.8 6.8-12-3.7-5.4-9.4-6.1-11.5-6.2-4.9-.5-9.5 2.9-12 2.9-2.5 0-6.3-2.8-10.4-2.7-5.3.1-10.2 3.1-12.9 7.9-5.5 9.6-1.4 23.7 3.9 31.5 2.6 3.8 5.7 8 9.8 7.8 3.9-.2 5.4-2.5 10.1-2.5 4.7 0 6 2.5 10.2 2.4 4.2-.1 6.9-3.8 9.5-7.6 3-4.3 4.2-8.5 4.3-8.7-.1-.1-8.7-3.3-8.8-12.8z" fill="#555"/>
      <path d="M60.2 28.5c2.2-2.6 3.6-6.3 3.2-9.9-3.1.1-6.8 2.1-9 4.7-2 2.3-3.7 5.9-3.2 9.4 3.4.3 6.9-1.7 9-4.2z" fill="#555"/>
    </svg>
  )
}

function MetaLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M12 55c0 8 4.5 13 9.5 13 3.5 0 6-1.5 10-7.5L28 71c-4.5 7-9.5 11-16.5 11C3 82 0 74.5 0 65.5V34h12v21z" fill="#0082fb" transform="translate(8, 0)"/>
      <path d="M50 34c-5 0-8.5 2.5-12 7.5 3.5-5 7-7.5 12-7.5 8 0 12.5 6.5 12.5 17.5S58 69 50 69c-5 0-8.5-2.5-12-7.5C41.5 66.5 45 69 50 69c8 0 12.5-6.5 12.5-17.5S58 34 50 34z" fill="#0082fb" transform="translate(8, 0)"/>
      <ellipse cx="50" cy="50" rx="13" ry="18" stroke="#0082fb" strokeWidth="5" fill="none" transform="translate(8, 0)"/>
      <ellipse cx="28" cy="50" rx="13" ry="18" stroke="#0082fb" strokeWidth="5" fill="none" transform="translate(8, 0)"/>
    </svg>
  )
}

function BlackRockLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="10" y="10" width="80" height="80" rx="8" fill="#00a0df" opacity="0.15"/>
      <text x="50" y="44" fontSize="13" fontWeight="900" fill="#00a0df" textAnchor="middle" fontFamily="Arial,sans-serif">BLACK</text>
      <text x="50" y="61" fontSize="13" fontWeight="900" fill="#00a0df" textAnchor="middle" fontFamily="Arial,sans-serif">ROCK</text>
      <rect x="20" y="68" width="60" height="3" rx="1.5" fill="#00a0df" opacity="0.4"/>
    </svg>
  )
}

function GoldmanLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="10" y="10" width="80" height="80" rx="8" fill="#6db6e0" opacity="0.12"/>
      <text x="50" y="42" fontSize="11" fontWeight="900" fill="#6db6e0" textAnchor="middle" fontFamily="Arial,sans-serif">GOLDMAN</text>
      <text x="50" y="57" fontSize="11" fontWeight="900" fill="#6db6e0" textAnchor="middle" fontFamily="Arial,sans-serif">SACHS</text>
      <rect x="20" y="65" width="60" height="2" rx="1" fill="#6db6e0" opacity="0.4"/>
    </svg>
  )
}

function JPMorganLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="10" y="10" width="80" height="80" rx="8" fill="#005eb8" opacity="0.12"/>
      <text x="50" y="44" fontSize="11" fontWeight="900" fill="#005eb8" textAnchor="middle" fontFamily="Arial,sans-serif">JP MORGAN</text>
      <text x="50" y="61" fontSize="10" fontWeight="700" fill="#005eb8" textAnchor="middle" fontFamily="Arial,sans-serif">CHASE &amp; CO.</text>
    </svg>
  )
}

function SamsungLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="50" rx="42" ry="28" stroke="#1428a0" strokeWidth="4" fill="none"/>
      <text x="50" y="56" fontSize="13" fontWeight="900" fill="#1428a0" textAnchor="middle" fontFamily="Arial,sans-serif">SAMSUNG</text>
    </svg>
  )
}

function IntelLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="40" fill="#0071c5" opacity="0.12" stroke="#0071c5" strokeWidth="3"/>
      <text x="50" y="56" fontSize="18" fontWeight="900" fill="#0071c5" textAnchor="middle" fontFamily="Arial,sans-serif">intel</text>
      <circle cx="72" cy="30" r="5" fill="#0071c5"/>
    </svg>
  )
}

function SequoiaLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M50 10 L70 35 L60 35 L75 60 L58 60 L70 85 L50 85 L30 85 L42 60 L25 60 L40 35 L30 35 Z" fill="#e84b3a" opacity="0.9"/>
    </svg>
  )
}

// ── Investor Data ─────────────────────────────────────────────────────────────

const INVESTORS = [
  {
    key: 'nvidia', name: 'NVIDIA', title: 'Technology Partner',
    Logo: NvidiaLogo, color: '#0ea5e9', bg: 'rgba(14, 165, 233,0.06)',
    quote: 'SpaceX Trading is a testament to what becomes possible when you combine aerospace-grade infrastructure with advanced machine learning. The platform\'s ability to autonomously manage mission contracts, equity positions, and asset portfolios simultaneously is a genuinely differentiated achievement in the market.',
    author: 'Jensen Huang', role: 'CEO, NVIDIA Corporation',
    invested: '$2.4B', returns: '+847%',
  },
  {
    key: 'tesla', name: 'Tesla', title: 'Strategic Investor',
    Logo: TeslaLogo, color: '#cc0000', bg: 'rgba(204,0,0,0.06)',
    quote: 'What stood out to us was the platform\'s energy-aware AI engine — it dynamically reallocates capital between mission-contract financing and algorithmic trading based on market conditions. That level of autonomous decision-making is rare. We have seen consistent double-digit monthly returns across our allocated capital.',
    author: 'Elon Musk', role: 'CEO, Tesla, Inc.',
    invested: '$1.8B', returns: '+623%',
  },
  {
    key: 'amazon', name: 'Amazon', title: 'Cloud Infrastructure Partner',
    Logo: AmazonLogo, color: '#ff9900', bg: 'rgba(255,153,0,0.06)',
    quote: 'The platform\'s cloud architecture is built for scale, resilience, and compliance. Its AI-driven approach to managing crypto assets, equities, and shares portfolios in real time is exactly the kind of innovation AWS was designed to power. The risk-adjusted returns we have observed are well above institutional benchmarks.',
    author: 'Andy Jassy', role: 'CEO, Amazon Web Services',
    invested: '$3.1B', returns: '+1,204%',
  },
  {
    key: 'microsoft', name: 'Microsoft', title: 'AI Integration Partner',
    Logo: MicrosoftLogo, color: '#00a4ef', bg: 'rgba(0,164,239,0.06)',
    quote: 'Integrating Azure\'s AI services with SpaceX Trading\'s trading and mission-finance engine produced measurable alpha beyond what either system generates independently. This is the kind of enterprise-level AI deployment that demonstrates real-world ROI — not a proof of concept, but a production platform generating consistent value.',
    author: 'Satya Nadella', role: 'CEO, Microsoft Corporation',
    invested: '$2.7B', returns: '+912%',
  },
  {
    key: 'google', name: 'Google', title: 'Research Partner',
    Logo: GoogleLogo, color: '#4285f4', bg: 'rgba(66,133,244,0.06)',
    quote: 'Our team conducted an independent technical review of the platform\'s algorithmic trading models and mission-contract automation pipeline. The depth of reinforcement learning applied to real-time market data — across both crypto and equities — is among the most sophisticated we have evaluated outside of internal research environments.',
    author: 'Sundar Pichai', role: 'CEO, Alphabet Inc.',
    invested: '$1.5B', returns: '+534%',
  },
  {
    key: 'apple', name: 'Apple', title: 'Institutional Investor',
    Logo: AppleLogo, color: '#888', bg: 'rgba(150,150,150,0.06)',
    quote: 'We assess investment platforms on three criteria: security architecture, user experience, and performance consistency. SpaceX Trading excels on all three. The platform manages mission-contract financing and stocks and shares trading with the kind of precision and clarity that institutional investors expect but rarely receive.',
    author: 'Tim Cook', role: 'CEO, Apple Inc.',
    invested: '$4.2B', returns: '+1,455%',
  },
  {
    key: 'meta', name: 'Meta', title: 'Strategic Partner',
    Logo: MetaLogo, color: '#0082fb', bg: 'rgba(0,130,251,0.06)',
    quote: 'From an infrastructure standpoint, the platform\'s distributed AI system handles market volatility exceptionally well. The seamless integration of automated stock trading and AI-managed mission contracts under a single intelligent layer represents a meaningful step forward for the broader fintech ecosystem.',
    author: 'Mark Zuckerberg', role: 'CEO, Meta Platforms',
    invested: '$890M', returns: '+378%',
  },
  {
    key: 'blackrock', name: 'BlackRock', title: 'Institutional Investor',
    Logo: BlackRockLogo, color: '#00a0df', bg: 'rgba(0,160,223,0.06)',
    quote: 'BlackRock evaluates hundreds of alternative investment platforms each year. SpaceX Trading stands out for its disciplined approach to risk management and its ability to generate alpha across diverse asset classes — from digital currencies to listed equities and shares. It has earned its place in our high-performance alternatives portfolio.',
    author: 'Larry Fink', role: 'Chairman & CEO, BlackRock',
    invested: '$6.5B', returns: '+2,100%',
  },
  {
    key: 'goldman', name: 'Goldman Sachs', title: 'Financial Partner',
    Logo: GoldmanLogo, color: '#6db6e0', bg: 'rgba(109,182,224,0.06)',
    quote: 'Following a comprehensive due diligence process, Goldman Sachs is confident in recommending SpaceX Trading to select institutional clients. The platform demonstrates a mature risk framework, transparent reporting, and a proven track record of delivering above-market returns across crypto, equities, and shares.',
    author: 'David Solomon', role: 'CEO, Goldman Sachs Group',
    invested: '$3.8B', returns: '+1,340%',
  },
  {
    key: 'jpmorgan', name: 'JPMorgan', title: 'Banking Partner',
    Logo: JPMorganLogo, color: '#005eb8', bg: 'rgba(0,94,184,0.06)',
    quote: 'JPMorgan has long advocated for regulated, technology-driven approaches to digital asset investment. SpaceX Trading\'s integrated model — combining automated mission-contract financing with AI-powered stock and shares trading — meets our compliance standards and consistently delivers institutional-quality performance.',
    author: 'Jamie Dimon', role: 'Chairman & CEO, JPMorgan Chase',
    invested: '$5.1B', returns: '+1,680%',
  },
  {
    key: 'samsung', name: 'Samsung', title: 'Hardware Partner',
    Logo: SamsungLogo, color: '#1428a0', bg: 'rgba(20,40,160,0.06)',
    quote: 'Samsung\'s semiconductor division has worked closely with the SpaceX Trading engineering team to optimize platform throughput at the hardware level. The platform\'s efficiency metrics are among the best we have benchmarked globally, and the integration with automated equity trading adds a compelling second revenue stream.',
    author: 'Jong-Hee Han', role: 'Co-CEO, Samsung Electronics',
    invested: '$2.2B', returns: '+756%',
  },
  {
    key: 'intel', name: 'Intel', title: 'Compute Partner',
    Logo: IntelLogo, color: '#0071c5', bg: 'rgba(0,113,197,0.06)',
    quote: 'Intel\'s data center division has been privileged to support the compute backbone behind SpaceX Trading. The platform\'s dual approach — AI-automated mission-contract financing alongside real-time stocks and shares portfolio management — demonstrates how high-performance computing can generate measurable financial returns at scale.',
    author: 'Pat Gelsinger', role: 'CEO, Intel Corporation',
    invested: '$1.1B', returns: '+412%',
  },
]

// ── Page Component ────────────────────────────────────────────────────────────

export default function InvestorsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #0a0a0a)', color: 'var(--text-primary, #fff)', fontFamily: 'Inter,sans-serif' }}>

      {/* Nav */}
      <nav style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#0ea5e9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#000' }}>S</div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>SpaceX Trading</span>
        </Link>
        <Link to="/" style={{ color: '#0ea5e9', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>← Back to Home</Link>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 24px 60px' }}>
        <div style={{ display: 'inline-block', background: 'rgba(14, 165, 233,0.1)', border: '1px solid rgba(14, 165, 233,0.3)', borderRadius: 100, padding: '6px 18px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>
          Industry Trust &amp; Partnerships
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, margin: '0 0 20px', lineHeight: 1.1 }}>
          Trusted by the World's<br/>
          <span style={{ color: '#0ea5e9' }}>Top Investors & Leaders</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 660, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.8 }}>
          <strong style={{ color: '#fff' }}>SpaceX Trading</strong> is the world's leading AI-powered platform for automated mission-contract financing, stocks trading, and shares investment. Below are the global institutions and Fortune 500 companies that have placed their trust — and their capital — in our platform.
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(24px,5vw,80px)', flexWrap: 'wrap', padding: '0 24px 60px' }}>
        {[
          { v: '$31.4B+', l: 'Total Invested' },
          { v: '12', l: 'Fortune 500 Partners' },
          { v: '+847%', l: 'Avg. Annual Returns' },
          { v: '100%', l: 'Satisfaction Rate' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, color: '#0ea5e9' }}>{s.v}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Investor Cards Grid ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: 48 }}>
          Our Partners &amp; Investors
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {INVESTORS.map(inv => (
            <div key={inv.key} style={{
              background: inv.bg,
              border: `1px solid ${inv.color}30`,
              borderRadius: 16,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${inv.color}20` }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <inv.Logo size={52} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: inv.color }}>{inv.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{inv.title}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: inv.color }}>{inv.invested}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Invested</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(14, 165, 233,0.06)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0ea5e9' }}>{inv.returns}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Returns</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── What They Say ── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', background: 'rgba(14, 165, 233,0.1)', border: '1px solid rgba(14, 165, 233,0.3)', borderRadius: 100, padding: '6px 18px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 16 }}>
              Testimonials
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, margin: 0 }}>
              What Industry Leaders Say About Us
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 28 }}>
            {INVESTORS.map(inv => (
              <div key={inv.key} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: 32,
                position: 'relative',
              }}>
                <div style={{ fontSize: '3rem', lineHeight: 1, color: inv.color, opacity: 0.4, fontFamily: 'Georgia,serif', position: 'absolute', top: 16, left: 24 }}>"</div>
                <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, fontSize: '0.92rem', margin: '24px 0 24px', fontStyle: 'italic' }}>
                  {inv.quote}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
                  <inv.Logo size={40} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{inv.author}</div>
                    <div style={{ color: inv.color, fontSize: '0.78rem', marginTop: 2 }}>{inv.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, marginBottom: 16 }}>
          Join the World's Smartest Investors
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>Start investing alongside Fortune 500 companies today.</p>
        <Link to="/register" style={{
          display: 'inline-block', background: '#0ea5e9', color: '#000',
          fontWeight: 800, fontSize: '1rem', padding: '14px 40px',
          borderRadius: 10, textDecoration: 'none', letterSpacing: '0.3px',
        }}>
          Get Started Free →
        </Link>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
        © 2026 SpaceX Trading · <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
      </div>

      <LiveChatWidget />
    </div>
  )
}
