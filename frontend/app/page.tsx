import { Navbar } from "@/components/Navbar";
import { CreateSession } from "@/components/CreateSession";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [joinId, setJoinId] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (joinId) router.push(`/game/${joinId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex flex-col items-center justify-center p-12 text-center">
        <h1 className="text-6xl font-bold mb-4">
          Payeer <span className="text-blue-500">Roulette</span>
        </h1>
        <p className="text-xl mb-12 max-w-2xl text-muted-foreground">
          The fairest way to split the bill on Base. Winner takes all.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl text-left">

          <CreateSession />

          <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Join a Session</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Session ID</label>
                <input
                  type="number"
                  placeholder="0"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="w-full p-3 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleJoin}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold py-3 px-6 rounded-lg transition-all"
              >
                Join Game
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
