import { describe, expect, it } from "vitest"
import { parseAndNormalizeUrl } from "@/src/audit/validate-url"

describe("parseAndNormalizeUrl", () => {
  it("normalizes valid http/https URLs", () => {
    expect(parseAndNormalizeUrl(" HTTPS://EXAMPLE.COM/path ")).toBe(
      "https://example.com/path"
    )
    expect(parseAndNormalizeUrl("https://example.com/")).toBe(
      "https://example.com"
    )
  })

  it("rejects empty or malformed URLs", () => {
    expect(() => parseAndNormalizeUrl("   ")).toThrow(
      "Please provide a URL to audit."
    )
    expect(() => parseAndNormalizeUrl("not-a-url")).toThrow(
      "Please enter a valid URL."
    )
  })

  it("rejects unsupported protocols", () => {
    expect(() => parseAndNormalizeUrl("ftp://example.com")).toThrow(
      "Only http and https URLs are supported."
    )
  })
})
