# Setup & Development

Prerequisites
- Node.js 18+ (use `node -v`)
- pnpm (recommended) or npm/yarn

Install

```bash
pnpm install
```

Environment
Create a `.env` file at the repository root with required keys. Common variables used by this app:

- `ZOOM_SDK_KEY` — Zoom Video SDK key (used by client wrapper)
- `ZOOM_SDK_SECRET` — Zoom Video SDK secret (used server-side to mint tokens)
- `NEXT_PUBLIC_BASE_URL` — Base URL for callbacks and invites (optional)

Run locally

```bash
pnpm dev
```

Build

```bash
pnpm build
pnpm start
```

Notes
- The server route that creates invites and/or tokens is at [src/app/api/send-invite/route.ts](src/app/api/send-invite/route.ts).
- Token generation may call helper at [src/data/getToken.ts](src/data/getToken.ts).
