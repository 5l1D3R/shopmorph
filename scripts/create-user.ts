import bcrypt from "bcryptjs";
import { getDb } from "../src/lib/db";

async function main() {
  const [, , email, password, name] = process.argv;

  if (!email || !password) {
    console.error("Usage: npm run create-user -- email@example.com password [name]");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  getDb()
    .prepare(
      `
      INSERT INTO users (email, name, password_hash)
      VALUES (?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        password_hash = excluded.password_hash
    `
    )
    .run(email.trim().toLowerCase(), name ?? null, passwordHash);

  console.log(`User ready: ${email.trim().toLowerCase()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
