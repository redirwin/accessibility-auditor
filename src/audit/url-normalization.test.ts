import { describe, expect, it } from "vitest"
import { normalizeUrlForStorage } from "@/src/audit/url-normalization"

describe("normalizeUrlForStorage", () => {
  it("lowercases protocol and host while preserving path/query", () => {
    const parsed = new URL("HTTPS://EXAMPLE.COM/path?q=1")
    expect(normalizeUrlForStorage(parsed)).toBe("https://example.com/path?q=1")
  })

  it("removes trailing slash only for base-path URLs", () => {
    expect(normalizeUrlForStorage(new URL("https://example.com/"))).toBe(
      "https://example.com"
    )
    expect(normalizeUrlForStorage(new URL("https://example.com/path/"))).toBe(
      "https://example.com/path/"
    )
  })
})
