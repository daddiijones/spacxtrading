import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  error: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  info: { icon: Info, color: '#00d4ff', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.3)' },
}

function Toast({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false)
  const cfg = ICONS[toast.type] || ICONS.info
  const Icon = cfg.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      background: cfg.bg, backdropFilter: 'blur(20px)',
      border: `1px solid ${cfg.border}`,
      borderRadius: 14, padding: '14px 18px', minWidth: 340, maxWidth: 440,
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      animation: exiting ? 'toastOut 0.3s ease-in forwards' : 'toastIn 0.35s ease-out',
      pointerEvents: 'all'
    }}>
      <Icon size={22} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9', marginBottom: 2 }}>{toast.title}</div>}
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>{toast.message}</div>
      </div>
      <button onClick={() => { setExiting(true); setTimeout(() => onRemove(toast.id), 300) }}
        style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: '#64748b', flexShrink: 0 }}>
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, message, title, duration) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, type, message, title, duration }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (message, title = 'Success') => addToast('success', message, title),
    error: (message, title = 'Error') => addToast('error', message, title),
    warning: (message, title = 'Warning') => addToast('warning', message, title),
    info: (message, title = 'Info') => addToast('info', message, title),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 10000,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none'
      }}>
        {toasts.map(t => <Toast key={t.id} toast={t} onRemove={removeToast} />)}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(100px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(100px) scale(0.95); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
