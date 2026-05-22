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
  return (
    <KontenPage
      weekStartIso={search.weekStart}
      platforms={search.platforms}
      status={search.status}
    />
  )
}
