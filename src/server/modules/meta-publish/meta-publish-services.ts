import { randomBytes } from 'node:crypto'
import { getActiveConnection } from '@/server/lib/connection-cookie'
import type { PerPlatformResult, PublishNowInput } from './meta-publish-schema'

const GRAPH_VERSION = 'v25.0'
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`

/**
 * Meta wajib URL publik. Kalau URL relative (`/uploads/...`), prefix dengan
 * PUBLIC_BASE_URL (mis. ngrok / cloudflared tunnel) agar Meta bisa fetch.
 */
function normalizeMediaUrl(u: string): string {
  if (/^https?:\/\//i.test(u)) return u
  const base = process.env.PUBLIC_BASE_URL
  if (!base) {
    throw new Error(
      `URL media "${u}" tidak punya host publik. Set PUBLIC_BASE_URL di .env (mis. https://abc.ngrok-free.app) untuk auto-prefix relative path.`,
    )
  }
  return `${base.replace(/\/$/, '')}/${u.replace(/^\//, '')}`
}

function normalizeMediaUrls(urls: string[]): string[] {
  return urls.map(normalizeMediaUrl)
}

interface ActiveConnection {
  pageId: string
  pageAccessToken: string
  igBusinessAccountId: string | null
  igUsername: string | null
}

interface AdapterResult {
  ok: boolean
  externalPostId: string | null
  errorMessage: string | null
}

async function postJson<T>(
  url: string,
  body: unknown,
): Promise<{ ok: boolean; status: number; json: T | null; text: string }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json: T | null = null
  try {
    json = JSON.parse(text) as T
  } catch {
    json = null
  }
  return { ok: res.ok, status: res.status, json, text }
}

async function getJson<T>(
  url: string,
): Promise<{ ok: boolean; status: number; json: T | null; text: string }> {
  const res = await fetch(url)
  const text = await res.text()
  let json: T | null = null
  try {
    json = JSON.parse(text) as T
  } catch {
    json = null
  }
  return { ok: res.ok, status: res.status, json, text }
}

async function publishToFacebookPage(
  conn: ActiveConnection,
  caption: string,
  mediaUrls: string[],
): Promise<AdapterResult> {
  try {
    if (mediaUrls.length === 0) {
      const { ok, status, json, text } = await postJson<{ id: string }>(
        `${GRAPH}/${conn.pageId}/feed`,
        { message: caption, access_token: conn.pageAccessToken },
      )
      if (!ok || !json) return { ok: false, externalPostId: null, errorMessage: `FB /feed ${status}: ${text}` }
      return { ok: true, externalPostId: json.id, errorMessage: null }
    }
    if (mediaUrls.length === 1) {
      const { ok, status, json, text } = await postJson<{ id?: string; post_id?: string }>(
        `${GRAPH}/${conn.pageId}/photos`,
        { url: mediaUrls[0], caption, published: true, access_token: conn.pageAccessToken },
      )
      if (!ok || !json) return { ok: false, externalPostId: null, errorMessage: `FB /photos ${status}: ${text}` }
      return { ok: true, externalPostId: json.post_id ?? json.id ?? null, errorMessage: null }
    }
    const photoIds: string[] = []
    for (const url of mediaUrls) {
      const { ok, status, json, text } = await postJson<{ id: string }>(
        `${GRAPH}/${conn.pageId}/photos`,
        { url, published: false, access_token: conn.pageAccessToken },
      )
      if (!ok || !json) return { ok: false, externalPostId: null, errorMessage: `FB upload ${status}: ${text}` }
      photoIds.push(json.id)
    }
    const { ok, status, json, text } = await postJson<{ id: string }>(
      `${GRAPH}/${conn.pageId}/feed`,
      {
        message: caption,
        attached_media: photoIds.map((id) => ({ media_fbid: id })),
        access_token: conn.pageAccessToken,
      },
    )
    if (!ok || !json) return { ok: false, externalPostId: null, errorMessage: `FB /feed multi ${status}: ${text}` }
    return { ok: true, externalPostId: json.id, errorMessage: null }
  } catch (err) {
    return { ok: false, externalPostId: null, errorMessage: err instanceof Error ? err.message : String(err) }
  }
}

async function waitIgContainer(containerId: string, token: string): Promise<{ ok: boolean; status: string }> {
  for (let i = 0; i < 10; i++) {
    const { json } = await getJson<{ status_code: string }>(
      `${GRAPH}/${containerId}?fields=status_code&access_token=${encodeURIComponent(token)}`,
    )
    const code = json?.status_code ?? 'UNKNOWN'
    if (code === 'FINISHED') return { ok: true, status: code }
    if (code === 'ERROR' || code === 'EXPIRED') return { ok: false, status: code }
    await new Promise((r) => setTimeout(r, 3000))
  }
  return { ok: false, status: 'TIMEOUT' }
}

