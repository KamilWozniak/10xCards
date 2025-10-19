/**
 * Compute SHA-256 hash of a text string
 * Used for source text hashing in generation records
 * Uses Web Crypto API for Cloudflare Pages compatibility
 *
 * @param text - Text to hash
 * @returns SHA-256 hash as hexadecimal string
 */
export async function computeHash(text: string): Promise<string> {
  // Use Web Crypto API which is available in Cloudflare Workers/Pages
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}
