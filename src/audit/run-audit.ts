import { load } from "cheerio"
import type { AuditResponse } from "@/src/audit/types"
import { runMvpRules } from "@/src/audit/rules"
import { computeAuditSummary } from "@/src/audit/score-summary"

type RunAuditInput = {
  url: string
  html: string
  fetchTimeMs: number
  htmlBytes: number
}

export async function runAudit(input: RunAuditInput): Promise<AuditResponse> {
  const $ = load(input.html)
  const checks = runMvpRules($)
  const summary = computeAuditSummary(checks)

  return {
    url: input.url,
    summary,
    checks,
    meta: {
      fetchTimeMs: input.fetchTimeMs,
      htmlBytes: input.htmlBytes,
    },
  }
}
