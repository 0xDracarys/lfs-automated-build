# Security & GDPR Audit — LFS Learning Platform

Date: 23 Oct 2026 · Scope: `lfs-learning-platform` (Next.js + Firebase + Google Cloud)

Result of a hard pass converting the app from "prototype trust" to verified identity + least privilege.

---

## 1 · Fixed in code (verified by file)

| # | Risk found | Severity | Fix | Evidence |
|---|------------|----------|-----|----------|
| 1 | **Firestore rules wide open**: `users` writable by ANYONE; `comments` full world-CRUD; `builds` readable by all signed-in users (leaks others' build configs/emails) | CRITICAL | Full rules rewrite: deny-by-default, owner-only reads/writes, admin via custom claim, analytics append-only | `firestore.rules` |
| 2 | **IDOR family**: `/api/progress`, `/api/commands`, `/api/activities`, `/api/support/hr` trusted `userId` from body/query → anyone could read/write anyone's data | CRITICAL | Spoofable params removed; identity now comes from verified Firebase ID tokens; dead legacy routes deleted outright | `lib/api-auth.ts`, routed under `app/api/support/hr`, others rm'd |
| 3 | **`/api/lfs/trigger`** spawned builds with no authentication (free compute abuse) | HIGH | ID-token required + 3 builds/hour/user limiter | `app/api/lfs/trigger/route.ts` |
| 4 | **`/api/lfs/status/[buildId]` & `/cancel/[buildId]`** let anyone view/cancel ANYONE's build (IDOR on builds) | HIGH | Token required + ownership check against the `builds.userId` field (403 otherwise) | status & cancel routes |
| 5 | **`/api/build`** ran local PowerShell builds unauthenticated | HIGH | Token + 2/hour limiter (script selection itself was already whitelist-pinned) | `app/api/build/route.ts` |
| 6 | **`/api/support/hr?isHRTeam=true`** returned *all* user tickets to anyone | HIGH | HR view gated by `SUPPORT_TEAM_EMAILS` env allowlist; users see only their own tickets; `x-user-email` header spoof removed | `app/api/support/hr/route.ts` |
| 7 | **`/api/notify`** stored arbitrary emails → spam/fake-reminder vector | MEDIUM | Email taken from the verified token only; 10 req/10min limiter | `app/api/notify/route.ts` |
| 8 | **Google Analytics initialized on every page load** without consent (the #1 GDPR fine pattern) | HIGH | `getAnalytics` now lazy: fires ONLY after banner "Accept"; nobody imported the instance so nothing breaks | `lib/firebase.ts` + consent banner |
| 9 | No security headers | MEDIUM | `X-Frame-Options: DENY`, `nosniff`, strict `Referrer-Policy`, `Permissions-Policy`, HSTS + conservative CSP (`frame-ancestors none`) | `next.config.js` |
| 10 | No way for users to exercise GDPR rights | required | Self-service **download my data (JSON)** + **delete my account & everything** with verified tokens; delete covers users doc + subcollections, builds, buildLogs, analytics, support, notifications, auth account | `app/api/gdpr/*`, `components/gdpr/DataRightsPanel` |
| 11 | Legal pages missing | required | Privacy policy (plain words, full inventory), Terms, Cookie list + consent banner bound to policy version | `app/privacy`, `app/terms`, `app/cookies`, `components/gdpr/ConsentBanner` |
| 12 | Dead ends hiding attack surface | cleanup | Removed: `/test`, `/test-penguin`, `/test-firebase` pages and the unused insecure routes (`/api/progress`, `/api/commands`, `/api/activities`) — zero UI callers existed | git rm |

**Rate limiting**: single-instance in-memory (`lib/rate-limit.ts`) — swap for Redis-backed if you run multiple server instances.

## 2 · You must do these by hand (cannot be done from code)

| # | Action | Why | How |
|---|--------|-----|-----|
| 1 | **Deploy the new Firestore rules** — the file alone changes nothing | The browser talks straight to Firebase with whatever is live in the console | `firebase deploy --only firestore:rules` from `lfs-learning-platform/` (or paste into Console → Firestore → Rules → Publish) |
| 2 | **Set the admin claim for admin dashboard reads** | Rules now require `token.admin == true` for cross-user views | `node set-admin-claim.js you@email.com` (script below) |
| 3 | **Restrict the web API key** in Google Cloud Console | Firebase keys are public by design; restrict them | APIs & Services → Credentials → key → Website restriction + only needed APIs |
| 4 | **Fill the controller identity** in `/privacy` + `/terms` (marked amber) | GDPR Art. 13 requires the controller's name/reachability | Edit `app/privacy/page.tsx` amber box |
| 5 | **Set `SUPPORT_TEAM_EMAILS`** env for HR inbox view | HR ticket view is now allowlisted | `.env.local` / hosting provider |
| 6 | **Consider Firebase App Check** | Blocks non-browser API abuse | Firebase Console → App Check (enforcement for Firestore from the project) |
| 7 | **Test the GDPR buttons after repointing `.env`** to the new project | Export/delete act on live data | New project → create account → export → delete → re-login fails |
| 8 | **Real review of privacy/terms/copy** | Templates ≠ legal advice; verify jurisdiction/data specifics | You + legal counsel |
| 9 | **CSP smoke test after `npm run build && start`** | CSP can flag legit inline scripts; tune hashes if needed | DevTools console on each page |

## 3 · One-liner: set admin claim

```bash
# from repo/functions context (service account present)
node -e "const a=require('firebase-admin');const s=require('./functions/service-account.json');a.initializeApp({credential:a.credential.cert(s)});const [em]=process.argv.slice(2);a.auth().getUserByEmail(em).then(u=>a.auth().setCustomUserClaims(u.uid,{admin:true})).then(()=>console.log('admin claim set for',em))"
```

## 4 · Processing record (GDPR Art. 30, starter)

| Data | Purpose | Legal basis | Retention |
|------|---------|-------------|-----------|
| Account (email/name/uid) | login & service delivery | contract Art 6(1)(b) | until account deleted |
| Progress / terminal history | resume lessons | contract | until account deleted |
| First-party events | product analytics | legitimate interest / consent (browser analytics) | delete on account erasure; purge annually |
| Builds & logs | artifact delivery | contract | 12 months |
| Build reminders | service messaging | contract | until sent/deleted |
| Support tickets (incl. user-agent) | customer support | contract | 12 months |
| AI prompts (transit only) | reply generation | contract | not stored by us |

**Breach playbook (Art. 33/34)**: detect → assess within 24h → if personal data risk, notify authority within 72h → if high risk for users, inform them directly → log the incident. Write the contact person's name in the controller box above.

## 5 · Remaining known limitations (honest)

- Email delivery ("notify when build completes") is still a stub — recipients land in `buildNotifications` only. Wire a provider (e.g., a Cloud Function → email API) when needed; support-to-email/GitHub forwarding needs a secret token you must add yourself.
- Rate limiting is per-instance memory (fine at current scale).
- CSP is conservative-but-broad (`'unsafe-inline'` scripts) — standard for Next.js; tighten with nonces later if desired.
- Legacy client-SDK-in-API-route patterns (support endpoints) work only with correctly deployed rules (action #1).
