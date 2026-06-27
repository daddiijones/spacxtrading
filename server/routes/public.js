import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// Public: get wallet addresses for deposit
router.get('/wallets', async (req, res) => {
  try {
    const settings = await req.prisma.adminSetting.findMany({
      where: { key: { startsWith: 'wallet_' } }
    })
    const wallets = {}
    settings.forEach(s => {
      const crypto = s.key.replace('wallet_', '')
      wallets[crypto] = s.value
    })
    res.json(wallets)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Public: get platform settings
router.get('/info', async (req, res) => {
  try {
    const settings = await req.prisma.adminSetting.findMany()
    const obj = {}
    settings.forEach(s => { obj[s.key] = s.value })
    res.json(obj)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Auth: user referrals
router.get('/referrals', authMiddleware, async (req, res) => {
  try {
    const referrals = await req.prisma.referral.findMany({
      where: { referrerId: req.userId },
      include: { referred: { select: { fullName: true, email: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' }
    })
    const totalBonus = referrals.reduce((sum, r) => sum + r.bonusEarned, 0)
    
    // Fetch custom referral bonus percentage
    let commissionRate = 5
    const setting = await req.prisma.adminSetting.findUnique({ where: { key: 'referral_bonus' } })
    if (setting && setting.value) commissionRate = parseFloat(setting.value)
    
    res.json({ referrals, totalBonus, count: referrals.length, commissionRate })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
