'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface TeamCardProps {
    rank: number;
    name: string;
    tag: string;
    winRate: number;
    tier: string;
    kills: number;
    logo: string;
    index: number;
}

const TIER_COLORS: Record<string, string> = {
    Diamond: '#00F2FF',
    Platinum: '#9B59B6',
    Gold: '#F3AF19',
};

export default function TeamCard3D({ rank, name, tag, winRate, tier, kills, logo, index }: TeamCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 25 });
    const rotY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 25 });

    function onMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = ref.current!.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    }

    function onLeave() {
        mouseX.set(0);
        mouseY.set(0);
        setHovered(false);
    }

    const tierColor = TIER_COLORS[tier] ?? '#fff';

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.23, 1, 0.32, 1] }}
            style={{ perspective: 900 }}
        >
            <motion.div
                ref={ref}
                onMouseMove={onMove}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={onLeave}
                style={{
                    rotateX: rotX,
                    rotateY: rotY,
                    transformStyle: 'preserve-3d',
                    boxShadow: hovered
                        ? '0 0 32px rgba(243,175,25,0.45), 0 0 60px rgba(243,175,25,0.15)'
                        : '0 4px 24px rgba(0,0,0,0.5)',
                }}
                className="relative rounded-xl overflow-hidden cursor-pointer transition-shadow duration-500"
            >
                <div
                    className="relative p-6 rounded-xl"
                    style={{
                        background: 'rgba(26,26,26,0.88)',
                        border: hovered ? '1px solid rgba(243,175,25,0.5)' : '1px solid #333',
                        transition: 'border-color 0.4s ease',
                    }}
                >
                    {/* Rank badge */}
                    <div className="absolute top-4 right-4">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                            style={{
                                background: rank <= 3 ? 'linear-gradient(135deg, #F3AF19 0%, #B87333 100%)' : 'rgba(60,60,60,0.8)',
                                color: rank <= 3 ? '#050505' : '#888',
                                fontFamily: 'Rajdhani, sans-serif',
                            }}
                        >
                            #{rank}
                        </div>
                    </div>

                    {/* Logo + name */}
                    <div className="flex items-center gap-4 mb-5">
                        <div className="text-4xl">{logo}</div>
                        <div>
                            <h3
                                className="text-xl font-black tracking-wider leading-tight"
                                style={{ fontFamily: 'Rajdhani, sans-serif', color: '#fff' }}
                            >
                                {name}
                            </h3>
                            <span
                                className="text-xs font-bold tracking-[0.25em]"
                                style={{ color: '#F3AF19', fontFamily: 'Exo 2, sans-serif' }}
                            >
                                [{tag}]
                            </span>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                        <Stat label="WIN RATE" value={`${winRate}%`} accent="#F3AF19" />
                        <Stat label="KILLS" value={kills.toLocaleString()} accent="#fff" />
                        <div className="flex flex-col items-center gap-1">
                            <span
                                className="text-lg font-bold tracking-wider"
                                style={{ color: tierColor, fontFamily: 'Exo 2, sans-serif' }}
                            >
                                {tier}
                            </span>
                            <span className="text-[10px] tracking-[0.2em] text-white/30" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                                TIER
                            </span>
                        </div>
                    </div>

                    {/* Win rate bar */}
                    <div className="mt-5 h-0.5 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${winRate}%` }}
                            transition={{ duration: 1.2, delay: index * 0.08 + 0.3, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #F3AF19, #B87333)' }}
                        />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold tracking-wider" style={{ color: accent, fontFamily: 'Exo 2, sans-serif' }}>
                {value}
            </span>
            <span className="text-[10px] tracking-[0.2em] text-white/30" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                {label}
            </span>
        </div>
    );
}
