import { useState, useEffect, useRef, useContext } from 'react'
import { io } from 'socket.io-client'
import { MessageCircle, X, Send, ChevronDown, Paperclip, FileText, Image, CornerUpLeft, XCircle } from 'lucide-react'
import { AuthContext } from '../App'

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:5002' : ''
const API_BASE = import.meta.env.DEV ? 'http://localhost:5002/api' : '/api'
const SESSION_KEY = 'livechat_session_id'

const ALLOWED_EXT = ['.jpg','.jpeg','.png','.gif','.webp','.pdf','.doc','.docx','.xls','.xlsx','.txt','.csv']
const IMAGE_TYPES = new Set(['image/jpeg','image/png','image/gif','image/webp'])

function isImage(type) { return IMAGE_TYPES.has(type) }

function FilePreview({ file, onRemove }) {
  const isImg = file.type && isImage(file.type)
  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '6px 8px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 80 }}>
      {isImg
        ? <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
        : <FileText size={28} color="rgba(255,255,255,0.4)" />}
      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 64 }}>{file.name}</span>
      <button onClick={onRemove} style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
        <X size={9} color="#fff" />
      </button>
    </div>
  )
}

function AttachedFileBubble({ file }) {
  const isImg = isImage(file.type)
  const href = file.url.startsWith('http') ? file.url : `${SOCKET_URL}${file.url}`
  return isImg
    ? <a href={href} target="_blank" rel="noreferrer"><img src={href} alt={file.name} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, display: 'block', marginTop: 4 }} /></a>
    : (
      <a href={href} target="_blank" rel="noreferrer" download={file.name} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '6px 10px', marginTop: 4, textDecoration: 'none', color: '#fff' }}>
        <FileText size={14} /> <span style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{file.name}</span>
      </a>
    )
}

function ReplyBanner({ snippet, sender, onClear }) {
  return (
    <div style={{ background: 'rgba(14, 165, 233,0.1)', borderLeft: '3px solid #0ea5e9', borderRadius: '0 8px 8px 0', padding: '5px 10px', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div>
        <div style={{ fontSize: '0.65rem', color: '#0ea5e9', fontWeight: 700 }}>{sender === 'admin' ? 'Support' : 'You'}</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{snippet}</div>
      </div>
      <button onClick={onClear} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 2, flexShrink: 0 }}><XCircle size={14} /></button>
    </div>
  )
}

