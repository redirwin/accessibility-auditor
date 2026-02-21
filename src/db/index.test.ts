import fs from "node:fs"
import path from "node:path"
import { performance } from "node:perf_hooks"
import { afterEach, describe, expect, it, vi } from "vitest"

function makeTestDbPath(label: string): string {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return path.resolve(
    process.cwd(),
    "data",
    "db-tests",
    `${label}-${suffix}`,
    "audits.db"
  )
}

const cleanupDirs = new Set<string>()
let lastOpenedDb: { close: () => unknown } | null = null

async function loadDbModule() {
  vi.resetModules()
  return import("@/src/db")
}

describe("src/db", () => {
  afterEach(() => {
    if (lastOpenedDb) {
      try {
        lastOpenedDb.close()
      } catch {
        // Ignore close failures in test cleanup.
      }
      lastOpenedDb = null
    }

    delete process.env.AUDITS_DB_PATH
    for (const dir of cleanupDirs) {
      try {
        fs.rmSync(dir, { recursive: true, force: true })
      } catch {
        // Ignore cleanup races on Windows file handles.
      }
    }
    cleanupDirs.clear()
    vi.restoreAllMocks()
  })

  it("resolves default and override DB paths deterministically", async () => {
    delete process.env.AUDITS_DB_PATH
    const defaultModule = await loadDbModule()
    expect(defaultModule.resolveDbPath()).toBe(
      path.resolve(process.cwd(), "data", "audits.db")
    )

    process.env.AUDITS_DB_PATH = "./data/custom/audits.db"
    const overrideModule = await loadDbModule()
    expect(overrideModule.resolveDbPath()).toBe(
      path.resolve(process.cwd(), "data", "custom", "audits.db")
    )
  })

  it("uses singleton connection and runtime-safe initialization on first access", async () => {
    const dbPath = makeTestDbPath("singleton-init")
    process.env.AUDITS_DB_PATH = dbPath
    cleanupDirs.add(path.dirname(dbPath))

    const { getDb } = await loadDbModule()
    const dbA = getDb()
    lastOpenedDb = dbA
    const dbB = getDb()
    expect(dbA).toBe(dbB)
    expect(fs.existsSync(dbPath)).toBe(true)

    const tableRow = dbA
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='audits';")
      .get() as { name?: string } | undefined
    expect(tableRow?.name).toBe("audits")

    const indexRows = dbA
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND name IN ('idx_audits_url_norm', 'idx_audits_created_at');"
      )
      .all() as Array<{ name: string }>
    expect(indexRows).toHaveLength(2)

    const versionRow = dbA
      .prepare("PRAGMA user_version;")
      .get() as { user_version?: number } | undefined
    expect(versionRow?.user_version).toBe(1)
  })

  it("keeps schema initialization idempotent when statements re-run", async () => {
    const dbPath = makeTestDbPath("idempotent")
    process.env.AUDITS_DB_PATH = dbPath
    cleanupDirs.add(path.dirname(dbPath))

    const { getDb } = await loadDbModule()
    const schema = await import("@/src/db/schema")
    const db = getDb()
    lastOpenedDb = db

    expect(() => {
      db.exec(schema.CREATE_AUDITS_TABLE_SQL)
      db.exec(schema.CREATE_AUDITS_URL_INDEX_SQL)
      db.exec(schema.CREATE_AUDITS_CREATED_AT_INDEX_SQL)
      db.exec(schema.SET_USER_VERSION_SQL)
    }).not.toThrow()

    const versionRow = db
      .prepare(schema.READ_USER_VERSION_SQL)
      .get() as { user_version?: number } | undefined
    expect(versionRow?.user_version).toBe(schema.DB_USER_VERSION)
  })

  it("inserts and queries audit summaries through helper seam", async () => {
    const dbPath = makeTestDbPath("insert-query")
    process.env.AUDITS_DB_PATH = dbPath
    cleanupDirs.add(path.dirname(dbPath))

    const { getDb, insertAuditSummary, listAuditSummariesByUrl } =
      await loadDbModule()
    const db = getDb()
    lastOpenedDb = db

    const insertResult = insertAuditSummary({
      urlOriginal: "https://example.com/",
      urlNormalized: "https://example.com",
      createdAt: new Date().toISOString(),
      summary: { score: 95, passes: 9, warnings: 1, fails: 0 },
      meta: { fetchTimeMs: 42, htmlBytes: 2048 },
    })
    expect(insertResult.ok).toBe(true)

    const queryResult = listAuditSummariesByUrl("https://example.com", 5)
    expect(queryResult.ok).toBe(true)
    if (queryResult.ok) {
      expect(queryResult.items).toHaveLength(1)
      expect(queryResult.items[0].score).toBe(95)
    }
  })

  it("opens the database within local performance target", async () => {
    const dbPath = makeTestDbPath("perf-open")
    process.env.AUDITS_DB_PATH = dbPath
    cleanupDirs.add(path.dirname(dbPath))

    const { getDb } = await loadDbModule()
    const start = performance.now()
    const db = getDb()
    lastOpenedDb = db
    const elapsedMs = performance.now() - start

    expect(elapsedMs).toBeLessThan(50)
  })

  it("returns and logs graceful failures for insert/query helpers", async () => {
    const dbPath = makeTestDbPath("graceful-errors")
    process.env.AUDITS_DB_PATH = dbPath
    cleanupDirs.add(path.dirname(dbPath))

    const { getDb, insertAuditSummary, listAuditSummariesByUrl } =
      await loadDbModule()
    const db = getDb()
    lastOpenedDb = db
    db.close()
    lastOpenedDb = null

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const insertResult = insertAuditSummary({
      urlOriginal: "https://example.com/",
      urlNormalized: "https://example.com",
      createdAt: new Date().toISOString(),
      summary: { score: 90, passes: 8, warnings: 1, fails: 1 },
      meta: { fetchTimeMs: 10, htmlBytes: 512 },
    })
    const queryResult = listAuditSummariesByUrl("https://example.com", 5)

    expect(insertResult.ok).toBe(false)
    expect(queryResult.ok).toBe(false)
    expect(errorSpy).toHaveBeenCalledWith(
      "[db_insert] Failed to insert audit summary",
      expect.objectContaining({ operation: "db_insert" })
    )
    expect(errorSpy).toHaveBeenCalledWith(
      "[db_query] Failed to list audit summaries",
      expect.objectContaining({ operation: "db_query" })
    )
  })
})
