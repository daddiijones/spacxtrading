import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import LiveChatWidget from '../components/LiveChatWidget'

// ── Inline SVG logos for the Trusted By marquee ─────────────────────────────
function MsftIcon() {
  return <svg width="22" height="22" viewBox="0 0 100 100" fill="none"><rect x="5" y="5" width="43" height="43" fill="#f25022" rx="2"/><rect x="52" y="5" width="43" height="43" fill="#7fba00" rx="2"/><rect x="5" y="52" width="43" height="43" fill="#00a4ef" rx="2"/><rect x="52" y="52" width="43" height="43" fill="#ffb900" rx="2"/></svg>
}
function TeslaIcon() {
  return <svg width="22" height="22" viewBox="0 0 100 100" fill="none"><path d="M50 20c-13 0-24 1.8-30 4.5 1.5 3.5 4.5 6 8 6.5C33 28.5 40 27 50 27s17 1.5 22 4c3.5-.5 6.5-3 8-6.5C74 22 63 20 50 20z" fill="#cc0000"/><path d="M50 27L38.5 78h6L50 45l5.5 33h6L50 27z" fill="#cc0000"/></svg>
}
function AmazonIcon() {
  return <svg width="22" height="22" viewBox="0 0 100 100" fill="none"><text x="10" y="54" fontSize="28" fontWeight="900" fill="#ff9900" fontFamily="Arial Black,sans-serif">a</text><path d="M8 62 Q30 72 55 62" stroke="#ff9900" strokeWidth="5" fill="none" strokeLinecap="round"/><path d="M52 58 L57 62 L52 66" stroke="#ff9900" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function GoogleIcon() {
  return <svg width="22" height="22" viewBox="0 0 100 100" fill="none"><path d="M90 50c0-2.5-.2-5-.7-7.3H50v13.8h22.5C71.4 62.7 67 68 60.5 71.3v9h13.7C82 74 90 63 90 50z" fill="#4285f4"/><path d="M50 92c11.7 0 21.5-3.9 28.7-10.5l-13.7-9C61.1 75.8 55.8 77 50 77c-11.2 0-20.7-7.6-24.1-17.8H12v9.3C19.1 84.1 33.5 92 50 92z" fill="#34a853"/><path d="M25.9 59.2C25 56.5 24.5 53.8 24.5 51s.5-5.5 1.4-8.2v-9.3H12C8.9 39.7 7 45.2 7 51s1.9 11.3 5 16.5l13.9-8.3z" fill="#fbbc05"/><path d="M50 24c6.3 0 12 2.2 16.4 6.5l12.3-12.3C70.5 10.9 60.7 7 50 7 33.5 7 19.1 14.9 12 28.5l13.9 9.3C29.3 27.6 38.8 24 50 24z" fill="#ea4335"/></svg>
}
function AppleIcon() {
  return <svg width="22" height="22" viewBox="0 0 100 100" fill="none"><path d="M68.5 53c-.1-8 6.5-11.8 6.8-12-3.7-5.4-9.4-6.1-11.5-6.2-4.9-.5-9.5 2.9-12 2.9-2.5 0-6.3-2.8-10.4-2.7-5.3.1-10.2 3.1-12.9 7.9-5.5 9.6-1.4 23.7 3.9 31.5 2.6 3.8 5.7 8 9.8 7.8 3.9-.2 5.4-2.5 10.1-2.5 4.7 0 6 2.5 10.2 2.4 4.2-.1 6.9-3.8 9.5-7.6 3-4.3 4.2-8.5 4.3-8.7-.1-.1-8.7-3.3-8.8-12.8z" fill="#888"/><path d="M60.2 28.5c2.2-2.6 3.6-6.3 3.2-9.9-3.1.1-6.8 2.1-9 4.7-2 2.3-3.7 5.9-3.2 9.4 3.4.3 6.9-1.7 9-4.2z" fill="#888"/></svg>
}
function MetaIcon() {
  return <svg width="22" height="22" viewBox="0 0 100 100" fill="none"><ellipse cx="32" cy="50" rx="14" ry="19" stroke="#0082fb" strokeWidth="6" fill="none"/><ellipse cx="68" cy="50" rx="14" ry="19" stroke="#0082fb" strokeWidth="6" fill="none"/></svg>
}
function NvidiaIcon() {
  return <svg width="22" height="22" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="42" fill="#0ea5e9"/><path d="M38 34v32l8-8V42l16 16 8-8L50 30l-12 4z" fill="#fff"/></svg>
}
function BRockIcon() {
  return <svg width="22" height="22" viewBox="0 0 100 100" fill="none"><rect x="8" y="8" width="84" height="84" rx="8" fill="#00a0df" opacity="0.2" stroke="#00a0df" strokeWidth="3"/><text x="50" y="44" fontSize="14" fontWeight="900" fill="#00a0df" textAnchor="middle" fontFamily="Arial,sans-serif">BLACK</text><text x="50" y="62" fontSize="14" fontWeight="900" fill="#00a0df" textAnchor="middle" fontFamily="Arial,sans-serif">ROCK</text></svg>
}
function GoldmanIcon() {
  return <svg width="22" height="22" viewBox="0 0 100 100" fill="none"><rect x="8" y="8" width="84" height="84" rx="8" fill="#6db6e0" opacity="0.15" stroke="#6db6e0" strokeWidth="3"/><text x="50" y="44" fontSize="12" fontWeight="900" fill="#6db6e0" textAnchor="middle" fontFamily="Arial,sans-serif">GOLDMAN</text><text x="50" y="60" fontSize="12" fontWeight="900" fill="#6db6e0" textAnchor="middle" fontFamily="Arial,sans-serif">SACHS</text></svg>
}
function JPMIcon() {
  return <svg width="22" height="22" viewBox="0 0 100 100" fill="none"><rect x="8" y="8" width="84" height="84" rx="8" fill="#005eb8" opacity="0.15" stroke="#005eb8" strokeWidth="3"/><text x="50" y="48" fontSize="11" fontWeight="900" fill="#005eb8" textAnchor="middle" fontFamily="Arial,sans-serif">JPMORGAN</text><text x="50" y="64" fontSize="10" fontWeight="700" fill="#005eb8" textAnchor="middle" fontFamily="Arial,sans-serif">CHASE</text></svg>
}
function SamsungIcon() {
  return <svg width="22" height="22" viewBox="0 0 100 100" fill="none"><ellipse cx="50" cy="50" rx="44" ry="30" stroke="#1428a0" strokeWidth="5" fill="none"/><text x="50" y="56" fontSize="14" fontWeight="900" fill="#1428a0" textAnchor="middle" fontFamily="Arial,sans-serif">SAMSUNG</text></svg>
}
function IntelIcon() {
  return <svg width="22" height="22" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="42" fill="#0071c5" opacity="0.15" stroke="#0071c5" strokeWidth="4"/><text x="50" y="57" fontSize="20" fontWeight="900" fill="#0071c5" textAnchor="middle" fontFamily="Arial,sans-serif">intel</text></svg>
}

const MARQUEE_ITEMS = [
  { Icon: NvidiaIcon, name: 'NVIDIA', color: '#0ea5e9', bg: 'rgba(14, 165, 233,0.08)', border: 'rgba(14, 165, 233,0.25)' },
  { Icon: TeslaIcon, name: 'Tesla', color: '#cc0000', bg: 'rgba(204,0,0,0.08)', border: 'rgba(204,0,0,0.25)' },
  { Icon: AmazonIcon, name: 'Amazon', color: '#ff9900', bg: 'rgba(255,153,0,0.08)', border: 'rgba(255,153,0,0.25)' },
  { Icon: MsftIcon, name: 'Microsoft', color: '#00a4ef', bg: 'rgba(0,164,239,0.08)', border: 'rgba(0,164,239,0.25)' },
  { Icon: GoogleIcon, name: 'Google', color: '#4285f4', bg: 'rgba(66,133,244,0.08)', border: 'rgba(66,133,244,0.25)' },
  { Icon: AppleIcon, name: 'Apple', color: '#a2aaad', bg: 'rgba(162,170,173,0.08)', border: 'rgba(162,170,173,0.2)' },
  { Icon: MetaIcon, name: 'Meta', color: '#0082fb', bg: 'rgba(0,130,251,0.08)', border: 'rgba(0,130,251,0.25)' },
  { Icon: BRockIcon, name: 'BlackRock', color: '#00a0df', bg: 'rgba(0,160,223,0.08)', border: 'rgba(0,160,223,0.25)' },
  { Icon: GoldmanIcon, name: 'Goldman Sachs', color: '#6db6e0', bg: 'rgba(109,182,224,0.08)', border: 'rgba(109,182,224,0.25)' },
  { Icon: JPMIcon, name: 'JPMorgan', color: '#005eb8', bg: 'rgba(0,94,184,0.08)', border: 'rgba(0,94,184,0.25)' },
  { Icon: SamsungIcon, name: 'Samsung', color: '#1428a0', bg: 'rgba(20,40,160,0.08)', border: 'rgba(20,40,160,0.25)' },
  { Icon: IntelIcon, name: 'Intel', color: '#0071c5', bg: 'rgba(0,113,197,0.08)', border: 'rgba(0,113,197,0.25)' },
]
import { miningApi } from '../utils/api'
import {
  Rocket, Shield, Zap, TrendingUp, Users, Globe, ArrowRight,
  Check, ChevronRight, Lock, BarChart3, Wallet,
  Clock, Award, Layers, Star, Menu, X, ExternalLink
} from 'lucide-react'

/* ─── Animated Counter ─── */
function Counter({ end, suffix = '', prefix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const startTime = Date.now()
        const tick = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * end))
          if (progress < 1) requestAnimationFrame(tick)
        }
        tick()
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

