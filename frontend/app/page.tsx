import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex flex-col items-center justify-center p-24 text-center">
        <h1 className="text-6xl font-bold mb-8">
          Payeer <span className="text-blue-500">Roulette</span>
        </h1>
        <p className="text-xl mb-8 max-w-2xl">
          The fairest way to split the bill. Create a session, invite friends, deposit funds, and spin the wheel. Winner takes all (or pays all!).
        </p>

        <div className="flex gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            Create Session
          </button>
          <button className="border border-gray-600 hover:border-gray-400 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            Join Session
          </button>
        </div>
      </main>
    </div>
  );
}
