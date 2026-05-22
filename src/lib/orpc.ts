import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import type { Router } from '../server/orpc'

const link = new RPCLink({
  url: 'http://localhost:5173/api/orpc',
})

export const orpcClient: RouterClient<Router> = createORPCClient(link)
