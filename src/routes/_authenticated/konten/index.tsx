import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { KontenPage } from '@/components/konten/KontenPage'
import { kontenSearchSchema } from '@/server/modules/contents/contents-schema'

export const Route = createFileRoute('/_authenticated/konten/')({
  validateSearch: kontenSearchSchema,
  head: () => ({
    meta: [{ title: 'Manajemen Konten | Etalaseku' }],
  }),
  component: KontenIndexRouteComponent,
})

function KontenIndexRouteComponent() {
  const search = Route.useSearch() as z.infer<typeof kontenSearchSchema>
  // Backward compat: kalau hanya ada `weekStart`, treat sebagai date+week.
  const dateIso = search.date ?? search.weekStart
  return (
    <KontenPage
      view={search.view}
      dateIso={dateIso}
      platforms={search.platforms}
      status={search.status}
    />
  )
}
