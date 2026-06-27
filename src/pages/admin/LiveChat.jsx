import { useState, useEffect, useRef, useContext, useCallback } from 'react'
import { io } from 'socket.io-client'
import { MessageCircle, Send, X, User, Wifi, WifiOff, ArrowLeft, Paperclip, FileText, RotateCcw, CornerUpLeft, XCircle } from 'lucide-react'
import { AuthContext } from '../../App'

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:5002' : ''
const API_BASE = import.meta.env.DEV ? 'http://localhost:5002/api' : '/api'
const ALLOWED_EXT = ['.jpg','.jpeg','.png','.gif','.webp','.pdf','.doc','.docx','.xls','.xlsx','.txt','.csv']
const IMAGE_TYPES = new Set(['image/jpeg','image/png','image/gif','image/webp'])

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator(); const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4)
  } catch (_) {}
}

function showBrowserNotif(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body })
}

function isImage(type) { return IMAGE_TYPES.has(type) }

function FileBubble({ file }) {
  const href = file.url?.startsWith('http') ? file.url : `${SOCKET_URL}${file.url}`
  return isImage(file.type)
    ? <a href={href} target="_blank" rel="noreferrer"><img src={href} alt={file.name} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, display: 'block', marginTop: 4 }} /></a>
    : <a href={href} download={file.name} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '6px 10px', marginTop: 4, textDecoration: 'none', color: '#fff' }}>
        <FileText size={14} /><span style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{file.name}</span>
      </a>
}

function FilePreviewThumb({ file, onRemove }) {
  const isImg = file.type && isImage(file.type)
  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '5px 7px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 72 }}>
      {isImg
        ? <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />
        : <FileText size={24} color="rgba(255,255,255,0.4)" />}
      <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 60 }}>{file.name}</span>
      <button onClick={onRemove} style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', border: 'none', borderRadius: '50%', width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
        <X size={8} color="#fff" />
      </button>
    </div>
  )
}

