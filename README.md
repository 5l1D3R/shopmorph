# ShopMorph Studio: An autonomous, self-correcting e-commerce software builder powered by the OpenAI Codex SDK.

ShopMorph Studio turns merchant prompts into live, interactive storefront widgets. It generates complete HTML/Tailwind/JavaScript micro-experiences, validates them server-side, stores them in SQLite, and previews them safely inside a sandboxed runtime viewport.

## 🌟 Core Features

- **Dynamic Interactive Software Generation**: Builds full games, timers, quizzes, offer mechanics, and conversion tools instead of static marketing text.
- **Manifest-Driven Governance**: Injects external design rules from `shopmorph-guardrails-manifest.md` so brand policy evolves outside the execution code.
- **Live Automated Assertion Engine**: Runs real-time quality gates on every API cycle, validating Tailwind CDN support, brand tokens, and interactive script structure.
- **Isolated Runtime Viewport**: Executes complex custom applications inside sandboxed iframes, protecting the dashboard from XSS and layout contamination.

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Application | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Persistence | SQLite with `better-sqlite3` |
| Verification | Vitest |
| AI Runtime | OpenAI Codex SDK |

## Login / Authorization for Users

ShopMorph includes a lightweight merchant login flow for local evaluation and demo usage:

- **Email/password login**: The App Router login API accepts merchant credentials and validates them server-side.
- **Automatic test onboarding**: If an evaluator signs in with a new email, the API can create the user automatically with a hashed password so setup stays frictionless.
- **Secure session cookie**: Successful login sets an HTTP-only cookie, keeping the session identifier out of client-side JavaScript.
- **Logout support**: The dashboard includes a logout action so users can clear their active session cleanly.

This gives the studio a real authorization boundary while keeping local development fast.

## Data Persistence

ShopMorph uses SQLite as the local system of record for users, sessions, and generated campaign assets.

| Data Type | Persistence Role |
| --- | --- |
| Users | Stores merchant identity and password hashes. |
| Sessions | Tracks active authenticated access for login/logout flows. |
| Campaigns | Stores the original prompt plus generated HTML/interactive widget code for dashboard reloads and future publishing. |

The database is initialized and migrated automatically by the local DB module, so generated widgets survive page refreshes and can be listed in the Saved Active Campaigns history feed.

## ⚙️ Installation & Workspace Setup

Install dependencies:

```bash
npm install
```

Create local environment configuration:

```bash
cp .env.example .env.local
```

Set your environment variables in `.env.local`:

```env
SQLITE_DB_PATH=./shopmorph.sqlite
SESSION_COOKIE_NAME=shopmorph_session
OPENAI_API_KEY=sk-your-api-key
```

Initialize the SQLite-backed user table with a local account:

```bash
npm run create-user -- admin@example.com "change-me" "Admin"
```

The app automatically creates and migrates the SQLite tables on startup, including users, sessions, and generated campaign/widget storage.

Start the developer environment inside WSL:

```bash
WATCHPACK_POLLING=true npm run dev
```

Open the app:

```txt
http://localhost:3000
```

## 🧪 Running the Offline Verification Suite

Run the Vitest suite:

```bash
npm test
```

The offline assertions guard against broken engine mechanics before anything reaches the live iframe runtime. The tests verify that:

- Brand guardrail tokens flow through the mocked skill path.
- Generated widget payloads are valid strings.
- The Tailwind CDN requirement is present.
- Empty or malformed HTML is rejected before iframe execution.

## 🔮 Production Roadmap

- **Headless embed engine**: Add `/api/v1/widgets/[id]/embed` to serve saved widgets as script-tag embeddable merchant experiences.
- **Cross-window analytics**: Use `postMessage` from sandboxed widgets to track impressions, clicks, game completions, opt-ins, and conversion events.
- **Merchant telemetry pipeline**: Persist widget analytics in SQLite/Postgres and expose campaign performance dashboards.
- **Versioned governance manifests**: Support per-brand and per-merchant guardrail manifests with audit history.
- **Widget registry**: Add publish states, rollbacks, preview URLs, and production deployment controls.
