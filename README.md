# One Move Away

Daily cooperative light-bending puzzle for Reddit (Devvit Web).

Communities share one 7×7 machine each day. Every player gets **3 moves**. Nobody can finish alone — the crystal only activates when people coordinate.

## Stack

- Devvit Web (React + Hono + Vite + Tailwind)
- Shared TypeScript game engine in `src/shared`
- Redis / Realtime / Scheduler (coming in later days)

## Day 1 status

- [x] Devvit React scaffold
- [x] Shared types + constants
- [x] Board helpers + 7×7 validation (49 cells, 1 source, 1 crystal)

## Commands

```bash
npm install
npm run test:types
npm run test:unit
npm run dev          # playtest on Reddit (requires Devvit login)
```

## Project layout

- `src/client` — React UI (splash + game)
- `src/server` — Hono API
- `src/shared` — board model, later beam engine / solver
