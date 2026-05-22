import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { verifyAccessToken } from '@/server/lib/auth-context'
import { metaConnectionsService } from './meta-connections-services'
import {
  authedInputSchema,
  callbackInputSchema,
  connectionIdInputSchema,
  type CallbackPendingResult,
  type MetaConnectionView,
} from './meta-connections-schema'

const STATE_COOKIE = 'meta_oauth_state'
const STATE_MAX_AGE_SEC = 600

export const getMetaAuthUrl = createServerFn({ method: 'POST' })
  .inputValidator(authedInputSchema)
  .handler(async ({ data }): Promise<{ url: string }> => {
    await verifyAccessToken(data.accessToken)
    const state = metaConnectionsService.generateState()
    setCookie(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: STATE_MAX_AGE_SEC,
    })
    return { url: metaConnectionsService.buildAuthUrl(state) }
  })

export const handleMetaCallback = createServerFn({ method: 'POST' })
  .inputValidator(callbackInputSchema)
  .handler(async ({ data }): Promise<CallbackPendingResult> => {
    const user = await verifyAccessToken(data.accessToken)
    const expected = getCookie(STATE_COOKIE)
    if (!expected || expected !== data.state) {
      throw new Error('State mismatch atau cookie kedaluwarsa. Mulai connect ulang dari /integrations.')
    }
    setCookie(STATE_COOKIE, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    })
    const pending = await metaConnectionsService.processCallback(user.id, data.code)
    return { pendingConnections: pending }
  })

export const activateMetaConnection = createServerFn({ method: 'POST' })
  .inputValidator(connectionIdInputSchema)
  .handler(async ({ data }): Promise<MetaConnectionView> => {
    await verifyAccessToken(data.accessToken)
    return await metaConnectionsService.activate(data.connectionId)
  })

export const listMetaConnections = createServerFn({ method: 'POST' })
  .inputValidator(authedInputSchema)
  .handler(async ({ data }): Promise<MetaConnectionView[]> => {
    await verifyAccessToken(data.accessToken)
    return await metaConnectionsService.listConnections()
  })

export const disconnectMetaConnection = createServerFn({ method: 'POST' })
  .inputValidator(connectionIdInputSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await verifyAccessToken(data.accessToken)
    await metaConnectionsService.disconnect(data.connectionId)
    return { ok: true }
  })
