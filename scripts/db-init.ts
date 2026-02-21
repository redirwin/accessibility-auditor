import { ensureDbDirectory, getDb, resolveDbPath } from "../src/db"
import {
  CREATE_AUDITS_CREATED_AT_INDEX_SQL,
  CREATE_AUDITS_TABLE_SQL,
  CREATE_AUDITS_URL_INDEX_SQL,
  DB_USER_VERSION,
  SET_USER_VERSION_SQL,
} from "../src/db/schema"

function runDbInit() {
  const dbPath = resolveDbPath()

  try {
    ensureDbDirectory(dbPath)
    const db = getDb()

    db.exec(CREATE_AUDITS_TABLE_SQL)
    db.exec(CREATE_AUDITS_URL_INDEX_SQL)
    db.exec(CREATE_AUDITS_CREATED_AT_INDEX_SQL)
    db.exec(SET_USER_VERSION_SQL)
    const versionRow = db
      .prepare("PRAGMA user_version;")
      .get() as { user_version?: number } | undefined
    const currentVersion = versionRow?.user_version ?? 0
    if (currentVersion !== DB_USER_VERSION) {
      throw new Error(
        `user_version mismatch (expected ${DB_USER_VERSION}, got ${currentVersion})`
      )
    }

    console.log(
      `[db_init] Success path=${dbPath} user_version=${DB_USER_VERSION}`
    )
  } catch (error) {
    console.error("[db_init] Failed", {
      operation: "db_init",
      path: dbPath,
      message: error instanceof Error ? error.message : String(error),
    })
    process.exit(1)
  }
}

runDbInit()
