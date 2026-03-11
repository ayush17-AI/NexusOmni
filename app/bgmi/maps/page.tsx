'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const MAPS = [
    {
        id: 'erangel',
        name: 'Erangel',
        sub: 'Battle Royale Map',
        region: 'Russian Island · 8×8 km',
        desc: 'The classic. Dense forests, military compounds, and open fields. The most iconic BGMI battleground.',
        img: '/maps/erangel.jpg',
        color: '#22c55e',
        glow: 'rgba(34,197,94,0.5)',
        glowDim: 'rgba(34,197,94,0.15)',
        border: 'rgba(34,197,94,0.6)',
        borderDim: 'rgba(34,197,94,0.2)',
        badge: '#14532d',
        badgeText: '#86efac',
        tag: 'Classic',
        accent: '#22c55e',
    },
    {
        id: 'miramar',
        name: 'Miramar',
        sub: 'Battle Royale Map',
        region: 'Mexican Desert · 8×8 km',
        desc: 'A vast desert map demanding long-range precision, vertical terrain mastery, and tactical positioning.',
        img: '/maps/miramar.jpg',
        color: '#f97316',
        glow: 'rgba(249,115,22,0.5)',
        glowDim: 'rgba(249,115,22,0.15)',
        border: 'rgba(249,115,22,0.6)',
        borderDim: 'rgba(249,115,22,0.2)',
        badge: '#431407',
        badgeText: '#fdba74',
        tag: 'Desert',
        accent: '#f97316',
    },
    {
        id: 'rondo',
        name: 'Rondo',
        sub: 'Battle Royale Map',
        region: 'Asian Metropolis · 8×8 km',
        desc: "BGMI's newest map — riverbanks, dense city blocks, elevated zones for relentless close-range combat.",
        img: '/maps/rondo.webp',
        color: '#38bdf8',
        glow: 'rgba(56,189,248,0.5)',
        glowDim: 'rgba(56,189,248,0.15)',
        border: 'rgba(56,189,248,0.6)',
        borderDim: 'rgba(56,189,248,0.2)',
        badge: '#082f49',
        badgeText: '#7dd3fc',
        tag: 'Urban',
        accent: '#38bdf8',
    },
];

// Resting 3D positions for each card
const REST = [
    { rotateY: 12, translateZ: -40 },
    { rotateY: 0, translateZ: 0 },
    { rotateY: -12, translateZ: -40 },
];

