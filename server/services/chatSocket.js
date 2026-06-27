import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'spacxtrading-secret-2026'

const adminSockets = new Set()
const sessionSockets = new Map()
let offlineEmailTimer = null

export function setupChatSocket(httpServer, prisma) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/socket.io'
  })

  io.on('connection', (socket) => {
    const ip =
      socket.handshake.headers['x-forwarded-for']?.split(',')[0].trim() ||
      socket.handshake.address ||
      'unknown'

    // ── Admin joins ──────────────────────────────────────────────────────────
    socket.on('admin:join', (token) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        if (decoded.role !== 'ADMIN') return socket.emit('admin:error', 'Not authorized')
        socket.join('admin_room')
        adminSockets.add(socket.id)
        socket.data.isAdmin = true

        if (offlineEmailTimer) { clearTimeout(offlineEmailTimer); offlineEmailTimer = null }

        // Send ALL sessions (open + closed) so admin can view history and reopen
        prisma.chatSession.findMany({
          include: { messages: { orderBy: { createdAt: 'asc' } } },
          orderBy: { updatedAt: 'desc' }
        }).then(sessions => socket.emit('admin:sessions', sessions))

        io.emit('chat:admin_status', { online: true })
      } catch { socket.emit('admin:error', 'Invalid token') }
    })

    // ── User starts chat — resume by email if session exists ─────────────────
    socket.on('chat:start', async ({ name, email, userId }) => {
      try {
        // Look for most recent session with this email
        let session = await prisma.chatSession.findFirst({
          where: { guestEmail: email },
          orderBy: { createdAt: 'desc' },
          include: { messages: { orderBy: { createdAt: 'asc' } } }
        })

        if (session) {
          // Reopen if it was closed
          if (session.status === 'CLOSED') {
            session = await prisma.chatSession.update({
              where: { id: session.id },
              data: { status: 'OPEN', guestIp: ip, updatedAt: new Date() },
              include: { messages: { orderBy: { createdAt: 'asc' } } }
            })
          }
          socket.data.sessionId = session.id
          socket.join(`session_${session.id}`)
          if (!sessionSockets.has(session.id)) sessionSockets.set(session.id, new Set())
          sessionSockets.get(session.id).add(socket.id)

          socket.emit('chat:session_created', { ...session, resumed: true })
          io.to('admin_room').emit('chat:session_resumed', session)
          io.to('admin_room').emit('admin:beep')
        } else {
          // New session
          session = await prisma.chatSession.create({
            data: { guestName: name, guestEmail: email, guestIp: ip, userId: userId || null, status: 'OPEN' },
            include: { messages: true }
          })
          socket.data.sessionId = session.id
          socket.join(`session_${session.id}`)
          if (!sessionSockets.has(session.id)) sessionSockets.set(session.id, new Set())
          sessionSockets.get(session.id).add(socket.id)

          socket.emit('chat:session_created', session)
          io.to('admin_room').emit('chat:new_session', session)
          io.to('admin_room').emit('admin:beep')
        }

        if (adminSockets.size === 0) scheduleOfflineEmail(prisma, session)
      } catch (err) { socket.emit('chat:error', err.message) }
    })

    // ── Rejoin by session ID (page refresh) ──────────────────────────────────
    socket.on('chat:rejoin', async (sessionId) => {
      try {
        const session = await prisma.chatSession.findUnique({
          where: { id: sessionId },
          include: { messages: { orderBy: { createdAt: 'asc' } } }
        })
        if (!session) return socket.emit('chat:error', 'Session not found')
        socket.data.sessionId = session.id
        socket.join(`session_${session.id}`)
        if (!sessionSockets.has(session.id)) sessionSockets.set(session.id, new Set())
        sessionSockets.get(session.id).add(socket.id)
        socket.emit('chat:session_created', session)
      } catch (err) { socket.emit('chat:error', err.message) }
    })

    // ── User sends message (text + optional files + optional reply) ───────────
    socket.on('chat:message', async ({ sessionId, message, files, replyToId, replyToSnippet, replyToSender }) => {
      try {
        const msg = await prisma.chatMessage.create({
          data: {
            sessionId, sender: 'user',
            message: message || '',
            files: files || undefined,
            replyToId: replyToId || null,
            replyToSnippet: replyToSnippet || null,
            replyToSender: replyToSender || null
          }
        })
        await prisma.chatSession.update({ where: { id: sessionId }, data: { updatedAt: new Date() } })
        io.to(`session_${sessionId}`).emit('chat:new_message', msg)
        io.to('admin_room').emit('chat:new_message', { ...msg, sessionId })
        io.to('admin_room').emit('admin:beep')
        if (adminSockets.size === 0) {
          const session = await prisma.chatSession.findUnique({ where: { id: sessionId } })
          if (session) scheduleOfflineEmail(prisma, session)
        }
      } catch (err) { socket.emit('chat:error', err.message) }
    })

    // ── Admin sends reply ─────────────────────────────────────────────────────
    socket.on('admin:reply', async ({ sessionId, message, files, replyToId, replyToSnippet, replyToSender }) => {
      if (!socket.data.isAdmin) return
      try {
        const msg = await prisma.chatMessage.create({
          data: {
            sessionId, sender: 'admin',
            message: message || '',
            files: files || undefined,
            replyToId: replyToId || null,
            replyToSnippet: replyToSnippet || null,
            replyToSender: replyToSender || null
          }
        })
        await prisma.chatSession.update({ where: { id: sessionId }, data: { updatedAt: new Date() } })
        io.to(`session_${sessionId}`).emit('chat:new_message', msg)
        io.to('admin_room').emit('chat:new_message', { ...msg, sessionId })
      } catch (err) { socket.emit('chat:error', err.message) }
    })

    // ── Admin closes session ──────────────────────────────────────────────────
    socket.on('admin:close_session', async (sessionId) => {
      if (!socket.data.isAdmin) return
      try {
        await prisma.chatSession.update({ where: { id: sessionId }, data: { status: 'CLOSED' } })
        io.to(`session_${sessionId}`).emit('chat:session_closed')
        io.to('admin_room').emit('chat:session_closed', { sessionId })
      } catch (err) { socket.emit('chat:error', err.message) }
    })

    // ── Admin reopens session ─────────────────────────────────────────────────
    socket.on('admin:reopen_session', async (sessionId) => {
      if (!socket.data.isAdmin) return
      try {
        const session = await prisma.chatSession.update({
          where: { id: sessionId },
          data: { status: 'OPEN', updatedAt: new Date() },
          include: { messages: { orderBy: { createdAt: 'asc' } } }
        })
        io.to(`session_${sessionId}`).emit('chat:session_reopened')
        io.to('admin_room').emit('chat:session_reopened', { sessionId })
      } catch (err) { socket.emit('chat:error', err.message) }
    })

    // ── Typing indicators ─────────────────────────────────────────────────────
    socket.on('chat:typing', ({ sessionId, isTyping }) => {
      socket.to(`session_${sessionId}`).emit('chat:typing', { sender: 'user', isTyping })
      socket.to('admin_room').emit('chat:typing', { sender: 'user', sessionId, isTyping })
    })

    socket.on('admin:typing', ({ sessionId, isTyping }) => {
      if (!socket.data.isAdmin) return
      io.to(`session_${sessionId}`).emit('chat:typing', { sender: 'admin', isTyping })
    })

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (socket.data.isAdmin) {
        adminSockets.delete(socket.id)
        if (adminSockets.size === 0) io.emit('chat:admin_status', { online: false })
      }
      if (socket.data.sessionId) {
        const set = sessionSockets.get(socket.data.sessionId)
        if (set) { set.delete(socket.id); if (set.size === 0) sessionSockets.delete(socket.data.sessionId) }
      }
    })
  })

  return io
}

function scheduleOfflineEmail(prisma, session) {
  if (offlineEmailTimer) return
  offlineEmailTimer = setTimeout(async () => {
    offlineEmailTimer = null
    if (adminSockets.size > 0) return
    try {
      const { emailService } = await import('./emailService.js')
      await emailService.sendLiveChatAlert({
        guestName: session.guestName,
        guestEmail: session.guestEmail,
        guestIp: session.guestIp,
        sessionId: session.id
      })
    } catch (err) { console.error('[CHAT] Offline email failed:', err.message) }
  }, 10_000)
}
