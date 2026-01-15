'use client';
import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PAYEER_ADDRESS, PAYEER_ABI } from '../constants';
import { formatEther } from 'viem';

export function GameBucket({ sessionId }: { sessionId: bigint }) {
    const { data: sessionData, refetch } = useReadContract({
        address: PAYEER_ADDRESS,
        abi: PAYEER_ABI,
        functionName: 'getSession',
        args: [sessionId],
    });

    const { data: participants, refetch: refetchParticipants } = useReadContract({
        address: PAYEER_ADDRESS,
        abi: PAYEER_ABI,
        functionName: 'getParticipants',
        args: [sessionId],
    });

    const { writeContract, data: hash, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isSuccess) {
            refetch();
            refetchParticipants();
        }
    }, [isSuccess]);

    if (!sessionData) return <div>Loading Session...</div>;

    const [entryFee, isActive, winner, totalPool, participantCount] = sessionData;

    const handleJoin = () => {
        writeContract({
            address: PAYEER_ADDRESS,
            abi: PAYEER_ABI,
            functionName: 'joinSession',
            args: [sessionId],
            value: entryFee,
        });
    };

    const handleSpin = () => {
        writeContract({
            address: PAYEER_ADDRESS,
            abi: PAYEER_ABI,
            functionName: 'spinWheel',
            args: [sessionId],
        });
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Stats Card */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 text-muted-foreground">Session Stats</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Entry Fee:</span>
                            <span className="font-mono">{formatEther(entryFee)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Pool:</span>
                            <span className="font-mono text-green-500">{formatEther(totalPool)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={isActive ? "text-blue-500" : "text-red-500"}>
                                {isActive ? "Active" : "Closed"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions Card */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-center gap-4">
                    {isActive ? (
                        <>
                            <button
                                onClick={handleJoin}
                                disabled={isPending || isConfirming}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors"
                            >
                                Join Game ({formatEther(entryFee)} ETH)
                            </button>
                            {/* Only show spin if user is creator? Or anyone? Contract allows anyone to spin currently if participants > 0 */}
                            {Number(participantCount) > 0 && (
                                <button
                                    onClick={handleSpin}
                                    disabled={isPending || isConfirming}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg transition-colors mt-2"
                                >
                                    SPIN THE WHEEL
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-yellow-500 mb-2">WINNER</h3>
                            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 break-all font-mono">
                                {winner}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Participants List */}
            <div className="w-full bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-4">Participants ({Number(participantCount)})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {participants?.map((p, i) => (
                        <div key={i} className="p-3 bg-background rounded border border-border font-mono text-sm truncate">
                            {p}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
