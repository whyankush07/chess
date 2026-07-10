'use client';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Page() {

  const router = useRouter();
  return (
    <div className="min-h-screen w-full flex justify-around items-center bg-neutral-100">
      <img src={"/chessboard.jpg"} alt="Chessboard" fetchPriority="high" className="h-auto w-96" width={500} height={500} />
      <div className="text-3xl font-bold flex flex-col items-center">
        <div className="">Chess</div>
        <div>Play a game of chess</div>
        <Button onClick={() => router.push("/game")} className="mt-4">Start Game</Button>
      </div>
    </div>
  )
} 