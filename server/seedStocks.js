import mysql from 'mysql2/promise'
import { randomUUID } from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const STOCKS = [
  { symbol: 'AAPL',   name: 'Apple Inc.',                              description: 'Consumer electronics, software, and services giant behind iPhone, Mac, and iOS.',         sector: 'Technology',     annualROI: 9.5,  minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 298.12 },
  { symbol: 'MSFT',   name: 'Microsoft Corporation',                   description: 'Global leader in cloud computing (Azure), enterprise software, and AI with Copilot.',      sector: 'Technology',     annualROI: 11.0, minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 501.73 },
  { symbol: 'NVDA',   name: 'NVIDIA Corporation',                      description: 'World\'s top GPU manufacturer powering AI, data centers, and next-gen compute.',            sector: 'Technology',     annualROI: 18.0, minInvestment: 100, maxInvestment: 500000, contractDays: 180, lastKnownPrice: 135.58 },
  { symbol: 'GOOGL',  name: 'Alphabet Inc. (Google)',                  description: 'Parent company of Google Search, YouTube, Google Cloud, and DeepMind AI.',                  sector: 'Technology',     annualROI: 10.5, minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 196.80 },
  { symbol: 'AMZN',   name: 'Amazon.com Inc.',                         description: 'Global e-commerce and cloud leader with AWS, Prime Video, and Alexa.',                      sector: 'E-Commerce',     annualROI: 12.0, minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 230.45 },
  { symbol: 'META',   name: 'Meta Platforms Inc.',                     description: 'Owner of Facebook, Instagram, WhatsApp, and leading developer in the metaverse.',           sector: 'Social Media',   annualROI: 13.5, minInvestment: 100, maxInvestment: 500000, contractDays: 180, lastKnownPrice: 691.22 },
  { symbol: 'TSLA',   name: 'Tesla Inc.',                              description: 'Leading electric vehicle manufacturer also driving solar energy and battery storage.',        sector: 'Automotive/EV',  annualROI: 15.0, minInvestment: 100, maxInvestment: 500000, contractDays: 180, lastKnownPrice: 335.40 },
  { symbol: 'BRK-B',  name: 'Berkshire Hathaway Inc.',                 description: 'Warren Buffett\'s diversified holding company with major positions in finance and energy.',  sector: 'Finance',        annualROI: 8.0,  minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 529.60 },
  { symbol: 'V',      name: 'Visa Inc.',                               description: 'World\'s largest payment processing network enabling global digital commerce.',               sector: 'Fintech',        annualROI: 9.0,  minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 372.85 },
  { symbol: 'MA',     name: 'Mastercard Inc.',                         description: 'Global payments technology company serving billions of cardholders worldwide.',                sector: 'Fintech',        annualROI: 9.5,  minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 563.40 },
  { symbol: 'JPM',    name: 'JPMorgan Chase & Co.',                    description: 'Largest U.S. bank by assets, spanning investment banking, consumer and commercial finance.', sector: 'Banking',        annualROI: 8.5,  minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 283.76 },
  { symbol: 'JNJ',    name: 'Johnson & Johnson',                       description: 'Healthcare giant with a diversified portfolio of pharmaceuticals, medical devices.',          sector: 'Healthcare',     annualROI: 7.5,  minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 152.90 },
  { symbol: 'UNH',    name: 'UnitedHealth Group Inc.',                 description: 'Largest health insurance company in the U.S. with integrated care delivery services.',        sector: 'Healthcare',     annualROI: 10.0, minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 282.44 },
  { symbol: 'WMT',    name: 'Walmart Inc.',                            description: 'World\'s largest retailer with over 10,500 stores globally and a growing e-commerce arm.',   sector: 'Retail',         annualROI: 7.0,  minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 102.98 },
  { symbol: 'HD',     name: 'The Home Depot Inc.',                     description: 'Largest home improvement retailer with strong contractor and DIY customer base.',             sector: 'Retail',         annualROI: 8.5,  minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 377.50 },
  { symbol: 'PG',     name: 'Procter & Gamble Co.',                    description: 'Consumer goods leader owning brands like Tide, Gillette, Pampers, and Oral-B.',              sector: 'Consumer Goods', annualROI: 7.0,  minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 167.65 },
  { symbol: 'XOM',    name: 'Exxon Mobil Corporation',                 description: 'One of the largest publicly traded oil and gas companies with global operations.',            sector: 'Energy',         annualROI: 9.0,  minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 116.80 },
  { symbol: 'KO',     name: 'The Coca-Cola Company',                   description: 'Iconic global beverage company with over 200 brands sold in 200+ countries.',                sector: 'Beverages',      annualROI: 6.5,  minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 70.92 },
  { symbol: 'NFLX',   name: 'Netflix Inc.',                            description: 'World\'s leading subscription streaming service with 260M+ paid memberships globally.',      sector: 'Streaming',      annualROI: 14.0, minInvestment: 100, maxInvestment: 500000, contractDays: 180, lastKnownPrice: 1342.10 },
  { symbol: 'AMD',    name: 'Advanced Micro Devices Inc.',             description: 'High-performance semiconductor company competing in CPUs, GPUs, and AI accelerators.',        sector: 'Technology',     annualROI: 16.0, minInvestment: 100, maxInvestment: 500000, contractDays: 180, lastKnownPrice: 154.92 },
  { symbol: 'INTC',   name: 'Intel Corporation',                       description: 'Pioneer semiconductor company pivoting toward foundry services and AI chip development.',     sector: 'Technology',     annualROI: 8.0,  minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 22.14 },
  { symbol: 'ORCL',   name: 'Oracle Corporation',                      description: 'Enterprise cloud infrastructure and database giant accelerating with AI and OCI.',            sector: 'Technology',     annualROI: 10.0, minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 194.37 },
  { symbol: 'CRM',    name: 'Salesforce Inc.',                         description: 'World\'s #1 CRM platform connecting sales, service, and marketing in the cloud.',            sector: 'SaaS',           annualROI: 11.5, minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 298.06 },
  { symbol: 'ADBE',   name: 'Adobe Inc.',                              description: 'Creative software leader powering digital media with Photoshop, Acrobat, and Adobe AI.',     sector: 'Software',       annualROI: 12.0, minInvestment: 100, maxInvestment: 500000, contractDays: 365, lastKnownPrice: 432.18 },
  { symbol: 'PYPL',   name: 'PayPal Holdings Inc.',                    description: 'Digital payments platform with Venmo, Braintree, and 400M+ active accounts.',                sector: 'Fintech',        annualROI: 10.5, minInvestment: 100, maxInvestment: 500000, contractDays: 180, lastKnownPrice: 75.80 },
  { symbol: 'UBER',   name: 'Uber Technologies Inc.',                  description: 'Global mobility and delivery platform operating in 70+ countries with ride-share and Eats.', sector: 'Mobility',       annualROI: 13.0, minInvestment: 100, maxInvestment: 500000, contractDays: 180, lastKnownPrice: 86.96 },
  { symbol: 'PLTR',   name: 'Palantir Technologies Inc.',              description: 'AI and big data analytics platform serving government agencies and enterprise clients.',       sector: 'AI / Defense',   annualROI: 17.0, minInvestment: 100, maxInvestment: 500000, contractDays: 90,  lastKnownPrice: 140.24 },
  { symbol: 'SNOW',   name: 'Snowflake Inc.',                          description: 'Cloud data warehousing and analytics platform enabling AI-powered data sharing.',              sector: 'Cloud / Data',   annualROI: 14.5, minInvestment: 100, maxInvestment: 500000, contractDays: 180, lastKnownPrice: 174.32 },
  { symbol: 'RIVN',   name: 'Rivian Automotive Inc.',                  description: 'Next-generation electric adventure vehicle startup backed by Amazon and Ford.',               sector: 'EV',             annualROI: 18.5, minInvestment: 100, maxInvestment: 500000, contractDays: 90,  lastKnownPrice: 12.48 },
  { symbol: 'LCID',   name: 'Lucid Group Inc.',                        description: 'Ultra-luxury EV maker with the world\'s longest-range electric vehicle, the Lucid Air.',     sector: 'EV',             annualROI: 16.5, minInvestment: 100, maxInvestment: 500000, contractDays: 90,  lastKnownPrice: 2.89 },
  {
    symbol: 'SPACEX',
    name: 'Space Exploration Technologies Corp. (SpaceX)',
    description: 'Elon Musk\'s private aerospace company revolutionizing space travel with Falcon 9, Starship, and Starlink. Available at secondary market valuation.',
    sector: 'Aerospace / Defense',
    isPrivate: true,
    fixedPrice: 250.00,
    lastKnownPrice: 250.00,
    annualROI: 22.0,
    minInvestment: 500,
    maxInvestment: 1000000,
    contractDays: 365
  },
]

