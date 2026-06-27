// Mining Accrual Service - Industry Standard "Lazy Evaluation" + Cron Hybrid
// Mining earnings accumulate based on elapsed time since last accrual,
// so users earn even when offline. Cron runs periodically to update balances.

export async function accrueAllMinings(prisma) {
  const activeMinings = await prisma.userMining.findMany({
    where: { status: 'ACTIVE' },
    include: { user: true }
  })

  const now = new Date()

  for (const mining of activeMinings) {
    // Check if mining has expired
    if (now >= mining.endDate) {
      // Final accrual for remaining time
      const remainingMs = mining.endDate.getTime() - mining.lastAccrualAt.getTime()
      const remainingDays = Math.max(0, remainingMs / (1000 * 60 * 60 * 24))
      const finalEarning = remainingDays * mining.dailyEarning

      await prisma.$transaction([
        prisma.userMining.update({
          where: { id: mining.id },
          data: {
            status: 'COMPLETED',
            totalEarned: { increment: finalEarning },
            lastAccrualAt: mining.endDate
          }
        }),
        prisma.user.update({
          where: { id: mining.userId },
          data: {
            balance: { increment: finalEarning },
            totalEarned: { increment: finalEarning }
          }
        })
      ])

      // Send high-fidelity email notification
      try {
        const { emailService } = await import('./emailService.js')
        const plan = await prisma.miningPlan.findUnique({ where: { id: mining.planId } })
        await emailService.sendMiningEnded(mining.user.email, {
          plan,
          investedAmount: mining.investedAmount,
          totalEarned: mining.totalEarned + finalEarning
        })
      } catch (mailErr) {
        console.error('Mail delivery for completed mining failed:', mailErr)
      }

      continue
    }

    // Calculate earnings since last accrual
    const elapsedMs = now.getTime() - mining.lastAccrualAt.getTime()
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24)

    if (elapsedDays < 0.001) continue // Skip if less than ~1.4 minutes

    const earning = elapsedDays * mining.dailyEarning

    await prisma.$transaction([
      prisma.userMining.update({
        where: { id: mining.id },
        data: {
          totalEarned: { increment: earning },
          lastAccrualAt: now
        }
      }),
      prisma.user.update({
        where: { id: mining.userId },
        data: {
          balance: { increment: earning },
          totalEarned: { increment: earning }
        }
      })
    ])
  }
}

// On-demand accrual for a single user (called on login/dashboard load)
export async function accrueUserMinings(prisma, userId) {
  const activeMinings = await prisma.userMining.findMany({
    where: { userId, status: 'ACTIVE' }
  })

  const now = new Date()

  for (const mining of activeMinings) {
    const endTime = mining.endDate < now ? mining.endDate : now
    const elapsedMs = endTime.getTime() - mining.lastAccrualAt.getTime()
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24)

    if (elapsedDays < 0.0001) continue

    const earning = elapsedDays * mining.dailyEarning
    const newStatus = mining.endDate <= now ? 'COMPLETED' : 'ACTIVE'

    await prisma.$transaction([
      prisma.userMining.update({
        where: { id: mining.id },
        data: {
          totalEarned: { increment: earning },
          lastAccrualAt: endTime,
          status: newStatus
        }
      }),
      prisma.user.update({
        where: { id: mining.userId },
        data: {
          balance: { increment: earning },
          totalEarned: { increment: earning }
        }
      })
    ])

    // Send email alert if completed
    if (newStatus === 'COMPLETED') {
      try {
        const user = await prisma.user.findUnique({ where: { id: mining.userId } })
        const plan = await prisma.miningPlan.findUnique({ where: { id: mining.planId } })
        const { emailService } = await import('./emailService.js')
        await emailService.sendMiningEnded(user.email, {
          plan,
          investedAmount: mining.investedAmount,
          totalEarned: mining.totalEarned + earning
        })
      } catch (mailErr) {
        console.error('Mail delivery for lazy completed mining failed:', mailErr)
      }
    }
  }
}
