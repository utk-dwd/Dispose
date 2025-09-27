import { ethers } from 'ethers'
import { pythEntropyService } from './pythService'

// Simplified smart account service for KISS principle
// This integrates with our deployed EntropyWallet contract
export interface SmartWallet {
  address: string
  privateKey: string
  contractWallet?: string
  sequenceNumber?: string
  status: 'creating' | 'requesting' | 'pending' | 'completed' | 'failed'
  network: string
}

// EntropyWallet contract ABI
const ENTROPY_WALLET_ABI = [
  'function requestRandomWallet() external payable returns (uint64)',
  'function getWallet(uint64 sequenceNumber) external view returns (address)',
  'function getEntropyFee() external view returns (uint256)',
  'function getRequester(uint64 sequenceNumber) external view returns (address)',
  'event WalletGenerated(uint64 indexed sequenceNumber, address indexed requester, address walletAddress)',
  'event RandomnessRequested(uint64 indexed sequenceNumber, address indexed requester)'
]

export class SmartAccountService {
  private provider: ethers.JsonRpcProvider
  private entropyWalletContract: ethers.Contract
  
  // Deployed EntropyWallet contract address (from our deployment)
  private readonly ENTROPY_WALLET_ADDRESS = '0x3934C2Dbf9f2c6117f31E192d068BF55Fc59622c'
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://mainnet.base.org')
    this.entropyWalletContract = new ethers.Contract(
      this.ENTROPY_WALLET_ADDRESS,
      ENTROPY_WALLET_ABI,
      this.provider
    )
  }

  /**
   * Generate wallet using Pyth entropy + deployed contract
   * Step 1: Generate entropy-based EOA wallet (for paying gas)
   * Step 2: Use that wallet to call EntropyWallet contract for true Pyth randomness
   */
  async generateSmartWallet(): Promise<SmartWallet> {
    try {
      console.log('🚀 Starting smart wallet generation with Pyth entropy...')
      
      // Step 1: Generate initial wallet with Pyth-inspired entropy
      const initialWallet = await pythEntropyService.generateWallet()
      console.log('📱 Initial wallet created:', initialWallet.address)
      
      // Create wallet instance for contract interaction
      const wallet = new ethers.Wallet(initialWallet.privateKey, this.provider)
      
      // Check if wallet has ETH for gas (in real app, would fund from faucet/paymaster)
      const balance = await this.provider.getBalance(wallet.address)
      console.log('💰 Wallet balance:', ethers.formatEther(balance), 'ETH')
      
      if (balance === 0n) {
        console.warn('⚠️  Wallet has no ETH for gas fees. In production, use paymaster.')
        // For now, return the Pyth-entropy wallet as final result
        return {
          address: initialWallet.address,
          privateKey: initialWallet.privateKey,
          status: 'completed',
          network: 'Base'
        }
      }
      
      // Step 2: Call EntropyWallet contract for true on-chain Pyth randomness
      return await this.requestContractRandomness(wallet, initialWallet)
      
    } catch (error) {
      console.error('Smart wallet generation failed:', error)
      throw error
    }
  }

  /**
   * Request randomness from deployed EntropyWallet contract
   */
  async requestContractRandomness(wallet: ethers.Wallet, initialWallet: any): Promise<SmartWallet> {
    try {
      console.log('🎲 Requesting randomness from EntropyWallet contract...')
      
      // Get entropy fee
      const entropyFee = await this.entropyWalletContract.getEntropyFee()
      console.log('💰 Entropy fee:', ethers.formatEther(entropyFee), 'ETH')
      
      // Connect wallet to contract
      const contractWithSigner = this.entropyWalletContract.connect(wallet)
      
      // Request random wallet from contract
      const tx = await (contractWithSigner as any).requestRandomWallet({ 
        value: entropyFee,
        gasLimit: 200000 // Set reasonable gas limit
      })
      
      console.log('📤 Transaction sent:', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ Transaction confirmed')
      
      // Parse events to get sequence number
      let sequenceNumber: string | undefined
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.entropyWalletContract.interface.parseLog({
            topics: log.topics,
            data: log.data
          })
          
          if (parsedLog && parsedLog.name === 'RandomnessRequested') {
            sequenceNumber = parsedLog.args.sequenceNumber.toString()
            console.log('🎯 Sequence number:', sequenceNumber)
            break
          }
        } catch (e) {
          // Skip logs that don't match our interface
        }
      }
      
      if (!sequenceNumber) {
        throw new Error('Failed to get sequence number from transaction')
      }
      
      // Wait for Pyth callback to generate the final wallet
      const contractWallet = await this.waitForWalletGeneration(sequenceNumber)
      
      return {
        address: initialWallet.address,
        privateKey: initialWallet.privateKey,
        contractWallet,
        sequenceNumber,
        status: 'completed',
        network: 'Base'
      }
      
    } catch (error) {
      console.error('Contract randomness request failed:', error)
      // Fallback to initial wallet
      return {
        address: initialWallet.address,
        privateKey: initialWallet.privateKey,
        status: 'failed',
        network: 'Base'
      }
    }
  }

  /**
   * Wait for Pyth entropy callback to generate wallet
   */
  async waitForWalletGeneration(sequenceNumber: string, maxWaitTime = 60000): Promise<string | undefined> {
    const startTime = Date.now()
    const pollInterval = 3000 // Poll every 3 seconds
    
    console.log('⏳ Waiting for Pyth entropy callback...')
    
    return new Promise((resolve) => {
      const pollTimer = setInterval(async () => {
        try {
          const walletAddress = await this.entropyWalletContract.getWallet(sequenceNumber)
          
          // Check if wallet has been generated (not zero address)
          if (walletAddress && walletAddress !== '0x0000000000000000000000000000000000000000') {
            clearInterval(pollTimer)
            console.log('🎉 Contract wallet generated:', walletAddress)
            resolve(walletAddress)
            return
          }
          
          // Check timeout
          if (Date.now() - startTime > maxWaitTime) {
            clearInterval(pollTimer)
            console.warn('⏰ Timeout waiting for Pyth callback')
            resolve(undefined)
          }
        } catch (error) {
          console.error('Error polling for wallet:', error)
          clearInterval(pollTimer)
          resolve(undefined)
        }
      }, pollInterval)
    })
  }

  /**
   * Get contract information
   */
  async getContractInfo() {
    try {
      const entropyFee = await this.entropyWalletContract.getEntropyFee()
      
      return {
        contractAddress: this.ENTROPY_WALLET_ADDRESS,
        entropyFee: ethers.formatEther(entropyFee),
        network: 'Base Mainnet'
      }
    } catch (error) {
      console.error('Error getting contract info:', error)
      throw error
    }
  }

  /**
   * Check if contract is available
   */
  async isContractAvailable(): Promise<boolean> {
    try {
      await this.entropyWalletContract.getEntropyFee()
      return true
    } catch {
      return false
    }
  }
}

export const smartAccountService = new SmartAccountService()