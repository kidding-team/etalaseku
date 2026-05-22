import { z } from 'zod'

export const metaConnectionStatusEnum = z.enum([
  'pending',
  'active',
  'disconnected',
  'expired',
])
export type MetaConnectionStatus = z.infer<typeof metaConnectionStatusEnum>

export interface MetaConnectionView {
  id: string
  provider: string
  page_id: string
  page_name: string
  ig_business_account_id: string | null
  ig_username: string | null
  scopes: string[]
  status: MetaConnectionStatus
  connected_at: string
  last_verified_at: string | null
}

export const authedInputSchema = z.object({
  accessToken: z.string().min(1),
})

export const callbackInputSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
  accessToken: z.string().min(1),
})

// connectionId = page_id (string FB), bukan UUID lagi
export const connectionIdInputSchema = z.object({
  connectionId: z.string().min(1),
  accessToken: z.string().min(1),
})

export interface CallbackPendingResult {
  pendingConnections: MetaConnectionView[]
}
