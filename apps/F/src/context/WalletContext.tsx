/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { smartAccountService } from '../services/simpleSmartAccountService'

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

  // Auto-load from localStorage on mount or generate new wallet
  React.useEffect(() => {
    const initializeWallet = async () => {
      const stored = loadFromStorage()
      if (stored && stored.wallet && stored.wallet.address) {
        // Load existing wallet from localStorage
        console.log('📱 Loading existing disposable wallet:', stored.wallet.address)
        setWallet(stored.wallet)
        setHistory(stored.history || [])
      } else {
        // No wallet found, automatically generate new one
        console.log('🔄 No existing wallet found, creating new disposable wallet...')
        await getWallet()
      }
    }
    
    // Only initialize once on mount
    initializeWallet().catch(console.error)
  }, []) // Remove getWallet dependency to prevent loops

  // Save to localStorage whenever wallet or history changes
  React.useEffect(() => {
    saveToStorage(wallet, history)
  }, [wallet, history])

  const getWallet = React.useCallback(async () => {
    setIsGenerating(true)
    try {
      console.log('🔄 Creating disposable wallet...')
      
      // Only use smart account approach - no local fallback
      console.log('🔗 Creating smart account with Pyth entropy')
      const generatedWallet = await smartAccountService.generateSmartWallet()
      
      const walletEntry: WalletEntry = {
        address: generatedWallet.address,
        balance: 0, // Smart accounts start with 0 balance
        network: generatedWallet.network || 'Base',
        createdAt: Date.now(),
        privateKey: generatedWallet.privateKey || generatedWallet.address
      }
      
      // Add enhanced security info if available
      if (generatedWallet.contractWallet) {
        console.log('✅ Enhanced security wallet created:', generatedWallet.contractWallet)
      }
      
      setWallet(walletEntry)
      setHistory(prev => [walletEntry, ...prev.slice(0, 9)]) // Keep last 10
    } catch (error) {
      console.error('Failed to generate smart wallet:', error)
      // No fallback - smart account is required
      throw new Error('Smart wallet creation failed. Please try again.')
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