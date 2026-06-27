import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// Get all active plans (public)
router.get('/plans', async (req, res) => {
  try {
    const plans = await req.prisma.miningPlan.findMany({ where: { isActive: true }, orderBy: { minDeposit: 'asc' } })
    res.json(plans)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Purchase a plan (auth required)
router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const { planId, amount } = req.body
    const plan = await req.prisma.miningPlan.findUnique({ where: { id: planId } })
    if (!plan || !plan.isActive) return res.status(400).json({ error: 'Plan not found' })
    if (amount < plan.minDeposit || amount > plan.maxDeposit) {
      return res.status(400).json({ error: `Amount must be between $${plan.minDeposit} and $${plan.maxDeposit}` })
    }

    const user = await req.prisma.user.findUnique({ where: { id: req.userId } })
    if ((user.balance || 0) < amount) {
      return res.status(400).json({ error: 'Insufficient wallet balance. Please deposit funds first.' })
    }

    const dailyEarning = amount * (plan.dailyROI / 100)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.durationDays)

    const [mining] = await req.prisma.$transaction([
      req.prisma.userMining.create({
        data: {
          userId: req.userId, planId, investedAmount: amount, cryptoType: 'USD',
          dailyEarning, endDate
        }
      }),
      req.prisma.user.update({
        where: { id: req.userId },
        data: { balance: { decrement: amount } }
      })
    ])

    await req.prisma.notification.create({
      data: {
        userId: req.userId,
        title: `${plan.name} Node Started`,
        message: `Your $${amount} investment on the ${plan.name} computing array has started. Daily earnings: $${dailyEarning.toFixed(2)}.`,
        type: 'MINING'
      }
    })

    // Send high-fidelity email notification
    try {
      const { emailService } = await import('../services/emailService.js')
      await emailService.sendMiningInitiated(user.email, {
        plan,
        investedAmount: amount,
        durationDays: plan.durationDays
      })
    } catch (mailErr) {
      console.error('Mail delivery for mining failed:', mailErr)
    }

    res.json(mining)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Get user's minings
router.get('/my-minings', authMiddleware, async (req, res) => {
  try {
    const minings = await req.prisma.userMining.findMany({
      where: { userId: req.userId }, include: { plan: true }, orderBy: { createdAt: 'desc' }
    })
    res.json(minings)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
