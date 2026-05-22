import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <>
      <Header />
      <main className="container py-12">
        <Card>
          <CardHeader>
            <CardDescription>About</CardDescription>
            <CardTitle className="text-4xl">A small starter with room to grow.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-3xl text-muted-foreground leading-8">
              TanStack Start gives you type-safe routing, server functions, and
              modern SSR defaults. Use this as a clean foundation, then layer in
              your own routes, styling, and add-ons.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}
