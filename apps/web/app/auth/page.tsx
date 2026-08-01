import Link from "next/link";
import { GiChessKnight, GiChessQueen, GiChessBishop } from "react-icons/gi";
import AuthCard from "@/components/auth/auth-card";

export const metadata = {
  title: "Sign In or Sign Up | Chess",
};

const features = [
  {
    icon: GiChessKnight,
    title: "Live Matches",
    text: "Get paired with a player and start playing in seconds.",
  },
  {
    icon: GiChessQueen,
    title: "Real-Time Play",
    text: "Every move streams instantly over WebSockets.",
  },
  {
    icon: GiChessBishop,
    title: "Game History",
    text: "Your completed games are recorded for review anytime.",
  },
];

export default function AuthPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <section className="relative flex flex-col justify-between overflow-hidden bg-neutral-950 p-8 text-neutral-100 sm:p-12">
        <div
          aria-hidden
          className="absolute inset-0 bg-[url('/chessboard.jpg')] bg-cover bg-center opacity-40"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/40 to-neutral-950"
        />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="font-heading text-2xl font-bold tracking-tight">
            Chess
          </Link>
          <span className="text-xs uppercase tracking-widest text-neutral-400">
            Multiplayer
          </span>
        </div>

        <div className="relative z-10 my-12">
          <h2 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
            Every move
            <br />
            matters.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-300 sm:text-base">
            Challenge players from around the world, think ahead, and claim your
            victory one move at a time.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-700 bg-neutral-900/60">
                <feature.icon className="size-5 text-neutral-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-100">
                  {feature.title}
                </p>
                <p className="text-sm text-neutral-400">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center bg-neutral-50 p-6 sm:p-12">
        <AuthCard />
      </section>
    </div>
  );
}
