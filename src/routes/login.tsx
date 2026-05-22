import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { supabase } from '@/lib/supabase'
import { useAuthStatus } from '@/hooks/use-auth-status'

export const Route = createFileRoute('/login')({
  component: Login,
  head: () => ({ meta: [{ title: 'Masuk | Etalaseku' }] }),
})

function Login() {
  const navigate = useNavigate()
  const { status } = useAuthStatus()
  const [submitting, setSubmitting] = React.useState(false)

  // Sudah login → langsung ke dashboard
  React.useEffect(() => {
    if (status === 'authenticated') {
      void navigate({ to: '/dashboard', replace: true })
    }
  }, [status, navigate])

  const handleGoogleLogin = async () => {
    setSubmitting(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
    } catch {
      setSubmitting(false)
    }
  }

  // Tampilkan spinner full-page saat resolve session / sedang redirect
  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Subtle grid background — selaras dengan landing HeroSection */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
      />

      <div className="relative z-10 flex w-full max-w-[440px] flex-col gap-6">
        <Link
          to="/"
          className="inline-flex cursor-pointer items-center gap-1.5 self-start text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Kembali ke beranda
        </Link>

        <Card className="rounded-2xl border-border/60 shadow-xl">
          <CardContent className="flex flex-col gap-6 p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-serif text-3xl font-medium italic">
                EtalaseKu
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-center">
              <p className="text-sm text-muted-foreground">
                Masuk untuk mulai mengelola katalog produk dan jadwal kontenmu.
              </p>
            </div>

            <Button
              onClick={handleGoogleLogin}
              disabled={submitting}
              size="lg"
              variant="outline"
              className="w-full cursor-pointer rounded-full font-semibold"
            >
              {submitting ? (
                <Spinner className="size-4" />
              ) : (
                <GoogleIcon className="size-5" />
              )}
              Lanjut dengan Google
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Dengan masuk, kamu menyetujui{' '}
              <a
                href="#"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                kebijakan dan privasi
              </a>{' '}
              kami.
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Belum punya akun? Akun akan otomatis dibuat saat kamu masuk pertama
          kali.
        </p>
      </div>
    </main>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