// Bypasses Prisma entirely for this script. The Prisma Rust query engine
// hard-panics ("timer has gone away") under this host's CPU throttling and
// the panic is non-recoverable for the rest of the process — confirmed live,
// every query after the first panic fails identically. mysql2 is pure JS,
// no native async runtime to starve, so it doesn't hit this failure class.
async function seedStocks() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL)
  console.log('🌱 Seeding stock catalog...')
  let succeeded = 0
  for (const s of STOCKS) {
    await conn.execute(
      `INSERT INTO stocks
        (id, symbol, name, description, sector, isPrivate, fixedPrice, lastKnownPrice, annualROI, minInvestment, maxInvestment, contractDays, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(3), NOW(3))
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), description=VALUES(description), sector=VALUES(sector), isPrivate=VALUES(isPrivate),
         fixedPrice=VALUES(fixedPrice), lastKnownPrice=VALUES(lastKnownPrice), annualROI=VALUES(annualROI),
         minInvestment=VALUES(minInvestment), maxInvestment=VALUES(maxInvestment), contractDays=VALUES(contractDays),
         isActive=1, updatedAt=NOW(3)`,
      [
        randomUUID(), s.symbol, s.name, s.description || null, s.sector || null,
        s.isPrivate ? 1 : 0, s.fixedPrice ?? null, s.lastKnownPrice ?? null,
        s.annualROI, s.minInvestment, s.maxInvestment, s.contractDays
      ]
    )
    succeeded++
  }
  console.log(`✅ ${succeeded}/${STOCKS.length} stocks seeded successfully!`)
  await conn.end()
}

seedStocks().catch(e => { console.error(e); process.exit(1) })
