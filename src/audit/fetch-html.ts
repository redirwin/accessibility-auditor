const MAX_REDIRECTS = 5
const TIMEOUT_MS = 10_000
const MAX_HTML_BYTES = 2 * 1024 * 1024

const USER_AGENT =
  "Mozilla/5.0 (compatible; AccessibilityUrlAuditor/1.0; +https://example.com)"

type FetchHtmlErrorCode =
  | "FETCH_TIMEOUT"
  | "RESPONSE_TOO_LARGE"
  | "UPSTREAM_FETCH_FAILED"

export class FetchHtmlError extends Error {
  constructor(
    public readonly code: FetchHtmlErrorCode,
    message: string
  ) {
    super(message)
  }
}

type FetchHtmlResult = {
  finalUrl: string
  html: string
  htmlBytes: number
  fetchTimeMs: number
}

function isRedirectStatus(status: number): boolean {
  return status >= 300 && status < 400
}

async function readHtmlWithByteLimit(response: Response): Promise<{
  html: string
  htmlBytes: number
}> {
  if (!response.body) {
    throw new FetchHtmlError(
      "UPSTREAM_FETCH_FAILED",
      "Failed to read HTML response body."
    )
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue

    totalBytes += value.byteLength
    if (totalBytes > MAX_HTML_BYTES) {
      throw new FetchHtmlError(
        "RESPONSE_TOO_LARGE",
        "The page exceeded the 2 MB HTML size limit."
      )
    }

    chunks.push(value)
  }

  const merged = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }

  return {
    html: new TextDecoder().decode(merged),
    htmlBytes: totalBytes,
  }
}

export async function fetchHtml(url: string): Promise<FetchHtmlResult> {
  const startedAt = performance.now()
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS)

  let currentUrl = url

  try {
    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
      let response: Response
      try {
        response = await fetch(currentUrl, {
          method: "GET",
          redirect: "manual",
          signal: timeoutController.signal,
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "text/html,application/xhtml+xml",
          },
        })
      } catch (error) {
        if (timeoutController.signal.aborted) {
          throw new FetchHtmlError(
            "FETCH_TIMEOUT",
            "Fetching the URL timed out after 10 seconds."
          )
        }

        throw new FetchHtmlError(
          "UPSTREAM_FETCH_FAILED",
          error instanceof Error
            ? "Failed to fetch the requested URL."
            : "Failed to fetch the requested URL."
        )
      }

      if (isRedirectStatus(response.status)) {
        if (redirectCount === MAX_REDIRECTS) {
          throw new FetchHtmlError(
            "UPSTREAM_FETCH_FAILED",
            "The URL redirected too many times."
          )
        }

        const location = response.headers.get("location")
        if (!location) {
          throw new FetchHtmlError(
            "UPSTREAM_FETCH_FAILED",
            "Redirect response did not include a Location header."
          )
        }

        currentUrl = new URL(location, currentUrl).toString()
        continue
      }

      if (!response.ok) {
        throw new FetchHtmlError(
          "UPSTREAM_FETCH_FAILED",
          "The requested URL could not be fetched successfully."
        )
      }

      const contentType = response.headers.get("content-type")
      if (
        contentType &&
        !contentType.includes("text/html") &&
        !contentType.includes("application/xhtml+xml")
      ) {
        throw new FetchHtmlError(
          "UPSTREAM_FETCH_FAILED",
          "The URL did not return an HTML document."
        )
      }

      const { html, htmlBytes } = await readHtmlWithByteLimit(response)

      return {
        finalUrl: currentUrl,
        html,
        htmlBytes,
        fetchTimeMs: Math.max(1, Math.round(performance.now() - startedAt)),
      }
    }

    throw new FetchHtmlError(
      "UPSTREAM_FETCH_FAILED",
      "The requested URL could not be fetched successfully."
    )
  } finally {
    clearTimeout(timeoutId)
  }
}
