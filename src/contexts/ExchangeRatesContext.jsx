import { createContext, useContext, useEffect, useState } from 'react'
import { fetchLiveRates } from '../utils/exchangeRates'
import { COUNTRIES_DATA } from '../utils/countriesData'

const Ctx = createContext(null)

function getRate(code, liveRates) {
  if (liveRates && liveRates[code] != null) return liveRates[code]
  return COUNTRIES_DATA.find(c => c.currency === code)?.rate || 1.0
}

export function formatCurrency(val, uUser, liveRates, shrink = false) {
  const code = uUser?.currency || 'USD'
  const match = COUNTRIES_DATA.find(c => c.currency === code)
  const symbol = match?.symbol || '$'
  const rate = getRate(code, liveRates)
  const converted = val * rate
  if (shrink) {
    const abs = Math.abs(converted)
    if (abs >= 1e12) return symbol + (converted / 1e12).toFixed(2) + 'T'
    if (abs >= 1e9)  return symbol + (converted / 1e9).toFixed(2) + 'B'
    if (abs >= 1e6)  return symbol + (converted / 1e6).toFixed(2) + 'M'
    if (abs >= 1e3)  return symbol + (converted / 1e3).toFixed(2) + 'k'
  }
  return symbol + Number(converted).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function usdToLocal(usdVal, uUser, liveRates) {
  const code = uUser?.currency || 'USD'
  return usdVal * getRate(code, liveRates)
}

export function localToUsd(localVal, uUser, liveRates) {
  const code = uUser?.currency || 'USD'
  return localVal / getRate(code, liveRates)
}

export function currencySymbol(uUser) {
  return COUNTRIES_DATA.find(c => c.currency === (uUser?.currency || 'USD'))?.symbol || '$'
}

export function ExchangeRatesProvider({ children }) {
  const [rates, setRates] = useState(null)
  useEffect(() => { fetchLiveRates().then(r => { if (r) setRates(r) }) }, [])
  return <Ctx.Provider value={rates}>{children}</Ctx.Provider>
}

export function useExchangeRates() {
  return useContext(Ctx)
}
