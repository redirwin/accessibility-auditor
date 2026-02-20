import { describe, expect, it } from "vitest"
import { computeAuditSummary } from "@/src/audit/score-summary"

describe("computeAuditSummary", () => {
  it("computes score and counts from check statuses", () => {
    const summary = computeAuditSummary([
      { id: "1", title: "A", status: "pass", hint: "ok" },
      { id: "2", title: "B", status: "warn", hint: "warn" },
      { id: "3", title: "C", status: "fail", hint: "fail" },
    ])

    expect(summary).toEqual({
      score: 85,
      passes: 1,
      warnings: 1,
      fails: 1,
    })
  })

  it("clamps score at zero", () => {
    const summary = computeAuditSummary(
      Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        title: "F",
        status: "fail" as const,
        hint: "fail",
      }))
    )

    expect(summary.score).toBe(0)
    expect(summary.fails).toBe(20)
  })
})
