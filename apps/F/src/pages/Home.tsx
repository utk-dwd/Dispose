import { useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Table, Th, Td, Tr } from '../components/ui/table'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const { wallet, getWallet, refreshBalance, deleteWallet, copyWallet, history, isGenerating } = useWallet()

  useEffect(() => {
    if (!wallet && !isGenerating) {
      getWallet().catch(console.error)
    }
  }, [wallet, isGenerating, getWallet])

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Current Wallet</CardTitle>
            <p className="text-xs text-black/60 dark:text-white/60 mt-1">
              🎲 Secured by Pyth Network entropy on Base
            </p>
          </div>
          <Button size="sm" variant="secondary" asChild>
            <Link to="/dapp" title="Connect to App">Dapp</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-black/60 dark:text-white/60">Address</label>
            <Input readOnly value={wallet?.address ?? ''} className="font-mono" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="col-span-2 md:col-span-1">
              <div className="text-xs text-black/60 dark:text-white/60">Type</div>
              <div className="font-medium text-black dark:text-white">EVM Wallet</div>
            </div>
            <div className="col-span-2 md:col-span-3">
              <div className="text-xs text-black/60 dark:text-white/60">Total Balance (USD)</div>
              <div className="font-semibold text-lg text-black dark:text-white">${wallet ? (wallet.balance * 3000).toFixed(2) : '0.00'}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              onClick={() => getWallet().catch(console.error)} 
              disabled={isGenerating}
            >
              {isGenerating ? '🎲 Generating...' : 'Change'}
            </Button>
            <Button variant="outline" onClick={refreshBalance}>Refresh</Button>
            <Button variant="outline" onClick={() => deleteWallet().catch(console.error)}>Delete</Button>
            <Button variant="outline" onClick={copyWallet}>Copy</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <p className="text-sm text-black/60 dark:text-white/60">Sign in to view & save your disposable wallet transactions.</p>
              <Button asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <thead>
                <Tr>
                  <Th>From Address</Th>
                  <Th>Network</Th>
                  <Th>Token</Th>
                  <Th>Track</Th>
                </Tr>
              </thead>
              <tbody>
                {history.map((w) => (
                  <Tr key={w.address}>
                    <Td className="font-mono text-xs break-all">{w.address}</Td>
                    <Td>{w.network}</Td>
                    <Td>0.1 USDC</Td>
                    <Td>
                      <a
                        href={`https://$${'{'}w.network.toLowerCase() === 'ethereum' ? '' : w.network.toLowerCase() + '.'}${'}'}etherscan.io/address/${w.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Explorer
                      </a>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}