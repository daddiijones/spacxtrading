import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

// Create deposit
router.post('/', async (req, res) => {
  try {
    const { amount, cryptoType, txHash } = req.body
    if (!amount || !cryptoType || !txHash) return res.status(400).json({ error: 'All fields required' })
    const deposit = await req.prisma.deposit.create({
      data: { userId: req.userId, amount: parseFloat(amount), cryptoType, txHash }
    })

    // Send high-fidelity email notification
    try {
      const user = await req.prisma.user.findUnique({ where: { id: req.userId } })
      const { emailService } = await import('../services/emailService.js')
      await emailService.sendDepositInitiated(user.email, deposit)
    } catch (mailErr) {
      console.error('Mail delivery for deposit initiation failed:', mailErr)
    }

    res.json(deposit)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// List user deposits
router.get('/', async (req, res) => {
  try {
    const deposits = await req.prisma.deposit.findMany({
      where: { userId: req.userId }, orderBy: { createdAt: 'desc' }
    })
    res.json(deposits)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
