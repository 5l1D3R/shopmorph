import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type UserRow = {
  id: number;
  email: string;
  password_hash: string;
};

function normalizeCredentials(body: unknown) {
  if (!body || typeof body !== "object") {
    return { email: "", password: "" };
  }

  const payload = body as Record<string, unknown>;
  return {
    email: typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "",
    password: typeof payload.password === "string" ? payload.password : ""
  };
}

export async function POST(request: Request) {
  const { email, password } = normalizeCredentials(await request.json().catch(() => null));

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required." },
      { status: 400 }
    );
  }

  const existingUser = db
    .prepare("SELECT id, email, password_hash FROM users WHERE lower(email) = ? LIMIT 1")
    .get(email) as UserRow | undefined;

  let userId = existingUser?.id;

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = db
      .prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
      .run(email, passwordHash);

    userId = Number(result.lastInsertRowid);
  } else {
    const passwordMatches = await bcrypt.compare(password, existingUser.password_hash);

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }
  }

  const response = NextResponse.json({
    success: true,
    userId
  });

  response.cookies.set("auth_session", String(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
