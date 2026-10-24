# ♟ Chess Mobile App

A native Expo + React Native mobile application for the real-time chess platform, compatible with Expo Go and powered by the existing backend API and WebSocket game engine.

---

## Overview

The mobile application replicates the functionality, rules, authentication, and real-time multiplayer chess interactions of the Next.js web frontend (`apps/web`):
- **Matchmaking & Game Lobby:** Fast pairing via real-time WebSocket protocol (`INIT_GAME`).
- **Live Board & Game Mechanics:** Dynamic touch chessboard with piece selection, legal move indicators, check alerts, checkmate/draw detection, last move highlighting, and board orientation flipping.
- **Move Synchronization:** Instant bi-directional move streaming via WebSockets with verbose SAN move history.
- **Authentication:** Sign in and Sign up flows connecting to the Express auth server, persisting session state for matchmaking.

---

## Technology Stack

- **Framework:** Expo (SDK 58)
- **Core Runtime:** React Native (0.88.0) & React (19.2.0)
- **Language:** TypeScript
- **State & Rules Engine:** `chess.js` (1.4.0)
- **Navigation:** `@react-navigation/native` & `@react-navigation/native-stack`
- **Storage:** `@react-native-async-storage/async-storage`
- **Dependency & Monorepo Manager:** Yarn Workspaces

---

## Repository Map

```
apps/mobile/
├── App.tsx                     # Application root with SafeArea, Toast, and Navigation providers
├── index.js                    # Entry point registering root component via Expo
├── app.json                    # Expo project configuration (Expo Go compatible)
├── metro.config.js             # Monorepo resolution config for Metro bundler
├── package.json                # Dependencies, workspace scripts, and metadata
├── tsconfig.json               # TypeScript compiler options and monorepo path aliases
├── .env.example                # Example environment variables template
├── .env                        # Local development environment configuration
├── .gitignore                  # Git ignore rules for build artifacts and dependencies
├── README.md                   # Mobile application documentation and setup guide
└── src/
    ├── assets/                 # Static visual assets (chessboard hero image, app icons)
    │   ├── chessboard.jpg
    │   ├── icon.png
    │   ├── splash.png
    │   ├── adaptive-icon.png
    │   └── favicon.png
    ├── components/             # Reusable UI primitives and presentational components
    │   ├── Button.tsx          # Touch button with default/outline/ghost variants and loading state
    │   ├── ChessBoard.tsx      # Interactive touch chessboard with piece glyphs and move highlights
    │   ├── Input.tsx           # Text input with label and error styling
    │   ├── MoveHistory.tsx     # Scrollable move pair list with algebraic notation
    │   ├── PlayerBadge.tsx     # Player indicator with color dot, check and victory badges
    │   └── Toast.tsx           # In-app toast notification banner replacing web sonner
    ├── constants/              # Styling tokens and environment settings
    │   ├── colors.ts           # Shared color palette matching web design
    │   └── config.ts           # Centralized API and WebSocket endpoints with fallbacks
    ├── hooks/                  # Stateful logic and application hooks
    │   ├── useAuth.ts          # Authentication status, sign-in, and sign-up logic
    │   ├── useChess.ts         # Chess game state, FEN parsing, legal moves via chess.js
    │   └── useSocket.ts        # WebSocket listener registration and move dispatch
    ├── navigation/             # App routing and screen stack
    │   └── AppNavigator.tsx    # Native stack navigator connecting Home, Auth, Lobby, Game
    ├── screens/                # View containers
    │   ├── AuthScreen.tsx      # Sign In / Sign Up tabs and feature overview
    │   ├── GameLobbyScreen.tsx # Pre-game matchmaking lobby and board preview
    │   ├── GameScreen.tsx      # Active chess match with live board and move history
    │   └── HomeScreen.tsx      # Hero landing screen with board image and quick start CTA
    ├── services/               # Centralized networking and I/O
    │   ├── api/
    │   │   ├── auth.ts         # HTTP requests for /auth/signin and /auth/signup
    │   │   └── client.ts       # Base HTTP fetch wrapper with standardized error handling
    │   └── websocket/
    │       └── socket.ts       # Singleton WebSocket client with reconnect and event dispatch
    ├── types/                  # TypeScript interface declarations
    │   └── navigation.ts       # React Navigation root stack param list and prop types
    └── utils/                  # Reusable helper functions
        └── storage.ts          # Persistent storage helper for session user ID
```

