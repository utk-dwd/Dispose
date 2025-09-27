import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-16 text-center space-y-4">
          <p className="text-sm text-black/60 dark:text-white/60 max-w-sm mx-auto">
            Sign in to customize preferences and manage advanced disposable wallet options.
          </p>
          <Button asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}