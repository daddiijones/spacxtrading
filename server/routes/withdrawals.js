import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

// Create withdrawal using a connected wallet
router.post('/', async (req, res) => {
  try {
    const { amount, savedWalletId } = req.body
    if (!amount || !savedWalletId) {
      return res.status(400).json({ error: 'Amount and a connected wallet are required' })
    }

    const savedWallet = await req.prisma.savedWallet.findFirst({
      where: { id: savedWalletId, userId: req.userId }
    })
    if (!savedWallet) return res.status(400).json({ error: 'Connected wallet not found' })

    const user = await req.prisma.user.findUnique({ where: { id: req.userId } })
    if ((user.balance || 0) < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient wallet balance' })
    }

    const withdrawal = await req.prisma.withdrawal.create({
      data: {
        userId: req.userId,
        amount: parseFloat(amount),
        cryptoType: savedWallet.cryptoType,
        walletAddress: savedWallet.walletAddress
      }
    })

    // Deduct from central balance immediately
    await req.prisma.user.update({
      where: { id: req.userId },
      data: { balance: { decrement: parseFloat(amount) } }
    })

    await req.prisma.notification.create({
      data: {
        userId: req.userId,
        title: 'Withdrawal Request Submitted',
        message: `Your withdrawal of $${parseFloat(amount).toFixed(2)} USD via ${savedWallet.cryptoType} to wallet "${savedWallet.label}" has been submitted and is pending admin approval.`,
        type: 'WITHDRAWAL'
      }
    })

    try {
      const { emailService } = await import('../services/emailService.js')
      await emailService.sendWithdrawalInitiated(user.email, withdrawal)
    } catch (_) {}

    res.json(withdrawal)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// List user withdrawals
router.get('/', async (req, res) => {
  try {
    const withdrawals = await req.prisma.withdrawal.findMany({
      where: { userId: req.userId }, orderBy: { createdAt: 'desc' }
    })
    res.json(withdrawals)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
