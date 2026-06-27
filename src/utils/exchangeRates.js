const CACHE_KEY = 'xr_cache_v1'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function fetchLiveRates() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.rates
  } catch {}

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    if (!res.ok) throw new Error('bad response')
    const data = await res.json()
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: data.rates, ts: Date.now() }))
    return data.rates
  } catch {
    return null // caller falls back to hardcoded rates
  }
}
