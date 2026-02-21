export const DB_USER_VERSION = 1

export const CREATE_AUDITS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url_original TEXT NOT NULL,
  url_normalized TEXT NOT NULL,
  created_at TEXT NOT NULL,
  score INTEGER NOT NULL,
  passes INTEGER NOT NULL,
  warnings INTEGER NOT NULL,
  fails INTEGER NOT NULL,
  fetch_time_ms INTEGER NOT NULL,
  html_bytes INTEGER NOT NULL
);
`

export const CREATE_AUDITS_URL_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_audits_url_norm
ON audits(url_normalized);
`

export const CREATE_AUDITS_CREATED_AT_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_audits_created_at
ON audits(created_at DESC);
`

export const READ_USER_VERSION_SQL = "PRAGMA user_version;"
export const SET_USER_VERSION_SQL = `PRAGMA user_version = ${DB_USER_VERSION};`

export const INSERT_AUDIT_SUMMARY_SQL = `
INSERT INTO audits (
  url_original,
  url_normalized,
  created_at,
  score,
  passes,
  warnings,
  fails,
  fetch_time_ms,
  html_bytes
) VALUES (
  @urlOriginal,
  @urlNormalized,
  @createdAt,
  @score,
  @passes,
  @warnings,
  @fails,
  @fetchTimeMs,
  @htmlBytes
);
`
