/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'

export interface WalletEntry {
  address: string
  balance: number
  network: string
  createdAt: number
}

interface WalletContextValue {
  wallet: WalletEntry | null
  history: WalletEntry[]
  getWallet: () => void
  deleteWallet: () => void
  copyWallet: () => void
  refreshBalance: () => void
}

export const WalletContext = React.createContext<WalletContextValue | undefined>(undefined)

function randomAddress() {
  const chars = 'abcdef0123456789'
  let out = '0x'
  for (let i = 0; i < 40; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

const networks = ['Base', 'Ethereum', 'Arbitrum']

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = React.useState<WalletEntry | null>(null)
  const [history, setHistory] = React.useState<WalletEntry[]>([])

  const getWallet = React.useCallback(() => {
    const entry: WalletEntry = {
      address: randomAddress(),
      balance: parseFloat((Math.random() * 0.5).toFixed(4)),
      network: networks[Math.floor(Math.random() * networks.length)],
      createdAt: Date.now()
    }
    setWallet(entry)
    setHistory(h => [entry, ...h].slice(0, 20))
  }, [])

  const deleteWallet = React.useCallback(() => {
    getWallet()
  }, [getWallet])

  const copyWallet = React.useCallback(() => {
    if (wallet) navigator.clipboard.writeText(wallet.address).catch(() => {})
  }, [wallet])

  const refreshBalance = React.useCallback(() => {
    setWallet(w => (w ? { ...w, balance: parseFloat((Math.random() * 0.5).toFixed(4)) } : w))
  }, [])

  const value: WalletContextValue = {
    wallet,
    history,
    getWallet,
    deleteWallet,
    copyWallet,
    refreshBalance,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = React.useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}