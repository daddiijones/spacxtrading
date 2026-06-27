import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { accrueUserMinings } from '../services/miningAccrual.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const WALLET_SECRET = process.env.WALLET_ENCRYPTION_SECRET || 'spacxtrading-wallet-enc-secret-2026-secure'

function encryptData(text, userId) {
  const key = crypto.createHash('sha256').update(`${userId}:${WALLET_SECRET}`).digest()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let enc = cipher.update(text, 'utf8', 'hex')
  enc += cipher.final('hex')
  return iv.toString('hex') + ':' + enc
}

function decryptData(encText, userId) {
  try {
    const key = crypto.createHash('sha256').update(`${userId}:${WALLET_SECRET}`).digest()
    const colonIdx = encText.indexOf(':')
    const ivHex = encText.substring(0, colonIdx)
    const enc = encText.substring(colonIdx + 1)
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let dec = decipher.update(enc, 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
  } catch { return null }
}

const router = Router()
router.use(authMiddleware)

// Get current user profile + accrued earnings
router.get('/me', async (req, res) => {
  try {
    await accrueUserMinings(req.prisma, req.userId)
    const user = await req.prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, email: true, fullName: true, role: true,
        balance: true,
        balanceBTC: true, balanceETH: true, balanceUSDT: true,
        balanceLTC: true, balanceBNB: true, balanceSOL: true,
        referralCode: true, totalEarned: true, totalDeposited: true,
        totalWithdrawn: true, isActive: true, createdAt: true,
        country: true, currency: true, timezone: true
      }
    })
    res.json(user)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    await accrueUserMinings(req.prisma, req.userId)
    const user = await req.prisma.user.findUnique({ where: { id: req.userId } })
    const activeMinings = await req.prisma.userMining.count({ where: { userId: req.userId, status: 'ACTIVE' } })
    const recentDeposits = await req.prisma.deposit.findMany({
      where: { userId: req.userId }, orderBy: { createdAt: 'desc' }, take: 10
    })
    const recentWithdrawals = await req.prisma.withdrawal.findMany({
      where: { userId: req.userId }, orderBy: { createdAt: 'desc' }, take: 10
    })
    const recentMinings = await req.prisma.userMining.findMany({
      where: { userId: req.userId }, orderBy: { createdAt: 'desc' }, take: 10, include: { plan: true }
    })
    res.json({ user, activeMinings, recentDeposits, recentWithdrawals, recentMinings })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Full transaction history - unified view of all credits and debits
router.get('/transactions', async (req, res) => {
  try {
    const deposits = await req.prisma.deposit.findMany({
      where: { userId: req.userId }, orderBy: { createdAt: 'desc' }
    })
    const withdrawals = await req.prisma.withdrawal.findMany({
      where: { userId: req.userId }, orderBy: { createdAt: 'desc' }
    })
    const minings = await req.prisma.userMining.findMany({
      where: { userId: req.userId }, orderBy: { createdAt: 'desc' }, include: { plan: true }
    })

    // Build unified transaction list
    const transactions = [
      ...deposits.map(d => ({
        id: d.id, type: 'deposit', direction: 'credit',
        label: `Deposit (${d.cryptoType})`, amount: d.amount,
        cryptoType: d.cryptoType, status: d.status,
        detail: d.txHash ? `TX: ${d.txHash.substring(0, 16)}...` : '',
        createdAt: d.createdAt
      })),
      ...withdrawals.map(w => ({
        id: w.id, type: 'withdrawal', direction: 'debit',
        label: `Withdrawal (${w.cryptoType})`, amount: w.amount,
        cryptoType: w.cryptoType, status: w.status,
        detail: w.walletAddress ? `To: ${w.walletAddress.substring(0, 16)}...` : '',
        createdAt: w.createdAt
      })),
      ...minings.map(m => ({
        id: m.id, type: 'mining', direction: 'debit',
        label: `Mission Plan: ${m.plan?.name || 'Plan'}`, amount: m.investedAmount,
        cryptoType: m.cryptoType, status: m.status,
        detail: `${m.plan?.hashRate} • ${m.plan?.dailyROI}% daily`,
        createdAt: m.createdAt
      })),
      ...minings.filter(m => m.totalEarned > 0).map(m => ({
        id: `${m.id}-earn`, type: 'mining-earning', direction: 'credit',
        label: `Mission Earning: ${m.plan?.name || 'Plan'}`, amount: m.totalEarned,
        cryptoType: m.cryptoType, status: m.status === 'ACTIVE' ? 'ACCRUING' : 'COMPLETED',
        detail: `Earned so far from ${m.plan?.hashRate}`,
        createdAt: m.updatedAt
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.json(transactions)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const { fullName, country, currency, timezone } = req.body
    const user = await req.prisma.user.update({
      where: { id: req.userId }, 
      data: { fullName, country, currency, timezone },
      select: { id: true, email: true, fullName: true, role: true, country: true, currency: true, timezone: true }
    })
    res.json(user)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Get user notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await req.prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    res.json(notifications)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Mark all notifications as read
router.put('/notifications/mark-read', async (req, res) => {
  try {
    await req.prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true }
    })
    res.json({ message: 'All notifications marked as read' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Mark single notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    await req.prisma.notification.update({
      where: { id, userId: req.userId },
      data: { isRead: true }
    })
    res.json({ message: 'Notification marked as read' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Change Password inside profile settings
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    const user = await req.prisma.user.findUnique({ where: { id: req.userId } })
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await req.prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    })

    // Log security notification
    await req.prisma.notification.create({
      data: {
        userId: req.userId,
        title: 'Password Changed Successfully',
        message: 'Your computational account password was successfully updated. If you did not perform this action, contact support immediately.',
        type: 'SYSTEM'
      }
    })

    res.json({ message: 'Password updated successfully' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Keystore Password Validation ──────────────────────────────────────────────
// Verifies the password by deriving the key and checking the EIP-55 MAC:
// MAC = keccak256(derivedKey[16:32] + ciphertext). Works for both standard
// EVM keystores and Trust Wallet multi-account mnemonic backups.
router.post('/wallets/validate-keystore', async (req, res) => {
  try {
    const { keystoreJson, password } = req.body
    if (!keystoreJson || password === undefined) {
      return res.status(400).json({ valid: false, error: 'keystoreJson and password are required' })
    }

    let ks
    try { ks = JSON.parse(keystoreJson) } catch {
      return res.status(400).json({ valid: false, error: 'Invalid JSON' })
    }

    const cryptoParams = ks.crypto || ks.Crypto
    if (!cryptoParams) return res.status(400).json({ valid: false, error: 'No crypto params found in keystore' })

    const { kdf, kdfparams, ciphertext, mac } = cryptoParams
    if (!kdf || !kdfparams || !ciphertext || !mac) {
      return res.status(400).json({ valid: false, error: 'Incomplete crypto parameters in keystore' })
    }

    const salt = Buffer.from(kdfparams.salt, 'hex')
    const dklen = kdfparams.dklen || 32

    let derivedKey
    if (kdf === 'scrypt') {
      const { n, r, p } = kdfparams
      derivedKey = crypto.scryptSync(
        Buffer.from(password, 'utf8'), salt, dklen,
        { N: n, r, p, maxmem: 128 * n * r * 2 }
      )
    } else if (kdf === 'pbkdf2') {
      const hashAlgo = (kdfparams.prf || '').includes('256') ? 'sha256' : 'sha512'
      derivedKey = crypto.pbkdf2Sync(
        Buffer.from(password, 'utf8'), salt, kdfparams.c, dklen, hashAlgo
      )
    } else {
      return res.json({ valid: false, error: `Unsupported KDF: ${kdf}` })
    }

    const { keccak256 } = await import('ethereum-cryptography/keccak.js')
    const ct = Buffer.from(ciphertext, 'hex')
    const macData = Buffer.concat([derivedKey.slice(16, 32), ct])
    const computedMac = Buffer.from(keccak256(macData)).toString('hex')

    if (computedMac !== mac) {
      return res.json({ valid: false, error: 'Incorrect password — this password does not match the keystore file.' })
    }

    res.json({ valid: true })
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message })
  }
})

// ── Saved Wallets ─────────────────────────────────────────────────────────────

// List wallets — never returns encryptedData
router.get('/wallets', async (req, res) => {
  try {
    const wallets = await req.prisma.savedWallet.findMany({
      where: { userId: req.userId },
      select: {
        id: true, label: true, cryptoType: true, network: true,
        walletAddress: true, connectionType: true, isDefault: true, createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(wallets)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Save / connect a wallet
router.post('/wallets', async (req, res) => {
  try {
    const { label, cryptoType, network, walletAddress, connectionType, secretData } = req.body
    if (!label || !cryptoType || !network || !walletAddress || !connectionType) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    let encryptedData = null
    if (secretData && connectionType !== 'ADDRESS_ONLY') {
      encryptedData = encryptData(secretData, req.userId)
    }
    const wallet = await req.prisma.savedWallet.create({
      data: { userId: req.userId, label, cryptoType, network, walletAddress, connectionType, encryptedData },
      select: {
        id: true, label: true, cryptoType: true, network: true,
        walletAddress: true, connectionType: true, isDefault: true, createdAt: true
      }
    })
    await req.prisma.notification.create({
      data: {
        userId: req.userId,
        title: 'Wallet Connected',
        message: `Your ${cryptoType} wallet "${label}" has been successfully connected to your account.`,
        type: 'SYSTEM'
      }
    })
    res.json(wallet)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Reveal decrypted credentials — only the owner can call this
router.get('/wallets/:id/reveal', async (req, res) => {
  try {
    const wallet = await req.prisma.savedWallet.findFirst({
      where: { id: req.params.id, userId: req.userId }
    })
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' })
    if (!wallet.encryptedData) return res.json({ data: null, connectionType: wallet.connectionType })
    const data = decryptData(wallet.encryptedData, req.userId)
    res.json({ data, connectionType: wallet.connectionType })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Delete wallet
router.delete('/wallets/:id', async (req, res) => {
  try {
    const wallet = await req.prisma.savedWallet.findFirst({
      where: { id: req.params.id, userId: req.userId }
    })
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' })
    await req.prisma.savedWallet.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
