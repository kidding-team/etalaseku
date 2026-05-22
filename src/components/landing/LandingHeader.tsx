import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { useAuthStatus } from '@/hooks/use-auth-status'
import { Button } from '../ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet'

const NAV_ITEMS = [
  { href: '#testimonials', label: 'Testimoni' },
  { href: '#features', label: 'Fitur' },
  { href: '#faq', label: 'FAQ' },
] as const

export function LandingHeader() {
  const { status } = useAuthStatus()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAuth = status === 'authenticated'
  const ctaTo = isAuth ? '/dashboard' : '/login'
  const ctaLabel = isAuth ? 'Dashboard' : 'Coba Sekarang'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <img
            src="/logo192.png"
            alt="EtalaseKu"
            className="h-8 w-8 rounded-md"
          />
          <span className="font-medium text-2xl font-serif italic">EtalaseKu</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <Link to={ctaTo} className="hidden sm:block">
            <Button className="rounded-full px-6 font-semibold shadow-sm">
              {ctaLabel}
            </Button>
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Buka menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-serif italic text-xl">
                <img
                  src="/logo192.png"
                  alt="EtalaseKu"
                  className="h-6 w-6 rounded"
                />
                EtalaseKu
              </SheetTitle>
            </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1 px-4">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 px-4">
                <Link
                  to={ctaTo}
                  onClick={() => setMobileOpen(false)}
                  className="block"
                >
                  <Button className="w-full rounded-full font-semibold shadow-sm">
                    {ctaLabel}
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
