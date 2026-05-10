# API Reference

This file documents server-side routes and programmatic entry points in the demo.

1) Send Invite API
- Path: [src/app/api/send-invite/route.ts](src/app/api/send-invite/route.ts)
- Method: POST
- Purpose: Accepts invite details (email/room) and triggers invite logic. In this repo it may also mint/return temporary SDK tokens.
- Expected payload: JSON with fields the UI sends (see usage in `InviteModal`), typically { "email": string, "room": string }
- Response: JSON success/failure and any invite links or tokens.

2) Token helper
- File: [src/data/getToken.ts](src/data/getToken.ts)
- Purpose: Encapsulates server-side token creation or interaction with Zoom SDK backend. Use this when you need to programmatically obtain a join token.

Client-side interfaces
- `VideochatClientWrapper` ([src/components/VideochatClientWrapper.tsx](src/components/VideochatClientWrapper.tsx)) is the primary integration point for the Zoom Video SDK client. It accepts props required to initialize the SDK and manages lifecycle.

Error handling
- API routes follow Next.js App Router `route.ts` conventions. Ensure thrown errors return appropriate HTTP status codes.

Extending the API
- Add new server APIs under `src/app/api/` as needed; prefer route handlers named after their purpose (e.g., `src/app/api/tokens/route.ts`).
