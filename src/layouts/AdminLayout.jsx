import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useContext, useState, useEffect, useRef } from 'react'
import { AuthContext } from '../App'
import { io } from 'socket.io-client'
import {
  LayoutDashboard, Users, ArrowDownToLine, ArrowUpFromLine,
  Rocket, Settings, LogOut, Menu, X, Shield, Orbit, MessageCircle, TrendingUp
} from 'lucide-react'

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:5002' : ''

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4)
  } catch (_) {}
}

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatBadge, setChatBadge] = useState(0)
  const location = useLocation()
  const socketRef = useRef(null)

  // Background socket connection to track new chats + beep
  useEffect(() => {
    const token = localStorage.getItem('miningToken')
    if (!token) return
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket
    socket.on('connect', () => socket.emit('admin:join', token))
    socket.on('admin:sessions', (sessions) => {
      setChatBadge(sessions.filter(s => s.status === 'OPEN').length)
    })
    socket.on('chat:new_session', () => {
      setChatBadge(p => p + 1)
      beep()
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Live Chat', { body: 'A visitor started a chat session.' })
      }
    })
    socket.on('admin:beep', beep)
    socket.on('chat:session_closed', () => setChatBadge(p => Math.max(0, p - 1)))
    return () => { socket.disconnect(); socketRef.current = null }
  }, [])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const getPageTitle = () => {
    const map = {
      '/admin': 'Admin Dashboard',
      '/admin/users': 'User Management',
      '/admin/deposits': 'Deposit Management',
      '/admin/withdrawals': 'Withdrawal Management',
      '/admin/plans': 'Manage Plans',
      '/admin/settings': 'Platform Settings',
      '/admin/live-chat': 'Live Chat',
      '/admin/stocks': 'Stock Investments',
    }
    return map[location.pathname] || 'Admin'
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/deposits', icon: ArrowDownToLine, label: 'Deposits' },
    { to: '/admin/withdrawals', icon: ArrowUpFromLine, label: 'Withdrawals' },
    { to: '/admin/plans', icon: Rocket, label: 'Investment Plans' },
    { to: '/admin/minings', icon: Orbit, label: 'Active Missions' },
    { to: '/admin/live-chat', icon: MessageCircle, label: 'Live Chat', badge: chatBadge },
    { to: '/admin/stocks', icon: TrendingUp, label: 'Stock Investments' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="app-layout">
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 99
      }} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #7c3aed)' }}>
            <Shield size={18} />
          </div>
          <h1 style={{ background: 'linear-gradient(135deg, #ef4444, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Admin Panel
          </h1>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Management</div>
            {navItems.map(item => (
              <NavLink
                key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                style={{ position: 'relative' }}
              >
                <item.icon />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span style={{
                    marginLeft: 'auto', minWidth: 18, height: 18, borderRadius: 9,
                    background: '#0ea5e9', color: '#000', fontSize: '0.68rem',
                    fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px', boxShadow: '0 0 8px rgba(14, 165, 233,0.6)'
                  }}>{item.badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/dashboard" className="nav-link" style={{ color: 'var(--accent-cyan)', marginBottom: 8 }}>
            <LayoutDashboard /> <span>Customer View</span>
          </NavLink>
          <button className="nav-link logout-btn" onClick={() => { localStorage.removeItem('miningToken'); logout() }} style={{ width: '100%', color: 'var(--danger)', cursor: 'pointer' }}>
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none', padding: '8px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              id="admin-menu-btn"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2>{getPageTitle()}</h2>
          </div>
          <div className="topbar-right">
            <span className="badge badge-active">ADMIN</span>
            <div className="topbar-avatar" style={{ background: 'linear-gradient(135deg, #ef4444, #7c3aed)' }}>
              {user?.fullName?.[0] || 'A'}
            </div>
            <button onClick={() => { localStorage.removeItem('miningToken'); logout() }}
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 12px', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600 }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </header>

        <div className="page-content fade-in">
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          #admin-menu-btn { display: flex !important; }
          .sidebar.open { transform: translateX(0) !important; }
        }
      `}</style>
    </div>
  )
}
