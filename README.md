# Hotel Suspect

Mobile-first, icon-only social deduction game for hotel guests. One authoritative Node server, phones join over the local network.

## Run on phones

Connect the laptop and every phone to the **same Wi-Fi or phone hotspot**.

```sh
npm install
npm start          # builds client + server, serves both on :3000 (PORT=… to change)
```

The terminal prints the Network URL and a QR code. Scan it with a phone.

For development, `npm run dev` starts the server with reload and Vite with hot reload. Open Vite's **Network** URL (port 5173) on the phone.

If a phone can't load the page, the network is probably blocking device-to-device traffic (common on venue Wi-Fi). Use your own phone hotspot instead.

## Scripts

| Script               | What it does                         |
| -------------------- | ------------------------------------ |
| `npm run check`      | lint + typecheck + all tests         |
| `npm test`           | Vitest across shared, server, client |
| `npm run test:watch` | Vitest in watch mode                 |
| `npm run lint`       | ESLint (includes leak-guard rules)   |
| `npm run format`     | Prettier                             |

## Layout

- `shared/`: protocol types, zod schemas, constants (imported as TS source)
- `server/`: Socket.IO server, game engine, visibility projection, bots
- `client/`: React + Vite, SVG map

The server never broadcasts. Every message to a client is a per-player projection sent from `server/src/net/outbox.ts`, and ESLint enforces this.
