import * as React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

export const Header: React.FC = () => {
  const [dark, setDark] = React.useState(false)
  React.useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])
  const navLinkClass = ({ isActive }: { isActive: boolean }) => cn('text-xs md:text-sm font-medium px-3 py-2 rounded-lg transition', isActive ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-soft' : 'text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10')
  return (
    <div className="pointer-events-none fixed top-4 left-1/2 z-30 w-[60%] max-w-5xl -translate-x-1/2">
      <header className="pointer-events-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60 shadow-soft">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2 font-semibold text-black dark:text-white">
            <span className="text-2xl">🗑️</span>
            <span className="hidden sm:inline text-sm md:text-base">Disposable Wallets</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass} end>Home</NavLink>
            <NavLink to="/history" className={navLinkClass}>Transactions</NavLink>
            <NavLink to="/settings" className={navLinkClass}>Settings</NavLink>
            <NavLink to="/dapp" className={navLinkClass}>Dapp</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setDark(d => !d)} aria-label="Toggle theme">
              {dark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m18.36 6.36-1.42-1.42M7.05 7.05 5.64 5.64m12.02 0-1.41 1.41M7.05 16.95l-1.41 1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>
    </div>
  )
}

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-black/10 dark:border-white/10 bg-white/90 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60 mt-12">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-black/60 dark:text-white/50">
        Prototype – no chain interactions.
      </div>
    </footer>
  )
}

export const ActionBar: React.FC = () => null

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col pt-20">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
      <Footer />
    </div>
  )
}