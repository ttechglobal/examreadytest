/**
 * Password hashing using Node's built-in crypto (pbkdf2).
 * No external dependencies — works in Next.js 14 App Router without bundler issues.
 */
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto'

const ITERATIONS = 100000
const KEYLEN     = 64
const DIGEST     = 'sha512'

export function hashPassword(password) {
  const salt   = randomBytes(32).toString('hex')
  const hash   = pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  const [salt, storedHash] = stored.split(':')
  if (!salt || !storedHash) return false
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex')
  // Timing-safe comparison
  try {
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))
  } catch {
    return false
  }
}
