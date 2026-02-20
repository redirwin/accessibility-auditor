import { isIP } from "node:net"

function parseIpv4(hostname: string): number | null {
  const parts = hostname.split(".")
  if (parts.length !== 4) return null

  const octets = parts.map((part) => Number(part))
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return null
  }

  return (
    (octets[0] << 24) |
    (octets[1] << 16) |
    (octets[2] << 8) |
    octets[3]
  ) >>> 0
}

function isIpv4InCidr(ip: number, base: number, prefixBits: number): boolean {
  const mask = prefixBits === 0 ? 0 : (~((1 << (32 - prefixBits)) - 1) >>> 0)
  return (ip & mask) === (base & mask)
}

function isBlockedLocalhostHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase()
  return normalized === "localhost" || normalized.endsWith(".localhost")
}

function isBlockedLiteralIpv4(hostname: string): boolean {
  const parsed = parseIpv4(hostname)
  if (parsed === null) return false

  const blockedRanges: Array<{ base: string; prefix: number }> = [
    { base: "127.0.0.0", prefix: 8 },
    { base: "10.0.0.0", prefix: 8 },
    { base: "172.16.0.0", prefix: 12 },
    { base: "192.168.0.0", prefix: 16 },
    { base: "169.254.0.0", prefix: 16 },
  ]

  return blockedRanges.some((range) => {
    const baseIp = parseIpv4(range.base)
    if (baseIp === null) return false
    return isIpv4InCidr(parsed, baseIp, range.prefix)
  })
}

function isBlockedLiteralIpv6(hostname: string): boolean {
  const normalized = hostname.toLowerCase()
  if (isIP(normalized) !== 6) return false

  return (
    normalized === "::1" ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  )
}

export function isBlockedTargetHost(hostname: string): boolean {
  return (
    isBlockedLocalhostHost(hostname) ||
    isBlockedLiteralIpv4(hostname) ||
    isBlockedLiteralIpv6(hostname)
  )
}
