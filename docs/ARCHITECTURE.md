# Architecture & Components

High-level overview

This app is a small Next.js frontend with a few client components that integrate the Zoom Video SDK. The server provides minimal helper APIs (token/invite generation).

Runtime pieces
- Browser (client): UI pages and components that initialize and render Zoom Video SDK video and controls.
- Server (Next.js App Router API routes): token/invite endpoints and secret usage.

Primary components
- `src/components/VideochatClientWrapper.tsx`: Initializes Zoom Video SDK client, handles lifecycle and events.
- `src/components/Videochat.tsx`: Renders remote/local video tiles and contains call controls.
- `src/components/MuteButtons.tsx`: Small control for audio mute/unmute.
- `src/components/InviteModal.tsx`: UI to gather invite info and call the `send-invite` API route.
- `src/lib/utils.ts`: Misc client helpers.

Sequence (join flow)
1. User opens call page: [src/app/call/[slug]/page.tsx](src/app/call/[slug]/page.tsx).
2. Page requests token (either via `getToken` helper or from `src/app/api/send-invite/route.ts`).
3. `VideochatClientWrapper` initializes SDK with token.
4. `Videochat` renders tracks and controls.

File map (quick)
- App UI: [src/app](src/app)
- Components: [src/components](src/components)
- Data helpers: [src/data/getToken.ts](src/data/getToken.ts)
- Utilities: [src/lib/utils.ts](src/lib/utils.ts)

Diagram (textual)

Client Browser
-> `VideochatClientWrapper` (initialize)
-> `Videochat` (render tracks)
-> `MuteButtons`, `InviteModal` (controls)

Server
-> `src/app/api/send-invite/route.ts` (invite/token endpoint)
