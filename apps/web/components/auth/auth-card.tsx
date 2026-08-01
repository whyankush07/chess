"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import AuthForm from "./auth-form";

type Mode = "signin" | "signup";

const modes: { id: Mode; label: string }[] = [
  { id: "signin", label: "Sign In" },
  { id: "signup", label: "Sign Up" },
];

export default function AuthCard() {
  const [mode, setMode] = useState<Mode>("signin");

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {mode === "signin" ? "Welcome back" : "Join the game"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to continue to your games"
            : "Create an account and start playing"}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 rounded-none border border-border bg-muted p-1">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "cursor-pointer rounded-none py-2 text-xs font-semibold uppercase tracking-widest transition-colors",
              mode === m.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <AuthForm key={mode} mode={mode} />
    </div>
  );
}
