import { Button } from '#/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14 flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14 w-full max-w-4xl">
        <h1 className="display-title mb-5 text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Welcome to Hackaton
        </h1>
        <p className="mb-8 text-base text-[var(--sea-ink-soft)] sm:text-lg max-w-2xl mx-auto">
          This is the public landing page. More content coming soon!
        </p>
        <Button>Hello</Button>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-8 py-3 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            Go to Login / Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
