'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

type Player = {
    name: string
    team: string
    image: string
    currentKills: number
    previousTournamentKills: number
    exTeams: string[]
}

export default function PlayerModal({
    player,
    onClose
}: {
    player: Player
    onClose: () => void
}) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                key="backdrop"
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                style={{ backdropFilter: 'blur(14px)', backgroundColor: 'rgba(0,0,0,0.65)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
            >
                {/* Modal Panel */}
                <motion.div
                    key="panel"
                    className="bg-zinc-950 border border-purple-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 max-w-2xl w-full relative overflow-hidden shadow-2xl shadow-purple-500/10"
                    initial={{ opacity: 0, scale: 0.88, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, y: 24 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Glow accent */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Player Image */}
                    <div className="flex-shrink-0 flex items-start justify-center md:justify-start">
                        <img
                            src={player.image}
                            alt={player.name}
                            className="w-full md:w-52 h-52 object-cover rounded-xl border border-white/5 relative z-10"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=581c87&color=e9d5ff&size=256&bold=true&font-size=0.45`;
                            }}
                        />
                    </div>

                    {/* Player Info */}
                    <div className="text-white flex flex-col justify-center relative z-10 flex-1">
                        <div className="mb-6">
                            <p className="text-purple-400 text-xs font-bold tracking-[0.3em] uppercase mb-1">PRO ATHLETE</p>
                            <h2 className="text-4xl font-black tracking-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                {player.name}
                            </h2>
                            <p className="text-zinc-400 font-medium tracking-wide">{player.team}</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-zinc-500 text-sm">Current Tournament Kills</span>
                                <span className="text-white font-bold">{player.currentKills}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-zinc-500 text-sm">Previous Tournament Kills</span>
                                <span className="text-white font-bold">{player.previousTournamentKills}</span>
                            </div>

                            {player.exTeams && player.exTeams.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Ex Teams</p>
                                    <div className="flex flex-wrap gap-2">
                                        {player.exTeams.map((team, index) => (
                                            <span key={index} className="bg-white/5 px-3 py-1 rounded-full text-xs text-zinc-300 border border-white/5">
                                                {team}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <motion.button
                            onClick={onClose}
                            className="w-full bg-purple-600 py-3 rounded-xl font-bold hover:bg-purple-500 transition-colors duration-200 shadow-lg shadow-purple-600/20"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            DISMISS
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
