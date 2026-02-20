import { describe, expect, it } from "vitest"
import { isBlockedTargetHost } from "@/src/audit/ssrf-guard"

describe("isBlockedTargetHost", () => {
  it("blocks localhost hostnames", () => {
    expect(isBlockedTargetHost("localhost")).toBe(true)
    expect(isBlockedTargetHost("api.localhost")).toBe(true)
  })

  it("blocks private/link-local loopback IPv4 and IPv6 literals", () => {
    expect(isBlockedTargetHost("127.0.0.1")).toBe(true)
    expect(isBlockedTargetHost("10.1.2.3")).toBe(true)
    expect(isBlockedTargetHost("172.16.5.1")).toBe(true)
    expect(isBlockedTargetHost("192.168.1.2")).toBe(true)
    expect(isBlockedTargetHost("169.254.1.1")).toBe(true)
    expect(isBlockedTargetHost("::1")).toBe(true)
  })

  it("allows public hosts", () => {
    expect(isBlockedTargetHost("example.com")).toBe(false)
    expect(isBlockedTargetHost("8.8.8.8")).toBe(false)
  })
})
