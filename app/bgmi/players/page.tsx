import { BGMIPlayerCard } from "@/components/BGMIPlayerCard";
import { bgmiPlayers } from "@/data/bgmiPlayers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PlayersPage() {
  return (
    <div className="min-h-screen bg-black px-4 py-8 pb-32 pt-24 text-white sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,170,0,0.05)_0%,rgba(0,0,0,0)_70%)]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/bgmi"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-orange-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to BGMI Portal
            </Link>
            <h1 className="text-4xl font-black uppercase tracking-widest text-white sm:text-5xl md:text-6xl">
              TOP <span className="text-orange-500">20</span> PLAYERS
            </h1>
            <p className="mt-2 text-lg text-gray-400">
              The legends of Battlegrounds Mobile India. Verified stats and real action.
            </p>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bgmiPlayers.map((player) => (
            <BGMIPlayerCard
              key={player.ign}
              ign={player.ign}
              team={player.team}
              mvpTitles={player.mvpTitles}
              image={player.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
