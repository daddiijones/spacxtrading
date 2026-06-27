import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { emailService } from '../services/emailService.js'

const router = Router()

// In-memory cache for Login OTPs
const otpCache = new Map()

// In-memory cache for Registration OTPs
const registerCache = new Map()

// Register (Sends Registration OTP)
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, referralCode, country, currency, timezone } = req.body
    if (!email || !password || !fullName) return res.status(400).json({ error: 'All fields required' })

    const existing = await req.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) return res.status(400).json({ error: 'Email already registered' })

    // Generate 6-digit random code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    registerCache.set(email.toLowerCase().trim(), {
      code: otpCode,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      password,
      fullName,
      referralCode,
      country: country || 'US',
      currency: currency || 'USD',
      timezone: timezone || 'UTC'
    })

    // Send high-fidelity registration verification email
    try {
      await emailService.sendRegisterOTP(email.toLowerCase().trim(), otpCode)
    } catch (mailErr) {
      console.error('Mailtrap registration OTP delivery failed:', mailErr)
    }
    // For local testing convenience
    console.log(`[TESTING] Registration OTP Code for ${email} is: ${otpCode}`)

    res.json({ requiresVerification: true, email: email.toLowerCase().trim() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Verify Registration OTP & Create Account
router.post('/verify-register-otp', async (req, res) => {
  try {
    const { email, code } = req.body
    if (!email || !code) return res.status(400).json({ error: 'Email and verification code are required' })

    const cached = registerCache.get(email.toLowerCase().trim())
    if (!cached) return res.status(400).json({ error: 'Verification session expired or not found. Please register again.' })

    if (Date.now() > cached.expiresAt) {
      registerCache.delete(email.toLowerCase().trim())
      return res.status(400).json({ error: 'Verification code has expired. Please register again.' })
    }

    if (cached.code !== code.trim()) {
      return res.status(400).json({ error: 'Incorrect verification code' })
    }

    // Double check email availability
    const existing = await req.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) {
      registerCache.delete(email.toLowerCase().trim())
      return res.status(400).json({ error: 'Email has already been registered' })
    }

    // Hash password and save user
    const hashed = await bcrypt.hash(cached.password, 10)
    const user = await req.prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashed,
        fullName: cached.fullName,
        country: cached.country,
        currency: cached.currency,
        timezone: cached.timezone
      }
    })

    // Handle referral
    if (cached.referralCode) {
      const referrer = await req.prisma.user.findUnique({ where: { referralCode: cached.referralCode } })
      if (referrer) {
        await req.prisma.referral.create({
          data: { referrerId: referrer.id, referredId: user.id }
        })
        
        // Notify the referrer of the new signup
        await req.prisma.notification.create({
          data: {
            userId: referrer.id,
            title: 'New Referral Signup!',
            message: `${cached.fullName} just registered using your referral link! You will earn a commission when they make their first deposit.`,
            type: 'SYSTEM'
          }
        })
      }
    }

    // Validated! Clear cached registration
    registerCache.delete(email.toLowerCase().trim())

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...userData } = user
    res.json({ user: userData, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Login (Triggers OTP)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const user = await req.prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' })
    if (!user.isActive) return res.status(403).json({ error: 'Account suspended' })

    // Generate 6-digit random code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    otpCache.set(user.id, {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    })

    // Send high-fidelity OTP email
    try {
      await emailService.sendLoginOTP(user.email, otpCode)
    } catch (mailErr) {
      console.error('Mailtrap OTP delivery failed:', mailErr)
      // For local testing convenience if Mailtrap transport is blocked, we log the OTP to terminal
      console.log(`[TESTING] OTP Code for ${user.email} is: ${otpCode}`)
    }

    res.json({ requiresOtp: true, userId: user.id, email: user.email })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, code } = req.body
    if (!userId || !code) return res.status(400).json({ error: 'User ID and verification code required' })

    const cached = otpCache.get(userId)
    if (!cached) return res.status(400).json({ error: 'Verification session expired or not found' })

    if (Date.now() > cached.expiresAt) {
      otpCache.delete(userId)
      return res.status(400).json({ error: 'Security code has expired. Please log in again.' })
    }

    if (cached.code !== code.trim()) {
      return res.status(400).json({ error: 'Incorrect verification code' })
    }

    // Retrieve full user record
    const user = await req.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(400).json({ error: 'User record not found' })
    if (!user.isActive) return res.status(403).json({ error: 'Account suspended' })

    // Validated! Free cached session
    otpCache.delete(userId)

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...userData } = user
    res.json({ user: userData, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// In-memory cache for Password Reset OTPs
const resetPasswordCache = new Map()

// Forgot Password (Sends Password Reset OTP)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })

    const user = await req.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user) return res.status(404).json({ error: 'User record not found' })

    // Generate 6-digit random code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    resetPasswordCache.set(email.toLowerCase().trim(), {
      code: otpCode,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    })

    // Send high-fidelity OTP email
    try {
      await emailService.sendPasswordResetOTP(user.email, otpCode)
    } catch (mailErr) {
      console.error('Mailtrap password reset OTP delivery failed:', mailErr)
    }
    // For local testing convenience
    console.log(`[TESTING] Password Reset OTP Code for ${user.email} is: ${otpCode}`)

    res.json({ email: user.email })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Reset Password (Verifies OTP & Sets New Password)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, verification code, and new password are required' })
    }

    const cached = resetPasswordCache.get(email.toLowerCase().trim())
    if (!cached) return res.status(400).json({ error: 'Verification session expired or not found. Please try again.' })

    if (Date.now() > cached.expiresAt) {
      resetPasswordCache.delete(email.toLowerCase().trim())
      return res.status(400).json({ error: 'Verification code has expired. Please try again.' })
    }

    if (cached.code !== code.trim()) {
      return res.status(400).json({ error: 'Incorrect verification code' })
    }

    const user = await req.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user) {
      resetPasswordCache.delete(email.toLowerCase().trim())
      return res.status(404).json({ error: 'User record not found' })
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await req.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // Log security notification
    await req.prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Password Reset Successful',
        message: 'Your account password was successfully reset using the email verification channel.',
        type: 'SYSTEM'
      }
    })

    // Clear cached verification
    resetPasswordCache.delete(email.toLowerCase().trim())

    res.json({ message: 'Password reset successfully. You can now log in.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
