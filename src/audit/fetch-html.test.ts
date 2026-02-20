import { afterEach, describe, expect, it, vi } from "vitest"
import { fetchHtml, FetchHtmlError } from "@/src/audit/fetch-html"

describe("fetchHtml", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it("follows redirects and returns HTML payload", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { location: "/next" },
        })
      )
      .mockResolvedValueOnce(
        new Response("<html><title>ok</title></html>", {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        })
      )

    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchHtml("https://example.com")
    expect(result.finalUrl).toBe("https://example.com/next")
    expect(result.html).toContain("<title>ok</title>")
    expect(result.htmlBytes).toBeGreaterThan(0)
  })

  it("fails when response exceeds 2 MB", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("a".repeat(2 * 1024 * 1024 + 10), {
          status: 200,
          headers: { "content-type": "text/html" },
        })
      )
    )

    await expect(fetchHtml("https://example.com")).rejects.toMatchObject({
      code: "RESPONSE_TOO_LARGE",
    } satisfies Partial<FetchHtmlError>)
  })

  it("times out after 10 seconds", async () => {
    vi.useFakeTimers()

    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted")))
        })
      })
    )

    const pending = fetchHtml("https://example.com")
    const rejection = expect(pending).rejects.toMatchObject({
      code: "FETCH_TIMEOUT",
    } satisfies Partial<FetchHtmlError>)
    await vi.advanceTimersByTimeAsync(10_000)
    await rejection
  })
})
