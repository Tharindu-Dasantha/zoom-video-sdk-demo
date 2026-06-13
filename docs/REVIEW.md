# Site Review — tenon-Link Connect

**Date:** 2026-06-13
**Branch:** `app-router`
**Reviewed at commit:** `0e570d8` (fixes from this review are included)
**Stack:** Next.js 16 (App Router) · React 19 · Prisma/PostgreSQL · Zoom Video SDK · UploadThing · Nodemailer

This document records a full recheck of the three core flows (admin auth, temporary
meetings, one-time testimonial recording links), the fixes applied during the review,
how they were verified, and the risks that remain.

---

## 1. Verdict by flow

| Flow | Status | Notes |
|------|--------|-------|
| Admin login / logout | ✅ Working | bcrypt verify → 8h httpOnly JWT cookie → middleware-guarded `/admin` → logout clears cookie. No changes needed. |
| Temporary meetings | ✅ Working | Creator joins as host, invitees as participants. Host leaving ends the session for all, ejects participants, and kills the link so later visitors can't reopen it. Nothing about meeting *content* is saved or recorded. |
| One-time recording links | ✅ Fixed | Link is now burned (`COMPLETED`) the instant the attendee presses **Done**, no longer dependent on the Zoom webhook. Recording is uploaded by the webhook and shown in the admin panel. |

---

## 2. Flow walkthroughs (as they behave now)

### 2.1 Login / Logout
- `POST /api/admin/login` ([login/route.ts](../src/app/api/admin/login/route.ts)) — looks up admin by email, `bcrypt.compare`, signs an 8h `HS256` JWT ([auth.ts](../src/lib/auth.ts)), sets it as an `httpOnly`, `sameSite=lax` cookie (`secure` in production).
- [middleware.ts](../src/middleware.ts) — guards `/admin/:path*`, verifies the JWT, redirects to `/login` (clearing the cookie) when missing/invalid.
- API routes (`/api/admin/*`) independently re-check `getAdminFromCookie()`, so data access does not rely on middleware alone.
- `GET /api/admin/logout` ([logout/route.ts](../src/app/api/admin/logout/route.ts)) — deletes the cookie with `path: "/"` and redirects to `/login`.

### 2.2 Temporary meetings
- `/meeting/new` ([page](../src/app/meeting/new/page.tsx)) sends the creator to `/meeting/{code}?name=…&host=1`.
- `/meeting/[id]` ([page](../src/app/meeting/[id]/page.tsx)) mints a Zoom token with **role 1 (host)** when `host=1`, otherwise **role 0 (participant)**. Email invites ([send-invite](../src/app/api/send-invite/route.ts)) link to a plain `/meeting/{code}` URL → participant.
- [Videochat.tsx](../src/components/Videochat.tsx): host leaving calls `client.leave(true)` (ends session for everyone); a `connection-change: "Closed"` redirects remaining participants home. Nothing is persisted; no recording is started.

### 2.3 One-time recording links
- Admin creates a link (`status = PENDING`) in the dashboard ([admin](../src/app/admin/page.tsx)).
- Attendee opens `/record/{token}` → device check → **Start Recording**: joins Zoom (role 1, host) and starts cloud recording; link → `IN_PROGRESS`.
- **Done** ([RecordingFlow.tsx](../src/app/record/[token]/RecordingFlow.tsx) `finishRecording`): stops cloud recording, marks the link `COMPLETED` immediately, then leaves. The link is now single-use.
- Zoom's `recording.completed` webhook ([webhook](../src/app/api/zoom/webhook/route.ts)) downloads the MP4, uploads it to UploadThing, and upserts the `Recording` row onto the already-completed link.
- Admin panel lists the recording with a "View recording" / "Open Video" link.
- Re-opening a `COMPLETED` link is blocked (HTTP 409); `IN_PROGRESS` is intentionally still re-enterable to allow recovery from an accidental refresh mid-recording.

---

## 3. Changes applied in this review (commit `0e570d8`)

1. **Recording links are now truly one-time use.**
   - `PATCH /api/record/[token]` gained an `action` body: `"start"` (PENDING→IN_PROGRESS) and `"complete"` (PENDING/IN_PROGRESS→COMPLETED).
   - `finishRecording` calls `stopCloudRecording()` and marks the link `COMPLETED` on Done, instead of waiting for the webhook (which could lag for minutes or never fire if recording failed to start, leaving the link reusable).
2. **Meeting lifecycle tied to the creator.**
   - `getData(slug, role)` now takes a role (defaults to host=1 so the recorder is unchanged).
   - Creator = host, invitees = participants; host leaving ends the session for all; participants are ejected via `connection-change`.
