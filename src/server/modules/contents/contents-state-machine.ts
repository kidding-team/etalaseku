import type { Status } from './contents-schema'

// Transisi yang diizinkan, sesuai diagram state machine R10.
export const ALLOWED_TRANSITIONS: ReadonlyArray<readonly [Status, Status]> = [
  ['draft', 'waiting_approval'],
  ['waiting_approval', 'approved'],
  ['waiting_approval', 'draft'], // reject
  ['approved', 'scheduled'],
  ['scheduled', 'published'],
] as const

export function isAllowedTransition(current: Status, next: Status): boolean {
  if (current === next) return true
  return ALLOWED_TRANSITIONS.some(([a, b]) => a === current && b === next)
}

export function assertValidTransition(current: Status, next: Status): void {
  if (!isAllowedTransition(current, next)) {
    throw new Error('Transisi status tidak valid')
  }
}

// Intent (tombol di FormKonten) → status awal saat create.
export const STATUS_FOR_INTENT = {
  schedulePost: 'scheduled',
  submitForApproval: 'waiting_approval',
  saveAsDraft: 'draft',
} as const satisfies Record<string, Status>

export type CreateIntent = keyof typeof STATUS_FOR_INTENT
