import { afterEach, describe, expect, it, vi } from "vitest"
import { POST } from "@/app/api/audit/route"

describe("POST /api/audit", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns success payload for a valid public URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          `
          <html lang="en">
            <head>
              <title>Example</title>
              <meta name="viewport" content="width=device-width">
            </head>
            <body>
              <h1>Example</h1>
              <a href="/about">About page</a>
            </body>
          </html>
          `,
          {
            status: 200,
            headers: { "content-type": "text/html" },
          }
        )
      )
    )

    const req = new Request("http://localhost:3000/api/audit", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveProperty("summary.score")
    expect(body).toHaveProperty("checks")
    expect(body.checks).toHaveLength(10)
  })

  it("returns validation error for invalid URL", async () => {
    const req = new Request("http://localhost:3000/api/audit", {
      method: "POST",
      body: JSON.stringify({ url: "not-a-url" }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe("VALIDATION_ERROR")
  })

  it("returns blocked error for localhost target", async () => {
    const req = new Request("http://localhost:3000/api/audit", {
      method: "POST",
      body: JSON.stringify({ url: "http://127.0.0.1" }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe("URL_BLOCKED")
  })
})
