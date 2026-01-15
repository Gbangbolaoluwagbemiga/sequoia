'use client';
import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { useRouter } from 'next/navigation';
import { PAYEER_ADDRESS, PAYEER_ABI } from '../constants';

export function CreateSession() {
    const [entryFee, setEntryFee] = useState('0.001');
    const router = useRouter();
    const { data: hash, writeContract, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const handleCreate = async () => {
        if (!entryFee) return;
        writeContract({
            address: PAYEER_ADDRESS,
            abi: PAYEER_ABI,
            functionName: 'createSession',
            args: [parseEther(entryFee)],
        });
    };

    return (
        <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Start a Roulette</h2>
            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Entry Fee (ETH)</label>
                    <input
                        type="number"
                        step="0.0001"
                        value={entryFee}
                        onChange={(e) => setEntryFee(e.target.value)}
                        className="w-full p-3 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary"
                    />
                </div>

                <button
                    onClick={handleCreate}
                    disabled={isPending || isConfirming}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-all"
                >
                    {isPending ? 'Confirming...' : isConfirming ? 'Creating...' : 'Create Session'}
                </button>

                {isSuccess && (
                    <div className="text-green-500 text-sm mt-2">
                        Session Created! Check events/logs for ID (Indexing not implemented yet).
                        {/* Ideally we capture the event here to route the user */}
                    </div>
                )}
            </div>
        </div>
    );
}
