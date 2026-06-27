export async function accrueAllStocks(prisma) {
  const now = new Date()

  const active = await prisma.stockInvestment.findMany({
    where: { status: 'ACTIVE' },
    include: { user: true }
  })

  for (const inv of active) {
    try {
      const lastAccrual = new Date(inv.lastAccrualAt)
      const hoursElapsed = (now - lastAccrual) / (1000 * 60 * 60)
      if (hoursElapsed < 1) continue

      const daysElapsed = hoursElapsed / 24
      const earned = inv.dailyEarning * daysElapsed

      const contractEnd = new Date(inv.contractEnd)
      const isExpired = now >= contractEnd

      if (isExpired) {
        // Final payout: calculate remaining earnings up to contract end
        const finalHours = (contractEnd - lastAccrual) / (1000 * 60 * 60)
        const finalDays = Math.max(0, finalHours / 24)
        const finalEarned = inv.dailyEarning * finalDays

        await prisma.$transaction([
          prisma.stockInvestment.update({
            where: { id: inv.id },
            data: {
              totalEarned: { increment: finalEarned },
              status: 'COMPLETED',
              lastAccrualAt: now
            }
          }),
          prisma.user.update({
            where: { id: inv.userId },
            data: {
              balance: { increment: finalEarned },
              totalEarned: { increment: finalEarned }
            }
          })
        ])

        await prisma.notification.create({
          data: {
            userId: inv.userId,
            title: `${inv.symbol} Contract Completed`,
            message: `Your stock investment in ${inv.stockName} has completed its contract. Total earnings: $${(inv.totalEarned + finalEarned).toFixed(2)} credited to your wallet.`,
            type: 'STOCK'
          }
        })
      } else {
        await prisma.$transaction([
          prisma.stockInvestment.update({
            where: { id: inv.id },
            data: {
              totalEarned: { increment: earned },
              lastAccrualAt: now
            }
          }),
          prisma.user.update({
            where: { id: inv.userId },
            data: {
              balance: { increment: earned },
              totalEarned: { increment: earned }
            }
          })
        ])
      }
    } catch (err) {
      console.error(`[STOCK ACCRUAL] Error on investment ${inv.id}:`, err.message)
    }
  }

  console.log(`[STOCK ACCRUAL] Processed ${active.length} active investments`)
}
