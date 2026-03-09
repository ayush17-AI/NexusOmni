'use client';

import { motion } from 'framer-motion';

interface PlayerCardProps {
    player: {
        id: string;
        name: string;
        team: string;
        role: string;
        total_kills: number;
        headshot_rate: string;
    };
    onClick: () => void;
}

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
    return (
        <motion.div
            layout // Enable smooth sorting/filtering layout transitions
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="group relative cursor-pointer overflow-hidden rounded-xl p-5"
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
            }}
            whileHover={{
                scale: 1.05,
                borderColor: 'rgba(243,175,25,0.4)',
                background: 'rgba(243,175,25,0.05)',
            }}
        >
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] uppercase tracking-widest text-[#F3AF19]" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    {player.role}
                </span>
                <span className="text-[10px] text-white/40" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    {player.team}
                </span>
            </div>

            <h3
                className="text-3xl font-black mb-6 uppercase transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(243,175,25,1)]"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
                {player.name}
            </h3>

            <div className="flex gap-4 border-t border-white/10 pt-4">
                <div>
                    <div className="text-[9px] text-white/40 mb-1 tracking-wider" style={{ fontFamily: 'Exo 2, sans-serif' }}>ELIMS</div>
                    <div className="text-sm font-bold text-white/90" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{player.total_kills.toLocaleString()}</div>
                </div>
                <div>
                    <div className="text-[9px] text-white/40 mb-1 tracking-wider" style={{ fontFamily: 'Exo 2, sans-serif' }}>HS RATE</div>
                    <div className="text-sm font-bold text-white/90" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{player.headshot_rate}</div>
                </div>
            </div>

            {/* Hover Glitch / Glow overlay */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(243,175,25,0.1) 0%, transparent 100%)'
                }}
            />
        </motion.div>
    );
}
