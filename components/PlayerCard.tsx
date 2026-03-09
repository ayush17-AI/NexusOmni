'use client';

import { motion } from 'framer-motion';
const TEAM_COLORS: Record<string, { accent: string; border: string; badge: string; text: string }> = {
  "GodLike Esports": { accent: "from-emerald-500/20", border: "border-emerald-500/40", badge: "bg-emerald-900/60 text-emerald-300 border-emerald-500/30", text: "text-emerald-400" },
  "iQOO Team SouL": { accent: "from-violet-500/20", border: "border-violet-500/40", badge: "bg-violet-900/60 text-violet-300 border-violet-500/30", text: "text-violet-400" },
  "Revenant XSpark": { accent: "from-orange-500/20", border: "border-orange-500/40", badge: "bg-orange-900/60 text-orange-300 border-orange-500/30", text: "text-orange-400" },
};

const DEFAULT_COLORS = { accent: "from-zinc-500/20", border: "border-zinc-700", badge: "bg-zinc-800 text-zinc-300 border-zinc-600", text: "text-zinc-400" };

export default function PlayerCard({ player, onClick }: { player: any; onClick?: () => void }) {
  const finishContribution = ((player.totalKills / player.teamTotalKills) * 100).toFixed(1);
  const colors = TEAM_COLORS[player.team] ?? DEFAULT_COLORS;

  return (
    <motion.div
      layout
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.03 }}
      className={`relative overflow-hidden cursor-pointer rounded-2xl bg-zinc-900 border ${colors.border} flex flex-col shadow-lg transition-colors duration-300 hover:shadow-2xl group`}
    >
      {/* Top Glow Accent */}
      <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${colors.accent} to-transparent pointer-events-none`} />

      {/* Player Avatar */}
      <div className="relative flex flex-col items-center pt-8 pb-4 px-6">
        <div className={`w-24 h-24 mb-4 rounded-full overflow-hidden border-2 ${colors.border} bg-zinc-800 shadow-lg`}>
          <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
        </div>
        <h3 className="text-xl font-extrabold text-white tracking-wide mb-0.5">{player.name}</h3>
        <p className="text-zinc-400 text-xs mb-3">{player.realName}</p>

        {/* Team + Role badges */}
        <div className="flex flex-wrap gap-2 justify-center mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${colors.badge}`}>{player.team}</span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800/60 text-zinc-300">{player.role}</span>
        </div>

        {/* Bio */}
        {player.bio && (
          <p className="text-zinc-500 text-xs text-center leading-relaxed line-clamp-3 mb-2">
            {player.bio}
          </p>
        )}
      </div>

      {/* Stats Panel */}
      <div className="bg-zinc-950/80 mx-4 mb-4 rounded-xl p-4 space-y-2.5 border border-zinc-800/50">
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-500">Total Elims</span>
          <span className={`font-bold text-lg ${colors.text}`}>{player.totalKills}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-500">Team Elims</span>
          <span className="text-zinc-300 font-medium">{player.teamTotalKills}</span>
        </div>
        <div className="h-px bg-zinc-800 my-1" />
        {/* Contribution bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400 font-medium">Kill Contribution</span>
            <span className="text-amber-400 font-bold text-base">{finishContribution}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-700"
              style={{ width: `${finishContribution}%` }}
            />
          </div>
        </div>
      </div>

      {/* Hover Glitch / Glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(243,175,25,0.05) 0%, transparent 100%)'
        }}
      />
    </motion.div>
  );
}
