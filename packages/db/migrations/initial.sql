CREATE TYPE "GameStatus" AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'ABANDONED'
);

CREATE TYPE "GameResult" AS ENUM (
    'WHITE_WINS',
    'BLACK_WINS',
    'DRAW'
);

CREATE TYPE "TimeControl" AS ENUM (
    'CLASSICAL',
    'RAPID',
    'BLITZ',
    'BULLET'
);

CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "username" TEXT UNIQUE NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "rating" INT NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP
);

CREATE TABLE "Game" (
    "id" TEXT PRIMARY KEY,
    "whitePlayerId" TEXT NOT NULL,
    "blackPlayerId" TEXT NOT NULL,
    "status" "GameStatus" NOT NULL,
    "result" "GameResult",
    "timeControl" "TimeControl" NOT NULL,
    "startingFen" TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    "currentFen" TEXT,
    "startAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "endAt" TIMESTAMP,
    "opening" TEXT,
    "event" TEXT,
    FOREIGN KEY ("whitePlayerId") REFERENCES "User"("id"),
    FOREIGN KEY ("blackPlayerId") REFERENCES "User"("id")
);

CREATE TABLE "Move" (
    "id" TEXT PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "moveNumber" INT NOT NULL,
    "notation" TEXT NOT NULL,
    "comments" TEXT,
    "startFen" TEXT NOT NULL,
    "endFen" TEXT NOT NULL,
    "timeTaken" INT DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("gameId") REFERENCES "Game"("id")
);
