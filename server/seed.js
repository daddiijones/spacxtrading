import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding database...')

  // Create Admin
  const adminPassword = await bcrypt.hash('Admin@2026!', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@spacxtrading.online' },
    update: { password: adminPassword },
    create: {
      email: 'admin@spacxtrading.online',
      password: adminPassword,
      fullName: 'Super Admin',
      role: 'ADMIN',
      referralCode: 'ADMIN001'
    }
  })
  console.log('✅ Admin created:', admin.email)

  // Clear all user minings & deposits first to avoid foreign key constraint violations
  await prisma.userMining.deleteMany({})
  await prisma.deposit.deleteMany({})
  await prisma.withdrawal.deleteMany({})
  await prisma.notification.deleteMany({})
  console.log('🧹 Purged dependent database tables')

  // Clear all old plans to remove any residual "Starter", "Professional", "VIP Elite" records
  await prisma.miningPlan.deleteMany({})
  console.log('🧹 Residual plans database table purged successfully')

  // Create Investment Plans modeled on the SpaceX launch fleet
  const plans = [
    { name: 'Falcon 1 Liftoff Array', description: 'Our entry-level launch contract — a small, reliable booster plan built for first-time mission investors.', hashRate: '420 kN Thrust Class', dailyROI: 1.5, totalROI: 45, durationDays: 30, minDeposit: 50, maxDeposit: 499, cryptoType: 'USDT', tier: 'starter' },
    { name: 'Falcon 9 Block 5', description: 'The reusable workhorse of the fleet — steady, dependable daily returns launch after launch.', hashRate: '7,607 kN Thrust Class', dailyROI: 1.8, totalROI: 54, durationDays: 30, minDeposit: 500, maxDeposit: 1999, cryptoType: 'USDT', tier: 'starter' },
    { name: 'Falcon Heavy', description: 'Triple-booster heavy-lift contract engineered for investors ready to accelerate portfolio growth.', hashRate: '22,819 kN Thrust Class', dailyROI: 2.2, totalROI: 66, durationDays: 30, minDeposit: 2000, maxDeposit: 4999, cryptoType: 'USDT', tier: 'professional' },
    { name: 'Dragon Cargo Fleet', description: 'A resupply-grade investment vehicle delivering consistent orbital cargo runs of daily yield.', hashRate: '6,000 kg Payload Class', dailyROI: 2.6, totalROI: 78, durationDays: 30, minDeposit: 500, maxDeposit: 9999, cryptoType: 'USDT', tier: 'professional' },
    { name: 'Starship Super Heavy', description: 'Full-stack orbital-class contract built for investors deploying serious capital at scale.', hashRate: '74,500 kN Thrust Class', dailyROI: 3.2, totalROI: 96, durationDays: 30, minDeposit: 10000, maxDeposit: 49999, cryptoType: 'USDT', tier: 'enterprise' },
    { name: 'Starbase Mars Fleet', description: 'Our flagship interplanetary contract — reserved for elite investors pursuing maximum compounding yield.', hashRate: 'Interplanetary Thrust Class', dailyROI: 4.0, totalROI: 120, durationDays: 30, minDeposit: 50000, maxDeposit: 500000, cryptoType: 'USDT', tier: 'vip' },
  ]

  for (const plan of plans) {
    await prisma.miningPlan.create({
      data: {
        id: plan.name.toLowerCase().replace(/\s/g, '-'),
        ...plan
      }
    })
  }
  console.log('✅ SpaceX Trading launch fleet investment plans created successfully!')

  // Create default admin settings
  const settings = [
    { key: 'wallet_BTC',  value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',           description: 'BTC wallet address' },
    { key: 'wallet_ETH',  value: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',            description: 'ETH wallet address' },
    { key: 'wallet_USDT', value: 'TN2Y3mFk7pcV8xGPb2K3Fv6wR8XjmWDZ3Q',                   description: 'USDT (TRC-20) wallet address' },
    { key: 'wallet_USDC', value: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',            description: 'USDC (ERC-20) wallet address' },
    { key: 'wallet_BNB',  value: '0xb794f5ea0ba39494ce839613fffba74279579268',            description: 'BNB (BSC) wallet address' },
    { key: 'wallet_SOL',  value: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',         description: 'SOL wallet address' },
    { key: 'wallet_XRP',  value: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',                  description: 'XRP wallet address' },
    { key: 'wallet_ADA',  value: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xd2wywdggs6uqzwl3', description: 'ADA wallet address' },
    { key: 'wallet_DOGE', value: 'DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L',                  description: 'DOGE wallet address' },
    { key: 'wallet_LTC',  value: 'ltc1qnf8pzqe6f5mc6s9xwrfhk8a2k3mtqyd5w',             description: 'LTC wallet address' },
    { key: 'wallet_AVAX', value: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',            description: 'AVAX (C-Chain) wallet address' },
    { key: 'wallet_MATIC',value: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',            description: 'MATIC (Polygon) wallet address' },
    { key: 'wallet_DOT',  value: '14E5nqKAp3oAJcmzgs25iLrDNBvngsimcnxuSgnQR2pN46ai',    description: 'DOT wallet address' },
    { key: 'wallet_LINK', value: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',            description: 'LINK (ERC-20) wallet address' },
    { key: 'wallet_TRX',  value: 'TN2Y3mFk7pcV8xGPb2K3Fv6wR8XjmWDZ3Q',                   description: 'TRX (TRON) wallet address' },
    { key: 'wallet_SHIB', value: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',            description: 'SHIB (ERC-20) wallet address' },
    { key: 'wallet_XLM',  value: 'GBCJYKPV5SPNFHWDLX7BNBSRMN3OVTJKL5W5MX7FKXKXLNFPF7XJKQ', description: 'XLM wallet address' },
    { key: 'wallet_ATOM', value: 'cosmos1yw8fr7gahxfkpv3s3mfqy5vh8x7n5a3vr3h2x6',     description: 'ATOM wallet address' },
    { key: 'wallet_NEAR', value: 'spacx-trading.near',                                     description: 'NEAR wallet address' },
    { key: 'wallet_XMR',  value: '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A', description: 'XMR wallet address' },
    { key: 'wallet_TON',  value: 'UQBvW8l5MB5aGb2DpgKCZaJ1Gn_p5cW8s3_R5nC9vXkJFSZm',   description: 'TON wallet address' },
    { key: 'wallet_ARB',  value: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',            description: 'ARB (Arbitrum) wallet address' },
    { key: 'wallet_OP',   value: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',            description: 'OP (Optimism) wallet address' },
    { key: 'min_deposit', value: '10', description: 'Minimum deposit in USD' },
    { key: 'min_withdrawal', value: '20', description: 'Minimum withdrawal in USD' },
    { key: 'withdrawal_fee', value: '2', description: 'Withdrawal fee percentage' },
    { key: 'referral_bonus', value: '5', description: 'Referral bonus percentage' },
  ]

  for (const s of settings) {
    await prisma.adminSetting.upsert({
      where: { key: s.key }, update: { value: s.value }, create: s
    })
  }
  console.log('✅ Admin settings updated')

  // Create/Upsert backdated user Annie Anh Do (Vietnam)
  const userEmail = 'anhntdo2017@gmail.com'
  const userPassword = await bcrypt.hash('Annie@2021!', 10)
  const targetBtcAmount = 100478000 / 67500 // 1488.56296296 BTC
  const targetDate = new Date('2021-04-06T12:00:00.000Z')
  const userRegDate = new Date('2021-04-06T08:00:00.000Z')
  const targetEndDate = new Date('2021-05-23T12:00:00.000Z')

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      password: userPassword,
      balanceBTC: targetBtcAmount,
      totalEarned: 100478000,
      country: 'VN',
      currency: 'VND',
      timezone: 'Asia/Ho_Chi_Minh',
      createdAt: userRegDate
    },
    create: {
      email: userEmail,
      password: userPassword,
      fullName: 'Annie Anh Do',
      balanceBTC: targetBtcAmount,
      totalEarned: 100478000,
      country: 'VN',
      currency: 'VND',
      timezone: 'Asia/Ho_Chi_Minh',
      createdAt: userRegDate
    }
  })
  console.log('✅ Backdated Vietnamese User created/updated:', user.email)

  // Insert backdated deposit transaction log
  const deposit = await prisma.deposit.create({
    data: {
      id: 'abc54ddd-2f78-4ef2-ab41-881eae5a9e49',
      userId: user.id,
      amount: targetBtcAmount,
      cryptoType: 'BTC',
      status: 'CONFIRMED',
      createdAt: targetDate,
      updatedAt: targetDate
    }
  })
  console.log('✅ Backdated deposit record seeded successfully')

  // Insert completed, backdated user mining trade record
  const dailyEarningBtc = targetBtcAmount / 47
  const mining = await prisma.userMining.create({
    data: {
      id: '09b19fb7-6c5f-49f2-ba17-43a671318ec4',
      userId: user.id,
      planId: 'starship-super-heavy',
      investedAmount: 23000,
      cryptoType: 'BTC',
      dailyEarning: dailyEarningBtc,
      totalEarned: targetBtcAmount,
      status: 'COMPLETED',
      startDate: targetDate,
      endDate: targetEndDate,
      createdAt: targetDate,
      updatedAt: targetEndDate,
      lastAccrualAt: targetEndDate
    }
  })
  console.log('✅ Completed, backdated user mining history record seeded successfully')

  // Insert backdated notifications for the user
  const notifications = [
    {
      userId: user.id,
      title: 'System Activation Successful',
      message: 'Welcome to SpaceX Trading! Your launch account has been successfully initialized.',
      type: 'SYSTEM',
      isRead: true,
      createdAt: userRegDate
    },
    {
      userId: user.id,
      title: 'Deposit Credited Successfully',
      message: `Your deposit of 1488.56 BTC (~$100.478M USD) has been verified and credited to your spot wallet.`,
      type: 'DEPOSIT',
      isRead: true,
      createdAt: targetDate
    },
    {
      userId: user.id,
      title: 'Starship Super Heavy Launch Started',
      message: 'Your high-throughput Starship Super Heavy investment contract of $23,000.00 has successfully started its mission.',
      type: 'MINING',
      isRead: true,
      createdAt: new Date('2021-04-06T12:05:00.000Z')
    },
    {
      userId: user.id,
      title: 'Mission Contract Completed',
      message: 'Your Starship Super Heavy investment contract has reached splashdown! Total yield of 1488.56 BTC successfully processed and transferred to your spot wallet.',
      type: 'MINING',
      isRead: false,
      createdAt: targetEndDate
    }
  ]

  for (const n of notifications) {
    await prisma.notification.create({ data: n })
  }
  console.log('✅ Backdated real-time notifications seeded successfully')

  console.log('\n🎉 Seeding complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Admin Credentials:')
  console.log('  Email:    admin@spacxtrading.online')
  console.log('  Password: Admin@2026!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Vietnamese User Credentials:')
  console.log('  Email:    anhntdo2017@gmail.com')
  console.log('  Password: Annie@2021!')
  console.log('  BTC Bal:  1488.56 BTC ($100.478M / ₫2.55T)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

seed()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
