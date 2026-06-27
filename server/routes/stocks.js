import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { emailService } from '../services/emailService.js'

const router = Router()

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
}

async function fetchYahooPrice(symbol) {
  try {
    const ctrl = new AbortController()
    const tid = setTimeout(() => ctrl.abort(), 5000)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    const res = await fetch(url, { headers: YF_HEADERS, signal: ctrl.signal })
    clearTimeout(tid)
    if (!res.ok) return null
    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    if (!meta) return null
    return {
      price: meta.regularMarketPrice ?? meta.chartPreviousClose,
      changePercent: meta.regularMarketChangePercent ?? 0,
    }
  } catch {
    return null
  }
}

// GET /api/stocks — list all active stocks with live prices
router.get('/', async (req, res) => {
  try {
    const stocks = await req.prisma.stock.findMany({ where: { isActive: true }, orderBy: { sector: 'asc' } })

    const publicStocks = stocks.filter(s => !s.isPrivate)

    // Fetch all public stock prices in parallel (5s timeout each)
    const priceResults = await Promise.allSettled(
      publicStocks.map(s => fetchYahooPrice(s.symbol))
    )

    const priceMap = {}
    publicStocks.forEach((s, i) => {
      const r = priceResults[i]
      if (r.status === 'fulfilled' && r.value) priceMap[s.symbol] = r.value
    })

    const enriched = stocks.map(s => {
      if (s.isPrivate) return { ...s, currentPrice: s.fixedPrice ?? s.lastKnownPrice, changePercent: 0, priceIsLive: false }
      const lp = priceMap[s.symbol]
      const currentPrice = lp?.price ?? s.lastKnownPrice ?? null
      return { ...s, currentPrice, changePercent: lp?.changePercent ?? 0, priceIsLive: !!lp }
    })

    res.json(enriched)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/stocks/price/:symbol — live price proxy
router.get('/price/:symbol', async (req, res) => {
  try {
    const stock = await req.prisma.stock.findUnique({ where: { symbol: req.params.symbol } })
    if (!stock) return res.status(404).json({ error: 'Stock not found' })
    if (stock.isPrivate) return res.json({ price: stock.fixedPrice, changePercent: 0 })

    const live = await fetchYahooPrice(req.params.symbol)
    if (!live) return res.status(503).json({ error: 'Price unavailable' })
    res.json(live)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/stocks/my — auth required, user's investments
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const investments = await req.prisma.stockInvestment.findMany({
      where: { userId: req.userId },
      include: { stock: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(investments)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/stocks/invest — buy stock investment
router.post('/invest', authMiddleware, async (req, res) => {
  try {
    const { stockId, amount } = req.body
    if (!stockId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Stock ID and a valid amount are required' })
    }

    const stock = await req.prisma.stock.findUnique({ where: { id: stockId } })
    if (!stock || !stock.isActive) return res.status(404).json({ error: 'Stock not found' })

    if (amount < stock.minInvestment) {
      return res.status(400).json({ error: `Minimum investment is $${stock.minInvestment.toFixed(2)}` })
    }
    if (amount > stock.maxInvestment) {
      return res.status(400).json({ error: `Maximum investment is $${stock.maxInvestment.toLocaleString()}` })
    }

    const user = await req.prisma.user.findUnique({ where: { id: req.userId } })
    if ((user.balance || 0) < amount) {
      return res.status(400).json({ error: 'Insufficient wallet balance. Please deposit funds first.' })
    }

    // Get current price — try live first, fall back to stored lastKnownPrice
    let currentPrice = stock.fixedPrice ?? null
    if (!stock.isPrivate) {
      const live = await fetchYahooPrice(stock.symbol)
      currentPrice = live?.price ?? stock.lastKnownPrice ?? 1.0
    }

    const sharesOwned = amount / currentPrice
    const dailyEarning = amount * (stock.annualROI / 100 / 365)
    const contractEnd = new Date()
    contractEnd.setDate(contractEnd.getDate() + stock.contractDays)

    const [investment] = await req.prisma.$transaction([
      req.prisma.stockInvestment.create({
        data: {
          userId: req.userId,
          stockId: stock.id,
          symbol: stock.symbol,
          stockName: stock.name,
          investedAmount: amount,
          priceAtPurchase: currentPrice,
          sharesOwned,
          annualROI: stock.annualROI,
          dailyEarning,
          contractEnd,
          lastAccrualAt: new Date()
        }
      }),
      req.prisma.user.update({
        where: { id: req.userId },
        data: { balance: { decrement: amount } }
      })
    ])

    // User notification
    await req.prisma.notification.create({
      data: {
        userId: req.userId,
        title: `${stock.symbol} Stock Investment Confirmed`,
        message: `You have successfully invested $${Number(amount).toFixed(2)} in ${stock.name}. Contract runs until ${contractEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Annual ROI: ${stock.annualROI}%.`,
        type: 'STOCK'
      }
    })

    // Admin notification
    const admin = await req.prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (admin) {
      await req.prisma.notification.create({
        data: {
          userId: admin.id,
          title: `New Stock Investment: ${stock.symbol}`,
          message: `${user.fullName} (${user.email}) invested $${Number(amount).toFixed(2)} in ${stock.name}. ${sharesOwned.toFixed(4)} shares @ $${Number(currentPrice).toFixed(2)}.`,
          type: 'STOCK'
        }
      })
    }

    // Email to user
    try {
      await emailService.sendStockInvestmentConfirmed(user.email, {
        ...investment,
        stock,
        currentPrice,
        contractEnd,
        user
      })
    } catch {}

    // Admin email
    try {
      if (admin) {
        await emailService.sendAdminStockAlert(admin.email, user.email, {
          ...investment,
          stock,
          currentPrice,
          contractEnd
        })
      }
    } catch {}

    res.json({ success: true, investment })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
