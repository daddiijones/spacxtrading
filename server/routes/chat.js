import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '../uploads/chat')

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv'
])

const ALLOWED_EXT = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'
])

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const rand = crypto.randomBytes(12).toString('hex')
    cb(null, `${Date.now()}-${rand}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ALLOWED_MIME.has(file.mimetype) && ALLOWED_EXT.has(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`File type not allowed: ${ext}`))
    }
  }
})

const router = Router()

// ── File upload (up to 10 files, no auth required so guest users can upload) ─
router.post('/upload', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }
    const files = req.files.map(f => ({
      url: `/uploads/chat/${f.filename}`,
      name: f.originalname,
      type: f.mimetype,
      size: f.size
    }))
    res.json({ files })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes('File type')) {
    return res.status(400).json({ error: err.message })
  }
  next(err)
})

// Admin: list all sessions (open + closed)
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({ where: { id: req.userId } })
    if (user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' })
    const sessions = await req.prisma.chatSession.findMany({
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { updatedAt: 'desc' }
    })
    res.json(sessions)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin: close a session
router.put('/sessions/:id/close', authMiddleware, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({ where: { id: req.userId } })
    if (user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' })
    const session = await req.prisma.chatSession.update({
      where: { id: req.params.id }, data: { status: 'CLOSED' }
    })
    res.json(session)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Admin: reopen a closed session
router.put('/sessions/:id/reopen', authMiddleware, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({ where: { id: req.userId } })
    if (user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' })
    const session = await req.prisma.chatSession.update({
      where: { id: req.params.id }, data: { status: 'OPEN', updatedAt: new Date() }
    })
    res.json(session)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Unread open session count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await req.prisma.chatSession.count({ where: { status: 'OPEN' } })
    res.json({ count })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
