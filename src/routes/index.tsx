import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <Header />
      <main className="container flex min-h-[60vh] flex-col items-center justify-center py-14 text-center">
        <Card className="w-full max-w-4xl">
          <CardContent className="space-y-6 p-10">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Welcome to Etalaseku
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground sm:text-lg">
              This is the public landing page. More content coming soon!
            </p>
            <Button asChild size="lg">
              <Link to="/login">Go to Login / Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}
