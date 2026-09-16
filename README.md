# Active Chat

Private, live chat rooms without accounts or message history.

Active Chat is a TanStack Start application deployed to Cloudflare Workers. Each room is a Cloudflare Durable Object that coordinates its active WebSocket participants. It broadcasts messages and typing state only; it never stores messages or participants. Password-protected rooms store only an AES-GCM encrypted random bootstrap value so browsers can validate a password locally.

## Architecture

- **TanStack Start + React:** file-based client and server routes, bundled by Vite.
- **Cloudflare Workers:** serves the application, session endpoints, and the WebSocket upgrade route.
- **One Durable Object per room:** deterministic room routing, hibernating WebSockets, and live broadcast.
- **Cookie-only identity:** a signed, `HttpOnly`, `SameSite=Lax` cookie holds an anonymous display name and random ID. There is no OAuth provider, user database, or browser-stored auth token.
- **Optional password rooms (work in progress):** AES-GCM encrypts messages and live typing on-device. The Worker sees ciphertext and encrypted bootstrap data only; passwords, password hashes, plaintext bootstrap values, and decryption results never leave the browser.
- **PWA shell cache:** the service worker caches same-origin static assets, never HTML navigation responses or `/api/*` responses. That keeps installed app startup fast without caching personalized pages or chat traffic.

## Local development

Requirements: Bun and a current Node.js runtime supported by the TanStack/Vite toolchain.

```sh
bun install
cp .env.example .dev.vars
# Replace SESSION_SECRET with a long random value.
bun run dev
```

Open `http://localhost:3000`. The Cloudflare Vite plugin provides the Worker and Durable Object bindings in local development.

## Deploy

Create a Worker secret before deploying. Do not put the secret in `wrangler.jsonc` or commit `.dev.vars`.

```sh
wrangler secret put SESSION_SECRET
bun run deploy
```

`wrangler.jsonc` declares the `CHAT_ROOMS` Durable Object binding and the `chat-rooms-v1` SQLite migration. Messages are never written to storage. Password rooms persist only their encrypted bootstrap ciphertext so a later participant can check the password locally.

## Verification

```sh
bun run check
```

Open one room in two browser windows. Messages and typing indicators should appear in both. Reloading or leaving a room intentionally clears its client-side transcript; no previous messages are replayed.

## Security and privacy model

Room names are shared secrets, not access-control credentials. Anyone who knows a room name can join it. The Worker verifies the signed session cookie before forwarding a WebSocket upgrade to the Durable Object; the browser cannot select another participant identity through the WebSocket protocol.

Messages are ephemeral. Open rooms are relayed as plain WebSocket messages; password rooms are encrypted end-to-end with AES-GCM before reaching Cloudflare. The server cannot validate a password or distinguish a valid encrypted sender from arbitrary ciphertext. The supported client only enables sending once it has successfully decrypted the room's encrypted bootstrap value.

## Project structure

```text
src/
  routes/                       # TanStack Start pages and Worker endpoints
  durable-objects/chat-room.ts  # hibernating, per-room WebSocket coordinator
  lib/session.ts                # signed cookie creation and verification
  server.ts                     # Start server entry and DO export
public/service-worker.js        # static-asset-only cache policy
wrangler.jsonc                  # Worker + Durable Object deployment config
```

## License

MIT. See [LICENSE](LICENSE).