export default function LiveChatWidget() {
  const ctx = useContext(AuthContext)
  const user = ctx?.user || null

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('intro') // intro | form | starting | chat | closed
  const [form, setForm] = useState({ name: '', email: '' })
  const [formError, setFormError] = useState('')
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [pendingFiles, setPendingFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [adminOnline, setAdminOnline] = useState(false)
  const [typing, setTyping] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const socketRef = useRef(null)
  const bottomRef = useRef(null)
  const messagesRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimer = useRef(null)

  useEffect(() => {
    if (user) setForm({ name: user.fullName || '', email: user.email || '' })
  }, [user])

  useEffect(() => {
    if (!open) return
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      const savedId = sessionStorage.getItem(SESSION_KEY)
      if (savedId) socket.emit('chat:rejoin', savedId)
    })

    socket.on('chat:admin_status', ({ online }) => setAdminOnline(online))

    socket.on('chat:session_created', (sess) => {
      setSession(sess)
      setMessages(sess.messages || [])
      sessionStorage.setItem(SESSION_KEY, sess.id)
      setStep('chat')
    })

    socket.on('chat:new_message', (msg) => {
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
      setTyping(false)
    })

    socket.on('chat:typing', ({ sender, isTyping }) => {
      if (sender === 'admin') setTyping(isTyping)
    })

    socket.on('chat:session_closed', () => {
      setStep('closed')
      sessionStorage.removeItem(SESSION_KEY)
    })

    socket.on('chat:session_reopened', () => {
      setStep('chat')
    })

    return () => { socket.disconnect(); socketRef.current = null }
  }, [open])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  function handleStart() {
    // If logged in and has full name + email, start directly; otherwise show form
    if (user && user.fullName?.trim() && user.email?.trim()) {
      doStartSession(user.fullName.trim(), user.email.trim())
    } else {
      setStep('form')
    }
  }

  function doStartSession(name, email) {
    setStep('starting') // show spinner immediately
    setFormError('')
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:start', { name, email, userId: user?.id || null })
    } else {
      // Wait for connect then emit
      const socket = socketRef.current
      if (!socket) return
      const onConnect = () => {
        socket.emit('chat:start', { name, email, userId: user?.id || null })
        socket.off('connect', onConnect)
      }
      socket.on('connect', onConnect)
    }
  }

  function startSession(name, email) {
    if (!name?.trim() || !email?.trim()) { setFormError('Name and email are required.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setFormError('Enter a valid email.'); return }
    doStartSession(name.trim(), email.trim())
  }

  function scrollToMessage(msgId) {
    const el = messagesRef.current?.querySelector(`[data-msgid="${msgId}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.style.transition = 'background 0.3s'
    el.style.background = 'rgba(14, 165, 233,0.18)'
    setTimeout(() => { el.style.background = '' }, 1200)
  }

  function handleFileChange(e) {
    const newFiles = Array.from(e.target.files || [])
    const filtered = newFiles.filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase()
      return ALLOWED_EXT.includes(ext)
    })
    setPendingFiles(prev => {
      const combined = [...prev, ...filtered]
      return combined.slice(0, 10) // max 10
    })
    e.target.value = ''
  }

  async function sendMessage() {
    if (!session) return
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
      } catch { /* upload failed, send text only */ }
      setUploading(false)
    }

    socketRef.current?.emit('chat:message', {
      sessionId: session.id,
      message: input.trim(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      replyToId: replyTo?.id || null,
      replyToSnippet: replyTo ? (replyTo.message?.substring(0, 80) || (replyTo.files ? '📎 File' : '')) : null,
      replyToSender: replyTo?.sender || null
    })

    setInput('')
    setPendingFiles([])
    setReplyTo(null)
    setSending(false)
    socketRef.current?.emit('chat:typing', { sessionId: session.id, isTyping: false })
  }

  function handleInputChange(e) {
    setInput(e.target.value)
    if (!session) return
    socketRef.current?.emit('chat:typing', { sessionId: session.id, isTyping: true })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('chat:typing', { sessionId: session.id, isTyping: false })
    }, 2000)
  }

  function resetChat() {
    sessionStorage.removeItem(SESSION_KEY)
    setSession(null); setMessages([]); setStep('intro'); setInput(''); setPendingFiles([]); setReplyTo(null)
  }

  function formatTime(d) {
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const canSend = (input.trim() || pendingFiles.length > 0) && !sending && !uploading

  return (
    <>
      {/* Bubble */}
      <div onClick={() => setOpen(o => !o)} style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, #0ea5e9, #0b3d91)',
        boxShadow: '0 4px 24px rgba(14, 165, 233,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'transform 0.2s'
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? <X size={22} color="#fff" /> : <MessageCircle size={22} color="#fff" />}
        {!open && (
          <span style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: '50%', background: adminOnline ? '#22c55e' : '#94a3b8', border: '2px solid #0a0e1a', boxShadow: adminOnline ? '0 0 8px rgba(34,197,94,0.8)' : 'none' }} />
        )}
      </div>

      {/* Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 9998,
          width: 'min(360px, calc(100vw - 48px))',
          background: 'rgba(15,18,30,0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(14, 165, 233,0.25)', borderRadius: 16,
          boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          maxHeight: 'min(560px, calc(100vh - 120px))',
          animation: 'chatSlideUp 0.22s ease-out'
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233,0.15), rgba(58,92,0,0.1))', borderBottom: '1px solid rgba(14, 165, 233,0.15)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #0b3d91)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageCircle size={16} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>SpaceX Trading Support</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: adminOnline ? '#22c55e' : '#94a3b8', boxShadow: adminOnline ? '0 0 6px rgba(34,197,94,0.8)' : 'none', animation: adminOnline ? 'pulse-dot 2s infinite' : 'none' }} />
                <span style={{ fontSize: '0.72rem', color: adminOnline ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>
                  {adminOnline ? 'Live · Online now' : 'Typically replies within 24h'}
                </span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}>
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Body */}
          <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {step === 'intro' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 12 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #0b3d91)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={28} color="#fff" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: 6 }}>Hi there! 👋</div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                    Have a question? We're here to help with your investment account, deposits, withdrawals, and more.
                  </div>
                </div>
                <button onClick={handleStart} style={{ background: 'linear-gradient(135deg, #0ea5e9, #0b3d91)', border: 'none', borderRadius: 10, padding: '10px 28px', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', width: '100%', boxShadow: '0 4px 16px rgba(14, 165, 233,0.3)' }}>
                  Start Live Chat
                </button>
              </div>
            )}

            {step === 'starting' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingTop: 24 }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(14, 165, 233,0.2)', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Connecting you to support…</span>
              </div>
            )}

            {step === 'form' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>Tell us a bit about yourself to get started.</div>
                {formError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem', color: '#f87171' }}>{formError}</div>}
                <input placeholder="Your full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                <input placeholder="Your email address" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
                <button onClick={() => startSession(form.name, form.email)} style={{ background: 'linear-gradient(135deg, #0ea5e9, #0b3d91)', border: 'none', borderRadius: 10, padding: '10px 0', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(14, 165, 233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Start Chatting
                </button>
              </div>
            )}

            {step === 'chat' && (
              <>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', padding: '12px 0' }}>
                    {session?.resumed ? 'Welcome back! Your previous chat history is loaded.' : 'Session started — say hello!'}
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} data-msgid={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', borderRadius: 10, transition: 'background 0.3s' }}>
                    {/* Reply quote — click to jump to original */}
                    {msg.replyToSnippet && (
                      <div
                        onClick={() => msg.replyToId && scrollToMessage(msg.replyToId)}
                        style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid rgba(255,255,255,0.2)', borderRadius: '0 6px 6px 0', padding: '4px 8px', marginBottom: 3, maxWidth: '80%', fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', cursor: msg.replyToId ? 'pointer' : 'default' }}
                      >
                        ↩ {msg.replyToSender === 'admin' ? 'Support' : 'You'}: {msg.replyToSnippet}
                      </div>
                    )}
                    <div style={{ maxWidth: '82%', background: msg.sender === 'user' ? 'linear-gradient(135deg, #0ea5e9, #075f9e)' : 'rgba(255,255,255,0.07)', borderRadius: msg.sender === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '9px 13px' }}>
                      {msg.message && <div style={{ fontSize: '0.82rem', color: '#fff', lineHeight: 1.45 }}>{msg.message}</div>}
                      {Array.isArray(msg.files) && msg.files.map((f, i) => <AttachedFileBubble key={i} file={f} />)}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: '0.62rem', opacity: 0.45 }}>{formatTime(msg.createdAt)}</span>
                        <button onClick={() => setReplyTo(msg)} title="Reply" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center' }}>
                          <CornerUpLeft size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 3, padding: '8px 12px', background: 'rgba(255,255,255,0.07)', borderRadius: 14 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9', animation: `typing-dot 1.2s ${i*0.2}s infinite` }} />)}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>Support is typing…</span>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}

            {step === 'closed' && (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>This chat has ended. Thank you for reaching out!</div>
                <button onClick={resetChat} style={{ background: 'rgba(14, 165, 233,0.15)', border: '1px solid rgba(14, 165, 233,0.3)', borderRadius: 8, padding: '8px 20px', color: '#0ea5e9', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                  Start New Chat
                </button>
              </div>
            )}
          </div>

          {/* Input area */}
          {step === 'chat' && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 12px 10px' }}>
              {/* Reply banner */}
              {replyTo && (
                <ReplyBanner
                  snippet={replyTo.message?.substring(0, 80) || (Array.isArray(replyTo.files) ? '📎 File' : '')}
                  sender={replyTo.sender}
                  onClear={() => setReplyTo(null)}
                />
              )}

              {/* Pending file previews */}
              {pendingFiles.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {pendingFiles.map((f, i) => (
                    <FilePreview key={i} file={f} onRemove={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))} />
                  ))}
                  {pendingFiles.length < 10 && (
                    <div onClick={() => fileInputRef.current?.click()} style={{ width: 48, height: 48, border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>+</span>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                {/* Attach button */}
                <button onClick={() => fileInputRef.current?.click()} title="Attach files (up to 10)" style={{ width: 32, height: 32, flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: pendingFiles.length > 0 ? '#0ea5e9' : 'rgba(255,255,255,0.4)' }}>
                  <Paperclip size={14} />
                </button>
                <input ref={fileInputRef} type="file" multiple accept={ALLOWED_EXT.join(',')} onChange={handleFileChange} style={{ display: 'none' }} />

                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Type a message…"
                  rows={1}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 11px', color: '#fff', fontSize: '0.82rem', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.4, maxHeight: 80, overflowY: 'auto' }}
                />

                <button onClick={sendMessage} disabled={!canSend} style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: canSend ? 'linear-gradient(135deg, #0ea5e9, #0b3d91)' : 'rgba(255,255,255,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canSend ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                  {uploading ? <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Send size={13} color={canSend ? '#fff' : '#555'} />}
                </button>
              </div>

              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', marginTop: 5, textAlign: 'center' }}>
                {pendingFiles.length}/10 files · jpg, png, pdf, doc, xlsx, txt
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.6)} 50%{box-shadow:0 0 0 5px rgba(34,197,94,0)} }
        @keyframes typing-dot { 0%,80%,100%{transform:scale(0.7);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </>
  )
}

const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }
