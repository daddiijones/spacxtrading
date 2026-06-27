import { Router } from 'express'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware, adminMiddleware)

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await req.prisma.user.count({ where: { role: 'USER' } })
    const totalDeposits = await req.prisma.deposit.aggregate({ _sum: { amount: true } })
    const activeMinings = await req.prisma.userMining.count({ where: { status: 'ACTIVE' } })
    const pendingDeposits = await req.prisma.deposit.count({ where: { status: 'PENDING' } })
    const pendingWithdrawals = await req.prisma.withdrawal.count({ where: { status: 'PENDING' } })
    const recentUsers = await req.prisma.user.findMany({
      where: { role: 'USER' }, orderBy: { createdAt: 'desc' }, take: 5,
      select: { id: true, email: true, fullName: true, createdAt: true }
    })
    res.json({ totalUsers, totalDeposits: totalDeposits._sum.amount || 0, activeMinings, pendingDeposits, pendingWithdrawals, recentUsers })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// List all users
router.get('/users', async (req, res) => {
  try {
    const users = await req.prisma.user.findMany({
      where: { role: 'USER' }, orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, fullName: true, isActive: true, createdAt: true,
        balanceBTC: true, balanceETH: true, balanceUSDT: true, balanceLTC: true, balanceBNB: true, balanceSOL: true,
        totalEarned: true, totalDeposited: true, totalWithdrawn: true,
        _count: { select: { userMinings: { where: { status: 'ACTIVE' } } } }
      }
    })
    res.json(users)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Ban/unban user
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({ where: { id: req.params.id } })
    const updated = await req.prisma.user.update({
      where: { id: req.params.id }, data: { isActive: !user.isActive }
    })
    res.json(updated)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// All deposits
router.get('/deposits', async (req, res) => {
  try {
    const deposits = await req.prisma.deposit.findMany({
      orderBy: { createdAt: 'desc' }, include: { user: { select: { email: true, fullName: true } } }
    })
    res.json(deposits)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Approve/reject deposit
router.put('/deposits/:id', async (req, res) => {
  try {
    const { status } = req.body
    const deposit = await req.prisma.deposit.findUnique({ where: { id: req.params.id } })
    if (!deposit) return res.status(404).json({ error: 'Not found' })

    const updated = await req.prisma.deposit.update({ where: { id: req.params.id }, data: { status } })

    if (status === 'CONFIRMED') {
      // Credit the USD amount to the user's central wallet balance
      const user = await req.prisma.user.update({
        where: { id: deposit.userId },
        data: { balance: { increment: deposit.amount }, totalDeposited: { increment: deposit.amount } }
      })

      // Create Deposit Confirmed Notification
      await req.prisma.notification.create({
        data: {
          userId: deposit.userId,
          title: 'Deposit Credited Successfully',
          message: `Your deposit of $${deposit.amount.toFixed(2)} USD (paid via ${deposit.cryptoType}) has been verified and credited to your wallet balance.`,
          type: 'DEPOSIT'
        }
      })

      // Send high-fidelity email notification
      try {
        const adminUser = await req.prisma.user.findUnique({ where: { id: req.userId } })
        const { emailService } = await import('../services/emailService.js')
        // Send email to user
        await emailService.sendDepositApproved(user.email, deposit)
        // Send email to admin
        await emailService.sendAdminDepositApproved(adminUser.email, user.email, deposit)
      } catch (mailErr) {
        console.error('Mail delivery for deposit approval failed:', mailErr)
      }

      // Referral bonus
      const referral = await req.prisma.referral.findUnique({ where: { referredId: deposit.userId } })
      if (referral) {
        let bonusPercent = 5 // default
        const setting = await req.prisma.adminSetting.findUnique({ where: { key: 'referral_bonus' } })
        if (setting && setting.value) {
          bonusPercent = parseFloat(setting.value)
        }
        
        const bonus = deposit.amount * (bonusPercent / 100)
        await req.prisma.user.update({
          where: { id: referral.referrerId },
          data: { balance: { increment: bonus }, totalEarned: { increment: bonus } }
        })
        await req.prisma.referral.update({ where: { id: referral.id }, data: { bonusEarned: { increment: bonus } } })
        
        // Notify the referrer
        await req.prisma.notification.create({
          data: {
            userId: referral.referrerId,
            title: 'Referral Commission Earned',
            message: `You have received a referral commission of $${bonus.toFixed(2)} USDT from a successful deposit made by your referred user.`,
            type: 'DEPOSIT'
          }
        })
      }
    }

    if (status === 'REJECTED') {
      await req.prisma.notification.create({
        data: {
          userId: deposit.userId,
          title: 'Deposit Request Rejected',
          message: `Your deposit request of ${deposit.amount} ${deposit.cryptoType} could not be verified by our computational ledger and was rejected.`,
          type: 'DEPOSIT'
        }
      })
    }
    res.json(updated)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// All withdrawals
router.get('/withdrawals', async (req, res) => {
  try {
    const withdrawals = await req.prisma.withdrawal.findMany({
      orderBy: { createdAt: 'desc' }, include: { user: { select: { email: true, fullName: true } } }
    })
    res.json(withdrawals)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Approve/reject withdrawal
router.put('/withdrawals/:id', async (req, res) => {
  try {
    const { status } = req.body
    const withdrawal = await req.prisma.withdrawal.findUnique({ where: { id: req.params.id } })
    if (status === 'REJECTED') {
      // Refund back to central balance
      await req.prisma.user.update({
        where: { id: withdrawal.userId },
        data: { balance: { increment: withdrawal.amount } }
      })
      await req.prisma.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Request Rejected',
          message: `Your withdrawal request of $${withdrawal.amount.toFixed(2)} has been rejected. Funds have been returned to your wallet balance.`,
          type: 'WITHDRAWAL'
        }
      })
    }
    if (status === 'COMPLETED') {
      await req.prisma.user.update({
        where: { id: withdrawal.userId },
        data: { totalWithdrawn: { increment: withdrawal.amount } }
      })
      await req.prisma.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Dispatched Successfully',
          message: `Your withdrawal of $${withdrawal.amount.toFixed(2)} has been verified and dispatched to your connected wallet.`,
          type: 'WITHDRAWAL'
        }
      })
    }
    const updated = await req.prisma.withdrawal.update({ where: { id: req.params.id }, data: { status } })
    res.json(updated)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// List minings — optional ?status=ACTIVE filter
router.get('/minings', async (req, res) => {
  try {
    const where = req.query.status ? { status: req.query.status } : {}
    const minings = await req.prisma.userMining.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        plan: { select: { id: true, name: true } }
      }
    })
    res.json(minings)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Manually create a mining for a user
router.post('/minings', async (req, res) => {
  try {
    const { userId, planId, investedAmount, cryptoType, dailyEarning, totalEarned, endDate, status } = req.body
    const mining = await req.prisma.userMining.create({
      data: {
        userId, planId,
        investedAmount: parseFloat(investedAmount),
        cryptoType,
        dailyEarning: parseFloat(dailyEarning),
        totalEarned: totalEarned ? parseFloat(totalEarned) : 0,
        endDate: new Date(endDate),
        status: status || 'ACTIVE'
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        plan: { select: { id: true, name: true } }
      }
    })
    res.json(mining)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Edit a mining
router.put('/minings/:id', async (req, res) => {
  try {
    const { investedAmount, dailyEarning, totalEarned, endDate, status } = req.body
    const data = {}
    if (investedAmount !== undefined) data.investedAmount = parseFloat(investedAmount)
    if (dailyEarning !== undefined) data.dailyEarning = parseFloat(dailyEarning)
    if (totalEarned !== undefined) data.totalEarned = parseFloat(totalEarned)
    if (endDate !== undefined) data.endDate = new Date(endDate)
    if (status !== undefined) data.status = status
    const updated = await req.prisma.userMining.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// CRUD mining plans
router.get('/plans', async (req, res) => {
  try { res.json(await req.prisma.miningPlan.findMany({ orderBy: { minDeposit: 'asc' } })) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/plans', async (req, res) => {
  try { res.json(await req.prisma.miningPlan.create({ data: req.body })) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/plans/:id', async (req, res) => {
  try { res.json(await req.prisma.miningPlan.update({ where: { id: req.params.id }, data: req.body })) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

// Settings
router.get('/settings', async (req, res) => {
  try { res.json(await req.prisma.adminSetting.findMany()) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/settings', async (req, res) => {
  try {
    const { settings } = req.body
    for (const s of settings) {
      await req.prisma.adminSetting.upsert({
        where: { key: s.key }, create: { key: s.key, value: s.value, description: s.description },
        update: { value: s.value }
      })
    }
    res.json(await req.prisma.adminSetting.findMany())
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Delete User and all associated data cleanly (Cascade)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    // 1. Delete associated deposits
    await req.prisma.deposit.deleteMany({ where: { userId: id } })
    // 2. Delete associated withdrawals
    await req.prisma.withdrawal.deleteMany({ where: { userId: id } })
    // 3. Delete associated userMinings
    await req.prisma.userMining.deleteMany({ where: { userId: id } })
    // 4. Delete associated referrals (where user is referrer or referred)
    await req.prisma.referral.deleteMany({ where: { OR: [{ referrerId: id }, { referredId: id }] } })
    // 5. Finally delete the user record
    await req.prisma.user.delete({ where: { id } })
    
    res.json({ message: 'User and all related records deleted successfully' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Broadcast Email to All Users
router.post('/users/broadcast-email', async (req, res) => {
  try {
    const { subject, title, message } = req.body
    if (!subject || !message) return res.status(400).json({ error: 'Subject and message are required' })

    const users = await req.prisma.user.findMany({
      where: { role: 'USER' },
      select: { email: true }
    })

    if (users.length === 0) return res.status(400).json({ error: 'No registered users found' })

    const { emailService } = await import('../services/emailService.js')
    
    // Background dispatch to prevent route execution blocking
    users.forEach(u => {
      emailService.sendCustomAdminMessage(u.email, subject, title, message)
        .catch(err => console.error(`Broadcast delivery failed for ${u.email}:`, err))
    })

    res.json({ message: `Broadcast successfully initialized for ${users.length} users` })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Compose & Send Direct Email to User
router.post('/users/:id/email', async (req, res) => {
  try {
    const { id } = req.params
    const { subject, title, message } = req.body
    if (!subject || !message) return res.status(400).json({ error: 'Subject and message are required' })

    const user = await req.prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { emailService } = await import('../services/emailService.js')
    await emailService.sendCustomAdminMessage(user.email, subject, title, message)

    res.json({ message: 'Email notification sent to user successfully' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ─── Stocks Admin ────────────────────────────────────────────────────────────

// List all stocks
router.get('/stocks', async (req, res) => {
  try {
    const stocks = await req.prisma.stock.findMany({ orderBy: { symbol: 'asc' } })
    res.json(stocks)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Update a stock (ROI, contract days, min/max, active status)
router.put('/stocks/:id', async (req, res) => {
  try {
    const { annualROI, contractDays, minInvestment, maxInvestment, isActive, fixedPrice, lastKnownPrice, description } = req.body
    const stock = await req.prisma.stock.update({
      where: { id: req.params.id },
      data: {
        ...(annualROI       != null && { annualROI: parseFloat(annualROI) }),
        ...(contractDays    != null && { contractDays: parseInt(contractDays) }),
        ...(minInvestment   != null && { minInvestment: parseFloat(minInvestment) }),
        ...(maxInvestment   != null && { maxInvestment: parseFloat(maxInvestment) }),
        ...(fixedPrice      != null && { fixedPrice: parseFloat(fixedPrice) }),
        ...(lastKnownPrice  != null && { lastKnownPrice: parseFloat(lastKnownPrice) }),
        ...(isActive        != null && { isActive }),
        ...(description     != null && { description }),
      }
    })
    res.json(stock)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// List all stock investments (with user + stock info)
router.get('/stock-investments', async (req, res) => {
  try {
    const { status } = req.query
    const investments = await req.prisma.stockInvestment.findMany({
      where: status ? { status } : undefined,
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        stock: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(investments)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Update a stock investment (e.g. change ROI, status, cancel)
router.put('/stock-investments/:id', async (req, res) => {
  try {
    const { annualROI, status, contractEnd } = req.body
    const inv = await req.prisma.stockInvestment.findUnique({ where: { id: req.params.id } })
    if (!inv) return res.status(404).json({ error: 'Investment not found' })

    const updates = {}
    if (annualROI != null) {
      updates.annualROI = parseFloat(annualROI)
      updates.dailyEarning = inv.investedAmount * (parseFloat(annualROI) / 100 / 365)
    }
    if (status) updates.status = status
    if (contractEnd) updates.contractEnd = new Date(contractEnd)

    const updated = await req.prisma.stockInvestment.update({
      where: { id: req.params.id },
      data: updates,
      include: { user: { select: { email: true, fullName: true } }, stock: true }
    })
    res.json(updated)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
