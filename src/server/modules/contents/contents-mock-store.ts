import type {
  ContentRow,
  CreateContentIn,
  UpdateContentIn,
} from './contents-schema'
import type { CreateIntent } from './contents-state-machine'
import { STATUS_FOR_INTENT } from './contents-state-machine'

let nextId = 1
const store: ContentRow[] = []

export async function createContent(
  input: CreateContentIn,
  intent: CreateIntent,
): Promise<ContentRow> {
  const now = new Date().toISOString()
  const row: ContentRow = {
    id: nextId++,
    user_id: 'mock-user',
    caption: input.caption ?? null,
    platforms: input.platforms,
    product_id: input.product_id ?? null,
    media_urls: input.media_urls ?? [],
    scheduled_at: input.scheduled_at ?? now,
    scheduling_mode: input.scheduling_mode ?? 'custom_time',
    status: STATUS_FOR_INTENT[intent],
    created_at: now,
    updated_at: now,
  }
  store.push(row)
  return row
}

export async function updateContent(
  input: UpdateContentIn,
): Promise<ContentRow> {
  const idx = store.findIndex((r) => r.id === input.id)
  const existing = idx >= 0 ? store[idx] : undefined
  if (!existing) throw new Error(`Content ${input.id} not found`)

  const updated: ContentRow = {
    ...existing,
    ...(input.caption !== undefined && { caption: input.caption ?? null }),
    ...(input.platforms && { platforms: input.platforms }),
    ...(input.product_id !== undefined && {
      product_id: input.product_id ?? null,
    }),
    ...(input.media_urls && { media_urls: input.media_urls }),
    ...(input.scheduling_mode && { scheduling_mode: input.scheduling_mode }),
    ...(input.scheduled_at && { scheduled_at: input.scheduled_at }),
    ...(input.status && { status: input.status }),
    updated_at: new Date().toISOString(),
  }
  store[idx] = updated
  return updated
}

export function getAllContents(): ContentRow[] {
  return [...store]
}

export function getContentById(id: number): ContentRow | undefined {
  return store.find((r) => r.id === id)
}
