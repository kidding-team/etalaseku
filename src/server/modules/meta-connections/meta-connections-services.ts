import { randomBytes } from 'node:crypto'
import {
  setActiveConnection,
  getActiveConnection,
  clearActiveConnection,
  setPendingPages,
  getPendingPages,
  clearPendingPages,
  type ConnectionData,
} from '@/server/lib/connection-cookie'
import type {
  MetaConnectionStatus,
  MetaConnectionView,
} from './meta-connections-schema'

const GRAPH_VERSION = 'v25.0'
const OAUTH_DIALOG_BASE = `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`

const FBLFB_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
]

interface MetaConfig {
  appId: string
  appSecret: string
  configId: string
  redirectUri: string
}

function readConfig(): MetaConfig {
  const entries = {
    META_APP_ID: process.env.META_APP_ID,
    META_APP_SECRET: process.env.META_APP_SECRET,
    META_CONFIG_ID: process.env.META_CONFIG_ID,
    META_REDIRECT_URI: process.env.META_REDIRECT_URI,
  }
  const missing = Object.entries(entries)
    .filter(([, v]) => !v || v.trim() === '')
    .map(([k]) => k)
  if (missing.length > 0) {
    throw new Error(`Missing Meta env vars: ${missing.join(', ')}.`)
  }
  return {
    appId: entries.META_APP_ID!,
    appSecret: entries.META_APP_SECRET!,
    configId: entries.META_CONFIG_ID!,
    redirectUri: entries.META_REDIRECT_URI!,
  }
}

interface RawPage {
  id: string
  name: string
  access_token: string
  instagram_business_account?: { id: string; username?: string }
}

function dataToView(d: ConnectionData, status: MetaConnectionStatus): MetaConnectionView {
  return {
    id: d.page_id, // pakai page_id sebagai id karena tidak ada DB row
    provider: 'meta_business',
    page_id: d.page_id,
    page_name: d.page_name,
    ig_business_account_id: d.ig_business_account_id,
    ig_username: d.ig_username,
    scopes: d.scopes,
    status,
    connected_at: d.connected_at,
    last_verified_at: null,
  }
}

export const metaConnectionsService = {
  generateState(): string {
    return randomBytes(16).toString('hex')
  },

  buildAuthUrl(state: string): string {
    const c = readConfig()
    const params = new URLSearchParams({
      client_id: c.appId,
      config_id: c.configId,
      redirect_uri: c.redirectUri,
      state,
      response_type: 'code',
    })
    return `${OAUTH_DIALOG_BASE}?${params.toString()}`
  },

  async exchangeCodeForUserToken(code: string): Promise<{ accessToken: string }> {
    const c = readConfig()
    const params = new URLSearchParams({
      client_id: c.appId,
      client_secret: c.appSecret,
      redirect_uri: c.redirectUri,
      code,
    })
    const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`)
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Token exchange gagal (${res.status}): ${body}`)
    }
    const json = (await res.json()) as { access_token: string }
    return { accessToken: json.access_token }
  },

  async fetchPagesWithTokens(userAccessToken: string): Promise<RawPage[]> {
    const params = new URLSearchParams({
      fields: 'id,name,access_token,instagram_business_account{id,username}',
      access_token: userAccessToken,
    })
    const res = await fetch(`${GRAPH_BASE}/me/accounts?${params.toString()}`)
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Fetch /me/accounts gagal (${res.status}): ${body}`)
    }
    const json = (await res.json()) as { data?: RawPage[] }
    return json.data ?? []
  },

  async processCallback(userId: string, code: string): Promise<MetaConnectionView[]> {
    console.log(`[meta-connect] user=${userId} exchange code (len=${code.length})`)
    const { accessToken: userToken } = await this.exchangeCodeForUserToken(code)
    console.log(`[meta-connect] user=${userId} got user_access_token len=${userToken.length}`)
    const pages = await this.fetchPagesWithTokens(userToken)
    console.log(
      `[meta-connect] user=${userId} pages fetched=${pages.length}:`,
      pages.map((p) => ({
        id: p.id,
        name: p.name,
        ig: p.instagram_business_account
          ? { id: p.instagram_business_account.id, username: p.instagram_business_account.username }
          : null,
        page_token_len: p.access_token?.length ?? 0,
      })),
    )
    if (pages.length === 0) {
      throw new Error('Tidak ada Facebook Page yang ter-grant. Pilih minimal satu Page saat dialog OAuth.')
    }

    const now = new Date().toISOString()
    const pending: ConnectionData[] = pages.map((p) => ({
      page_id: p.id,
      page_name: p.name,
      page_access_token: p.access_token,
      ig_business_account_id: p.instagram_business_account?.id ?? null,
      ig_username: p.instagram_business_account?.username ?? null,
      scopes: FBLFB_SCOPES,
      connected_at: now,
    }))

    // Auto-activate kalau cuma 1 Page — skip picker.
    if (pending.length === 1) {
      setActiveConnection(pending[0])
      clearPendingPages()
      console.log(`[meta-connect] auto-activated single page=${pending[0].page_name}`)
      return [dataToView(pending[0], 'active')]
    }

    setPendingPages(pending)
    console.log(`[meta-connect] stored ${pending.length} pending pages in cookie (multi-page picker)`)
    return pending.map((p) => dataToView(p, 'pending'))
  },

  async activate(pageId: string): Promise<MetaConnectionView> {
    console.log(`[meta-connect] activate page_id=${pageId}`)
    const pending = getPendingPages()
    if (!pending) {
      throw new Error('Tidak ada pending pages di cookie (mungkin sudah kedaluwarsa). Mulai connect ulang.')
    }
    const chosen = pending.find((p) => p.page_id === pageId)
    if (!chosen) {
      throw new Error(`Page ${pageId} tidak ditemukan di pending. Mulai connect ulang.`)
    }
    setActiveConnection(chosen)
    clearPendingPages()
    console.log(`[meta-connect] activated page=${chosen.page_name} ig=${chosen.ig_username ?? '(none)'}`)
    return dataToView(chosen, 'active')
  },

  async listConnections(): Promise<MetaConnectionView[]> {
    const active = getActiveConnection()
    if (!active) return []
    return [dataToView(active, 'active')]
  },

  async disconnect(pageId: string): Promise<void> {
    const active = getActiveConnection()
    if (active && active.page_id === pageId) {
      clearActiveConnection()
      console.log(`[meta-connect] disconnected page=${active.page_name}`)
    }
  },
}
