/**
 * Cookie-based persistence untuk koneksi Meta. Pengganti DB untuk dev lokal.
 *
 * Cookie:
 *   meta_active  — koneksi yang sudah diaktivasi (1 page aktif)
 *   meta_pending — daftar pages dari /me/accounts saat callback, untuk picker
 *
 * Semua HttpOnly + SameSite=Lax. Payload (JSON) dienkripsi pakai
 * AES-256-GCM lewat META_TOKEN_ENCRYPTION_KEY agar Page Access Token
 * tidak tersimpan plain di cookie store browser.
 */

import { setCookie, getCookie } from '@tanstack/react-start/server'
import { encryptToken, decryptToken } from './token-crypto'

const ACTIVE_COOKIE = 'meta_active_v1'
const PENDING_COOKIE = 'meta_pending_v1'
const ACTIVE_MAX_AGE_SEC = 30 * 24 * 3600 // 30 hari
const PENDING_MAX_AGE_SEC = 10 * 60 // 10 menit

export interface ConnectionData {
  page_id: string
  page_name: string
  page_access_token: string
  ig_business_account_id: string | null
  ig_username: string | null
  scopes: string[]
  connected_at: string
}

function packEncrypted(plaintext: string): string {
  const { ciphertext, iv, tag } = encryptToken(plaintext)
  return `${iv}.${tag}.${ciphertext}`
}

function unpackEncrypted(packed: string): string {
  const parts = packed.split('.')
  if (parts.length !== 3) throw new Error('Invalid encrypted cookie format')
  return decryptToken({ iv: parts[0], tag: parts[1], ciphertext: parts[2] })
}

function baseOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
}

export function setActiveConnection(data: ConnectionData): void {
  setCookie(ACTIVE_COOKIE, packEncrypted(JSON.stringify(data)), {
    ...baseOptions(),
    maxAge: ACTIVE_MAX_AGE_SEC,
  })
}

export function getActiveConnection(): ConnectionData | null {
  const raw = getCookie(ACTIVE_COOKIE)
  if (!raw) return null
  try {
    return JSON.parse(unpackEncrypted(raw)) as ConnectionData
  } catch {
    return null
  }
}

export function clearActiveConnection(): void {
  setCookie(ACTIVE_COOKIE, '', { ...baseOptions(), maxAge: 0 })
}

export function setPendingPages(pages: ConnectionData[]): void {
  setCookie(PENDING_COOKIE, packEncrypted(JSON.stringify(pages)), {
    ...baseOptions(),
    maxAge: PENDING_MAX_AGE_SEC,
  })
}

export function getPendingPages(): ConnectionData[] | null {
  const raw = getCookie(PENDING_COOKIE)
  if (!raw) return null
  try {
    return JSON.parse(unpackEncrypted(raw)) as ConnectionData[]
  } catch {
    return null
  }
}

export function clearPendingPages(): void {
  setCookie(PENDING_COOKIE, '', { ...baseOptions(), maxAge: 0 })
}
