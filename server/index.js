import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import depositRoutes from './routes/deposits.js'
import withdrawalRoutes from './routes/withdrawals.js'
import miningRoutes from './routes/mining.js'
import adminRoutes from './routes/admin.js'
import publicRoutes from './routes/public.js'
import chatRoutes from './routes/chat.js'
import stockRoutes from './routes/stocks.js'
import { accrueAllMinings } from './services/miningAccrual.js'
import { accrueAllStocks } from './services/stockAccrual.js'
import { setupChatSocket } from './services/chatSocket.js'
import cron from 'node-cron'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const prisma = new PrismaClient()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Serve the built frontend (production: single Node process serves both API and SPA)
app.use(express.static(path.join(__dirname, '../dist')))

// Make prisma available to routes
app.use((req, res, next) => {
  req.prisma = prisma
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/deposits', depositRoutes)
app.use('/api/withdrawals', withdrawalRoutes)
app.use('/api/mining', miningRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/stocks', stockRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// SPA fallback: any non-API, non-asset GET request gets the React app's index.html
// so client-side routing (react-router-dom) works on a hard refresh / direct link
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

// Socket.io for live chat
setupChatSocket(httpServer, prisma)

// Mining accrual cron - runs every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  console.log('[CRON] Accruing mining earnings...')
  await accrueAllMinings(prisma)
})

// Stock accrual cron - runs every hour
cron.schedule('0 * * * *', async () => {
  console.log('[CRON] Accruing stock earnings...')
  await accrueAllStocks(prisma)
})

// Initial accrual on startup
accrueAllMinings(prisma).then(() => console.log('[STARTUP] Mining accrual complete'))
accrueAllStocks(prisma).then(() => console.log('[STARTUP] Stock accrual complete'))

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))
