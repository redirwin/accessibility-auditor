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

  it("returns structured examples with capped length and full exampleCount", async () => {
    const repeatedImages = new Array(7).fill('<img src="/x.png">').join("")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          `
          <html lang="en">
            <head><title>Example</title></head>
            <body>
              ${repeatedImages}
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
    const imgAlt = body.checks.find((check: { id: string }) => check.id === "img-alt")

    expect(response.status).toBe(200)
    expect(imgAlt.count).toBe(7)
    expect(imgAlt.details.exampleCount).toBe(7)
    expect(imgAlt.details.examples.length).toBeLessThanOrEqual(5)
    expect(imgAlt.details.examples[0]).toHaveProperty("selector")
    expect(imgAlt.details.examples[0]).toHaveProperty("snippet")
  })

  it("produces stable examples for repeated identical requests", async () => {
    const html = `
      <html lang="en">
        <head><title>Stable</title></head>
        <body>
          <button class="icon-btn"><svg></svg></button>
          <button class="icon-btn"><svg></svg></button>
        </body>
      </html>
    `

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Response(html, {
            status: 200,
            headers: { "content-type": "text/html" },
          })
      )
    )

    const reqA = new Request("http://localhost:3000/api/audit", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
      headers: { "content-type": "application/json" },
    })
    const reqB = new Request("http://localhost:3000/api/audit", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
      headers: { "content-type": "application/json" },
    })

    const responseA = await POST(reqA)
    const responseB = await POST(reqB)
    const bodyA = await responseA.json()
    const bodyB = await responseB.json()
    const btnA = bodyA.checks.find((check: { id: string }) => check.id === "btn-label")
    const btnB = bodyB.checks.find((check: { id: string }) => check.id === "btn-label")

    expect(btnA.details.examples).toEqual(btnB.details.examples)
    expect(btnA.details.exampleCount).toBe(btnB.details.exampleCount)
  })
})