3. **Event-listener leaks fixed.** Both [Videochat.tsx](../src/components/Videochat.tsx) and [RecordingFlow.tsx](../src/app/record/[token]/RecordingFlow.tsx) previously called `client.off(event, () => {})` with a throwaway function that never matched the registered handler. Handlers are now stored (stable `useCallback` / ref) and removed correctly.
4. **Deleting a link removes its stored file.** `DELETE /api/admin/links/[id]` now deletes the UploadThing object before removing the DB row, instead of orphaning the file.

### Follow-up fixes (post-review, addressing §4.1 / §4.4 / §4.5)

5. **Dead meeting links are now hard-blocked (§4.1).** Added an `EndedMeeting` table (code only — no meeting content). The host's join clears any marker (`POST /api/meeting/start`); the host leaving — via the Leave button, tab close (`pagehide` + `sendBeacon`), or unmount — marks the code ended (`POST /api/meeting/end`). `/meeting/[id]` shows a "This meeting has ended" screen to non-host visitors of a dead code. The host can restart the same code, which reactivates it.
6. **Recordings can no longer be silently lost (§4.4).** If `startCloudRecording()` fails, [RecordingFlow.tsx](../src/app/record/[token]/RecordingFlow.tsx) now leaves the session and shows an error instead of letting the attendee record into the void; the link stays `IN_PROGRESS` (re-enterable) so they can refresh and retry, and is never marked `COMPLETED` without a recording. The [webhook](../src/app/api/zoom/webhook/route.ts) now returns `500` on download/upload/DB failure so Zoom retries delivery rather than dropping the file.
7. **Recording download + logout hardening (§4.5).** Added an admin-guarded proxy route `GET /api/admin/recordings/[id]/download` that streams the file with `Content-Disposition: attachment` (a "Download" button sits beside "Open Video"). Logout is now `POST`-only (`fetch` from a button) so a cross-site GET can't force a logout.

---

## 4. Outstanding risks & recommendations

### 4.1 ✅ RESOLVED — meetings now block *new* visitors after the creator leaves
Previously a brand-new visitor could reopen a dead code and start a fresh empty room. An
`EndedMeeting` table now records codes whose host has left; non-host visitors of such a code
get a "This meeting has ended" screen. Only the meeting **code** is persisted — no meeting
content, audio, video, or recording — so this stays consistent with "nothing gets saved." The
host reactivates a code simply by starting it again (the marker is cleared on host join).
See changes #5 above.

### 4.2 Security — `host=1` is client-supplied and bypassable (MEDIUM)
Any participant can append `?host=1` to a meeting URL to obtain the host role (and thus the
ability to end the meeting or start cloud recording). For an unauthenticated demo meeting
this is largely inherent, but if host privileges matter, the role must be decided server-side
(e.g. the first joiner, or a signed host token issued only to the creator).

### 4.3 Security — `/api/send-invite` is unauthenticated (MEDIUM)
The invite endpoint sends branded email to an arbitrary recipient with no auth and no rate
limiting, making it a spam/abuse vector via your SMTP credentials. **Recommendation:** require
an admin session or a valid meeting context, and add rate limiting.

### 4.4 ✅ RESOLVED — silent loss of a recording
- If `startCloudRecording()` fails, the flow no longer continues silently: it tears down the
  Zoom session and shows an error. The link stays `IN_PROGRESS` (re-enterable) so the attendee
  can refresh and retry, and it is never marked `COMPLETED` without a recording.
- The webhook now returns `500` on download/upload/DB failure, so Zoom retries delivery instead
  of dropping the recording. See changes #6 above.

### 4.5 ✅ RESOLVED — download & logout hardening
- A "Download" button now hits an admin-guarded same-origin proxy
  (`/api/admin/recordings/[id]/download`) that serves the file with
  `Content-Disposition: attachment`, forcing a real download; "Open Video" still opens it in a
  tab for quick preview.
- Logout is now `POST`-only, removing the `GET` CSRF-logout vector.

---

## 5. Verification performed
- `tsc --noEmit` — **passes** (full project, 0 errors).
- `eslint` on all changed files — **passes** (0 errors, 0 warnings).
- `next build` — **passes** (compiled successfully; routes include the new `/api/meeting/start`, `/api/meeting/end`, and `/api/admin/recordings/[id]/download`).
- `prisma migrate deploy` — **applied** (`20260613000000_ended_meeting`).

### Requires live verification (not exercisable without real Zoom credentials + a live session)
These depend on actual Zoom SDK runtime behavior and should be confirmed in a real meeting/recording before shipping:
1. Host `client.leave(true)` ends the session for all participants.
2. Participants receive `connection-change` with state `"Closed"` and are redirected home.
3. `stopCloudRecording()` on Done produces a `recording.completed` webhook that uploads the MP4 and surfaces it in the admin panel.
