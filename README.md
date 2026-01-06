# Criterion: Frontend (Listener UI)

> This document is an **ADR (Architecture Decision Record)** for the Dubcast frontend and also serves as a short **Frontend README** for reviewers.

## Architecture Decision Record

### Status

**Status:** -  
**Date:** 2026-01-06

### Context

Dubcast is a “live radio” web application where listeners share the same moment: everyone hears the same stream and sees the same **Now Playing** information. The Listener UI must support:

- **Radio playback** (open the app and start listening quickly).
- **Now Playing**: current track title + cover artwork (and consistent timing across clients).
- **Real-time community features**:
    - **Chat** (send/receive messages live).
    - **Online listeners counter** (how many people are listening right now).
- **User profile** where a listener can publish a short bio and links to their music / socials.
- **Admin management is API-only**: tracks/playlists/schedule are managed via Swagger UI / REST endpoints (no dedicated Admin UI).

Constraints and forces:

- Diploma scope → deliver a functional UI fast, keep it maintainable and demonstrable locally.
- Backend integration requires **REST** for data and **WebSocket** for real-time features.
- Basic automated tests (unit + e2e smoke) must exist.

### Decision

Implement the Listener UI as an **Angular (TypeScript) SPA** using:

- **Angular 21** for routing, DI, forms, and HTTP clients.
- **PrimeNG + PrimeIcons** for UI components and icons (fast development, consistent look).
- **RxJS** for reactive UI state (player status, now playing, auth/profile state).
- **STOMP + SockJS** for real-time messaging over WebSocket (chat + online counter).
- **SCSS** for theming and UI effects (dark/glassmorphism + blurred background from cover artwork).

For local development, use an **Angular proxy** to route `/api` and `/radio-ws` to the backend without CORS issues.

### Alternatives Considered

| Alternative | Pros | Cons | Why Not Chosen |
|-------------|------|------|----------------|
| React SPA | Huge ecosystem | More manual architecture decisions | Angular provides stronger structure for diploma scope |
| Vue SPA | Simple learning curve | Less opinionated for large app structure | Angular chosen for strict project structure + tooling |
| Server-side templates (Thymeleaf) | Simple deployment | Harder to build real-time chat + player UX | SPA fits reactive/live UI better |
| Polling instead of WebSocket | Easy to implement | Worse UX, more network traffic | Real-time features are core to Dubcast |
| NgRx store | Predictable global state | Boilerplate overhead | Services + RxJS are sufficient for current scope |

### Consequences

**Positive:**
- Strong structure (routing + services + components) improves maintainability.
- Real-time UX for chat and online counter.
- Reusable components enable consistent UI across pages.

**Negative:**
- SPA runtime/bundle is heavier than server-rendered templates.
- WebSocket connection management adds complexity (reconnects/fallback).

**Neutral:**
- Admin operations remain API-only and are not part of the Listener UI.

---

## Implementation Details

### Quick Start

**Requirements**
- Node.js (LTS recommended)
- npm (project uses `npm@10.8.2`)
- Angular CLI (optional; the project runs via `ng` scripts)

**Install & run**
```bash
npm install
npm start
```
Default dev server: `http://localhost:4200`

### Backend Proxy (recommended)

If backend runs on `http://localhost:8089` (Docker Compose mapping), create `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:8089",
    "secure": false,
    "changeOrigin": true
  },
  "/radio-ws": {
    "target": "http://localhost:8089",
    "secure": false,
    "changeOrigin": true,
    "ws": true
  }
}
```

Run with proxy:
```bash
npm start -- --proxy-config proxy.conf.json
```

### Project Structure (high level)

```
src/
├── app/
│   ├── core/                 # singleton services (auth, api clients, websocket, player state)
│   ├── shared/               # reusable UI components (mini-player, global-player, online-listeners, chat widgets)
│   ├── features/
│   │   └── public/           # pages: radio, login, register, profile, chat
│   ├── app.*                 # root component/module + routing bootstrap
│   └── styles/               # global styles (dark theme, blur/glass effects)
├── e2e/                       # Playwright E2E tests
└── playwright.config.ts       # Playwright configuration
```

### Key Implementation Decisions

