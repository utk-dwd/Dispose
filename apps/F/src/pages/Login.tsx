import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const handleLogin = () => {
    // Mock Privy login success
    setTimeout(() => navigate('/'), 300)
  }
  return (
    <div className="flex items-center justify-center py-20">
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-black/70">Mock Privy authentication. Click below to continue.</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin}>Login with Privy</Button>
        </CardFooter>
      </Card>
    </div>
  )
}