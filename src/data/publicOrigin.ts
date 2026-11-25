export function approvedPublicOrigin(value: string | undefined) {
  if (!value) return undefined
  try {
    const candidate = new URL(value)
    if (/^https?:$/.test(candidate.protocol) && !candidate.username && !candidate.password) return candidate.origin
  } catch {
    return undefined
  }
}
