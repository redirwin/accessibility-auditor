import { NextResponse } from "next/server"
import type { AuditResponse } from "@/src/audit/types"
import { parseAndNormalizeUrl } from "@/src/audit/validate-url"
import { isBlockedTargetHost } from "@/src/audit/ssrf-guard"
import { fetchHtml, FetchHtmlError } from "@/src/audit/fetch-html"
import { runAudit } from "@/src/audit/run-audit"

export const runtime = "nodejs"

type ErrorCode =
  | "VALIDATION_ERROR"
  | "URL_BLOCKED"
  | "FETCH_TIMEOUT"
  | "RESPONSE_TOO_LARGE"
  | "UPSTREAM_FETCH_FAILED"
  | "HTML_PARSE_FAILED"
  | "INTERNAL_ERROR"

class AuditApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly status: number,
    message: string
  ) {
    super(message)
  }
}

const errorStatusByCode: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  URL_BLOCKED: 400,
  FETCH_TIMEOUT: 504,
  RESPONSE_TOO_LARGE: 413,
  UPSTREAM_FETCH_FAILED: 502,
  HTML_PARSE_FAILED: 502,
  INTERNAL_ERROR: 500,
}

function jsonError(code: ErrorCode, message: string, status?: number) {
  return NextResponse.json(
    { error: { code, message } },
    { status: status ?? errorStatusByCode[code] }
  )
}

async function runAuditScaffold(url: string): Promise<AuditResponse> {
  const fetchResult = await fetchHtml(url)

  return runAudit({
    url: fetchResult.finalUrl,
    html: fetchResult.html,
    fetchTimeMs: fetchResult.fetchTimeMs,
    htmlBytes: fetchResult.htmlBytes,
  })
}

export async function POST(request: Request) {
  const requestStartedAt = performance.now()

  try {
    let body: unknown

    try {
      body = await request.json()
    } catch {
      throw new AuditApiError(
        "VALIDATION_ERROR",
        errorStatusByCode.VALIDATION_ERROR,
        "Request body must be valid JSON."
      )
    }

    const rawUrl =
      typeof body === "object" &&
      body !== null &&
      "url" in body &&
      typeof (body as { url?: unknown }).url === "string"
        ? (body as { url: string }).url
        : ""

    if (!rawUrl) {
      throw new AuditApiError(
        "VALIDATION_ERROR",
        errorStatusByCode.VALIDATION_ERROR,
        "Please provide a URL to audit."
      )
    }

    let normalizedUrl: string
    try {
      normalizedUrl = parseAndNormalizeUrl(rawUrl)
    } catch (error) {
      throw new AuditApiError(
        "VALIDATION_ERROR",
        errorStatusByCode.VALIDATION_ERROR,
        error instanceof Error ? error.message : "Please enter a valid URL."
      )
    }

    const normalizedHost = new URL(normalizedUrl).hostname
    if (isBlockedTargetHost(normalizedHost)) {
      throw new AuditApiError(
        "URL_BLOCKED",
        errorStatusByCode.URL_BLOCKED,
        "That URL host is not allowed."
      )
    }

    let result: AuditResponse
    try {
      result = await runAuditScaffold(normalizedUrl)
    } catch (error) {
      if (error instanceof FetchHtmlError) {
        throw new AuditApiError(
          error.code,
          errorStatusByCode[error.code],
          error.message
        )
      }

      throw error
    }

    return NextResponse.json({
      ...result,
      meta: {
        ...result.meta,
        fetchTimeMs: Math.max(
          result.meta.fetchTimeMs,
          Math.round(performance.now() - requestStartedAt)
        ),
      },
    })
  } catch (error) {
    if (error instanceof AuditApiError) {
      return jsonError(error.code, error.message, error.status)
    }

    return jsonError(
      "INTERNAL_ERROR",
      "Unexpected server error while running the audit."
    )
  }
}
