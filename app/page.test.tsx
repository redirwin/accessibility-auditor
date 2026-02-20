import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import Home from "@/app/page"

function successPayload() {
  return {
    url: "https://example.com",
    summary: { score: 95, passes: 9, warnings: 1, fails: 0 },
    checks: [
      {
        id: "doc-lang",
        title: "Document language",
        status: "pass",
        hint: "ok",
      },
    ],
    meta: { fetchTimeMs: 42, htmlBytes: 512 },
  }
}

describe("Home page flow", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    cleanup()
  })

  it("transitions idle -> loading -> success", async () => {
    let resolveFetch: ((value: Response) => void) | null = null
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve
          })
      )
    )

    render(<Home />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/url to audit/i), "https://example.com")
    await user.click(screen.getByRole("button", { name: /^audit$/i }))

    expect(await screen.findByText(/auditing page/i)).toBeInTheDocument()

    resolveFetch?.(
      new Response(JSON.stringify(successPayload()), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    )

    await waitFor(() => {
      expect(screen.getByText("Checks")).toBeInTheDocument()
    })
  })

  it("transitions loading -> error on API failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { code: "VALIDATION_ERROR", message: "bad url" },
          }),
          {
            status: 400,
            headers: { "content-type": "application/json" },
          }
        )
      )
    )

    render(<Home />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/url to audit/i), "bad")
    await user.click(screen.getByRole("button", { name: /^audit$/i }))

    expect(await screen.findByText(/please enter a valid public http\/https url/i)).toBeInTheDocument()
  })

  it("resets back to idle", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(successPayload()), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      )
    )

    render(<Home />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/url to audit/i), "https://example.com")
    await user.click(screen.getByRole("button", { name: /^audit$/i }))
    await screen.findByText("Checks")

    await user.click(screen.getByRole("button", { name: /^reset$/i }))
    expect(await screen.findByText(/enter a url to run an audit/i)).toBeInTheDocument()
  })
})
