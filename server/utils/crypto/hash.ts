import crypto from 'crypto'

/**
 * Compute MD5 hash of a text string
 * Used for source text hashing in generation records
 *
 * @param text - Text to hash
 * @returns MD5 hash as hexadecimal string
 */
export function computeHash(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex')
}
