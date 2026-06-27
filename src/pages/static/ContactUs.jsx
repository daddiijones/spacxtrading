import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, MessageCircle, MapPin, Clock } from 'lucide-react'

export default function ContactUs() {
  return (
    <div className="landing-page" style={{ background: '#07090e', minHeight: '100vh', color: '#fff' }}>
      <div className="landing-container" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-cyan)', fontSize: '0.88rem', marginBottom: 32, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: 8, background: 'linear-gradient(135deg, #fff 30%, #0ea5e9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Contact Us</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 48 }}>We're here to assist. Connect with our mission support crew.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 800 }}>
          {[
            { icon: Mail, title: 'Email Support', detail: 'admin@spacxtrading.online', sub: 'Response guaranteed within 24 hours' },
            { icon: MessageCircle, title: 'Live Chat Support', detail: 'Available inside Dashboard', sub: 'Mon-Sun, 24/7 Priority Support' },
            { icon: MapPin, title: 'Headquarters Operations', detail: 'Global Mission Control Centers', sub: 'Redundant systems active across 12 countries' },
            { icon: Clock, title: 'Mission Hours', detail: '24/7 Automated Investment Operations', sub: 'System telemetry active continuously' },
          ].map((c, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, transition: 'all 0.3s ease' }} className="card">
              <c.icon size={28} style={{ color: '#0ea5e9', marginBottom: 14 }} />
              <h3 style={{ fontWeight: 700, marginBottom: 6, color: '#fff' }}>{c.title}</h3>
              <p style={{ fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: 4, wordBreak: 'break-all' }}>{c.detail}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{c.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
