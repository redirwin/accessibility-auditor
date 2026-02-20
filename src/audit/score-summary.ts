import type { AuditCheck } from "@/src/audit/types"

const PENALTY_BY_STATUS = {
  pass: 0,
  warn: 5,
  fail: 10,
} as const

export function computeAuditSummary(checks: AuditCheck[]) {
  const passes = checks.filter((check) => check.status === "pass").length
  const warnings = checks.filter((check) => check.status === "warn").length
  const fails = checks.filter((check) => check.status === "fail").length

  const totalPenalty = checks.reduce((sum, check) => {
    return sum + PENALTY_BY_STATUS[check.status]
  }, 0)

  return {
    score: Math.max(0, 100 - totalPenalty),
    passes,
    warnings,
    fails,
  }
}
