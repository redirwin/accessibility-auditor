export function parseAndNormalizeUrl(input: string): string {
  const trimmed = input.trim()

  if (!trimmed) {
    throw new Error("Please provide a URL to audit.")
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error("Please enter a valid URL.")
  }

  const protocol = parsed.protocol.toLowerCase()
  if (protocol !== "http:" && protocol !== "https:") {
    throw new Error("Only http and https URLs are supported.")
  }

  // Keep normalization deterministic while preserving user intent.
  parsed.protocol = protocol
  parsed.hostname = parsed.hostname.toLowerCase()

  return parsed.toString()
}