/* ─── Crypto ticker ─── */
const cryptos = [
  { symbol: 'BTC', name: 'Bitcoin', price: '67,540', change: '+2.4%', up: true },
  { symbol: 'ETH', name: 'Ethereum', price: '3,812', change: '+1.8%', up: true },
  { symbol: 'BNB', name: 'BNB', price: '612', change: '+0.9%', up: true },
  { symbol: 'SOL', name: 'Solana', price: '172', change: '+5.2%', up: true },
  { symbol: 'LTC', name: 'Litecoin', price: '85', change: '-0.3%', up: false },
  { symbol: 'USDT', name: 'Tether', price: '1.00', change: '0.0%', up: true },
]

const plans = [
  { name: 'Falcon 1 Liftoff Array', hash: '420 kN Thrust Class', roi: '1.5%', price: '$50', duration: '30 days', popular: false, tier: 'starter' },
  { name: 'Falcon Heavy', hash: '22,819 kN Thrust Class', roi: '2.2%', price: '$1,000', duration: '30 days', popular: true, tier: 'professional' },
  { name: 'Starship Super Heavy', hash: '74,500 kN Thrust Class', roi: '3.0%', price: '$10,000', duration: '30 days', popular: false, tier: 'enterprise' },
  { name: 'Starbase Mars Fleet', hash: 'Interplanetary Thrust Class', roi: '4.0%', price: '$50,000', duration: '30 days', popular: false, tier: 'vip' },
]

const allTestimonials = [
  { name: 'James W.', role: 'Investor', country: '🇺🇸', text: 'SpaceX Trading has completely changed my passive income strategy. Consistent returns every single day.', stars: 5 },
  { name: 'Maria K.', role: 'Trader', country: '🇩🇪', text: "The platform is incredibly user-friendly. I launched my first contract within minutes of signing up.", stars: 5 },
  { name: 'David L.', role: 'Business Owner', country: '🇬🇧', text: 'Enterprise plan delivers exactly as promised. The dedicated manager is a huge plus.', stars: 5 },
  { name: 'Sarah M.', role: 'Engineer', country: '🇨🇦', text: "I've tried 5 different investment platforms. SpaceX Trading is the only one with real, consistent payouts.", stars: 5 },
  { name: 'Ahmed R.', role: 'Freelancer', country: '🇦🇪', text: "Earning $200/day passively while I focus on my main work. Life-changing platform!", stars: 5 },
  { name: 'Liu Wei', role: 'Analyst', country: '🇸🇬', text: "The transparency is what sold me. I can verify every payout on the blockchain.", stars: 5 },
  { name: 'Elena P.', role: 'Entrepreneur', country: '🇫🇷', text: "Started with the Falcon 1 plan, now running Starship contracts. Returns compounded beautifully.", stars: 5 },
  { name: 'Michael T.', role: 'Retired', country: '🇦🇺', text: "Finally a platform I can trust for retirement income. 6 months and counting.", stars: 5 },
  { name: 'Olga S.', role: 'Teacher', country: '🇵🇱', text: "Even with a small investment, the returns are impressive. Great referral program too!", stars: 5 },
  { name: 'Carlos R.', role: 'Developer', country: '🇧🇷', text: "Clean UI, fast withdrawals, transparent blockchain proofs. Everything an investor needs.", stars: 5 },
  { name: 'Aisha N.', role: 'Student', country: '🇳🇬', text: "Referred 15 friends and earned over $3,000 in commissions alone. Amazing program!", stars: 5 },
  { name: 'Tomo H.', role: 'Day Trader', country: '🇯🇵', text: "My contracts run 24/7 even when I sleep. My daily ROI has been incredibly consistent.", stars: 5 },
]

/* ─── Live Payouts Generator ─── */
// Links go to each chain's live recent-transactions feed so they always resolve
const EXPLORER_URLS = {
  BTC: 'https://www.blockchain.com/explorer/transactions/btc',
  ETH: 'https://etherscan.io/txs',
  USDT: 'https://tronscan.org/#/transaction/list',
  LTC: 'https://blockchair.com/litecoin/transactions',
  BNB: 'https://bscscan.com/txs',
  SOL: 'https://solscan.io/txs',
}

const NAMES = ['Alex M.', 'Chen W.', 'Emma S.', 'Raj P.', 'Ana G.', 'John D.', 'Yuki T.', 'Omar K.', 'Lisa F.', 'Hans B.', 'Fatima A.', 'Pedro L.', 'Min J.', 'Kate R.', 'Ivan S.', 'Rosa M.', 'Tom W.', 'Nina V.', 'Sam K.', 'Leah D.']
const CRYPTO_KEYS = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'LTC']

function genTxHash(crypto) {
  const chars = '0123456789abcdef'
  const len = crypto === 'SOL' ? 88 : 64
  const prefix = crypto === 'ETH' || crypto === 'BNB' ? '0x' : ''
  let hash = ''
  for (let i = 0; i < len; i++) hash += chars[Math.floor(Math.random() * chars.length)]
  return prefix + hash
}

function genPayout() {
  const crypto = CRYPTO_KEYS[Math.floor(Math.random() * CRYPTO_KEYS.length)]
  const amounts = { BTC: [0.001, 0.15], ETH: [0.01, 2.5], USDT: [50, 15000], LTC: [0.1, 20], BNB: [0.01, 5], SOL: [0.5, 50] }
  const [min, max] = amounts[crypto]
  const amount = (Math.random() * (max - min) + min).toFixed(crypto === 'USDT' ? 2 : 4)
  const txHash = genTxHash(crypto)
  return {
    id: Math.random(), name: NAMES[Math.floor(Math.random() * NAMES.length)],
    crypto, amount, txHash,
    url: EXPLORER_URLS[crypto],
    time: `${Math.floor(Math.random() * 58) + 1}m ago`
  }
}

