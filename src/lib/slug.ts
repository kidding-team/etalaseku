/** Konversi string apa pun ke slug URL-safe (lowercase, dash). */
export function slugify(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accent
    .replace(/[^\w\s-]/g, '') // remove non-word
    .replace(/\s+/g, '-') // spaces → dash
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-|-$/g, '') // trim leading/trailing dashes
}
