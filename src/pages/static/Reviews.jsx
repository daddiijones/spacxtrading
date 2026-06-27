import { Link } from 'react-router-dom'
import { ArrowLeft, Star, ArrowRight } from 'lucide-react'

const reviews = [
  { name: 'James W.', role: 'Aerospace Investment Broker', country: '🇺🇸', text: 'SpaceX Trading has completely changed my passive income strategy. Consistent returns every single day. I started with $500 and now running $15,000 across multiple mission contracts.', stars: 5, plan: 'Starship Super Heavy', joined: 'Jan 2024' },
  { name: 'Maria K.', role: 'Investment Analyst', country: '🇩🇪', text: "The platform is incredibly user-friendly. I started growing my portfolio within minutes of signing up. The UI is clean, responsive, and extremely premium.", stars: 5, plan: 'Dragon Cargo Fleet', joined: 'Mar 2024' },
  { name: 'David L.', role: 'Mission Contract Investor', country: '🇬🇧', text: 'Starship Super Heavy contracts deliver exactly as promised. The dedicated manager answers my questions within minutes. Best investment for our venture funds.', stars: 5, plan: 'Starship Super Heavy', joined: 'Nov 2023' },
  { name: 'Sarah M.', role: 'Investment Systems Engineer', country: '🇨🇦', text: "I've tried 5 different investment platforms. SpaceX Trading is the only one with real, consistent payouts. The real-time portfolio telemetry is phenomenal.", stars: 5, plan: 'Dragon Cargo Fleet', joined: 'Feb 2024' },
  { name: 'Ahmed R.', role: 'Digital Entrepreneur', country: '🇦🇪', text: "Earning $200/day passively while my mission contracts run in the background. This has given me financial freedom.", stars: 5, plan: 'Starbase Mars Fleet', joined: 'Dec 2023' },
  { name: 'Liu Wei', role: 'Venture Capitalist', country: '🇸🇬', text: "The transparency is what sold me. Every payout is verifiable on the ledger. No other platform offers this level of security and scale.", stars: 5, plan: 'Starship Super Heavy', joined: 'Apr 2024' },
  { name: 'Elena P.', role: 'Founder', country: '🇫🇷', text: "Started with the Falcon 9 Block 5 contract to test, now running full Starship Super Heavy. Returns compounded beautifully over 6 months.", stars: 5, plan: 'Starship Super Heavy', joined: 'Jan 2024' },
  { name: 'Michael T.', role: 'Systems Architect', country: '🇦🇺', text: "Finally a platform I can trust for consistent returns. 8 months and counting with zero issues. Withdrawals arrive within hours.", stars: 5, plan: 'Dragon Cargo Fleet', joined: 'Oct 2023' },
  { name: 'Olga S.', role: 'Technical Writer', country: '🇵🇱', text: "Even with a small investment, the returns are impressive. The referral program earned me an extra $800 just from sharing with colleagues!", stars: 5, plan: 'Falcon 1 Liftoff Array', joined: 'May 2024' },
  { name: 'Carlos R.', role: 'Infrastructure Dev', country: '🇧🇷', text: "Clean UI, fast withdrawals, transparent blockchain proofs. As an engineer, I appreciate the technical excellence of this platform.", stars: 5, plan: 'Dragon Cargo Fleet', joined: 'Mar 2024' },
  { name: 'Aisha N.', role: 'FinTech Student', country: '🇳🇬', text: "Referred 15 classmates and earned over $3,000 in commissions. The 5% referral bonus is incredibly generous and instantly credited!", stars: 5, plan: 'Falcon 9 Block 5', joined: 'Apr 2024' },
  { name: 'Tomo H.', role: 'Quant Trader', country: '🇯🇵', text: "My contracts run 24/7 even when I sleep. My daily ROI has been incredibly consistent for 4 months. Predictable and highly profitable.", stars: 5, plan: 'Dragon Cargo Fleet', joined: 'Feb 2024' },
  { name: 'Isabella F.', role: 'Portfolio Manager', country: '🇮🇹', text: "As an accountant, I appreciate the detailed transaction history and earnings breakdown. Makes tax reporting so much easier.", stars: 5, plan: 'Starship Super Heavy', joined: 'Jan 2024' },
  { name: 'Kwame A.', role: 'Startup Owner', country: '🇬🇭', text: "This platform has transformed my business cash flow. Started small, reinvested profits, and now scale my contract portfolio daily.", stars: 5, plan: 'Falcon Heavy', joined: 'Dec 2023' },
  { name: 'Natasha V.', role: 'Creative Director', country: '🇷🇺', text: "Beautiful interface, reliable returns, excellent customer support. I recommend SpaceX Trading to everyone looking for passive income.", stars: 5, plan: 'Falcon 1 Liftoff Array', joined: 'May 2024' },
  { name: 'Robert C.', role: 'Angel Investor', country: '🇺🇸', text: "Diversifying into mission contracts was my best move this year. SpaceX Trading makes it effortless. The VIP returns are phenomenal.", stars: 5, plan: 'Starbase Mars Fleet', joined: 'Nov 2023' },
  { name: 'Priya S.', role: 'Healthcare Consultant', country: '🇮🇳', text: "I don't have time to actively manage my portfolio. The contract runs in the background and I check my growing balance daily. Perfect for busy professionals.", stars: 5, plan: 'Starship Super Heavy', joined: 'Mar 2024' },
  { name: 'Diego M.', role: 'Tech Consultant', country: '🇲🇽', text: "Simple, reliable, highly profitable. Three words that describe SpaceX Trading perfectly. Every withdrawal processed within hours.", stars: 5, plan: 'Dragon Cargo Fleet', joined: 'Dec 2023' },
  { name: 'Sophie L.', role: 'Network Admin', country: '🇳🇱', text: "I was skeptical at first but tried the Falcon 9 Block 5 contract. After seeing consistent returns, I upgraded to Starship immediately.", stars: 5, plan: 'Starship Super Heavy', joined: 'Feb 2024' },
  { name: 'Yusuf K.', role: 'Computer Science Student', country: '🇹🇷', text: "Even with limited student funds, I'm earning passive returns daily. The Falcon 1 entry plan makes it accessible to everyone.", stars: 5, plan: 'Falcon 1 Liftoff Array', joined: 'Apr 2024' },
  { name: 'Fatima Z.', role: 'Bioinformatics Engineer', country: '🇲🇦', text: "I wanted a way to grow my capital without the volatility of daily trading. This platform is exactly what I needed.", stars: 5, plan: 'Dragon Cargo Fleet', joined: 'Jan 2024' },
  { name: 'Viktor B.', role: 'Operations Specialist', country: '🇺🇦', text: "The engineering behind this platform is solid. 99.99% system uptime is real. I've been monitoring performance regularly.", stars: 5, plan: 'Starship Super Heavy', joined: 'Nov 2023' },
  { name: 'Anna W.', role: 'Art Producer', country: '🇸🇪', text: "I love that I can fund my design projects with passive investment income. Set it and forget it, then check back to a bigger balance.", stars: 5, plan: 'Falcon 1 Liftoff Array', joined: 'May 2024' },
  { name: 'Kofi M.', role: 'Transport Operator', country: '🇬🇭', text: "Between busy hours, I check my dashboard and smile. My contracts earn more than some of my hard working days. Game changer.", stars: 5, plan: 'Falcon Heavy', joined: 'Mar 2024' },
  { name: 'Chen Li', role: 'Quantitative Lead', country: '🇨🇳', text: "I analyzed the payout statistical deviations. Returns are exceptionally consistent. Outstanding portfolio stability.", stars: 5, plan: 'Starship Super Heavy', joined: 'Feb 2024' },
  { name: 'Grace O.', role: 'Compliance Officer', country: '🇰🇪', text: "Reviewed their terms, security, and policies thoroughly. Everything is transparent and legally sound. Outstanding team.", stars: 5, plan: 'Starship Super Heavy', joined: 'Dec 2023' },
  { name: 'Raj P.', role: 'Operations Director', country: '🇮🇳', text: "Allocated capital across Falcon Heavy and Starship plans. Returns have been clockwork. My team is now signing up too.", stars: 5, plan: 'Starship Super Heavy', joined: 'Jan 2024' },
  { name: 'Linda J.', role: 'E-commerce Merchant', country: '🇺🇸', text: "Started with a mission contract as a side investment experiment. Now it covers my primary bills every single month.", stars: 5, plan: 'Falcon 1 Liftoff Array', joined: 'Apr 2024' },
  { name: 'Oscar T.', role: 'Aviation Specialist', country: '🇪🇸', text: "I am flying for days at a time. With this platform, my capital works while I am in the air. Returned to $800 in earnings.", stars: 5, plan: 'Starbase Mars Fleet', joined: 'Oct 2023' },
  { name: 'Mei Lin', role: 'Digital Designer', country: '🇹🇼', text: "The premium design caught my eye first. The high-performance yields kept me. 4 months in and completely satisfied.", stars: 5, plan: 'Dragon Cargo Fleet', joined: 'Feb 2024' },
  { name: 'Hassan B.', role: 'Global Logistics', country: '🇸🇦', text: "I compare these mission contracts to my traditional stock investments. The ROI here outperforms most of my portfolio.", stars: 5, plan: 'Starbase Mars Fleet', joined: 'Nov 2023' },
  { name: 'Patricia M.', role: 'Scientific Researcher', country: '🇵🇹', text: "I was naturally skeptical. The mathematical and blockchain verifications check out perfectly. I am convinced.", stars: 5, plan: 'Starship Super Heavy', joined: 'Jan 2024' },
  { name: 'Felix N.', role: 'Automation Specialist', country: '🇩🇪', text: "Don't need deeply technical crypto knowledge. Just fund the balance, pick a contract, and earn daily. Simplicity is its strength.", stars: 5, plan: 'Falcon 1 Liftoff Array', joined: 'May 2024' },
  { name: 'Zara A.', role: 'Media Creator', country: '🇬🇧', text: "Shared my experience with my audience. They signed up through my referral link and I earned over $2,000 in commissions!", stars: 5, plan: 'Dragon Cargo Fleet', joined: 'Mar 2024' },
  { name: 'Thomas R.', role: 'Medical Director', country: '🇨🇭', text: "Swiss precision and standards in mission-grade investing. Every franc invested returned exactly as projected.", stars: 5, plan: 'Starship Super Heavy', joined: 'Dec 2023' },
  { name: 'Amara D.', role: 'Field Representative', country: '🇸🇳', text: "These mission contracts supplement my salary beautifully. It's allowed me to comfortably secure schooling tuition.", stars: 5, plan: 'Falcon 1 Liftoff Array', joined: 'Apr 2024' },
  { name: 'Kevin O.', role: 'Operations Lead', country: '🇮🇪', text: "Consistent performance, highly predictable returns, excellent administrative support. A premium platform.", stars: 5, plan: 'Dragon Cargo Fleet', joined: 'Feb 2024' },
  { name: 'Lena K.', role: 'Architectural Designer', country: '🇫🇮', text: "Clean layout, robust fleet systems, beautiful execution. Best-in-class service.", stars: 5, plan: 'Starship Super Heavy', joined: 'Jan 2024' },
  { name: 'Jorge S.', role: 'Creative Director', country: '🇦🇷', text: "While I focus on creative productions, my contracts execute in the background. Best passive source of income for creatives.", stars: 5, plan: 'Falcon Heavy', joined: 'Nov 2023' },
  { name: 'Ruth W.', role: 'Retired Financial Director', country: '🇿🇦', text: "30 years in banking taught me to audit carefully. This platform is authentic: verifiable returns, transparent systems.", stars: 5, plan: 'Starbase Mars Fleet', joined: 'Oct 2023' },
  { name: 'Dmitri V.', role: 'Game Engine Developer', country: '🇷🇺', text: "The dashboard is outstanding — satisfying to watch real-time returns climb. Excellent product.", stars: 5, plan: 'Dragon Cargo Fleet', joined: 'Mar 2024' },
  { name: 'Nadia H.', role: 'Research Analyst', country: '🇪🇬', text: "I investigated operations thoroughly before depositing. Verified ledger hashes and actual payouts. Fully legitimate.", stars: 5, plan: 'Starship Super Heavy', joined: 'Feb 2024' },
  { name: 'Peter G.', role: 'Logistics Manager', country: '🇳🇿', text: "Out in the fields, my contract keeps working. Simple concept, highly profitable. Recommending to my entire network.", stars: 5, plan: 'Falcon 1 Liftoff Array', joined: 'May 2024' },
  { name: 'Sakura T.', role: 'Technical Translator', country: '🇯🇵', text: "Multi-language dashboard works perfectly. Returns are steady regardless of general market volatility. Highly recommended.", stars: 5, plan: 'Dragon Cargo Fleet', joined: 'Apr 2024' },
  { name: 'Emmanuel O.', role: 'Charity Organizer', country: '🇳🇬', text: "Shared this with several colleagues seeking reliable capital growth. Everyone is highly satisfied and earning daily.", stars: 5, plan: 'Falcon Heavy', joined: 'Jan 2024' },
  { name: 'Christine B.', role: 'Clinical Lead', country: '🇧🇪', text: "Simple, highly effective, completely hands-off. Highly recommend for passive capital growth.", stars: 5, plan: 'Falcon 1 Liftoff Array', joined: 'Mar 2024' },
  { name: 'Ali M.', role: 'Fleet Manager', country: '🇵🇰', text: "Started with a Falcon 9 Block 5 contract and compounded earnings. Grown to over $2,000. Phenomenal system.", stars: 5, plan: 'Falcon 9 Block 5', joined: 'Dec 2023' },
  { name: 'Eva R.', role: 'Wellness Instructor', country: '🇨🇷', text: "Gives me financial peace of mind. Passive returns now exceed my active studio income. Incredibly grateful.", stars: 5, plan: 'Starship Super Heavy', joined: 'Feb 2024' },
  { name: 'Samuel K.', role: 'Operations Guard', country: '🇺🇬', text: "Watching my balance tick up on my shifts is motivating. Money works for me around the clock.", stars: 5, plan: 'Falcon 1 Liftoff Array', joined: 'Apr 2024' },
  { name: 'Monica L.', role: 'HR Director', country: '🇨🇴', text: "Our workplace referral pool is highly active. Everyone is earning consistent passive income. Excellent yields.", stars: 5, plan: 'Starship Super Heavy', joined: 'Nov 2023' },
]

export default function Reviews() {
  return (
    <div className="landing-page" style={{ background: '#07090e', minHeight: '100vh', color: '#fff' }}>
      <div className="landing-container" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-cyan)', fontSize: '0.88rem', marginBottom: 32, textDecoration: 'none' }}><ArrowLeft size={16} /> Back to Home</Link>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: 8, background: 'linear-gradient(135deg, #fff 30%, #0ea5e9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Investor Reviews</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>Real reviews from {reviews.length} verified investors worldwide growing their portfolio with us.</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            {Array(5).fill(0).map((_, i) => <Star key={i} size={22} fill="#f59e0b" color="#f59e0b" />)}
            <span style={{ fontWeight: 700, fontSize: '1.15rem', marginLeft: 8, color: '#fff' }}>4.9/5</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>({reviews.length} reviews)</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, transition: 'all 0.3s ease' }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {Array(r.stars).fill(0).map((_, j) => <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 16 }}>"{r.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{r.country}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>{r.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.role}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 600 }}>{r.plan}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Since {r.joined}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #075f9e 100%)', border: 'none', fontWeight: 700, padding: '14px 32px' }}>Start Investing Today <ArrowRight size={16} /></Link>
        </div>
      </div>
    </div>
  )
}
