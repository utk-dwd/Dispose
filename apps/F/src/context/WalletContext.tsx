/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { pythEntropyService, type Wallet } from '../services/pythService'

export interface WalletEntry {
  address: string
  balance: number
  network: string
  createdAt: number
  privateKey?: string
}

interface StoredWallet {
  wallet: WalletEntry | null
  history: WalletEntry[]
}

interface WalletContextValue {
  wallet: WalletEntry | null
  history: WalletEntry[]
  isGenerating: boolean
  getWallet: () => Promise<void>
  deleteWallet: () => Promise<void>
  copyWallet: () => void
  refreshBalance: () => void
}

export const WalletContext = React.createContext<WalletContextValue | undefined>(undefined)

// localStorage keys
const WALLET_STORAGE_KEY = 'disposable-wallet'
const HISTORY_STORAGE_KEY = 'disposable-wallet-history'

// Utility functions for localStorage
const saveToStorage = (wallet: WalletEntry | null, history: WalletEntry[]) => {
  try {
    const data: StoredWallet = { wallet, history }
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

const loadFromStorage = (): StoredWallet | null => {
  try {
    const stored = localStorage.getItem(WALLET_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return null
  }
}

// Mock USD price for ETH (in real app, fetch from API)
const ETH_USD_PRICE = 3000

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = React.useState<WalletEntry | null>(null)
  const [history, setHistory] = React.useState<WalletEntry[]>([])
  const [isGenerating, setIsGenerating] = React.useState(false)

  // Load from localStorage on mount
  React.useEffect(() => {
    const stored = loadFromStorage()
    if (stored) {
      setWallet(stored.wallet)
      setHistory(stored.history || [])
    }
  }, [])

  // Save to localStorage whenever wallet or history changes
  React.useEffect(() => {
    saveToStorage(wallet, history)
  }, [wallet, history])

  const getWallet = React.useCallback(async () => {
    setIsGenerating(true)
    try {
      const generatedWallet = await pythEntropyService.generateWallet()
      const entry: WalletEntry = {
        address: generatedWallet.address,
        balance: parseFloat((Math.random() * 0.5).toFixed(4)),
        network: 'Base', // Using Base network as requested
        createdAt: Date.now(),
        privateKey: generatedWallet.privateKey
      }
      setWallet(entry)
      setHistory(h => [entry, ...h].slice(0, 20))
    } catch (error) {
      console.error('Error generating wallet:', error)
      // Fallback to previous method if randomness service fails
      const entry: WalletEntry = {
        address: '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        balance: parseFloat((Math.random() * 0.5).toFixed(4)),
        network: 'Base',
        createdAt: Date.now()
      }
      setWallet(entry)
      setHistory(h => [entry, ...h].slice(0, 20))
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const deleteWallet = React.useCallback(async () => {
    await getWallet()
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
    isGenerating,
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