async function publishToInstagram(
  conn: ActiveConnection,
  caption: string,
  mediaUrls: string[],
): Promise<AdapterResult> {
  if (!conn.igBusinessAccountId) {
    return { ok: false, externalPostId: null, errorMessage: 'IG Business Account belum ter-link ke Page.' }
  }
  if (mediaUrls.length === 0) {
    return { ok: false, externalPostId: null, errorMessage: 'IG butuh minimal 1 image URL publik.' }
  }
  const igId = conn.igBusinessAccountId
  try {
    if (mediaUrls.length === 1) {
      const create = await postJson<{ id: string }>(`${GRAPH}/${igId}/media`, {
        image_url: mediaUrls[0],
        caption,
        access_token: conn.pageAccessToken,
      })
      if (!create.ok || !create.json) {
        return { ok: false, externalPostId: null, errorMessage: `IG /media ${create.status}: ${create.text}` }
      }
      const containerId = create.json.id
      const wait = await waitIgContainer(containerId, conn.pageAccessToken)
      if (!wait.ok) return { ok: false, externalPostId: null, errorMessage: `IG container: ${wait.status}` }
      const pub = await postJson<{ id: string }>(`${GRAPH}/${igId}/media_publish`, {
        creation_id: containerId,
        access_token: conn.pageAccessToken,
      })
      if (!pub.ok || !pub.json) {
        return { ok: false, externalPostId: null, errorMessage: `IG /media_publish ${pub.status}: ${pub.text}` }
      }
      return { ok: true, externalPostId: pub.json.id, errorMessage: null }
    }
    const childIds: string[] = []
    for (const url of mediaUrls) {
      const r = await postJson<{ id: string }>(`${GRAPH}/${igId}/media`, {
        image_url: url,
        is_carousel_item: true,
        access_token: conn.pageAccessToken,
      })
      if (!r.ok || !r.json) return { ok: false, externalPostId: null, errorMessage: `IG child ${r.status}: ${r.text}` }
      const wait = await waitIgContainer(r.json.id, conn.pageAccessToken)
      if (!wait.ok) return { ok: false, externalPostId: null, errorMessage: `IG child container: ${wait.status}` }
      childIds.push(r.json.id)
    }
    const parent = await postJson<{ id: string }>(`${GRAPH}/${igId}/media`, {
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption,
      access_token: conn.pageAccessToken,
    })
    if (!parent.ok || !parent.json) {
      return { ok: false, externalPostId: null, errorMessage: `IG parent ${parent.status}: ${parent.text}` }
    }
    const waitP = await waitIgContainer(parent.json.id, conn.pageAccessToken)
    if (!waitP.ok) return { ok: false, externalPostId: null, errorMessage: `IG parent container: ${waitP.status}` }
    const pub = await postJson<{ id: string }>(`${GRAPH}/${igId}/media_publish`, {
      creation_id: parent.json.id,
      access_token: conn.pageAccessToken,
    })
    if (!pub.ok || !pub.json) {
      return { ok: false, externalPostId: null, errorMessage: `IG carousel publish ${pub.status}: ${pub.text}` }
    }
    return { ok: true, externalPostId: pub.json.id, errorMessage: null }
  } catch (err) {
    return { ok: false, externalPostId: null, errorMessage: err instanceof Error ? err.message : String(err) }
  }
}

function getActiveConn(): ActiveConnection {
  const data = getActiveConnection()
  if (!data) throw new Error('Tidak ada koneksi Meta aktif. Hubungkan dulu di /integrations.')
  return {
    pageId: data.page_id,
    pageAccessToken: data.page_access_token,
    igBusinessAccountId: data.ig_business_account_id,
    igUsername: data.ig_username,
  }
}

export const metaPublishService = {
  async publishNow(userId: string, input: PublishNowInput): Promise<PerPlatformResult[]> {
    console.log(
      `[meta-publish] user=${userId} platforms=${input.platforms.join(',')} media=${input.mediaUrls.length} caption_len=${input.caption.length}`,
    )
    const conn = getActiveConn()
    console.log(
      `[meta-publish] using page_id=${conn.pageId} ig=${conn.igBusinessAccountId ?? '(none)'}`,
    )

    let normalizedMedia: string[]
    try {
      normalizedMedia = normalizeMediaUrls(input.mediaUrls)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`[meta-publish] media normalization failed: ${msg}`)
      return input.platforms.map((platform) => ({
        platform,
        status: 'failed' as const,
        externalPostId: null,
        errorMessage: msg,
        attemptId: randomBytes(8).toString('hex'),
      }))
    }
    if (normalizedMedia.some((u, i) => u !== input.mediaUrls[i])) {
      console.log(`[meta-publish] media normalized via PUBLIC_BASE_URL:`, normalizedMedia)
    }

    const results: PerPlatformResult[] = []
    for (const platform of input.platforms) {
      const attemptId = randomBytes(8).toString('hex')
      console.log(`[meta-publish] attempt=${attemptId} platform=${platform} → Graph API`)
      const adapter =
        platform === 'facebook_page'
          ? await publishToFacebookPage(conn, input.caption, normalizedMedia)
          : await publishToInstagram(conn, input.caption, normalizedMedia)
      const finalStatus = adapter.ok ? 'published' : 'failed'
      console.log(
        `[meta-publish] attempt=${attemptId} platform=${platform} status=${finalStatus} post_id=${adapter.externalPostId ?? '-'} err=${adapter.errorMessage ?? '-'}`,
      )
      results.push({
        platform,
        status: finalStatus,
        externalPostId: adapter.externalPostId,
        errorMessage: adapter.errorMessage,
        attemptId,
      })
    }
    return results
  },
}
