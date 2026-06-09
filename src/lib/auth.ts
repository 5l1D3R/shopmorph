import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";

const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? "shopmorph_session";
const SESSION_DAYS = 7;

type UserRow = {
  id: number;
  email: string;
  name: string | null;
  password_hash: string;
};

export async function signInWithPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return { ok: false, error: "Enter your email and password." };
  }

  const db = getDb();
  const user = db
    .prepare(
      "SELECT id, email, name, password_hash FROM users WHERE lower(email) = ? LIMIT 1"
    )
    .get(normalizedEmail) as UserRow | undefined;

  if (!user) {
    return { ok: false, error: "Invalid email or password." };
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return { ok: false, error: "Invalid email or password." };
  }

  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  );

  db.prepare(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(sessionId, user.id, expiresAt.toISOString());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });

  return { ok: true, error: null };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  return getDb()
    .prepare(
      `
      SELECT users.id, users.email, users.name
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.id = ?
        AND datetime(sessions.expires_at) > datetime('now')
      LIMIT 1
    `
    )
    .get(sessionId) as { id: number; email: string; name: string | null } | null;
}

export async function signOut() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    getDb().prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}