---

## Prerequisites

- **Node.js:** v18 or newer
- **Yarn:** Monorepo package manager (Classic / v1 or v4)
- **Expo Go App:** Installed on your physical Android or iOS device from Google Play / App Store (optional if running in an Android Emulator or iOS Simulator).

---

## Installation

From the repository root:

```bash
yarn install
```

Or target the mobile workspace directly:

```bash
yarn --cwd apps/mobile install
```

---

## Environment Variable Configuration

Create or edit `apps/mobile/.env` based on `apps/mobile/.env.example`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_WS_URL=ws://localhost:8080
```

### Important Network Note for Devices & Emulators

- **`localhost` does NOT work on physical mobile devices.** Physical phones connect over Wi-Fi and cannot resolve your computer's `localhost`.
- **Physical Device:** Replace `localhost` with your computer's Local Area Network (LAN) IP address:
  ```env
  EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
  EXPO_PUBLIC_WS_URL=ws://192.168.1.100:8080
  ```
- **Android Emulator:** Android emulators use `10.0.2.2` to refer to the host development machine:
  ```env
  EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
  EXPO_PUBLIC_WS_URL=ws://10.0.2.2:8080
  ```
- **iOS Simulator:** Can use `http://localhost:8000` and `ws://localhost:8080` directly.

---

## Running the Application

### 1. Start the Expo Dev Server (Expo Go)

From the project root:

```bash
yarn --cwd apps/mobile start
```

Or from within `apps/mobile`:

```bash
yarn start
```

To explicitly force Expo Go mode and assign a dedicated port:

```bash
yarn expo start --go -p 8082
```

### 2. Open in Expo Go

- **Android:** Scan the terminal QR code using the Expo Go app.
- **iOS:** Scan the terminal QR code using the native Camera app, then tap the prompt to open in Expo Go.
- **Simulator / Emulator:** Press `a` in the terminal for Android or `i` for iOS simulator.

---

## Architecture & Integration

### HTTP API Client (`src/services/api/`)
- Reuses backend Express endpoints (`apps/server`):
  - `POST /auth/signup`: `{ username, email, password }`
  - `POST /auth/signin`: `{ email, password }`
- Saves signed-in `userId` in AsyncStorage so subsequent game sessions pass the authenticated user ID.

### WebSocket Service (`src/services/websocket/`)
- Connects to the WebSocket game server / proxy (`apps/ws-proxy` or `apps/native`):
  - Outgoing `init_game`: `{ type: "init_game", payload: { userId } }`
  - Outgoing `move`: `{ type: "move", payload: { from, to, san } }`
  - Incoming `init_game`: `{ type: "init_game", payload: { gameId, color, info } }`
  - Incoming `move`: `{ type: "move", payload: { from, to, san } }`
  - Incoming `game_over`: `{ type: "game_over", payload: { winner } }`
  - Incoming `info`: `{ type: "info", payload: { info } }`
- Managed as a singleton connection with listener subscriptions to prevent duplicate sockets during React re-renders.

### Chess Game Logic (`src/hooks/useChess.ts`)
- Powered by `chess.js` (identical engine to the web frontend).
- Computes legal moves, FEN representations, check, checkmate, stalemate, draw, and move history on device.

---

## Available Checks & Verification

### TypeScript Typecheck
```bash
yarn --cwd apps/mobile check-types
```

### Metro Bundle Verification
Test bundle compilation for Android:
```bash
yarn --cwd apps/mobile expo export --platform android --no-bytecode
```

---

## Troubleshooting & Known Limitations

1. **"Network request failed" / WebSocket connection drops:**
   Verify that your mobile device is on the exact same Wi-Fi network as your computer, and update `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_WS_URL` in `.env` to your machine's LAN IP address.
2. **Firewall / Port blocking:**
   Ensure incoming connections on port 8000 (API server), 8080/8081 (WebSocket server), and 8081/8082 (Expo Metro bundler) are allowed through your OS firewall.
3. **Expo Go Native Limitations:**
   The application uses 100% standard Expo Go-compatible packages (`@react-navigation`, `@react-native-async-storage/async-storage`, `react-native-screens`, `react-native-safe-area-context`). No native prebuild or custom development clients are needed.
