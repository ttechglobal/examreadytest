import { createHash } from 'crypto'

// Produces a short, non-reversible device fingerprint.
// Used only for rate limiting and duplicate upvote prevention.
// Not stored alongside any personal data.
export function getDeviceHash(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const ua = request.headers.get('user-agent') ?? 'unknown'
  return createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 16)
}
