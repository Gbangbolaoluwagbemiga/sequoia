import { Navbar } from "@/components/Navbar";
import { GameBucket } from "@/components/GameBucket";

export default function GamePage({ params }: { params: { id: string } }) {
    // In Next.js 15, params might be a Promise, but let's assume standard App Router behavior for now.
    // We'll wrap it to be safe or use simple prop access if types allow.

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="flex flex-col items-center p-12">
                <h1 className="text-4xl font-bold mb-8">Game Lobby #{params.id}</h1>
                <GameBucket sessionId={BigInt(params.id)} />
            </main>
        </div>
    );
}
