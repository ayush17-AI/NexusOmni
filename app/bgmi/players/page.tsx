'use client';

import { useState, useEffect } from "react";
import playerDataJson from "@/data/players.json";
import PlayerCard from "@/components/PlayerCard";

export default function PlayersPage() {
    const [playerData, setPlayerData] = useState<{ players: any[] }>({ players: [] });

    useEffect(() => {
        // Safe assignment dealing with both array and object formats depending on the imported json structure
        if (playerDataJson && typeof playerDataJson === 'object' && 'players' in playerDataJson) {
            setPlayerData(playerDataJson as { players: any[] });
        } else if (Array.isArray(playerDataJson)) {
            setPlayerData({ players: playerDataJson });
        }
    }, []);
    return (
        <div className="bg-transparent text-white font-sans selection:bg-emerald-500/30">
            <main className="w-full px-6 md:px-12 py-6 md:py-12">
                <div className="w-full px-6 md:px-12">
                    <header className="mb-12 border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-emerald-500 text-sm font-semibold tracking-widest uppercase">BGIS 2026 Wildcard Stage</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                                Player Standings
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-2xl">
                                Performance metrics for the top Tier 1 players currently active in the tournament.
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm font-medium">
                                <span className="text-zinc-400">Status:</span>
                                <span className="text-emerald-400">LIVE</span>
                            </span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                        {playerData?.players?.map((player: any) => (
                            <PlayerCard key={player.id} player={player} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
