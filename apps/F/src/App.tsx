import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/Layout'
import { WalletProvider } from './context/WalletContext'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import HistoryPage from './pages/History'
import SettingsPage from './pages/Settings'
import DappPage from './pages/Deep'

export default function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/dapp" element={<DappPage />} />
          </Routes>
        </AppLayout>
      </WalletProvider>
    </BrowserRouter>
  )
}
