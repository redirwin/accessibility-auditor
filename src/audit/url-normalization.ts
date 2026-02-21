export function normalizeUrlForStorage(parsedUrl: URL): string {
  const normalized = new URL(parsedUrl.toString())
  normalized.protocol = normalized.protocol.toLowerCase()
  normalized.hostname = normalized.hostname.toLowerCase()

  if (
    normalized.pathname === "/" &&
    normalized.search.length === 0 &&
    normalized.hash.length === 0
  ) {
    return `${normalized.protocol}//${normalized.host}`
  }

  return normalized.toString()
}
