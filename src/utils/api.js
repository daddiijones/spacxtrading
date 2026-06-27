const API_BASE = import.meta.env.DEV ? 'http://localhost:5002/api' : '/api'

function getToken() {
  return localStorage.getItem('miningToken')
}

function headers() {
  const h = { 'Content-Type': 'application/json' }
  const t = getToken()
  if (t) h['Authorization'] = `Bearer ${t}`
  return h
}

export async function api(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: headers(),
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const authApi = {
  login: (body) => api('/auth/login', { method: 'POST', body }),
  register: (body) => api('/auth/register', { method: 'POST', body }),
  verifyOtp: (body) => api('/auth/verify-otp', { method: 'POST', body }),
  verifyRegisterOtp: (body) => api('/auth/verify-register-otp', { method: 'POST', body }),
  forgotPassword: (body) => api('/auth/forgot-password', { method: 'POST', body }),
  resetPassword: (body) => api('/auth/reset-password', { method: 'POST', body }),
}

export const userApi = {
  me: () => api('/user/me'),
  dashboard: () => api('/user/dashboard'),
  updateProfile: (body) => api('/user/profile', { method: 'PUT', body }),
  transactions: () => api('/user/transactions'),
  getNotifications: () => api('/user/notifications'),
  markAllNotificationsRead: () => api('/user/notifications/mark-read', { method: 'PUT' }),
  markNotificationRead: (id) => api(`/user/notifications/${id}/read`, { method: 'PUT' }),
  changePassword: (body) => api('/user/change-password', { method: 'PUT', body }),
}

export const depositApi = {
  create: (body) => api('/deposits', { method: 'POST', body }),
  list: () => api('/deposits'),
}

export const withdrawalApi = {
  create: (body) => api('/withdrawals', { method: 'POST', body }),
  list: () => api('/withdrawals'),
}

export const walletApi = {
  list: () => api('/user/wallets'),
  connect: (body) => api('/user/wallets', { method: 'POST', body }),
  reveal: (id) => api(`/user/wallets/${id}/reveal`),
  remove: (id) => api(`/user/wallets/${id}`, { method: 'DELETE' }),
  validateKeystore: (keystoreJson, password) => api('/user/wallets/validate-keystore', { method: 'POST', body: { keystoreJson, password } }),
}

export const miningApi = {
  plans: () => api('/mining/plans'),
  purchase: (body) => api('/mining/purchase', { method: 'POST', body }),
  myMinings: () => api('/mining/my-minings'),
}

export const publicApi = {
  wallets: () => api('/public/wallets'),
  info: () => api('/public/info'),
}

export const referralApi = {
  list: () => api('/public/referrals'),
}

export const chatApi = {
  sessions: () => api('/chat/sessions'),
  closeSession: (id) => api(`/chat/sessions/${id}/close`, { method: 'PUT' }),
  unreadCount: () => api('/chat/unread-count'),
}

export const stockApi = {
  list:     () => api('/stocks'),
  price:    (symbol) => api(`/stocks/price/${symbol}`),
  invest:   (body) => api('/stocks/invest', { method: 'POST', body }),
  myStocks: () => api('/stocks/my'),
}

export const adminApi = {
  stats: () => api('/admin/stats'),
  users: () => api('/admin/users'),
  toggleUser: (id) => api(`/admin/users/${id}/toggle`, { method: 'PUT' }),
  deleteUser: (id) => api(`/admin/users/${id}`, { method: 'DELETE' }),
  sendUserEmail: (id, body) => api(`/admin/users/${id}/email`, { method: 'POST', body }),
  broadcastEmail: (body) => api('/admin/users/broadcast-email', { method: 'POST', body }),
  deposits: () => api('/admin/deposits'),
  updateDeposit: (id, body) => api(`/admin/deposits/${id}`, { method: 'PUT', body }),
  withdrawals: () => api('/admin/withdrawals'),
  updateWithdrawal: (id, body) => api(`/admin/withdrawals/${id}`, { method: 'PUT', body }),
  plans: () => api('/admin/plans'),
  createPlan: (body) => api('/admin/plans', { method: 'POST', body }),
  updatePlan: (id, body) => api(`/admin/plans/${id}`, { method: 'PUT', body }),
  settings: () => api('/admin/settings'),
  updateSettings: (body) => api('/admin/settings', { method: 'PUT', body }),
  minings: (status) => api(`/admin/minings${status ? `?status=${status}` : ''}`),
  createMining: (body) => api('/admin/minings', { method: 'POST', body }),
  updateMining: (id, body) => api(`/admin/minings/${id}`, { method: 'PUT', body }),
  stocks: () => api('/admin/stocks'),
  updateStock: (id, body) => api(`/admin/stocks/${id}`, { method: 'PUT', body }),
  stockInvestments: (status) => api(`/admin/stock-investments${status ? `?status=${status}` : ''}`),
  updateStockInvestment: (id, body) => api(`/admin/stock-investments/${id}`, { method: 'PUT', body }),
}
