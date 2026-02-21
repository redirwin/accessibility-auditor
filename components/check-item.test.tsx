import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CheckItem } from "@/components/check-item"
import type { AuditCheck } from "@/src/audit/types"

function makeCheck(overrides: Partial<AuditCheck> = {}): AuditCheck {
  return {
    id: "img-alt",
    title: "Images missing alt text",
    status: "fail",
    hint: "2 images missing alt text",
    count: 2,
    details: {
      summary: "Image alternatives are required.",
      examples: [
        {
          selector: "img.hero",
          snippet: '<img class="hero" src="/hero.png">',
        },
      ],
      exampleCount: 2,
    },
    ...overrides,
  }
}

describe("CheckItem actionable examples", () => {
  beforeEach(() => {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    cleanup()
  })

  it("renders examples section and truncation text when capped", async () => {
    render(<CheckItem check={makeCheck()} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: /images missing alt text/i }))

    expect(screen.getByText("Problem Elements")).toBeInTheDocument()
    expect(screen.getByText("Showing 1 of 2")).toBeInTheDocument()
    expect(screen.getByText("img.hero")).toBeInTheDocument()
    expect(screen.getByText('<img class="hero" src="/hero.png">')).toBeInTheDocument()
  })

  it("hides examples section when no examples are present", async () => {
    render(
      <CheckItem
        check={makeCheck({
          details: {
            summary: "No issues found.",
          },
          status: "pass",
          count: undefined,
        })}
      />
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: /images missing alt text/i }))
    expect(screen.queryByText("Problem Elements")).not.toBeInTheDocument()
  })

  it("copies selector and snippet via dedicated buttons", async () => {
    render(<CheckItem check={makeCheck()} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: /images missing alt text/i }))
    const selectorButton = await screen.findByRole("button", { name: /copy selector example 1/i })
    const snippetButton = await screen.findByRole("button", { name: /copy snippet example 1/i })

    await user.click(selectorButton)
    await waitFor(() => {
      expect(selectorButton.querySelector(".lucide-check")).toBeTruthy()
    })

    await user.click(snippetButton)
    await waitFor(() => {
      expect(snippetButton.querySelector(".lucide-check")).toBeTruthy()
    })
  })
})
