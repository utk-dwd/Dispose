import { createSmartAccountClient } from 'permissionless'
import { toSimpleSmartAccount } from 'permissionless/accounts'
import { createPimlicoClient } from 'permissionless/clients/pimlico'
import { createPublicClient, http, encodeFunctionData, parseAbi } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// EntryPoint V0.7 address
const ENTRYPOINT_ADDRESS_V07 = '0x0000000071727De22E5E9d8BAf0edAc6f37da032'

// EntropyWallet contract ABI (only functions we need)
const ENTROPY_WALLET_ABI = parseAbi([
  'function requestRandomWallet() external payable returns (uint64)',
  'function getWallet(uint64 sequenceNumber) external view returns (address)',
  'function getEntropyFee() external view returns (uint256)',
  'function getRequester(uint64 sequenceNumber) external view returns (address)',
  'event WalletGenerated(uint64 indexed sequenceNumber, address indexed requester, address walletAddress)',
  'event RandomnessRequested(uint64 indexed sequenceNumber, address indexed requester)'
])

export interface SmartWallet {
  address: string
  smartAccountAddress: string
  sequenceNumber?: bigint
  generatedWallet?: string
  status: 'creating' | 'requesting' | 'pending' | 'completed' | 'failed'
  network: string
}

export class PimlicoSmartAccountService {
  private publicClient
  private pimlicoClient
  
  // This should be the deployed EntropyWallet contract address
  private readonly ENTROPY_WALLET_CONTRACT = '0x3934C2Dbf9f2c6117f31E192d068BF55Fc59622c' // From deployment
  
  // Pimlico API endpoints for Base mainnet
  private readonly PIMLICO_API_KEY = 'pim_YOUR_API_KEY_HERE' // TODO: Add your Pimlico API key
  private readonly PIMLICO_BUNDLER_URL = `https://api.pimlico.io/v2/base/rpc?apikey=${this.PIMLICO_API_KEY}`

  constructor() {
    // Initialize Base mainnet clients
    this.publicClient = createPublicClient({
      transport: http('https://mainnet.base.org'),
      chain: base,
    })

    this.pimlicoClient = createPimlicoClient({
      transport: http(this.PIMLICO_BUNDLER_URL),
    })
  }

  /**
   * Create a smart account using Pyth entropy as the private key
   */
  async createSmartAccount(entropyPrivateKey: string): Promise<{
    smartAccount: any
    smartAccountClient: any
    accountAddress: string
  }> {
    try {
      console.log('🔐 Creating smart account with Pyth entropy...')
      
      // Create account from entropy-generated private key
      const signer = privateKeyToAccount(entropyPrivateKey as `0x${string}`)
      
      // Create simple smart account following official Pimlico guide
      const smartAccount = await toSimpleSmartAccount({
        client: this.publicClient,
        owner: signer,
        entryPoint: {
          address: ENTRYPOINT_ADDRESS_V07,
          version: '0.7' as const,
        },
      })

      // Create smart account client following official guide
      const smartAccountClient = createSmartAccountClient({
        account: smartAccount,
        chain: base,
        bundlerTransport: http(this.PIMLICO_BUNDLER_URL),
        paymaster: this.pimlicoClient, // optional paymaster
        userOperation: {
          estimateFeesPerGas: async () => {
            return (await this.pimlicoClient.getUserOperationGasPrice()).fast // only when using pimlico bundler
          },
        }
      })

      const accountAddress = smartAccount.address

      console.log('✅ Smart account created:', accountAddress)
      return { smartAccount, smartAccountClient, accountAddress }
    } catch (error) {
      console.error('Failed to create smart account:', error)
      throw new Error('Smart account creation failed')
    }
  }

