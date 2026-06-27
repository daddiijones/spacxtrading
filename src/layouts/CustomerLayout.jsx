import { Outlet, NavLink, useLocation, Link } from 'react-router-dom'
import { useContext, useState, useEffect, useRef } from 'react'
import { AuthContext } from '../App'
import { userApi } from '../utils/api'
import LiveChatWidget from '../components/LiveChatWidget'
import {
  LayoutDashboard, ArrowDownToLine, ArrowUpFromLine,
  Rocket, Orbit, Users, UserCircle, LogOut, Menu, X, Bell, History,
  Globe, HelpCircle, Mail, Code, Activity, FileText, TrendingUp, BarChart2
} from 'lucide-react'

export default function CustomerLayout() {
  const { user, logout } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [selectedLang, setSelectedLang] = useState('en')
  const location = useLocation()
  const notifRef = useRef(null)

  const getPageTitle = () => {
    const map = {
      '/dashboard': 'Dashboard',
      '/deposit': 'Deposit Funds',
      '/withdraw': 'Withdraw',
      '/plans': 'Investment Plans',
      '/my-minings': 'My Missions',
      '/stocks': 'Stock Market',
      '/my-stocks': 'My Stock Portfolio',
      '/referrals': 'Referrals',
      '/profile': 'Profile',
      '/transactions': 'Transaction History',
    }
    return map[location.pathname] || 'Dashboard'
  }

  // Load notifications + Poll every 10 seconds (real-time)
  const loadNotifications = () => {
    userApi.getNotifications()
      .then(data => {
        setNotifications(data || [])
        setUnreadCount(data ? data.filter(n => !n.isRead).length : 0)
      })
      .catch(err => console.error('Error fetching notifications:', err))
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Drive the hidden Google Translate widget — no reload, no Google UI
  const switchLanguage = (langCode) => {
    setSelectedLang(langCode)
    const combo = document.querySelector('#gt_hidden select.goog-te-combo')
    if (combo) {
      if (langCode === 'en') {
        combo.value = 'en';
        combo.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
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

  const handleMarkAllRead = () => {
    userApi.markAllNotificationsRead()
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      })
      .catch(err => console.error('Error marking all as read:', err))
  }

  const handleMarkSingleRead = (id) => {
    userApi.markNotificationRead(id)
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      })
      .catch(err => console.error('Error marking read:', err))
  }

  const getNotifColor = (type) => {
    switch (type) {
      case 'DEPOSIT': return 'var(--accent-cyan)'
      case 'WITHDRAWAL': return 'var(--danger)'
      case 'MINING': return 'var(--accent-green)'
      case 'STOCK': return '#627eea'
      default: return 'var(--accent-cyan)'
    }
  }

  const formatNotifDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/deposit', icon: ArrowDownToLine, label: 'Deposit' },
    { to: '/withdraw', icon: ArrowUpFromLine, label: 'Withdraw' },
    { to: '/plans', icon: Rocket, label: 'Investment Plans' },
    { to: '/my-minings', icon: Orbit, label: 'My Missions' },
    { to: '/stocks', icon: TrendingUp, label: 'Stock Market' },
    { to: '/my-stocks', icon: BarChart2, label: 'My Stocks' },
    { to: '/referrals', icon: Users, label: 'Referrals' },
    { to: '/transactions', icon: History, label: 'Transactions' },
    { to: '/profile', icon: UserCircle, label: 'Profile' },
  ]

  const supportItems = [
    { to: '/help', icon: HelpCircle, label: 'Help Center' },
    { to: '/contact', icon: Mail, label: 'Contact Us' },
    { to: '/api-docs', icon: Code, label: 'API Docs' },
    { to: '/status', icon: Activity, label: 'Status Page' },
    { to: '/terms', icon: FileText, label: 'Terms of Service' },
  ]

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 99
      }} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">🚀</div>
          <h1>SpaceX Trading</h1>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Menu</div>
            {navItems.map(item => (
              <NavLink
                key={item.to} to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-section" style={{ marginTop: 24 }}>
            <div className="nav-section-title">Support & Platform Info</div>
            {supportItems.map(item => (
              <NavLink
                key={item.to} to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                style={{ opacity: 0.85 }}
              >
                <item.icon size={16} />
                <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link logout-btn" onClick={() => { localStorage.removeItem('miningToken'); logout() }} style={{ width: '100%', color: 'var(--danger)', cursor: 'pointer' }}>
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn-secondary" onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none', padding: '8px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              id="mobile-menu-btn"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2>{getPageTitle()}</h2>
          </div>
          <div className="topbar-right" style={{ gap: 16 }}>
            {/* Custom Language Selector */}
            <div className="lang-selector" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '4px 8px' }}>
              <Globe size={14} style={{ color: 'var(--accent-cyan)', marginRight: 6, flexShrink: 0 }} />
              <select
                className="notranslate"
                onChange={(e) => switchLanguage(e.target.value)}
                value={selectedLang}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.82rem', cursor: 'pointer', outline: 'none', fontFamily: 'Inter, sans-serif' }}
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

            {/* Dynamic Notification Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button 
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                style={{ position: 'relative', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0,
                    minWidth: 14, height: 14, borderRadius: '50%',
                    background: 'var(--danger)', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                    animation: 'pulse 2s infinite'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Glassmorphic Notification Panel */}
              {showNotifPanel && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 12px)',
                  width: 'min(340px, calc(100vw - 24px))', background: 'rgba(20,24,35,0.92)', backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                  boxShadow: 'var(--shadow-lg), 0 10px 40px rgba(0,0,0,0.5)',
                  zIndex: 999, overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: 300, overflowY: 'auto', padding: '8px 0' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => !notif.isRead && handleMarkSingleRead(notif.id)}
                          style={{
                            padding: '12px 16px', display: 'flex', gap: 12,
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            background: notif.isRead ? 'transparent' : 'rgba(0,212,255,0.03)',
                            cursor: notif.isRead ? 'default' : 'pointer',
                            transition: 'background 0.2s'
                          }}
                        >
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: getNotifColor(notif.type), marginTop: 6,
                            flexShrink: 0
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: notif.isRead ? 'var(--text-secondary)' : '#fff', margin: 0 }}>
                                {notif.title}
                              </h4>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                                {formatNotifDate(notif.createdAt)}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: '4px 0 0 0' }}>
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="topbar-avatar">{user?.fullName?.[0] || 'U'}</div>
            <span className="topbar-username" style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user?.fullName || 'User'}</span>
            <button onClick={() => { localStorage.removeItem('miningToken'); logout() }}
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 12px', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600 }}>
              <LogOut size={14} /> <span className="logout-label">Logout</span>
            </button>
          </div>
        </header>

        <div className="page-content fade-in">
          <Outlet />
        </div>
      </main>
      <LiveChatWidget />

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
          .sidebar.open { transform: translateX(0) !important; }
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  )
}
