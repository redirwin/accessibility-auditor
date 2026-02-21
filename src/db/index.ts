import fs from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"
import type { AuditResponse } from "@/src/audit/types"
import {
  CREATE_AUDITS_CREATED_AT_INDEX_SQL,
  CREATE_AUDITS_TABLE_SQL,
  CREATE_AUDITS_URL_INDEX_SQL,
  DB_USER_VERSION,
  INSERT_AUDIT_SUMMARY_SQL,
  READ_USER_VERSION_SQL,
  SET_USER_VERSION_SQL,
} from "@/src/db/schema"

let dbInstance: Database.Database | null = null
let runtimeSchemaInitialized = false

export function resolveDbPath(): string {
  const fromEnv = process.env.AUDITS_DB_PATH?.trim()
  if (fromEnv) return path.resolve(fromEnv)
  return path.resolve(process.cwd(), "data", "audits.db")
}

export function ensureDbDirectory(dbPath = resolveDbPath()): void {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
}

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance

  const dbPath = resolveDbPath()
  ensureDbDirectory(dbPath)
  dbInstance = new Database(dbPath)
  ensureRuntimeDbInitialization(dbInstance)
  return dbInstance
}

export type InsertAuditSummaryInput = {
  urlOriginal: string
  urlNormalized: string
  createdAt: string
  summary: AuditResponse["summary"]
  meta: AuditResponse["meta"]
}

export type InsertAuditSummaryResult =
  | { ok: true; rowId: number }
  | { ok: false; error: string }

export type AuditSummaryRow = {
  id: number
  url_original: string
  url_normalized: string
  created_at: string
  score: number
  passes: number
  warnings: number
  fails: number
  fetch_time_ms: number
  html_bytes: number
}

export type ListAuditSummariesResult =
  | { ok: true; items: AuditSummaryRow[] }
  | { ok: false; error: string }

export function insertAuditSummary(
  input: InsertAuditSummaryInput
): InsertAuditSummaryResult {
  try {
    const db = getDb()
    const statement = db.prepare(INSERT_AUDIT_SUMMARY_SQL)
    const result = statement.run({
      urlOriginal: input.urlOriginal,
      urlNormalized: input.urlNormalized,
      createdAt: input.createdAt,
      score: input.summary.score,
      passes: input.summary.passes,
      warnings: input.summary.warnings,
      fails: input.summary.fails,
      fetchTimeMs: input.meta.fetchTimeMs,
      htmlBytes: input.meta.htmlBytes,
    })

    return { ok: true, rowId: Number(result.lastInsertRowid) }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[db_insert] Failed to insert audit summary", {
      operation: "db_insert",
      message,
    })
    return { ok: false, error: message }
  }
}

export function listAuditSummariesByUrl(
  urlNormalized: string,
  limit = 10
): ListAuditSummariesResult {
  try {
    const db = getDb()
    const statement = db.prepare(
      `
      SELECT
        id,
        url_original,
        url_normalized,
        created_at,
        score,
        passes,
        warnings,
        fails,
        fetch_time_ms,
        html_bytes
      FROM audits
      WHERE url_normalized = ?
      ORDER BY created_at DESC
      LIMIT ?
      `
    )
    const items = statement.all(urlNormalized, limit) as AuditSummaryRow[]
    return { ok: true, items }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[db_query] Failed to list audit summaries", {
      operation: "db_query",
      message,
    })
    return { ok: false, error: message }
  }
}

function ensureRuntimeDbInitialization(db: Database.Database): void {
  if (runtimeSchemaInitialized) return

  try {
    db.pragma("journal_mode = WAL")
    db.exec(CREATE_AUDITS_TABLE_SQL)
    db.exec(CREATE_AUDITS_URL_INDEX_SQL)
    db.exec(CREATE_AUDITS_CREATED_AT_INDEX_SQL)

    const versionRow = db.prepare(READ_USER_VERSION_SQL).get() as
      | { user_version?: number }
      | undefined
    const currentVersion = versionRow?.user_version ?? 0
    if (currentVersion < DB_USER_VERSION) {
      db.exec(SET_USER_VERSION_SQL)
    }

    runtimeSchemaInitialized = true
  } catch (error) {
    console.error("[db_init] Runtime initialization failed", {
      operation: "db_init",
      message: error instanceof Error ? error.message : String(error),
    })
  }
}