  /**
   * Request a random wallet using the deployed EntropyWallet contract
   */
  async requestRandomWallet(smartAccountClient: any): Promise<{
    sequenceNumber: bigint
    userOperationHash: string
  }> {
    try {
      console.log('🎲 Requesting random wallet via Pyth entropy...')
      
      // Get the entropy fee from contract
      const entropyFee = await this.publicClient.readContract({
        address: this.ENTROPY_WALLET_CONTRACT,
        abi: ENTROPY_WALLET_ABI,
        functionName: 'getEntropyFee'
      }) as bigint

      console.log('💰 Entropy fee:', entropyFee.toString(), 'wei')

      // Encode the contract call
      const callData = encodeFunctionData({
        abi: ENTROPY_WALLET_ABI,
        functionName: 'requestRandomWallet'
      })

      // Send gasless transaction via paymaster
      const userOperationHash = await smartAccountClient.sendUserOperation({
        userOperation: {
          callData: await smartAccountClient.account.encodeCallData({
            to: this.ENTROPY_WALLET_CONTRACT,
            data: callData,
            value: entropyFee, // Pay the entropy fee
          })
        }
      })

      console.log('📤 User operation sent:', userOperationHash)

      // Wait for the transaction receipt
      const receipt = await this.pimlicoClient.waitForUserOperationReceipt({
        hash: userOperationHash,
      })

      // Parse logs to get sequence number
      let sequenceNumber: bigint = 0n
      
      for (const log of receipt.logs) {
        try {
          // Use viem's decodeEventLog function
          const { decodeEventLog } = await import('viem')
          const decoded = decodeEventLog({
            abi: ENTROPY_WALLET_ABI,
            data: log.data,
            topics: log.topics,
          })
          
          if (decoded.eventName === 'RandomnessRequested') {
            sequenceNumber = decoded.args.sequenceNumber as bigint
            console.log('🎯 Randomness requested, sequence:', sequenceNumber.toString())
            break
          }
        } catch (e) {
          // Skip logs that don't match our ABI
          continue
        }
      }

      if (sequenceNumber === 0n) {
        throw new Error('Failed to get sequence number from transaction receipt')
      }

      return { sequenceNumber, userOperationHash }
    } catch (error) {
      console.error('Failed to request random wallet:', error)
      throw error
    }
  }

  /**
   * Check if a wallet has been generated for a sequence number
   */
  async checkWalletGenerated(sequenceNumber: bigint): Promise<string | null> {
    try {
      const walletAddress = await this.publicClient.readContract({
        address: this.ENTROPY_WALLET_CONTRACT,
        abi: ENTROPY_WALLET_ABI,
        functionName: 'getWallet',
        args: [sequenceNumber]
      }) as string

      // Return null if wallet hasn't been generated yet (address is zero)
      if (walletAddress === '0x0000000000000000000000000000000000000000') {
        return null
      }

      return walletAddress
    } catch (error) {
      console.error('Error checking wallet generation:', error)
      return null
    }
  }

  /**
   * Poll for wallet generation completion
   */
  async waitForWalletGeneration(sequenceNumber: bigint, maxWaitTime = 60000): Promise<string> {
    const startTime = Date.now()
    const pollInterval = 2000 // Poll every 2 seconds

    console.log('⏳ Waiting for Pyth entropy callback...')

    return new Promise((resolve, reject) => {
      const pollTimer = setInterval(async () => {
        try {
          const walletAddress = await this.checkWalletGenerated(sequenceNumber)
          
          if (walletAddress) {
            clearInterval(pollTimer)
            console.log('🎉 Wallet generated:', walletAddress)
            resolve(walletAddress)
            return
          }

          // Check timeout
          if (Date.now() - startTime > maxWaitTime) {
            clearInterval(pollTimer)
            reject(new Error('Timeout waiting for wallet generation'))
          }
        } catch (error) {
          clearInterval(pollTimer)
          reject(error)
        }
      }, pollInterval)
    })
  }

  /**
   * Complete flow: Create smart account + request random wallet + wait for generation
   */
  async generateWalletWithPythEntropy(entropyPrivateKey: string): Promise<SmartWallet> {
    try {
      console.log('🚀 Starting full Pyth entropy wallet generation flow...')
      
      // Step 1: Create smart account
      const { smartAccountClient, accountAddress } = await this.createSmartAccount(entropyPrivateKey)
      
      // Step 2: Request random wallet via Pyth entropy
      const { sequenceNumber } = await this.requestRandomWallet(smartAccountClient)
      
      // Step 3: Wait for Pyth callback to generate wallet
      const generatedWallet = await this.waitForWalletGeneration(sequenceNumber)
      
      return {
        address: entropyPrivateKey, // Original entropy private key
        smartAccountAddress: accountAddress,
        sequenceNumber,
        generatedWallet,
        status: 'completed',
        network: 'Base'
      }
    } catch (error) {
      console.error('Full flow failed:', error)
      throw error
    }
  }

  /**
   * Get contract information
   */
  async getContractInfo() {
    try {
      const entropyFee = await this.publicClient.readContract({
        address: this.ENTROPY_WALLET_CONTRACT,
        abi: ENTROPY_WALLET_ABI,
        functionName: 'getEntropyFee'
      })

      return {
        contractAddress: this.ENTROPY_WALLET_CONTRACT,
        entropyFee: entropyFee.toString(),
        network: 'Base Mainnet'
      }
    } catch (error) {
      console.error('Error getting contract info:', error)
      throw error
    }
  }
}

export const pimlicoSmartAccountService = new PimlicoSmartAccountService()