| Decision | Rationale |
|----------|-----------|
| Angular Router with routes `/radio`, `/login`, `/register`, `/profile` | Simple, explicit navigation for main flows |
| Player state lives in a singleton service (`BehaviorSubject`) | Playback continues across route changes |
| JWT attached via interceptor (or centralized auth service) | Consistent auth handling for protected endpoints |
| Single WebSocket/STOMP service | One place to manage connect/reconnect + topic subscriptions |
| Cover-art-based UI background (blur/dim) | Reinforces “Now Playing” and improves visual identity |
| Proxy config for local dev | Avoids CORS and matches reviewer setup |

---

## API Integration (Frontend View)

> Endpoint names must match the backend implementation. Below is the **expected integration contract** based on current Dubcast UI features.

### Auth
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/register` | Register a new user |

### Profile
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/profile/me` | Get current user profile |
| PUT/PATCH | `/api/profile/username` | Update username |
| PUT/PATCH | `/api/profile/bio` | Update bio |
| GET | `/api/profile/public/{username}` | Public profile snippet for chat popover |

### Radio / Now Playing
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/radio/now` | Current track (title/artwork + timing data) |

### Chat (REST + WebSocket)
| Channel | Endpoint | Purpose |
|---|---|---|
| GET | `/api/chat/messages/page?page=N&size=S` | Load paged message history |
| WS app | `/app/chat.send` | Send a message |
| WS topic | `/topic/chat` | Receive chat messages |

### Analytics / Online listeners
| Channel | Endpoint | Purpose |
|---|---|---|
| WS app | `/app/analytics.heartbeat` | “I am listening” heartbeat |
| WS topic | `/topic/analytics/online` | Receive current online count |
| (optional) GET | `/api/admin/analytics/online` | Diagnostics (not required for Listener UI) |

---

## User Flows

### Guest / Authentication
1. Open the app.
2. Navigate to `/login` or `/register`.
3. Submit form (client validation → API call).
4. On success → redirect to `/radio` and store JWT.

### Listener (Radio)
1. Open `/radio`.
2. UI loads **Now Playing** and renders cover art.
3. User presses **Play** → stream starts.
4. Volume changes update the player service state.
5. “Now playing” updates refresh the UI (poll or WS topic depending on backend).

### Chat + Public Profile
1. User opens chat on Radio page.
2. Messages arrive from `/topic/chat`.
3. Hover/click on username → UI requests `/api/profile/public/{username}` and shows a popover (bio + links).

---

## Testing

### Unit Tests
Run once (no watch):
```bash
npm test
# or
ng test --watch=false
```

### E2E Smoke Tests (Playwright)
Configured in `src/playwright.config.ts` and executed via scripts:

```bash
npm run e2e
npm run e2e:ui
```

Typical smoke coverage:
- `/radio` page opens
- `/login` page opens

---

## Requirements Checklist

| # | Requirement | Status | Evidence/Notes |
|---|-------------|--------|----------------|
| 1 | Listener SPA with radio + auth + profile + chat | ✅ | Angular pages and routing for core flows |
| 2 | REST integration for Now Playing and profile data | ✅ | Angular services calling `/api/**` |
| 3 | Real-time chat and online counter | ✅ | STOMP/SockJS subscriptions + send endpoints |
| 4 | Reusable UI components | ✅ | Shared player widgets, online indicator, chat components |
| 5 | Basic automated tests (unit + e2e smoke) | ✅ | `npm test` + Playwright (`npm run e2e`) |
| 6 | Mobile browser support | ⚠️ | Best-effort responsive layout; not fully validated on real devices |
| 7 | Admin UI | ❌ | Out of scope by design (Swagger UI on backend is used instead) |

---

## Known Limitations

| Limitation | Impact | Potential Solution |
|------------|--------|-------------------|
| Mobile UX not fully tested on real devices | Some UI details may require polishing on small screens | Manual device testing + responsive improvements |
| SoundCloud metadata availability can change | Import/metadata flows may fail if page structure changes | Add fallback parsing or switch to official APIs where available |
| SockJS fallback noise (iframe route) may appear | Console warnings; functional impact is low | Ensure WS endpoint mapping + proxy configuration |

---

## References

- Angular docs (Router, HttpClient, DI)
- PrimeNG / PrimeIcons docs
- STOMPJS + SockJS docs
- Playwright docs