export default function MapsPage() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [clickedId, setClickedId] = useState<string | null>(null);
    const router = useRouter();

    const handleCardClick = (id: string) => {
        if (clickedId) return;
        setClickedId(id);
        setTimeout(() => router.push(`/bgmi/maps/${id}`), 420);
    };

    return (
        <main
            className="min-h-screen w-screen text-white overflow-hidden relative flex flex-col items-center"
            style={{ background: 'radial-gradient(ellipse 140% 100% at 50% 0%, #060d1f 0%, #010308 80%)' }}
        >
            {/* ── PREMIUM ANIMATED BACKGROUND ── */}
            <PremiumBG />

            {/* ── BACK LINK ── */}
            <Link
                href="/bgmi"
                className="absolute top-8 left-8 z-20 flex items-center gap-2 text-xs tracking-[0.35em]
                           text-amber-500/50 hover:text-amber-400 transition-all duration-300 group"
                style={{ fontFamily: 'Exo 2, sans-serif' }}
            >
                <span className="group-hover:-translate-x-1 transition-transform duration-300">◄</span>
                BGMI ZONE
            </Link>

            {/* ── HEADER ── */}
            <motion.div
                className="relative z-10 text-center pt-28 pb-12 px-6"
                initial={{ opacity: 0, y: -32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
                <p
                    className="text-[9px] tracking-[0.65em] mb-5 uppercase"
                    style={{ fontFamily: 'Exo 2, sans-serif', color: 'rgba(243,175,25,0.75)' }}
                >
                    ◆ TACTICAL INTELLIGENCE SYSTEM
                </p>
                <h1
                    className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-none mb-4"
                    style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        background: 'linear-gradient(135deg, #F3AF19 0%, #E8901A 40%, #F3AF19 70%, #fff7d6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 32px rgba(243,175,25,0.35))',
                    }}
                >
                    Choose Your Battleground
                </h1>
                <p className="text-white/30 text-sm tracking-wide" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    Select a map to explore, plan strategies, and study drop zones
                </p>

                {/* Decorative line */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60" style={{ boxShadow: '0 0 8px rgba(243,175,25,0.8)' }} />
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/40" />
                </div>
            </motion.div>

            {/* ── 3D PORTAL GRID ── */}
            <div
                className="relative z-10 flex flex-col md:flex-row items-stretch justify-center gap-7 w-full max-w-6xl px-6 pb-20"
                style={{ perspective: '1200px', perspectiveOrigin: '50% 45%' }}
            >
                {/* Glow halo behind portals */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(20,50,100,0.35) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />

                {MAPS.map((map, i) => {
                    const isHovered = hoveredId === map.id;
                    const isOther = hoveredId !== null && !isHovered;
                    const isClicked = clickedId === map.id;
                    const isOtherClicked = clickedId !== null && clickedId !== map.id;

                    const restRY = REST[i].rotateY;
                    const restTZ = REST[i].translateZ;

                    let animTarget: object;
                    if (isClicked) {
                        animTarget = { rotateY: 0, translateZ: 180, scale: 1.15, opacity: 1, filter: 'blur(0px) brightness(1.3)' };
                    } else if (isOtherClicked) {
                        animTarget = { rotateY: restRY, translateZ: restTZ - 30, scale: 0.82, opacity: 0.2, filter: 'blur(4px) brightness(0.5)' };
                    } else if (isHovered) {
                        animTarget = { rotateY: 0, translateZ: 100, scale: 1.06, opacity: 1, filter: 'blur(0px) brightness(1.15)' };
                    } else if (isOther) {
                        animTarget = { rotateY: restRY * 0.6, translateZ: restTZ - 15, scale: 0.88, opacity: 0.4, filter: 'blur(2.5px) brightness(0.65)' };
                    } else {
                        animTarget = { rotateY: restRY, translateZ: restTZ, scale: 1, opacity: 1, filter: 'blur(0px) brightness(1)' };
                    }

                    return (
                        <motion.div
                            key={map.id}
                            initial={{ opacity: 0, y: 90, rotateX: 20, scale: 0.9 }}
                            animate={{ ...(animTarget as object), y: 0, rotateX: 0 }}
                            transition={
                                isHovered || isOther || isClicked || isOtherClicked
                                    ? { type: 'spring', stiffness: 240, damping: 26 }
                                    : { duration: 0.75, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] }
                            }
                            style={{
                                flex: 1,
                                maxWidth: 390,
                                transformStyle: 'preserve-3d',
                                cursor: clickedId ? 'default' : 'pointer',
                            }}
                            onHoverStart={() => !clickedId && setHoveredId(map.id)}
                            onHoverEnd={() => setHoveredId(null)}
                            onClick={() => handleCardClick(map.id)}
                            whileTap={!clickedId ? { scale: 0.97 } : {}}
                        >
                            {/* PORTAL CARD */}
                            <div
                                className="relative overflow-hidden rounded-2xl h-full flex flex-col"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(15,25,45,0.85) 0%, rgba(6,10,22,0.92) 100%)',
                                    backdropFilter: 'blur(24px)',
                                    border: `1px solid ${isHovered ? map.border : map.borderDim}`,
                                    boxShadow: isHovered
                                        ? `0 0 0 1px ${map.border}, 0 0 50px ${map.glow}, 0 0 120px ${map.glowDim}, 0 32px 80px rgba(0,0,0,0.7)`
                                        : isClicked
                                            ? `0 0 0 2px ${map.border}, 0 0 80px ${map.glow}, 0 40px 100px rgba(0,0,0,0.8)`
                                            : `0 0 0 1px ${map.borderDim}, 0 16px 48px rgba(0,0,0,0.5)`,
                                    transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
                                }}
                            >
                                {/* Top gloss shine */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10"
                                    style={{
                                        background: 'linear-gradient(175deg, rgba(255,255,255,0.07) 0%, transparent 60%)',
                                        borderRadius: '16px 16px 0 0',
                                    }}
                                />

                                {/* Neon glow pulse when hovered */}
                                {isHovered && (
                                    <div
                                        className="absolute inset-0 rounded-2xl pointer-events-none z-0"
                                        style={{
                                            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${map.glow} 0%, transparent 65%)`,
                                            animation: 'neon-pulse 2s ease-in-out infinite',
                                        }}
                                    />
                                )}

                                {/* MAP PREVIEW IMAGE */}
                                <div className="relative h-56 overflow-hidden flex-shrink-0">
                                    <img
                                        src={map.img}
                                        alt={map.name}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                        style={{
                                            transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
                                            transform: isHovered ? 'scale(1.12)' : 'scale(1.02)',
                                        }}
                                    />

                                    {/* Image bottom gradient */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: `linear-gradient(to bottom,
                                                ${isHovered ? map.glowDim : 'transparent'} 0%,
                                                rgba(6,10,22,0.5) 60%,
                                                rgba(6,10,22,0.95) 100%)`,
                                            transition: 'background 0.4s ease',
                                        }}
                                    />

                                    {/* Map name + tag overlay */}
                                    <div className="absolute bottom-3 left-4 right-4 z-10">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p
                                                    className="text-white font-black text-3xl uppercase tracking-wide leading-none"
                                                    style={{
                                                        fontFamily: 'Rajdhani, sans-serif',
                                                        textShadow: `0 2px 12px rgba(0,0,0,0.9), 0 0 20px ${map.glow}`,
                                                    }}
                                                >
                                                    {map.name}
                                                </p>
                                                <p
                                                    className="text-xs mt-0.5 tracking-[0.2em] uppercase"
                                                    style={{ color: map.color, opacity: 0.85, fontFamily: 'Exo 2, sans-serif' }}
                                                >
                                                    {map.sub}
                                                </p>
                                            </div>
                                            <span
                                                className="text-xs font-bold px-3 py-1 rounded-full"
                                                style={{
                                                    background: map.badge,
                                                    color: map.badgeText,
                                                    border: `1px solid ${map.borderDim}`,
                                                    boxShadow: isHovered ? `0 0 12px ${map.glowDim}` : 'none',
                                                }}
                                            >
                                                {map.tag}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD BODY */}
                                <div className="p-5 flex flex-col flex-1 relative z-10">
                                    <p className="text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: `${map.color}70`, fontFamily: 'Exo 2, sans-serif' }}>
                                        {map.region}
                                    </p>
                                    <p className="text-zinc-400 text-sm leading-relaxed flex-1">{map.desc}</p>

                                    {/* Enter button row */}
                                    <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: `1px solid ${map.borderDim}` }}>
                                        <span
                                            className="text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full transition-all duration-300"
                                            style={{
                                                background: isHovered ? map.glowDim : 'rgba(255,255,255,0.04)',
                                                color: isHovered ? map.color : 'rgba(255,255,255,0.35)',
                                                border: `1px solid ${isHovered ? map.border : 'rgba(255,255,255,0.07)'}`,
                                                boxShadow: isHovered ? `0 0 16px ${map.glowDim}` : 'none',
                                                fontFamily: 'Exo 2, sans-serif',
                                            }}
                                        >
                                            ENTER MAP →
                                        </span>
                                        <span className="text-white/15 text-[9px] uppercase tracking-widest">Interactive</span>
                                    </div>
                                </div>

                                {/* Bottom accent line */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-400"
                                    style={{
                                        background: `linear-gradient(90deg, transparent 0%, ${map.color} 50%, transparent 100%)`,
                                        opacity: isHovered ? 1 : 0.2,
                                        boxShadow: isHovered ? `0 0 12px ${map.glow}` : 'none',
                                    }}
                                />

                                {/* Left accent line */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-[2px] transition-opacity duration-400"
                                    style={{
                                        background: `linear-gradient(180deg, transparent 0%, ${map.color} 50%, transparent 100%)`,
                                        opacity: isHovered ? 0.7 : 0,
                                    }}
                                />

                                {/* Index number */}
                                <div
                                    className="absolute top-4 right-4 font-black text-6xl pointer-events-none select-none z-0"
                                    style={{
                                        fontFamily: 'Rajdhani, sans-serif',
                                        color: isHovered ? map.color : 'rgba(255,255,255,0.04)',
                                        opacity: isHovered ? 0.15 : 0.07,
                                        transition: 'color 0.4s ease, opacity 0.4s ease',
                                    }}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer */}
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/12 text-[9px] tracking-[0.4em] uppercase z-10">
                NexusOmni · Tactical Maps Intelligence
            </p>

            {/* CSS Keyframes */}
            <style>{`
                @keyframes neon-pulse {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 1; }
                }
                @keyframes particle-float-1 {
                    0% { transform: translate(0, 0) scale(1); opacity: 0.5; }
                    33% { transform: translate(40px, -60px) scale(1.2); opacity: 0.8; }
                    66% { transform: translate(-20px, -120px) scale(0.9); opacity: 0.4; }
                    100% { transform: translate(0, -180px) scale(1); opacity: 0; }
                }
                @keyframes particle-float-2 {
                    0% { transform: translate(0, 0); opacity: 0.3; }
                    40% { transform: translate(-50px, -80px); opacity: 0.7; }
                    100% { transform: translate(20px, -200px); opacity: 0; }
                }
                @keyframes particle-float-3 {
                    0% { transform: translate(0, 0) scale(0.8); opacity: 0.6; }
                    50% { transform: translate(30px, -90px) scale(1.3); opacity: 0.9; }
                    100% { transform: translate(-10px, -170px) scale(0.5); opacity: 0; }
                }
                @keyframes grid-scroll-x {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(80px); }
                }
                @keyframes grid-scroll-y {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(80px); }
                }
                @keyframes radar-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes hud-flicker {
                    0%, 95%, 100% { opacity: 0.25; }
                    96% { opacity: 0.1; }
                    97% { opacity: 0.3; }
                }
            `}</style>
        </main>
    );
}

/* ── PREMIUM ANIMATED BACKGROUND ── */
function PremiumBG() {
    const particles = [
        { x: '12%', y: '75%', delay: '0s', dur: '6s', anim: 'particle-float-1', size: 3, color: 'rgba(56,189,248,0.7)' },
        { x: '28%', y: '80%', delay: '1.5s', dur: '8s', anim: 'particle-float-2', size: 2, color: 'rgba(34,197,94,0.6)' },
        { x: '45%', y: '70%', delay: '0.8s', dur: '7s', anim: 'particle-float-3', size: 4, color: 'rgba(243,175,25,0.5)' },
        { x: '62%', y: '85%', delay: '2.2s', dur: '9s', anim: 'particle-float-1', size: 2, color: 'rgba(249,115,22,0.6)' },
        { x: '78%', y: '72%', delay: '0.3s', dur: '6.5s', anim: 'particle-float-2', size: 3, color: 'rgba(56,189,248,0.5)' },
        { x: '88%', y: '88%', delay: '3s', dur: '7.5s', anim: 'particle-float-3', size: 2, color: 'rgba(34,197,94,0.7)' },
        { x: '5%', y: '60%', delay: '1s', dur: '8.5s', anim: 'particle-float-1', size: 2, color: 'rgba(243,175,25,0.4)' },
        { x: '55%', y: '90%', delay: '4s', dur: '7s', anim: 'particle-float-2', size: 3, color: 'rgba(56,189,248,0.6)' },
        { x: '35%', y: '65%', delay: '2.5s', dur: '9.5s', anim: 'particle-float-3', size: 2, color: 'rgba(249,115,22,0.5)' },
        { x: '72%', y: '55%', delay: '1.8s', dur: '6s', anim: 'particle-float-1', size: 4, color: 'rgba(34,197,94,0.4)' },
    ];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>

            {/* Animated grid — X */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0,255,180,0.035) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                    animation: 'grid-scroll-y 12s linear infinite',
                }}
            />
            {/* Animated grid — Y */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'linear-gradient(90deg, rgba(0,255,180,0.035) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                    animation: 'grid-scroll-x 10s linear infinite',
                }}
            />

            {/* Diagonal subtle lines */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        -45deg, transparent, transparent 120px,
                        rgba(56,189,248,0.012) 120px, rgba(56,189,248,0.012) 121px
                    )`,
                }}
            />

            {/* Large ambient glows */}
            <div
                className="absolute"
                style={{
                    width: 800,
                    height: 800,
                    borderRadius: '50%',
                    left: '50%',
                    top: '30%',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(20,60,120,0.4) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />
            <div
                className="absolute"
                style={{
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    left: '20%',
                    top: '60%',
                    background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                }}
            />
            <div
                className="absolute"
                style={{
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    right: '20%',
                    top: '55%',
                    background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                }}
            />

            {/* Radar system */}
            <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
                {[200, 330, 480, 650].map((r, i) => (
                    <div
                        key={r}
                        className="absolute rounded-full border"
                        style={{
                            width: r, height: r, left: -r / 2, top: -r / 2,
                            borderColor: `rgba(0,255,170,${0.06 - i * 0.012})`,
                        }}
                    />
                ))}
                {/* Radar sweep */}
                <div
                    className="absolute rounded-full overflow-hidden"
                    style={{ width: 650, height: 650, left: -325, top: -325 }}
                >
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,255,170,0.07) 40deg, transparent 90deg)',
                            animation: 'radar-spin 10s linear infinite',
                        }}
                    />
                </div>
                {/* Center dot */}
                <div
                    className="absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2"
                    style={{
                        background: 'rgba(0,255,170,0.7)',
                        boxShadow: '0 0 12px rgba(0,255,170,0.9)',
                    }}
                />
            </div>

            {/* Floating particles */}
            {particles.map((p, i) => (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                        animation: `${p.anim} ${p.dur} ${p.delay} ease-in-out infinite`,
                    }}
                />
            ))}

            {/* HUD corners */}
            <div className="absolute top-6 right-8 opacity-0" style={{ animation: 'hud-flicker 4s ease-in-out infinite' }}>
                <div className="w-10 h-10 border-t-2 border-r-2 border-cyan-400/60 rounded-tr" />
            </div>
            <div className="absolute bottom-8 left-8 opacity-0" style={{ animation: 'hud-flicker 4s 1.5s ease-in-out infinite' }}>
                <div className="w-10 h-10 border-b-2 border-l-2 border-cyan-400/60 rounded-bl" />
            </div>
            <div className="absolute top-6 left-8 opacity-0" style={{ animation: 'hud-flicker 4s 0.7s ease-in-out infinite' }}>
                <div className="w-6 h-6 border-t-2 border-l-2 border-amber-400/50 rounded-tl" />
            </div>
            <div className="absolute bottom-8 right-8 opacity-0" style={{ animation: 'hud-flicker 4s 2.3s ease-in-out infinite' }}>
                <div className="w-6 h-6 border-b-2 border-r-2 border-amber-400/50 rounded-br" />
            </div>

            {/* Top gradient vignette */}
            <div
                className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(1,3,8,0.6) 0%, transparent 100%)' }}
            />
            {/* Bottom gradient vignette */}
            <div
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(1,3,8,0.7) 0%, transparent 100%)' }}
            />
        </div>
    );
}
