'use client';

import { motion } from 'framer-motion';

type Player = {
  name: string
  team: string
  kills: number
  matches: number
  damage: number
  kd: number
  image: string
}

export default function PlayerCard({
  player,
  onClick
}: {
  player: Player
  onClick?: () => void
}) {
  return (
    <motion.div
      onClick={onClick}
      className="cursor-pointer bg-black/40 backdrop-blur-md rounded-xl p-4 text-white border border-white/10 relative overflow-hidden group"
      whileHover={{
        scale: 1.05,
        borderColor: 'rgba(168, 85, 247, 0.4)',
        transition: { type: 'spring', stiffness: 400, damping: 22 }
      }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hover glow overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.06) 0%, transparent 100%)' }} />

      <img
        src={player.image}
        alt={player.name}
        className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-2 border-white/10 group-hover:border-purple-500/40 transition-colors duration-300"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=3b0764&color=e9d5ff&size=256&bold=true&font-size=0.45`;
        }}
      />

      <h3 className="text-base font-bold text-center mb-0.5">{player.name}</h3>
      <p className="text-xs text-center text-gray-400 mb-3">{player.team}</p>

      <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-300">
        <p className="bg-white/5 p-1.5 rounded-lg text-center">
          <span className="block text-[10px] text-gray-500 uppercase tracking-wide leading-none mb-0.5">Kills</span>
          {player.kills}
        </p>
        <p className="bg-white/5 p-1.5 rounded-lg text-center">
          <span className="block text-[10px] text-gray-500 uppercase tracking-wide leading-none mb-0.5">Matches</span>
          {player.matches}
        </p>
        <p className="bg-white/5 p-1.5 rounded-lg text-center">
          <span className="block text-[10px] text-gray-500 uppercase tracking-wide leading-none mb-0.5">Damage</span>
          {(player.damage / 1000).toFixed(1)}k
        </p>
        <p className="bg-white/5 p-1.5 rounded-lg text-center">
          <span className="block text-[10px] text-gray-500 uppercase tracking-wide leading-none mb-0.5">K/D</span>
          {player.kd}
        </p>
      </div>
    </motion.div>
  )
}
