'use client';

import { motion } from 'framer-motion';

interface PlayerOverlayProps {
    player: {
        id: string;
        name: string;
        team: string;
        role: string;
        total_kills: number;
        headshot_rate: string;
        bio: string;
        image: string;
    };
    onClose: () => void;
}

export default function PlayerOverlay({ player, onClose }: PlayerOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-12 overflow-hidden"
        >
            <button
                onClick={onClose}
                className="absolute top-8 right-8 z-50 text-white/50 hover:text-white text-4xl hover:scale-110 transition-all font-light"
            >
                ×
            </button>

            <motion.div
                className="relative w-full max-w-6xl h-full max-h-[800px] flex flex-col md:flex-row items-center justify-between"
                initial={{ y: 50, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 50, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.1 }}
            >
                {/* Left Panel: Dense Typography & Stats */}
                <div className="w-full md:w-1/2 flex flex-col justify-center z-20 pb-12 md:pb-0 px-4 md:px-0">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                        className="text-xs uppercase tracking-[0.4em] text-[#F3AF19] mb-4"
                        style={{ fontFamily: 'Exo 2, sans-serif' }}
                    >
                        {player.team} · {player.role}
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                        className="text-7xl md:text-[8rem] font-black leading-none mb-8 uppercase"
                        style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            textShadow: '0 0 40px rgba(243,175,25,0.3)'
                        }}
                    >
                        {player.name}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        className="text-lg text-white/60 mb-12 max-w-md leading-relaxed"
                        style={{ fontFamily: 'Exo 2, sans-serif' }}
                    >
                        {player.bio}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                        className="flex gap-12"
                    >
                        <div>
                            <div className="text-xs text-[#F3AF19] mb-2 tracking-[0.2em]" style={{ fontFamily: 'Exo 2, sans-serif' }}>CAREER ELIMS</div>
                            <div className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{player.total_kills.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-xs text-[#F3AF19] mb-2 tracking-[0.2em]" style={{ fontFamily: 'Exo 2, sans-serif' }}>HEADSHOT RATE</div>
                            <div className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{player.headshot_rate}</div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Panel: Character Render */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
                    className="absolute md:relative right-0 md:w-1/2 h-[60vh] md:h-full z-10 opacity-20 md:opacity-100 flex justify-end"
                >
                    {/* Placeholder for Character Render - Utilizing a generic silhouette or generated image later */}
                    <div className="w-full h-full bg-gradient-to-t from-black via-transparent to-transparent absolute inset-0 z-20 md:hidden" />
                    <img
                        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000"
                        alt={player.name}
                        className="h-full object-cover md:object-contain object-right"
                        style={{ filter: 'drop-shadow(-20px 0 30px rgba(0,0,0,0.8))' }}
                    />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
