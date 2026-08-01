# ♜ Chess

A real-time multiplayer chess platform. Two people open the app, get paired, and play a game of chess move-by-move over WebSockets. The server validates every move, the client updates instantly, and moves are streamed through Redis for async processing.

## Current Architecture

```
Browser (Next.js)                 Node.js WebSocket Server              Redis
┌────────────────────┐           ┌──────────────────────────┐       ┌──────────┐
│  Landing Page (/)  │           │  WebSocket Server :8080  │       │ Streams  │
│         │          │           │                          │       │ game:    │
│  /game              │           │  GameManager              │       │ moves    │
│   opens WS ────────┼──────────▶│   ├─ pendingUser         │       └──────────┘
│         │          │           │   ├─ users[]             │            ▲
│  /game/[gameId]    │           │   └─ games[]             │            │
│   ChessBoard       │           │         │                │            │
│   useChess()       │           │    Game (chess.js)       │────────────┘
│   useSocket()      │◀──MOVE────│    ├─ makeMove()         │
│                    │           │    ├─ turn validation    │       ┌──────────┐
│                    │           │    └─ game-over check    │       │PostgreSQL│
│                    │           │                          │       │(schema   │
│   @repo/types      │           │   @repo/db ──────────────┼──────▶│ ready,   │
│   @repo/ui         │           │                          │       │ unwired) │
└────────────────────┘           └──────────────────────────┘       └──────────┘
												 │
												 │ consumes
												 ▼
											 ┌──────────────┐
											 │ History      │
											 │ Worker       │
											 │ (subscriber) │
											 └──────────────┘
```

## ER Diagram

![ER diagram of the tables](ER.png)

### How it plays

1. A user opens the app and clicks **Start Game** → lands on `/game`.
2. Hitting **New Game** opens a WebSocket to `localhost:8080` and sends `init_game`.
3. The **GameManager** pairs the first two players who arrive — first is White, second is Black.
4. Both receive an `INIT_GAME` message with their assigned `gameId` and `color`.
5. They land on `/game/[gameId]` which renders the **ChessBoard** component.
6. Clicking a piece shows legal moves (computed locally via `chess.js` for instant feedback). Clicking a valid destination sends a `move` over the WebSocket.
7. The server's `Game` class validates the move (turn ownership, legality via `chess.js`), forwards the `MOVE` to the opponent, and publishes the event to a Redis stream (`game:moves`) for future async persistence.
8. The opponent's board updates immediately when the `MOVE` arrives.

### Key modules

| Module | Role |
|---|---|
| **apps/web** | Next.js 16 frontend — landing, lobby, game board, WebSocket client |
| **apps/native** | Node.js WebSocket server — game matching, authoritative move validation, Redis publishing |
| **apps/history-worker** | Redis Streams consumer — subscribes to `game:moves` for async history processing |
| **packages/db** | PostgreSQL client + schema (`User`, `Game`, `Move` tables) — prepared but not yet wired into game flow |
| **packages/types** | Shared TypeScript types and message constants (`INIT_GAME`, `MOVE`, `GAME_OVER`, etc.) |
| **packages/ui** | Shared React component stubs |

### Stack

Turborepo · Yarn 4 · Next.js 16 · React 19 · TypeScript 5.9 · Tailwind CSS v4 · shadcn/ui · chess.js · ws · ioredis · PostgreSQL · Redis Streams

---

## Future Plans

### Infra / Scaling

- **Redis** — session store, pub-sub for cross-instance move broadcast, matchmaking queue, rate limiting
- Horizontal scaling of native WS servers behind a load balancer (sticky sessions or Redis pub-sub to desync game state from a single instance)
- **Message queue** (Kafka / RabbitMQ / SQS) for async jobs — game history writes, rating recalculation, email/notification dispatch
- Separate microservices: **auth-service**, **game-service**, **matchmaking-service**, **history-service**, **notification-service**
- **API Gateway** in front of services (routing, auth verification, rate limiting)
- **Service discovery** (Consul / etcd) once the system is multi-service
- **CDN** for static assets (board themes, piece sets, sounds)

### Auth

- Dedicated auth service — JWT issuance/refresh, OAuth (Google/GitHub), session management
- Auth middleware shared across services (verify JWT at gateway or per-service)
- **RBAC** for admin/moderator roles (ban, review reported games)

### Data / Persistence

- Separate DB per service (or schema separation) — auth-db, game-db, billing-db
- **Read replicas** for game history / leaderboard queries
- Time-series or partitioned tables for move history at scale
- **Caching layer** (Redis) for hot data — active games, leaderboards, user profiles

### Real-time / Pub-Sub

- **Redis Pub/Sub** or NATS for broadcasting moves across horizontally-scaled WS servers
- WebSocket connection registry in Redis (which server holds which user's socket)
- **Presence system** (online/offline/in-game status) via Redis
