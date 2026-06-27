import { useState, useEffect } from 'react'
import { Download, X, Share, Plus } from 'lucide-react'

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream

const isInStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  navigator.standalone === true

const DISMISS_KEY = 'nct-pwa-dismissed'
const DISMISS_DAYS = 7

export default function InstallPrompt() {
  const [prompt, setPrompt]   = useState(null) // Android/Chrome deferred event
  const [show, setShow]       = useState(false)
  const [ios, setIos]         = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Already installed as PWA — never show
    if (isInStandalone()) return

    // Respect dismiss cooldown
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DAYS * 864e5) return

    if (isIOS()) {
      // iOS doesn't fire beforeinstallprompt — show manual instructions after 2s
      setIos(true)
      const t = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(t)
    }

    const handler = e => {
      e.preventDefault()
      setPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    setInstalling(true)
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    setInstalling(false)
    setPrompt(null)
    setShow(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now())
    setShow(false)
  }

  if (!show) return null

  return (
    <>
      {/* Backdrop blur on mobile */}
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: 'linear-gradient(180deg, #0f1117 0%, #0a0c12 100%)',
        border: '1px solid rgba(14, 165, 233,0.25)',
        borderBottom: 'none',
        borderRadius: '20px 20px 0 0',
        padding: '12px 20px 32px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
        animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.15)',
          margin: '0 auto 18px',
        }} />

        {/* Dismiss */}
        <button onClick={handleDismiss} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.06)', border: 'none',
          borderRadius: 8, padding: '4px 6px', cursor: 'pointer', color: '#94a3b8',
          display: 'flex', alignItems: 'center',
        }}>
          <X size={16} />
        </button>

        {/* Icon + text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <img
            src="/icons/icon-192.png"
            alt="SpaceX Trading"
            style={{ width: 54, height: 54, borderRadius: 14, flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f1f5f9', lineHeight: 1.2 }}>
              SpaceX Trading
            </div>
            <div style={{ fontSize: '0.78rem', color: '#0ea5e9', marginTop: 2 }}>
              spacxtrading.online
            </div>
            <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: 3 }}>
              Install for instant access — no browser needed
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {['24/7 Investing', 'Live Payouts', 'Stock Market', 'Offline Access'].map(f => (
            <span key={f} style={{
              fontSize: '0.7rem', fontWeight: 600, color: '#0ea5e9',
              background: 'rgba(14, 165, 233,0.1)', border: '1px solid rgba(14, 165, 233,0.2)',
              borderRadius: 20, padding: '3px 10px',
            }}>{f}</span>
          ))}
        </div>

        {ios ? (
          /* iOS manual instructions */
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '14px 16px', marginBottom: 14,
            }}>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    background: 'rgba(14, 165, 233,0.15)', border: '1px solid rgba(14, 165, 233,0.3)',
                    borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#0ea5e9', flexShrink: 0,
                  }}>1</span>
                  Tap the <Share size={14} style={{ display: 'inline', marginInline: 4, color: '#0ea5e9' }} /> <strong style={{ color: '#f1f5f9' }}>Share</strong> button in Safari
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    background: 'rgba(14, 165, 233,0.15)', border: '1px solid rgba(14, 165, 233,0.3)',
                    borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#0ea5e9', flexShrink: 0,
                  }}>2</span>
                  Select <Plus size={14} style={{ display: 'inline', marginInline: 4, color: '#0ea5e9' }} /> <strong style={{ color: '#f1f5f9' }}>Add to Home Screen</strong>
                </div>
              </div>
            </div>
            <button onClick={handleDismiss} style={{
              width: '100%', padding: '13px', borderRadius: 12,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            }}>
              Got it
            </button>
          </div>
        ) : (
          /* Android / Chrome install button */
          <button
            onClick={handleInstall}
            disabled={installing}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: installing
                ? 'rgba(14, 165, 233,0.5)'
                : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.95rem',
              cursor: installing ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(14, 165, 233,0.3)',
              transition: 'all 0.2s',
            }}
          >
            <Download size={18} />
            {installing ? 'Installing…' : 'Install App'}
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
