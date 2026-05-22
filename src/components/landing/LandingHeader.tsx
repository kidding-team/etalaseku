import { Link } from '@tanstack/react-router'
import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '../ui/button'

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-medium text-2xl font-serif italic">EtalaseKu</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#testimonials" className="hover:text-foreground transition-colors">Testimoni</a>
          <a href="#features" className="hover:text-foreground transition-colors">Fitur</a>
          <a href="#showcase" className="hover:text-foreground transition-colors">Demo AI</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to='/login' className="hidden sm:block">
            <Button className="rounded-full px-6 font-semibold shadow-sm">
              Coba Sekarang
            </Button>
          </Link>
        </div>

      </div>
    </header>
  )
}
