import Database from "better-sqlite3";
import path from "node:path";

declare global {
  var shopmorphDb: Database.Database | undefined;
}

function resolveDbPath() {
  const configuredPath = process.env.SQLITE_DB_PATH ?? "./shopmorph.sqlite";
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);
}

function ensureSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt TEXT NOT NULL,
      headline TEXT NOT NULL,
      cta_text TEXT NOT NULL,
      tailwind_classes TEXT NOT NULL,
      has_countdown_timer INTEGER NOT NULL DEFAULT 0,
      layout_type TEXT NOT NULL DEFAULT 'bg-overlay',
      image_keyword TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      inline_svg TEXT NOT NULL DEFAULT '',
      social_caption TEXT NOT NULL DEFAULT '',
      raw_html TEXT NOT NULL DEFAULT '',
      interactive_code TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const campaignColumns = new Set(
    (
      db.prepare("PRAGMA table_info(campaigns)").all() as Array<{
        name: string;
      }>
    ).map((column) => column.name)
  );

  const addCampaignColumn = (name: string, definition: string) => {
    if (!campaignColumns.has(name)) {
      db.exec(`ALTER TABLE campaigns ADD COLUMN ${name} ${definition}`);
    }
  };

  addCampaignColumn("layout_type", "TEXT NOT NULL DEFAULT 'bg-overlay'");
  addCampaignColumn("image_keyword", "TEXT NOT NULL DEFAULT ''");
  addCampaignColumn("image_url", "TEXT NOT NULL DEFAULT ''");
  addCampaignColumn("inline_svg", "TEXT NOT NULL DEFAULT ''");
  addCampaignColumn("social_caption", "TEXT NOT NULL DEFAULT ''");
  addCampaignColumn("raw_html", "TEXT NOT NULL DEFAULT ''");
  addCampaignColumn("interactive_code", "TEXT NOT NULL DEFAULT ''");
}

export function getDb() {
  if (!global.shopmorphDb) {
    global.shopmorphDb = new Database(resolveDbPath());
    global.shopmorphDb.pragma("journal_mode = WAL");
  }

  ensureSchema(global.shopmorphDb);

  return global.shopmorphDb;
}

export const db = getDb();
