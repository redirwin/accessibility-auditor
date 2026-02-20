export type AuditStatus = "pass" | "warn" | "fail"

export type AuditCheck = {
  id: string
  title: string
  status: AuditStatus
  hint: string
  count?: number
  details?: {
    summary?: string
    examples?: string[]
  }
}

export type AuditResponse = {
  url: string
  summary: {
    score: number
    passes: number
    warnings: number
    fails: number
  }
  checks: AuditCheck[]
  meta: {
    fetchTimeMs: number
    htmlBytes: number
  }
}