export default function LiveChat() {
  const { user } = useContext(AuthContext)
  const [sessions, setSessions] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [messages, setMessages] = useState({})
  const [input, setInput] = useState('')
  const [pendingFiles, setPendingFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [typingMap, setTypingMap] = useState({})
  const [replyTo, setReplyTo] = useState(null) // { id, message, sender, files }
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mobileView, setMobileView] = useState('list')
  const socketRef = useRef(null)
  const bottomRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  const selectedSession = sessions.find(s => s.id === selectedId)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
    const token = localStorage.getItem('miningToken')
    if (!token) return
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => { setSocketConnected(true); socket.emit('admin:join', token) })
    socket.on('disconnect', () => setSocketConnected(false))

    socket.on('admin:sessions', (all) => {
      setSessions(all)
      const map = {}; all.forEach(s => { map[s.id] = s.messages || [] }); setMessages(map)
    })

    socket.on('chat:new_session', (session) => {
      setSessions(prev => prev.find(s => s.id === session.id) ? prev : [{ ...session, messages: [] }, ...prev])
      setMessages(prev => ({ ...prev, [session.id]: [] }))
      beep()
      showBrowserNotif('New Live Chat', `${session.guestName} (${session.guestEmail}) started a chat`)
    })

    socket.on('chat:session_resumed', (session) => {
      setSessions(prev => {
        const exists = prev.find(s => s.id === session.id)
        if (exists) return prev.map(s => s.id === session.id ? { ...s, status: 'OPEN' } : s)
        return [session, ...prev]
      })
      beep()
      showBrowserNotif('Chat Resumed', `${session.guestName} returned to chat`)
    })

    socket.on('admin:beep', beep)

    socket.on('chat:new_message', (msg) => {
      const sid = msg.sessionId
      setMessages(prev => {
        const existing = prev[sid] || []
        if (existing.find(m => m.id === msg.id)) return prev
        return { ...prev, [sid]: [...existing, msg] }
      })
      setSessions(prev => prev.map(s => s.id === sid ? { ...s, updatedAt: msg.createdAt } : s).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))
      if (msg.sender === 'user') { beep(); showBrowserNotif('New Message', msg.message?.substring(0, 80) || '📎 File') }
    })

    socket.on('chat:typing', ({ sender, sessionId, isTyping }) => {
      if (sender === 'user') {
        setTypingMap(prev => ({ ...prev, [sessionId]: isTyping }))
        if (isTyping) setTimeout(() => setTypingMap(prev => ({ ...prev, [sessionId]: false })), 4000)
      }
    })

    socket.on('chat:session_closed', ({ sessionId }) => {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'CLOSED' } : s))
    })

    socket.on('chat:session_reopened', ({ sessionId }) => {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'OPEN' } : s))
    })

    return () => { socket.disconnect(); socketRef.current = null }
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages[selectedId], typingMap[selectedId]])

  const selectSession = (id) => { setSelectedId(id); if (isMobile) setMobileView('chat') }
  const goBack = () => { setMobileView('list'); setSelectedId(null) }

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []).filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase()
      return ALLOWED_EXT.includes(ext)
    })
    setPendingFiles(prev => [...prev, ...files].slice(0, 10))
    e.target.value = ''
  }

  const sendReply = useCallback(async () => {
    if (!selectedId) return
    if (!input.trim() && pendingFiles.length === 0) return
    setSending(true)

    let uploadedFiles = []
    if (pendingFiles.length > 0) {
      setUploading(true)
      const fd = new FormData()
      pendingFiles.forEach(f => fd.append('files', f))
      try {
        const res = await fetch(`${API_BASE}/chat/upload`, { method: 'POST', body: fd })
        const data = await res.json()
        if (data.files) uploadedFiles = data.files
      } catch (_) {}
      setUploading(false)
    }

    socketRef.current?.emit('admin:reply', {
      sessionId: selectedId,
      message: input.trim(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      replyToId: replyTo?.id || null,
      replyToSnippet: replyTo ? (replyTo.message?.substring(0, 80) || (Array.isArray(replyTo.files) ? '📎 File' : '')) : null,
      replyToSender: replyTo?.sender || null
    })

    setInput(''); setPendingFiles([]); setReplyTo(null); setSending(false)
    socketRef.current?.emit('admin:typing', { sessionId: selectedId, isTyping: false })
    inputRef.current?.focus()
  }, [input, selectedId, pendingFiles, replyTo])

  const closeSession = useCallback((sessionId) => {
    socketRef.current?.emit('admin:close_session', sessionId)
  }, [])

  const reopenSession = useCallback((sessionId) => {
    socketRef.current?.emit('admin:reopen_session', sessionId)
  }, [])

  const handleAdminTyping = (e) => {
    setInput(e.target.value)
    socketRef.current?.emit('admin:typing', { sessionId: selectedId, isTyping: true })
  }

  function formatTime(d) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  function formatDate(d) { return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }

  function scrollToMessage(msgId) {
    const el = messagesContainerRef.current?.querySelector(`[data-msgid="${msgId}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.style.transition = 'background 0.3s'
    el.style.background = 'rgba(14, 165, 233,0.15)'
    setTimeout(() => { el.style.background = '' }, 1200)
  }

  const openCount = sessions.filter(s => s.status === 'OPEN').length
  const sessionMessages = messages[selectedId] || []
  const canSend = (input.trim() || pendingFiles.length > 0) && !sending && !uploading

  // ── Sidebar ────────────────────────────────────────────────────────────────
  const sidebar = (
    <div style={{ width: isMobile ? '100%' : 290, flexShrink: 0, borderRight: isMobile ? 'none' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={16} style={{ color: 'var(--accent-green)' }} /> Live Chat
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {socketConnected
              ? <><Wifi size={13} color="#22c55e" /><span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700 }}>Live</span></>
              : <><WifiOff size={13} color="#ef4444" /><span style={{ fontSize: '0.7rem', color: '#ef4444' }}>Offline</span></>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: '0.75rem', background: openCount > 0 ? 'rgba(14, 165, 233,0.15)' : 'rgba(255,255,255,0.06)', color: openCount > 0 ? '#0ea5e9' : 'var(--text-muted)', borderRadius: 6, padding: '3px 8px', fontWeight: 600 }}>{openCount} Open</span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', borderRadius: 6, padding: '3px 8px' }}>{sessions.length - openCount} Closed</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sessions.length === 0
          ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No chat sessions yet.<br />Waiting for visitors…</div>
          : sessions.map(sess => {
              const sessMessages = messages[sess.id] || []
              const lastMsg = sessMessages[sessMessages.length - 1]
              const hasUnread = sess.status === 'OPEN' && lastMsg?.sender === 'user'
              const isTyping = typingMap[sess.id]
              return (
                <div key={sess.id} onClick={() => selectSession(sess.id)} style={{
                  padding: '12px 14px', cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: selectedId === sess.id && !isMobile ? 'rgba(14, 165, 233,0.08)' : 'transparent',
                  borderLeft: selectedId === sess.id && !isMobile ? '3px solid #0ea5e9' : '3px solid transparent',
                  transition: 'all 0.15s', opacity: sess.status === 'CLOSED' ? 0.65 : 1
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: sess.status === 'OPEN' ? 'rgba(14, 165, 233,0.2)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={13} color={sess.status === 'OPEN' ? '#0ea5e9' : '#555'} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sess.guestName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {isTyping ? <em style={{ color: '#0ea5e9' }}>typing…</em> : lastMsg ? (lastMsg.message || '📎 File') : sess.guestEmail}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {hasUnread && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0ea5e9', boxShadow: '0 0 6px rgba(14, 165, 233,0.8)' }} />}
                        <span style={{ fontSize: '0.6rem', padding: '2px 5px', borderRadius: 4, fontWeight: 600, background: sess.status === 'OPEN' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)', color: sess.status === 'OPEN' ? '#22c55e' : '#555' }}>{sess.status}</span>
                      </div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{formatDate(sess.updatedAt || sess.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )

  // ── Chat pane ──────────────────────────────────────────────────────────────
  const chatPane = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
      {!selectedSession ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-muted)' }}>
          <MessageCircle size={40} color="rgba(14, 165, 233,0.3)" />
          <span style={{ fontSize: '0.88rem' }}>Select a conversation to start replying</span>
        </div>
      ) : (
        <>
          {/* Chat header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', flexShrink: 0, gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              {isMobile && (
                <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <ArrowLeft size={16} />
                </button>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 130 : 220 }}>{selectedSession.guestName}</span>
                  <span style={{ fontSize: '0.62rem', padding: '2px 7px', borderRadius: 4, fontWeight: 700, flexShrink: 0, background: selectedSession.status === 'OPEN' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)', color: selectedSession.status === 'OPEN' ? '#22c55e' : '#666' }}>{selectedSession.status}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 140 : 200 }}>{selectedSession.guestEmail}</span>
                  {selectedSession.guestIp && !isMobile && <span>IP: {selectedSession.guestIp}</span>}
                  {selectedSession.userId && <span style={{ color: '#0ea5e9' }}>Registered</span>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {selectedSession.status === 'OPEN' ? (
                <button onClick={() => closeSession(selectedId)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: isMobile ? '6px 8px' : '6px 12px', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <X size={13} />{!isMobile && ' Close'}
                </button>
              ) : (
                <button onClick={() => reopenSession(selectedId)} style={{ background: 'rgba(14, 165, 233,0.1)', border: '1px solid rgba(14, 165, 233,0.25)', borderRadius: 8, padding: isMobile ? '6px 8px' : '6px 12px', color: '#0ea5e9', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <RotateCcw size={13} />{!isMobile && ' Reopen'}
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px' : '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessionMessages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: 16 }}>No messages yet — they'll appear here in real-time.</div>
            )}
            {sessionMessages.map(msg => (
              <div key={msg.id} data-msgid={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'admin' ? 'flex-end' : 'flex-start', borderRadius: 10, transition: 'background 0.3s' }}>
                {/* Reply quote — click to jump to original */}
                {msg.replyToSnippet && (
                  <div
                    onClick={() => msg.replyToId && scrollToMessage(msg.replyToId)}
                    style={{ background: 'rgba(255,255,255,0.04)', borderLeft: '3px solid rgba(255,255,255,0.2)', borderRadius: '0 6px 6px 0', padding: '4px 8px', marginBottom: 3, maxWidth: '75%', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', cursor: msg.replyToId ? 'pointer' : 'default' }}
                  >
                    ↩ {msg.replyToSender === 'admin' ? 'You' : selectedSession.guestName}: {msg.replyToSnippet}
                  </div>
                )}
                <div style={{ maxWidth: isMobile ? '88%' : '72%', background: msg.sender === 'admin' ? 'linear-gradient(135deg, rgba(14, 165, 233,0.2), rgba(58,92,0,0.2))' : 'rgba(255,255,255,0.07)', border: msg.sender === 'admin' ? '1px solid rgba(14, 165, 233,0.2)' : '1px solid rgba(255,255,255,0.06)', borderRadius: msg.sender === 'admin' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '9px 13px' }}>
                  {msg.message && <div style={{ fontSize: '0.82rem', color: '#fff', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.message}</div>}
                  {Array.isArray(msg.files) && msg.files.map((f, i) => <FileBubble key={i} file={f} />)}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 5 }}>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)' }}>{msg.sender === 'admin' ? 'You' : selectedSession.guestName} · {formatTime(msg.createdAt)}</span>
                    <button onClick={() => setReplyTo(msg)} title="Reply to this message" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '0 1px', display: 'flex', alignItems: 'center' }}>
                      <CornerUpLeft size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {typingMap[selectedId] && (
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 3, padding: '8px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9', animation: `typing-dot 1.2s ${i*0.2}s infinite` }} />)}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{selectedSession.guestName} is typing…</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {selectedSession.status === 'OPEN' ? (
            <div style={{ padding: isMobile ? '8px 12px 10px' : '10px 16px 12px', borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
              {/* Reply banner */}
              {replyTo && (
                <div style={{ background: 'rgba(14, 165, 233,0.08)', borderLeft: '3px solid #0ea5e9', borderRadius: '0 8px 8px 0', padding: '5px 10px', marginBottom: 7, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#0ea5e9', fontWeight: 700 }}>{replyTo.sender === 'admin' ? 'You' : selectedSession.guestName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                      {replyTo.message?.substring(0, 80) || (Array.isArray(replyTo.files) ? '📎 File' : '')}
                    </div>
                  </div>
                  <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', flexShrink: 0 }}><XCircle size={14} /></button>
                </div>
              )}

              {/* File previews */}
              {pendingFiles.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {pendingFiles.map((f, i) => (
                    <FilePreviewThumb key={i} file={f} onRemove={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))} />
                  ))}
                  {pendingFiles.length < 10 && (
                    <div onClick={() => fileInputRef.current?.click()} style={{ width: 44, height: 44, border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>
                      <span style={{ fontSize: '1.1rem' }}>+</span>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <button onClick={() => fileInputRef.current?.click()} title="Attach files" style={{ width: 34, height: 34, flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: pendingFiles.length > 0 ? '#0ea5e9' : 'rgba(255,255,255,0.4)' }}>
                  <Paperclip size={14} />
                </button>
                <input ref={fileInputRef} type="file" multiple accept={ALLOWED_EXT.join(',')} onChange={handleFileChange} style={{ display: 'none' }} />

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleAdminTyping}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                  placeholder={`Reply to ${selectedSession.guestName}…`}
                  rows={isMobile ? 1 : 2}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: '0.85rem', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.4 }}
                />

                <button onClick={sendReply} disabled={!canSend} style={{ height: 40, padding: '0 14px', borderRadius: 10, flexShrink: 0, background: canSend ? 'linear-gradient(135deg, #0ea5e9, #0b3d91)' : 'rgba(255,255,255,0.06)', border: '1px solid transparent', display: 'flex', alignItems: 'center', gap: 6, color: canSend ? '#fff' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem', cursor: canSend ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                  {uploading
                    ? <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    : <Send size={14} />}
                  {!isMobile && ' Send'}
                </button>
              </div>

              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.18)', marginTop: 4 }}>
                {pendingFiles.length}/10 files · jpg, png, pdf, doc, xlsx, txt · max 10 MB each
              </div>
            </div>
          ) : (
            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This conversation is closed.</span>
              <button onClick={() => reopenSession(selectedId)} style={{ background: 'rgba(14, 165, 233,0.1)', border: '1px solid rgba(14, 165, 233,0.25)', borderRadius: 8, padding: '6px 14px', color: '#0ea5e9', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={13} /> Reopen Chat
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )

  return (
    <div style={{ height: isMobile ? 'calc(100vh - 100px)' : 'calc(100vh - 120px)', display: 'flex', background: 'var(--bg-card)', borderRadius: isMobile ? 12 : 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      {isMobile ? (mobileView === 'list' ? sidebar : chatPane) : <>{sidebar}{chatPane}</>}
      <style>{`
        @keyframes typing-dot { 0%,80%,100%{transform:scale(0.7);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
