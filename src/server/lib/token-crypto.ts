import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGO = 'aes-256-gcm'
const IV_BYTES = 12
const TAG_BYTES = 16
const KEY_BYTES = 32

function readKey(): Buffer {
  const hex = process.env.META_TOKEN_ENCRYPTION_KEY
  if (!hex || hex.trim() === '') {
    throw new Error(
      'META_TOKEN_ENCRYPTION_KEY belum diset. Generate: `openssl rand -hex 32`',
    )
  }
  const buf = Buffer.from(hex, 'hex')
  if (buf.length !== KEY_BYTES) {
    throw new Error(`META_TOKEN_ENCRYPTION_KEY harus 32 byte (64 hex). Sekarang ${buf.length}.`)
  }
  return buf
}

export interface EncryptedToken {
  ciphertext: string
  iv: string
  tag: string
}

export function encryptToken(plaintext: string): EncryptedToken {
  const key = readKey()
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGO, key, iv)
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    ciphertext: ct.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  }
}

export function decryptToken(enc: EncryptedToken): string {
  const key = readKey()
  const iv = Buffer.from(enc.iv, 'base64')
  const tag = Buffer.from(enc.tag, 'base64')
  const ct = Buffer.from(enc.ciphertext, 'base64')
  if (iv.length !== IV_BYTES) throw new Error('Invalid IV length')
  if (tag.length !== TAG_BYTES) throw new Error('Invalid auth tag length')
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8')
}