function LivePayouts() {
  const [payouts, setPayouts] = useState(() => Array.from({ length: 8 }, genPayout))

  useEffect(() => {
    const interval = setInterval(() => {
      setPayouts(prev => [genPayout(), ...prev.slice(0, 9)])
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {payouts.map((p, i) => (
        <div key={p.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
            background: i === 0 ? 'rgba(0,212,255,0.06)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${i === 0 ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)'}`,
            borderRadius: 10, transition: 'all 0.3s ease',
            animation: i === 0 ? 'fadeIn 0.5s ease' : 'none'
          }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Check size={16} style={{ color: '#10b981' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#f1f5f9' }}>{p.name}</div>
            <div style={{ fontSize: '0.68rem', color: '#475569', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.txHash.slice(0, 18)}…{p.txHash.slice(-6)}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#10b981' }}>+{p.amount} {p.crypto}</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{p.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

const T = {
  en: {
    navHome: "Home",
    navFeatures: "Features",
    navPlans: "Plans",
    navFaq: "FAQ",
    navReviews: "Reviews",
    navLogin: "Sign In",
    navRegister: "Launch Account",
    heroBadge: "Aerospace-Grade Investment Infrastructure",
    heroTitlePart1: "Launch Your Capital Into",
    heroTitlePart2: "Orbit-Class Returns",
    heroSubtitle: "Deploy capital across our Falcon, Dragon, and Starship investment fleet. Scale your portfolio with dynamic daily returns, engineered with the same precision SpaceX brings to every launch.",
    ctaDeploy: "Launch Your Portfolio",
    ctaWhitepaper: "View Mission Plans",
    activeNodes: "Active Investment Contracts",
    hashrateTitle: "Total Yield Distributed",
    usersTitle: "Verified Investors",
    payoutTitle: "Payouts",
    featuresTitle: "Engineered for Liftoff",
    featuresSub: "Mission-grade infrastructure built to launch your capital further and return it safely, every single day.",
    feat1Title: "Falcon-Class Reliability",
    feat1Desc: "Invest in reusable, battle-tested contract plans engineered for consistent daily performance.",
    feat2Title: "Full-Stack Scale",
    feat2Desc: "From a single Falcon 1 contract to a full Starship fleet allocation, scale your capital up to 45x faster with compounding returns.",
    feat3Title: "Real-Time Mission Telemetry",
    feat3Desc: "Track your returns live as they accrue, credited directly to your wallet every single day.",
    step1Title: "Create Account",
    step1Desc: "Sign up in seconds with just your email. No KYC required to start.",
    step2Title: "Make a Deposit",
    step2Desc: "Choose from 6 cryptocurrencies. BTC, ETH, USDT, LTC, BNB, or SOL.",
    step3Title: "Earn Daily",
    step3Desc: "Select a plan and start earning. Withdraw anytime, anywhere.",
    plansTitle: "The SpaceX Trading Fleet",
    plansSub: "Choose a launch vehicle to deploy your capital into and start generating daily returns.",
    deployNodeBtn: "Launch This Plan",
    testimonialsTitle: "Investor Flight Logs",
    testimonialsSub: "Read what investors around the world are saying about their missions with us.",
    faqTitle: "Mission Control & FAQ",
    faqSub: "Essential questions about contract allocations, fleet capacity, and payout processing.",
    faq1Q: "How does a mission contract work?",
    faq1A: "Once you select a launch vehicle plan, your contract activates instantly and your capital deploys into our secure investment fleet. Operations are fully managed, and your accrued returns update dynamically every 24 hours.",
    faq2Q: "Can I launch multiple mission contracts at once?",
    faq2A: "Absolutely. You can launch contracts across different vehicle tiers (Falcon, Dragon, Starship, etc.) to diversify and scale your portfolio.",
    faq3Q: "What cryptocurrencies are supported for funding a launch?",
    faq3A: "We accept Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Litecoin (LTC), Binance Coin (BNB), and Solana (SOL) for instant deposits and payouts."
  },
  de: {
    navHome: "Startseite",
    navFeatures: "Merkmale",
    navPlans: "Pläne",
    navFaq: "FAQ",
    navReviews: "Bewertungen",
    navLogin: "Anmelden",
    navRegister: "Konto starten",
    heroBadge: "Investitionsinfrastruktur in Raumfahrtqualität",
    heroTitlePart1: "Bringen Sie Ihr Kapital auf",
    heroTitlePart2: "Orbit-Klasse-Renditen",
    heroSubtitle: "Verteilen Sie Ihr Kapital auf unsere Falcon-, Dragon- und Starship-Investmentflotte. Skalieren Sie Ihr Portfolio mit dynamischen täglichen Renditen – mit der gleichen Präzision, die SpaceX bei jedem Start an den Tag legt.",
    ctaDeploy: "Portfolio starten",
    ctaWhitepaper: "Missionspläne ansehen",
    activeNodes: "Aktive Anlageverträge",
    hashrateTitle: "Gesamt ausgezahlte Rendite",
    usersTitle: "Verifizierte Investoren",
    payoutTitle: "Auszahlungen",
    featuresTitle: "Entwickelt für den Start",
    featuresSub: "Infrastruktur in Missionsqualität, die Ihr Kapital weiter trägt und es jeden Tag sicher zurückbringt.",
    feat1Title: "Falcon-Klasse Zuverlässigkeit",
    feat1Desc: "Investieren Sie in wiederverwendbare, bewährte Vertragspläne für konstante tägliche Leistung.",
    feat2Title: "Vollständige Skalierung",
    feat2Desc: "Von einem einzelnen Falcon-1-Vertrag bis zur vollen Starship-Flottenzuteilung – skalieren Sie Ihr Kapital bis zu 45x schneller mit Zinseszins-Renditen.",
    feat3Title: "Echtzeit-Missions-Telemetrie",
    feat3Desc: "Verfolgen Sie Ihre Renditen live, während sie anfallen, und direkt jeden Tag Ihrem Wallet gutgeschrieben werden.",
    step1Title: "Konto erstellen",
    step1Desc: "Registrieren Sie sich in Sekunden mit Ihrer E-Mail. Kein KYC erforderlich.",
    step2Title: "Einzahlung tätigen",
    step2Desc: "Wählen Sie aus 6 Kryptowährungen. BTC, ETH, USDT, LTC, BNB oder SOL.",
    step3Title: "Täglich verdienen",
    step3Desc: "Wählen Sie einen Missionsplan aus und beginnen Sie zu verdienen. Jederzeit abheben.",
    plansTitle: "Die SpaceX Trading Flotte",
    plansSub: "Wählen Sie ein Trägersystem, um Ihr Kapital einzusetzen und tägliche Renditen zu erzielen.",
    deployNodeBtn: "Plan starten",
    testimonialsTitle: "Flugprotokolle der Investoren",
    testimonialsSub: "Lesen Sie, was Investoren weltweit über ihre Missionen mit uns sagen.",
    faqTitle: "Missionskontrolle & FAQ",
    faqSub: "Wesentliche Fragen zu Vertragszuteilungen, Flottenkapazität und Auszahlungsabwicklung.",
    faq1Q: "Wie funktioniert ein Missionsvertrag?",
    faq1A: "Nach der Auswahl eines Trägersystem-Plans wird Ihr Vertrag sofort aktiviert und Ihr Kapital in unsere sichere Investmentflotte eingesetzt. Der Betrieb wird vollständig verwaltet, und Ihre aufgelaufenen Renditen aktualisieren sich alle 24 Stunden.",
    faq2Q: "Kann ich mehrere Missionsverträge gleichzeitig starten?",
    faq2A: "Absolut. Sie können Verträge über verschiedene Trägersystem-Stufen (Falcon, Dragon, Starship usw.) starten, um Ihr Portfolio zu diversifizieren und zu skalieren.",
    faq3Q: "Welche Kryptowährungen werden zur Finanzierung eines Starts unterstützt?",
    faq3A: "Wir akzeptieren Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Litecoin (LTC), Binance Coin (BNB) und Solana (SOL) für sofortige Einzahlungen und Auszahlungen."
  },
  fr: {
    navHome: "Accueil",
    navFeatures: "Fonctionnalités",
    navPlans: "Offres",
    navFaq: "FAQ",
    navReviews: "Avis",
    navLogin: "Connexion",
    navRegister: "Lancer un Compte",
    heroBadge: "Infrastructure d'Investissement de Qualité Aérospatiale",
    heroTitlePart1: "Propulsez Votre Capital Vers des",
    heroTitlePart2: "Rendements de Classe Orbitale",
    heroSubtitle: "Déployez votre capital sur notre flotte d'investissement Falcon, Dragon et Starship. Faites évoluer votre portefeuille avec des rendements quotidiens dynamiques, conçus avec la même précision que SpaceX apporte à chaque lancement.",
    ctaDeploy: "Lancer Mon Portefeuille",
    ctaWhitepaper: "Voir les Plans de Mission",
    activeNodes: "Contrats d'Investissement Actifs",
    hashrateTitle: "Rendement Total Distribué",
    usersTitle: "Investisseurs Vérifiés",
    payoutTitle: "Distribution des Gains",
    featuresTitle: "Conçu pour le Décollage",
    featuresSub: "Infrastructure de qualité mission, conçue pour propulser votre capital plus loin et le ramener en toute sécurité, chaque jour.",
    feat1Title: "Fiabilité de Classe Falcon",
    feat1Desc: "Investissez dans des plans réutilisables et éprouvés, conçus pour une performance quotidienne constante.",
    feat2Title: "Échelle Intégrale",
    feat2Desc: "D'un simple contrat Falcon 1 à une allocation complète de flotte Starship, faites croître votre capital jusqu'à 45x plus vite grâce aux rendements composés.",
    feat3Title: "Télémétrie de Mission en Temps Réel",
    feat3Desc: "Suivez vos rendements en direct, crédités chaque jour directement sur votre portefeuille.",
    step1Title: "Créer un compte",
    step1Desc: "Inscrivez-vous en quelques secondes. Aucun KYC requis pour commencer.",
    step2Title: "Faire un dépôt",
    step2Desc: "Choisissez parmi 6 cryptomonnaies : BTC, ETH, USDT, LTC, BNB ou SOL.",
    step3Title: "Gagner chaque jour",
    step3Desc: "Sélectionnez un plan de mission et commencez à gagner. Retrait à tout moment.",
    plansTitle: "La Flotte SpaceX Trading",
    plansSub: "Choisissez un véhicule de lancement pour déployer votre capital et générer des rendements quotidiens.",
    deployNodeBtn: "Lancer ce Plan",
    testimonialsTitle: "Journaux de Vol des Investisseurs",
    testimonialsSub: "Découvrez ce que disent les investisseurs du monde entier sur leurs missions avec nous.",
    faqTitle: "Contrôle de Mission & FAQ",
    faqSub: "Questions essentielles sur les allocations de contrats, la capacité de la flotte et le traitement des paiements.",
    faq1Q: "Comment fonctionne un contrat de mission ?",
    faq1A: "Dès la sélection d'un plan de véhicule de lancement, votre contrat s'active instantanément et votre capital est déployé dans notre flotte d'investissement sécurisée. Les opérations sont entièrement gérées et vos rendements accumulés se mettent à jour toutes les 24 heures.",
    faq2Q: "Puis-je lancer plusieurs contrats de mission à la fois ?",
    faq2A: "Tout à fait. Vous pouvez lancer des contrats sur différents niveaux de véhicules (Falcon, Dragon, Starship, etc.) pour diversifier et faire évoluer votre portefeuille.",
    faq3Q: "Quelles cryptomonnaies sont acceptées pour financer un lancement ?",
    faq3A: "Nous acceptons le Bitcoin (BTC), l'Ethereum (ETH), le Tether (USDT), le Litecoin (LTC), le BNB et le Solana (SOL) pour des dépôts et paiements instantanés."
  },
  es: {
    navHome: "Inicio",
    navFeatures: "Características",
    navPlans: "Planes",
    navFaq: "FAQ",
    navReviews: "Reseñas",
    navLogin: "Iniciar Sesión",
    navRegister: "Lanzar Cuenta",
    heroBadge: "Infraestructura de Inversión de Grado Aeroespacial",
    heroTitlePart1: "Impulse su Capital Hacia",
    heroTitlePart2: "Rendimientos de Clase Orbital",
    heroSubtitle: "Despliegue su capital en nuestra flota de inversión Falcon, Dragon y Starship. Escale su portafolio con rendimientos diarios dinámicos, diseñados con la misma precisión que SpaceX aplica en cada lanzamiento.",
    ctaDeploy: "Lanzar mi Portafolio",
    ctaWhitepaper: "Ver Planes de Misión",
    activeNodes: "Contratos de Inversión Activos",
    hashrateTitle: "Rendimiento Total Distribuido",
    usersTitle: "Inversores Verificados",
    payoutTitle: "Pagos Distribuidos",
    featuresTitle: "Diseñado para el Despegue",
    featuresSub: "Infraestructura de grado misión, construida para impulsar su capital más lejos y devolverlo de forma segura, todos los días.",
    feat1Title: "Fiabilidad Clase Falcon",
    feat1Desc: "Invierta en planes reutilizables y probados, diseñados para un rendimiento diario constante.",
    feat2Title: "Escala Integral",
    feat2Desc: "Desde un solo contrato Falcon 1 hasta una asignación completa de la flota Starship, escale su capital hasta 45 veces más rápido con rendimientos compuestos.",
    feat3Title: "Telemetría de Misión en Tiempo Real",
    feat3Desc: "Siga sus rendimientos en vivo a medida que se acumulan, acreditados directamente en su billetera todos los días.",
    step1Title: "Crear Cuenta",
    step1Desc: "Regístrese en segundos con su correo. No se requiere KYC para comenzar.",
    step2Title: "Hacer un Depósito",
    step2Desc: "Elija entre 6 criptomonedas compatibles: BTC, ETH, USDT, LTC, BNB o SOL.",
    step3Title: "Gane Diariamente",
    step3Desc: "Seleccione un plan de misión y comience a ganar. Retire cuando quiera.",
    plansTitle: "La Flota de SpaceX Trading",
    plansSub: "Elija un vehículo de lanzamiento para desplegar su capital y comenzar a generar rendimientos diarios.",
    deployNodeBtn: "Lanzar este Plan",
    testimonialsTitle: "Bitácoras de Vuelo de Inversores",
    testimonialsSub: "Lea lo que dicen los inversores de todo el mundo sobre sus misiones con nosotros.",
    faqTitle: "Control de Misión y FAQ",
    faqSub: "Preguntas esenciales sobre asignación de contratos, capacidad de la flota y procesamiento de pagos.",
    faq1Q: "¿Cómo funciona un contrato de misión?",
    faq1A: "Al seleccionar un plan de vehículo de lanzamiento, su contrato se activa al instante y su capital se despliega en nuestra flota de inversión segura. Las operaciones están totalmente gestionadas y sus rendimientos acumulados se actualizan cada 24 horas.",
    faq2Q: "¿Puedo lanzar varios contratos de misión a la vez?",
    faq2A: "Sí. Puede lanzar contratos en diferentes niveles de vehículos (Falcon, Dragon, Starship, etc.) para diversificar y escalar su portafolio.",
    faq3Q: "¿Qué criptomonedas se aceptan para financiar un lanzamiento?",
    faq3A: "Aceptamos Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Litecoin (LTC), Binance Coin (BNB) y Solana (SOL) para depósitos y pagos instantáneos."
  },
  zh: {
    navHome: "首页",
    navFeatures: "技术特性",
    navPlans: "投资方案",
    navFaq: "常见问题",
    navReviews: "用户评价",
    navLogin: "登录系统",
    navRegister: "启动账户",
    heroBadge: "航天级投资基础设施",
    heroTitlePart1: "让您的资本进入",
    heroTitlePart2: "轨道级回报",
    heroSubtitle: "将资金部署到我们的猎鹰、龙飞船和星舰投资舰队中。以动态的每日回报扩展您的投资组合，其精密程度与SpaceX每一次发射如出一辙。",
    ctaDeploy: "启动我的投资组合",
    ctaWhitepaper: "查看任务方案",
    activeNodes: "活跃投资合约数",
    hashrateTitle: "累计已分配收益",
    usersTitle: "已验证投资者数",
    payoutTitle: "累计已分配收益",
    featuresTitle: "为发射而生",
    featuresSub: "任务级基础设施，致力于让您的资本飞得更远，并每天安全返航。",
    feat1Title: "猎鹰级可靠性",
    feat1Desc: "投资于可重复使用、久经考验的合约方案，确保稳定的每日表现。",
    feat2Title: "全栈式扩展",
    feat2Desc: "从单一的猎鹰一号合约到完整的星舰舰队配置，通过复利回报让您的资本增长速度提升高达45倍。",
    feat3Title: "实时任务遥测",
    feat3Desc: "实时追踪您的收益增长，每日直接结算到您的钱包。",
    step1Title: "创建免费账户",
    step1Desc: "几秒钟内完成注册。无需 KYC 即可开始。",
    step2Title: "安全存入资产",
    step2Desc: "支持 6 种主流加密货币快速充值结算：BTC、ETH、USDT、LTC、BNB、SOL。",
    step3Title: "每日获取收益",
    step3Desc: "选定任务方案，每天自动入账。支持随时发起提现申请。",
    plansTitle: "SpaceX Trading 投资舰队",
    plansSub: "选择一艘发射载具来部署您的资本，开始获取每日回报。",
    deployNodeBtn: "启动该方案",
    testimonialsTitle: "投资者飞行日志",
    testimonialsSub: "了解全球投资者对与我们一同执行任务的真实评价。",
    faqTitle: "任务控制中心与常见问题",
    faqSub: "关于合约分配、舰队容量和收益发放流程的核心问题说明。",
    faq1Q: "任务合约是如何运作的？",
    faq1A: "选定发射载具方案后，您的合约会立即激活，资本随即部署到我们安全的投资舰队中。运营完全代管，您的累计回报每 24 小时动态更新一次。",
    faq2Q: "我可以同时启动多个任务合约吗？",
    faq2A: "完全可以。您可以在不同的载具级别（猎鹰、龙飞船、星舰等）之间自由配置合约，以分散并扩大您的投资组合。",
    faq3Q: "发射任务的资金支持哪些加密货币？",
    faq3A: "我们支持 Bitcoin (BTC)、Ethereum (ETH)、Tether (USDT)、Litecoin (LTC)、BNB 和 Solana (SOL) 进行即时充值和收益结算。"
  },
  ja: {
    navHome: "ホーム",
    navFeatures: "特徴",
    navPlans: "プラン",
    navFaq: "よくある質問",
    navReviews: "実績",
    navLogin: "ログイン",
    navRegister: "アカウントを開設する",
    heroBadge: "航空宇宙グレードの投資インフラ",
    heroTitlePart1: "あなたの資本を",
    heroTitlePart2: "軌道クラスのリターンへ",
    heroSubtitle: "Falcon、Dragon、Starship投資フリートに資本を展開。SpaceXが打ち上げごとに実現する精密さと同じ品質で、日々のダイナミックなリターンによりポートフォリオを拡大します。",
    ctaDeploy: "ポートフォリオを起動する",
    ctaWhitepaper: "ミッションプランを見る",
    activeNodes: "アクティブな投資契約数",
    hashrateTitle: "累計配分済みリターン",
    usersTitle: "認証済み投資家数",
    payoutTitle: "総分配報酬額",
    featuresTitle: "打ち上げのために設計",
    featuresSub: "あなたの資本をより遠くへ届け、毎日安全に持ち帰るために設計されたミッショングレードのインフラ。",
    feat1Title: "Falconクラスの信頼性",
    feat1Desc: "再利用可能で実績のある契約プランに投資し、安定した日次パフォーマンスを実現します。",
    feat2Title: "フルスタックなスケール",
    feat2Desc: "単一のFalcon 1契約からStarshipフリート全体の配分まで、複利リターンにより最大45倍速く資本を拡大します。",
    feat3Title: "リアルタイム・ミッションテレメトリー",
    feat3Desc: "リターンが発生する様子をリアルタイムで追跡し、毎日直接ウォレットに加算されます。",
    step1Title: "アカウント作成",
    step1Desc: "メールアドレスのみで即時に登録完了。開始時の本人確認（KYC）は不要です。",
    step2Title: "デポジット（預入）",
    step2Desc: "主要 6 種類の仮想通貨（BTC, ETH, USDT, LTC, BNB, SOL）に対応しています。",
    step3Title: "毎日報酬を獲得",
    step3Desc: "ミッションプランを選択して稼働を開始。貯まった報酬はいつでも引き出し可能です。",
    plansTitle: "SpaceX Trading フリート",
    plansSub: "発射機を選択して資本を展開し、日次リターンの獲得を開始します。",
    deployNodeBtn: "このプランを起動",
    testimonialsTitle: "投資家フライトログ",
    testimonialsSub: "世界各地の投資家が私たちとのミッションについて語る声をご覧ください。",
    faqTitle: "ミッションコントロール & よくある質問",
    faqSub: "契約割り当て、フリートの容量、配当処理に関する重要なご質問。",
    faq1Q: "ミッション契約はどのように機能しますか？",
    faq1A: "発射機プランを選択すると、契約は即座に有効化され、資本は安全な投資フリートに展開されます。運用は完全に管理され、累積リターンは24時間ごとに動的に更新されます。",
    faq2Q: "複数のミッション契約を同時に起動できますか？",
    faq2A: "はい、可能です。異なる発射機クラス（Falcon、Dragon、Starshipなど）にまたがって契約を起動し、ポートフォリオを多様化・拡大することができます。",
    faq3Q: "発射の資金提供にはどの仮想通貨が対応していますか？",
    faq3A: "ビットコイン（BTC）、イーサリアム（ETH）、テザー（USDT）、ライトコイン（LTC）、BNB、ソラナ（SOL）に対応しており、即時の入出金が可能です。"
  }
}

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [plansList, setPlansList] = useState([])
  const [selectedLang, setSelectedLang] = useState('en')

  // Drive the hidden Google Translate widget — no reload, no Google UI
  const switchLanguage = (langCode) => {
    setSelectedLang(langCode)
    const combo = document.querySelector('#gt_hidden select.goog-te-combo')
    if (combo) {
      if (langCode === 'en') {
        // To revert to original (English), find the restore iframe button or reload if needed.
        // Google Translate's built-in way to revert is to clear cookies and reload, or click restore.
        // Let's clear the cookie and trigger a reload ONLY when going back to original, 
        // OR try setting value to 'en' first, if it doesn't work, we can reload.
        // Wait, dispatching change with empty value works in some GT versions.
        combo.value = 'en';
        combo.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        // If it doesn't revert, try clearing cookies and reloading as fallback for EN only
        setTimeout(() => {
           document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
           document.cookie = 'googtrans=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
           window.location.reload();
        }, 100);
      } else {
        combo.value = langCode
        combo.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
      }
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    miningApi.plans()
      .then(p => setPlansList(p.filter(x => x.isActive)))
      .catch(err => console.error('Failed to load plans:', err))
  }, [])

  // Auto-detect visitor country and translate inline on first load
  useEffect(() => {
    const countryToLang = {
      af: 'ps', al: 'sq', dz: 'ar', ar: 'es', am: 'hy', at: 'de', az: 'az',
      bh: 'ar', bd: 'bn', by: 'be', be: 'nl', bo: 'es', ba: 'bs', br: 'pt',
      bg: 'bg', kh: 'km', cm: 'fr', ca: 'fr', cl: 'es', cn: 'zh-CN', co: 'es',
      cr: 'es', hr: 'hr', cu: 'es', cy: 'el', cz: 'cs', dk: 'da', do: 'es',
      ec: 'es', eg: 'ar', sv: 'es', ee: 'et', et: 'am', fi: 'fi', fr: 'fr',
      ge: 'ka', de: 'de', gh: 'en', gr: 'el', gt: 'es', hn: 'es', hk: 'zh-TW',
      hu: 'hu', is: 'is', in: 'hi', id: 'id', iq: 'ar', ir: 'fa', ie: 'ga',
      il: 'he', it: 'it', jm: 'en', jp: 'ja', jo: 'ar', kz: 'kk', ke: 'sw',
      kw: 'ar', kg: 'ky', la: 'lo', lv: 'lv', lb: 'ar', ly: 'ar', lt: 'lt',
      lu: 'lb', mk: 'mk', mg: 'mg', my: 'ms', mv: 'dv', ml: 'fr', mt: 'mt',
      mx: 'es', mn: 'mn', ma: 'ar', mz: 'pt', mm: 'my', np: 'ne', nl: 'nl',
      nz: 'en', ni: 'es', ng: 'en', no: 'no', om: 'ar', pk: 'ur', pa: 'es',
      py: 'es', pe: 'es', ph: 'fil', pl: 'pl', pt: 'pt', qa: 'ar', ro: 'ro',
      ru: 'ru', rw: 'rw', sa: 'ar', sn: 'fr', rs: 'sr', sg: 'zh-CN', sk: 'sk',
      si: 'sl', so: 'so', za: 'af', kr: 'ko', es: 'es', lk: 'si', sd: 'ar',
      se: 'sv', ch: 'de', sy: 'ar', tw: 'zh-TW', tj: 'tg', tz: 'sw', th: 'th',
      tn: 'ar', tr: 'tr', tm: 'tk', ug: 'sw', ua: 'uk', ae: 'ar', uy: 'es',
      uz: 'uz', ve: 'es', vn: 'vi', ye: 'ar', zm: 'en', zw: 'sn',
    }

    const autoDetect = () => {
      const combo = document.querySelector('#gt_hidden select.goog-te-combo')
      if (!combo) { setTimeout(autoDetect, 500); return }

      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          const cc = data.country_code?.toLowerCase()
          if (cc && cc !== 'us' && cc !== 'gb') {
            const lang = countryToLang[cc] || cc
            if (lang && lang !== 'en') switchLanguage(lang)
          }
        })
        .catch(() => {})
    }
    autoDetect()
  }, [])

  const activeT = T.en

  const localFeatures = [
    { icon: Rocket, title: activeT.feat1Title, desc: activeT.feat1Desc },
    { icon: Zap, title: activeT.feat2Title, desc: activeT.feat2Desc },
    { icon: Shield, title: activeT.feat3Title, desc: activeT.feat3Desc },
  ]

  return (
    <div className="landing-page">
      {/* ─── NAVBAR ─── */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-container nav-inner">
          <Link to="/" className="nav-brand">
            <div className="brand-icon-lg">🚀</div>
            <span className="brand-text-lg">SpaceX Trading</span>
          </Link>

          <div className={`nav-links ${mobileMenu ? 'open' : ''}`}>
            <a href="#features" onClick={() => setMobileMenu(false)}>{activeT.navFeatures}</a>
            <a href="#plans" onClick={() => setMobileMenu(false)}>{activeT.navPlans}</a>
            <a href="#payouts" onClick={() => setMobileMenu(false)}>{activeT.payoutTitle}</a>
            <a href="#testimonials" onClick={() => setMobileMenu(false)}>{activeT.navReviews}</a>
            <div className="nav-auth-mobile">
              <Link to="/login" className="btn btn-secondary">{activeT.navLogin}</Link>
              <Link to="/register" className="btn btn-primary">{activeT.navRegister}</Link>
            </div>
          </div>

          <div className="nav-auth" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Custom Language Selector */}
            <div className="hide-on-mobile" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '4px 8px' }}>
              <Globe size={15} style={{ color: 'var(--accent-cyan)', marginRight: 6, flexShrink: 0 }} />
              <select
                className="notranslate"
                onChange={(e) => switchLanguage(e.target.value)}
                value={selectedLang}
                style={{
                  background: 'transparent', border: 'none', color: '#fff',
                  fontSize: '0.88rem', cursor: 'pointer', outline: 'none',
                  fontFamily: 'Inter, sans-serif', padding: '3px 4px',
                }}
              >
                <option value="en" style={{ background: '#111' }}>🇺🇸 English</option>
                <option value="af" style={{ background: '#111' }}>🇿🇦 Afrikaans</option>
                <option value="sq" style={{ background: '#111' }}>🇦🇱 Shqip</option>
                <option value="am" style={{ background: '#111' }}>🇪🇹 አማርኛ</option>
                <option value="ar" style={{ background: '#111' }}>🇸🇦 العربية</option>
                <option value="hy" style={{ background: '#111' }}>🇦🇲 Հայերեն</option>
                <option value="az" style={{ background: '#111' }}>🇦🇿 Azərbaycan</option>
                <option value="eu" style={{ background: '#111' }}>🇪🇸 Euskara</option>
                <option value="be" style={{ background: '#111' }}>🇧🇾 Беларуская</option>
                <option value="bn" style={{ background: '#111' }}>🇧🇩 বাংলা</option>
                <option value="bs" style={{ background: '#111' }}>🇧🇦 Bosanski</option>
                <option value="bg" style={{ background: '#111' }}>🇧🇬 Български</option>
                <option value="ca" style={{ background: '#111' }}>🇪🇸 Català</option>
                <option value="ceb" style={{ background: '#111' }}>🇵🇭 Cebuano</option>
                <option value="zh-CN" style={{ background: '#111' }}>🇨🇳 中文 (简体)</option>
                <option value="zh-TW" style={{ background: '#111' }}>🇹🇼 中文 (繁體)</option>
                <option value="hr" style={{ background: '#111' }}>🇭🇷 Hrvatski</option>
                <option value="cs" style={{ background: '#111' }}>🇨🇿 Čeština</option>
                <option value="da" style={{ background: '#111' }}>🇩🇰 Dansk</option>
                <option value="nl" style={{ background: '#111' }}>🇳🇱 Nederlands</option>
                <option value="et" style={{ background: '#111' }}>🇪🇪 Eesti</option>
                <option value="fil" style={{ background: '#111' }}>🇵🇭 Filipino</option>
                <option value="fi" style={{ background: '#111' }}>🇫🇮 Suomi</option>
                <option value="fr" style={{ background: '#111' }}>🇫🇷 Français</option>
                <option value="gl" style={{ background: '#111' }}>🇪🇸 Galego</option>
                <option value="ka" style={{ background: '#111' }}>🇬🇪 ქართული</option>
                <option value="de" style={{ background: '#111' }}>🇩🇪 Deutsch</option>
                <option value="el" style={{ background: '#111' }}>🇬🇷 Ελληνικά</option>
                <option value="gu" style={{ background: '#111' }}>🇮🇳 ગુજરાતી</option>
                <option value="ht" style={{ background: '#111' }}>🇭🇹 Kreyòl Ayisyen</option>
                <option value="ha" style={{ background: '#111' }}>🇳🇬 Hausa</option>
                <option value="haw" style={{ background: '#111' }}>🇺🇸 ʻŌlelo Hawaiʻi</option>
                <option value="he" style={{ background: '#111' }}>🇮🇱 עברית</option>
                <option value="hi" style={{ background: '#111' }}>🇮🇳 हिन्दी</option>
                <option value="hu" style={{ background: '#111' }}>🇭🇺 Magyar</option>
                <option value="is" style={{ background: '#111' }}>🇮🇸 Íslenska</option>
                <option value="ig" style={{ background: '#111' }}>🇳🇬 Igbo</option>
                <option value="id" style={{ background: '#111' }}>🇮🇩 Bahasa Indonesia</option>
                <option value="ga" style={{ background: '#111' }}>🇮🇪 Gaeilge</option>
                <option value="it" style={{ background: '#111' }}>🇮🇹 Italiano</option>
                <option value="ja" style={{ background: '#111' }}>🇯🇵 日本語</option>
                <option value="jv" style={{ background: '#111' }}>🇮🇩 Jawa</option>
                <option value="kn" style={{ background: '#111' }}>🇮🇳 ಕನ್ನಡ</option>
                <option value="kk" style={{ background: '#111' }}>🇰🇿 Қазақ</option>
                <option value="km" style={{ background: '#111' }}>🇰🇭 ខ្មែរ</option>
                <option value="rw" style={{ background: '#111' }}>🇷🇼 Kinyarwanda</option>
                <option value="ko" style={{ background: '#111' }}>🇰🇷 한국어</option>
                <option value="ku" style={{ background: '#111' }}>🇮🇶 Kurdî</option>
                <option value="ky" style={{ background: '#111' }}>🇰🇬 Кыргызча</option>
                <option value="lo" style={{ background: '#111' }}>🇱🇦 ລາວ</option>
                <option value="lv" style={{ background: '#111' }}>🇱🇻 Latviešu</option>
                <option value="lt" style={{ background: '#111' }}>🇱🇹 Lietuvių</option>
                <option value="lb" style={{ background: '#111' }}>🇱🇺 Lëtzebuergesch</option>
                <option value="mk" style={{ background: '#111' }}>🇲🇰 Македонски</option>
                <option value="mg" style={{ background: '#111' }}>🇲🇬 Malagasy</option>
                <option value="ms" style={{ background: '#111' }}>🇲🇾 Bahasa Melayu</option>
                <option value="ml" style={{ background: '#111' }}>🇮🇳 മലയാളം</option>
                <option value="mt" style={{ background: '#111' }}>🇲🇹 Malti</option>
                <option value="mi" style={{ background: '#111' }}>🇳🇿 Māori</option>
                <option value="mr" style={{ background: '#111' }}>🇮🇳 मराठी</option>
                <option value="mn" style={{ background: '#111' }}>🇲🇳 Монгол</option>
                <option value="my" style={{ background: '#111' }}>🇲🇲 မြန်မာ</option>
                <option value="ne" style={{ background: '#111' }}>🇳🇵 नेपाली</option>
                <option value="no" style={{ background: '#111' }}>🇳🇴 Norsk</option>
                <option value="ny" style={{ background: '#111' }}>🇲🇼 Chichewa</option>
                <option value="or" style={{ background: '#111' }}>🇮🇳 ଓଡ଼ିଆ</option>
                <option value="ps" style={{ background: '#111' }}>🇦🇫 پښتو</option>
                <option value="fa" style={{ background: '#111' }}>🇮🇷 فارسی</option>
                <option value="pl" style={{ background: '#111' }}>🇵🇱 Polski</option>
                <option value="pt" style={{ background: '#111' }}>🇧🇷 Português</option>
                <option value="pa" style={{ background: '#111' }}>🇮🇳 ਪੰਜਾਬੀ</option>
                <option value="ro" style={{ background: '#111' }}>🇷🇴 Română</option>
                <option value="ru" style={{ background: '#111' }}>🇷🇺 Русский</option>
                <option value="sm" style={{ background: '#111' }}>🇼🇸 Gagana Sāmoa</option>
                <option value="sr" style={{ background: '#111' }}>🇷🇸 Српски</option>
                <option value="sn" style={{ background: '#111' }}>🇿🇼 Shona</option>
                <option value="sd" style={{ background: '#111' }}>🇵🇰 سنڌي</option>
                <option value="si" style={{ background: '#111' }}>🇱🇰 සිංහල</option>
                <option value="sk" style={{ background: '#111' }}>🇸🇰 Slovenčina</option>
                <option value="sl" style={{ background: '#111' }}>🇸🇮 Slovenščina</option>
                <option value="so" style={{ background: '#111' }}>🇸🇴 Soomaali</option>
                <option value="es" style={{ background: '#111' }}>🇪🇸 Español</option>
                <option value="su" style={{ background: '#111' }}>🇮🇩 Basa Sunda</option>
                <option value="sw" style={{ background: '#111' }}>🇰🇪 Kiswahili</option>
                <option value="sv" style={{ background: '#111' }}>🇸🇪 Svenska</option>
                <option value="tg" style={{ background: '#111' }}>🇹🇯 Тоҷикӣ</option>
                <option value="ta" style={{ background: '#111' }}>🇮🇳 தமிழ்</option>
                <option value="tt" style={{ background: '#111' }}>🇷🇺 Татар</option>
                <option value="te" style={{ background: '#111' }}>🇮🇳 తెలుగు</option>
                <option value="th" style={{ background: '#111' }}>🇹🇭 ไทย</option>
                <option value="tr" style={{ background: '#111' }}>🇹🇷 Türkçe</option>
                <option value="tk" style={{ background: '#111' }}>🇹🇲 Türkmen</option>
                <option value="uk" style={{ background: '#111' }}>🇺🇦 Українська</option>
                <option value="ur" style={{ background: '#111' }}>🇵🇰 اردو</option>
                <option value="ug" style={{ background: '#111' }}>🇨🇳 ئۇيغۇرچە</option>
                <option value="uz" style={{ background: '#111' }}>🇺🇿 Oʻzbek</option>
                <option value="vi" style={{ background: '#111' }}>🇻🇳 Tiếng Việt</option>
                <option value="cy" style={{ background: '#111' }}>🏴 Cymraeg</option>
                <option value="xh" style={{ background: '#111' }}>🇿🇦 isiXhosa</option>
                <option value="yi" style={{ background: '#111' }}>🇮🇱 ייִדיש</option>
                <option value="yo" style={{ background: '#111' }}>🇳🇬 Yorùbá</option>
                <option value="zu" style={{ background: '#111' }}>🇿🇦 isiZulu</option>
              </select>
            </div>

            <Link to="/login" className="btn btn-secondary">{activeT.navLogin}</Link>
            <Link to="/register" className="btn btn-primary hide-on-mobile">{activeT.navRegister} <ArrowRight size={16} /></Link>
          </div>

          <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>

        <div className="landing-container hero-content">
          <div className="hero-badge">
            <Rocket size={14} /> {activeT.heroBadge}
          </div>
          <h1 className="hero-title">
            {activeT.heroTitlePart1}
            <span className="gradient-text"> {activeT.heroTitlePart2}</span>
          </h1>
          <p className="hero-subtitle">
            {activeT.heroSubtitle}
          </p>

          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg hero-btn-glow">
              {activeT.ctaDeploy} <ArrowRight size={18} />
            </Link>
            <a href="#plans" className="btn btn-secondary btn-lg">
              {activeT.ctaWhitepaper} <ChevronRight size={18} />
            </a>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat">
              <div className="hero-stat-value"><Counter end={50000} suffix="+" /></div>
              <div className="hero-stat-label">{activeT.activeNodes}</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-value">$<Counter end={125} suffix="M+" /></div>
              <div className="hero-stat-label">{activeT.payoutTitle}</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-value"><Counter end={99} suffix=".9%" /></div>
              <div className="hero-stat-label">Uptime</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-value"><Counter end={12} /></div>
              <div className="hero-stat-label">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CRYPTO TICKER ─── */}
      <section className="ticker-section">
        <div className="ticker-track">
          {[...cryptos, ...cryptos].map((c, i) => (
            <div className="ticker-item" key={i}>
              <span className="ticker-symbol">{c.symbol}</span>
              <span className="ticker-price">${c.price}</span>
              <span className={`ticker-change ${c.up ? 'up' : 'down'}`}>{c.change}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="features-section" id="features">
        <div className="landing-container">
          <div className="section-intro">
            <span className="section-tag"><Shield size={14} /> Why SpaceX Trading</span>
            <h2 className="section-title">Engineered for <span className="gradient-text">Maximum Velocity</span></h2>
            <p className="section-desc">
              {activeT.featuresSub}
            </p>
          </div>

          <div className="features-grid">
            {localFeatures.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon-wrap">
                  <f.icon size={24} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="how-section">
        <div className="landing-container">
          <div className="section-intro">
            <span className="section-tag"><Layers size={14} /> Simple Process</span>
            <h2 className="section-title">Start Investing in <span className="gradient-text">3 Steps</span></h2>
          </div>

          <div className="steps-grid">
            {[
              { num: '01', title: activeT.step1Title, desc: activeT.step1Desc, icon: Users },
              { num: '02', title: activeT.step2Title, desc: activeT.step2Desc, icon: Wallet },
              { num: '03', title: activeT.step3Title, desc: activeT.step3Desc, icon: TrendingUp },
            ].map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-num">{s.num}</div>
                <div className="step-icon-wrap"><s.icon size={28} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < 2 && <div className="step-arrow"><ChevronRight size={20} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLANS ─── */}
      <section className="plans-section" id="plans">
        <div className="landing-container">
          <div className="section-intro">
            <span className="section-tag"><Rocket size={14} /> {activeT.plansTitle}</span>
            <h2 className="section-title">Select Your <span className="gradient-text">Launch Vehicle</span></h2>
            <p className="section-desc">{activeT.plansSub}</p>
          </div>

          <div className="landing-plans-grid">
            {(plansList.length > 0 ? plansList : plans).map((p, i) => {
              const isPopular = p.popular || p.tier === 'professional'
              const minPrice = p.minDeposit !== undefined ? `$${p.minDeposit.toLocaleString()}` : p.price
              const maxPrice = p.maxDeposit !== undefined ? `$${p.maxDeposit.toLocaleString()}` : ''
              const planName = p.name
              const planROI = p.dailyROI !== undefined ? `${p.dailyROI}%` : p.roi
              const planHash = p.hashRate || p.hash
              const planDuration = p.durationDays !== undefined ? `${p.durationDays} days` : p.duration

              // Custom features list based on the SpaceX launch vehicle fleet
              const extras = p.tier === 'starter' ? ['Falcon 9 Reusable Core', 'Rapid Reflight Turnaround']
                           : p.tier === 'professional' ? ['Triple-Booster Configuration', 'Dedicated Mission Control']
                           : p.tier === 'enterprise' ? ['Full Orbital-Class Stack', 'Enterprise Mission Suite']
                           : p.tier === 'vip' ? ['Interplanetary Fleet Access', '24/7 Mission Control Support']
                           : ['Rapid Launch Cadence', 'Instant Daily Payouts']

              return (
                <div className={`landing-plan-card ${isPopular ? 'popular' : ''}`} key={p.id || i}>
                  {isPopular && <div className="popular-tag">🚀 Recommended Launch</div>}
                  <h3>{planName}</h3>
                  <div className="plan-roi">
                    <span className="roi-value">{planROI}</span>
                    <span className="roi-label">Daily ROI</span>
                  </div>
                  <ul>
                    <li><Check size={16} /> {planHash}</li>
                    <li><Check size={16} /> {planDuration} Duration</li>
                    <li><Check size={16} /> Starts from: {minPrice}</li>
                    {maxPrice && <li><Check size={16} /> Max Allocation: {maxPrice}</li>}
                    {extras.map((ex, idx) => (
                      <li key={idx}><Check size={16} /> {ex}</li>
                    ))}
                  </ul>
                  <Link to="/register" className={`btn ${isPopular ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%' }}>
                    {activeT.deployNodeBtn} <ArrowRight size={16} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── LIVE PAYOUT FEED ─── */}
      <section className="payouts-section" id="payouts">
        <div className="landing-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div className="section-intro" style={{ textAlign: 'left', marginBottom: 24 }}>
                <span className="section-tag" style={{ justifyContent: 'flex-start' }}><TrendingUp size={14} /> Real-Time Payouts</span>
                <h2 className="section-title" style={{ fontSize: '2.2rem' }}>Verifiable <span className="gradient-text">Blockchain Ledger</span></h2>
                <p className="section-desc" style={{ maxWidth: '100%' }}>
                  Our smart contract distributions automatically execute payouts directly to user external wallets. Click on any payout transaction to inspect live cryptographic ledger verification on independent blockchain explorers.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>24/7</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automated Processing</div>
                </div>
                <div style={{ width: 1, background: 'var(--border-color)' }} />
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>0.00s</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transaction Delays</div>
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: '24px 28px', background: 'rgba(13,13,13,0.75)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Live Yield Distribution Stream</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '4px 10px', borderRadius: 20 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> LIVE LEDGER FEED
                </div>
              </div>
              <LivePayouts />
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="stats-section">
        <div className="landing-container">
          <div className="stats-banner">
            <div className="stats-banner-item">
              <BarChart3 size={28} />
              <div className="stats-banner-value">$<Counter end={125} suffix="M" /></div>
              <div className="stats-banner-label">Total Payouts</div>
            </div>
            <div className="stats-banner-item">
              <Users size={28} />
              <div className="stats-banner-value"><Counter end={52400} /></div>
              <div className="stats-banner-label">Registered Users</div>
            </div>
            <div className="stats-banner-item">
              <Rocket size={28} />
              <div className="stats-banner-value"><Counter end={8750} /></div>
              <div className="stats-banner-label">Active Mission Contracts</div>
            </div>
            <div className="stats-banner-item">
              <Clock size={28} />
              <div className="stats-banner-value"><Counter end={1095} /> days</div>
              <div className="stats-banner-label">Online Since 2023</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="testimonials-section" id="testimonials">
        <div className="landing-container">
          <div className="section-intro">
            <span className="section-tag"><Star size={14} /> {activeT.testimonialsTitle}</span>
            <h2 className="section-title">What Our <span className="gradient-text">Investors Say</span></h2>
            <p className="section-desc">{activeT.testimonialsSub}</p>
          </div>

          <div className="testimonials-grid">
            {allTestimonials.slice(0, 6).map((t, i) => (
              <div className="testimonial-card" key={i}>
                <div className="stars">{Array(t.stars).fill(0).map((_, j) => <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />)}</div>
                <p>"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.country}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/reviews" className="btn btn-secondary btn-lg">View All Reviews <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="faq-section" id="faq" style={{ padding: '100px 0', background: 'rgba(255,255,255,0.01)' }}>
        <div className="landing-container">
          <div className="section-intro">
            <span className="section-tag"><Layers size={14} /> FAQ</span>
            <h2 className="section-title">{activeT.faqTitle}</h2>
            <p className="section-desc">{activeT.faqSub}</p>
          </div>

          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { q: activeT.faq1Q, a: activeT.faq1A },
              { q: activeT.faq2Q, a: activeT.faq2A },
              { q: activeT.faq3Q, a: activeT.faq3A }
            ].map((f, idx) => (
              <div key={idx} className="card" style={{ padding: 24, background: 'rgba(13,13,13,0.7)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: 10 }}>{f.q}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="landing-container cta-inner">
          <div className="cta-orb" />
          <h2>Ready for Liftoff?</h2>
          <p>Join 50,000+ investors earning passive income every day. No hardware. No hassle. Just profits.</p>
          <Link to="/register" className="btn btn-primary btn-lg hero-btn-glow">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ─── TRUSTED BY ─── */}
      <section style={{ padding: '64px 0 56px', background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div className="landing-container">
          <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 36 }}>
            Top Global Investors &amp; Industry Leaders
          </p>
        </div>

        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(to right, #000, transparent)', zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(to left, #000, transparent)', zIndex: 2, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', gap: 40, animation: 'logoScroll 32s linear infinite', width: 'max-content', alignItems: 'center', padding: '8px 0' }}>
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((co, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
                background: co.bg, border: `1px solid ${co.border}`,
                borderRadius: 10, padding: '10px 20px', whiteSpace: 'nowrap',
              }}>
                <co.Icon />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: co.color, letterSpacing: '0.2px' }}>
                  {co.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/investors" style={{ color: '#0ea5e9', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid rgba(14, 165, 233,0.4)', paddingBottom: 2, letterSpacing: '0.3px' }}>
            View all investors &amp; testimonials →
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <div className="footer-brand">
            <div className="nav-brand" style={{ marginBottom: 12 }}>
              <div className="brand-icon-lg">🚀</div>
              <span className="brand-text-lg">SpaceX Trading</span>
            </div>
            <p>Aerospace-grade investment platform trusted by investors worldwide since 2023.</p>
          </div>
          <div className="footer-links">
            <h4>Platform</h4>
            <a href="#features">Features</a>
            <a href="#plans">Investment Plans</a>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
          </div>
          <div className="footer-links">
            <h4>Support</h4>
            <Link to="/help">Help Center</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/api-docs">API Docs</Link>
            <Link to="/status">Status Page</Link>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/refund-policy">Refund Policy</Link>
            <Link to="/aml-policy">AML Policy</Link>
          </div>
        </div>
        <div className="footer-bottom landing-container">
          <p>© 2023-2026 SpaceX Trading. All rights reserved.</p>
          <div className="footer-cryptos">
            {['BTC', 'ETH', 'USDT', 'LTC', 'BNB', 'SOL'].map(c => (
              <span key={c} className="footer-crypto-badge">{c}</span>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        .payouts-section { padding: 80px 0; background: var(--bg-secondary); }
        @media (max-width: 768px) {
          .payouts-section > div > div[style] { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <LiveChatWidget />
    </div>
  )
}
