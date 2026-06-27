import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext } from 'react'
import { ExchangeRatesProvider } from './contexts/ExchangeRatesContext'
import InstallPrompt from './components/InstallPrompt'
import LandingPage from './pages/LandingPage'
import CustomerLayout from './layouts/CustomerLayout'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CustomerDashboard from './pages/customer/Dashboard'
import Deposit from './pages/customer/Deposit'
import Withdraw from './pages/customer/Withdraw'
import MiningPlans from './pages/customer/MiningPlans'
import MyMinings from './pages/customer/MyMinings'
import Referrals from './pages/customer/Referrals'
import Profile from './pages/customer/Profile'
import Transactions from './pages/customer/Transactions'
import Stocks from './pages/customer/Stocks'
import MyStocks from './pages/customer/MyStocks'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminDeposits from './pages/admin/Deposits'
import AdminWithdrawals from './pages/admin/Withdrawals'
import AdminPlans from './pages/admin/ManagePlans'
import AdminActiveMinings from './pages/admin/ActiveMinings'
import AdminStockInvestments from './pages/admin/StockInvestments'
import AdminSettings from './pages/admin/Settings'
import AdminLiveChat from './pages/admin/LiveChat'
import HelpCenter from './pages/static/HelpCenter'
import ContactUs from './pages/static/ContactUs'
import ApiDocs from './pages/static/ApiDocs'
import StatusPage from './pages/static/StatusPage'
import { TermsOfService, PrivacyPolicy, RefundPolicy, AmlPolicy } from './pages/static/Legal'
import Reviews from './pages/static/Reviews'
import InvestorsPage from './pages/InvestorsPage'
import { ToastProvider } from './components/Toast'

export const AuthContext = createContext(null)

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('miningUser')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { localStorage.removeItem('miningUser') }
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('miningUser', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('miningUser')
    localStorage.removeItem('miningToken')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0e1a' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <ExchangeRatesProvider>
    <AuthContext.Provider value={{ user, login, logout }}>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

          {/* Static Pages */}
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/aml-policy" element={<AmlPolicy />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/investors" element={<InvestorsPage />} />

          {/* Customer Routes */}
          <Route element={user ? <CustomerLayout /> : <Navigate to="/login" />}>
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="plans" element={<MiningPlans />} />
            <Route path="my-minings" element={<MyMinings />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="profile" element={<Profile />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="stocks" element={<Stocks />} />
            <Route path="my-stocks" element={<MyStocks />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminLayout /> : <Navigate to="/login" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="deposits" element={<AdminDeposits />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="minings" element={<AdminActiveMinings />} />
            <Route path="live-chat" element={<AdminLiveChat />} />
            <Route path="stocks" element={<AdminStockInvestments />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <InstallPrompt />
      </ToastProvider>
    </AuthContext.Provider>
    </ExchangeRatesProvider>
  )
}

export default App
