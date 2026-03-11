"use client"

import { useEffect, useState } from "react"
import PlayerCard from "./PlayerCard"
import PlayerModal from "./PlayerModal"

export default function PlayersGrid() {
    const [players, setPlayers] = useState([])
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null)

    useEffect(() => {
        fetch("/api/players")
            .then(res => res.json())
            .then(data => setPlayers(data))
            .catch(err => console.error("Failed to fetch players:", err))
    }, [])

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full max-w-6xl">
                {players.map((player: any, index: number) => (
                    <PlayerCard
                        key={index}
                        player={player}
                        onClick={() => setSelectedPlayer(player)}
                    />
                ))}
            </div>

            {selectedPlayer && (
                <PlayerModal
                    player={selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                />
            )}
        </>
    )
}
