'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Starfield from '@/components/portal/Starfield';

const COMMAND_LINKS = [
    { label: 'PLAYERS', href: '/bgmi/players' },
    { label: 'TEAMS', href: '/bgmi/teams' },
    { label: 'TOURNAMENTS', href: '/bgmi/tournaments' },
    { label: 'CHAMPIONS', href: '/bgmi/champions' },
    { label: 'INTERACTIVE MAPS', href: '/bgmi/maps' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function BGMIPage() {
    return (
        <main className="relative min-h-screen text-white flex flex-col items-center justify-center overflow-hidden">
            <Starfield />

            {/* Breadcrumb back to home */}
            <Link
                href="/"
                className="absolute top-8 left-8 z-20 text-xs tracking-[0.3em] transition-colors hover:text-white"
                style={{ color: 'rgba(243,175,25,0.5)', fontFamily: 'Exo 2, sans-serif' }}
            >
                <div className="flex items-center gap-2">
                    <span className="opacity-50">◄</span> NEXUS PORTAL
                </div>
            </Link>

            {/* Background Character Realism Layer */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    zIndex: -5,
                    backgroundImage: 'url(https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.2, // lowered opacity as requested
                    filter: 'blur(4px) brightness(0.5)'
                }}
            />

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto px-4 mt-8">

                {/* ── HERO TITLE ── */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-12 md:mb-16 flex flex-col items-center"
                >
                    <p className="text-xs tracking-[0.4em] mb-4 text-[#F3AF19] font-['Exo_2']" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        ◆ BATTLEGROUND ZONE
                    </p>
                    <h1
                        className="text-[6rem] sm:text-8xl md:text-[10rem] font-black leading-none tracking-tighter"
                        style={{
                            background: 'linear-gradient(135deg, #F3AF19 0%, #B87333 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontFamily: 'Rajdhani, sans-serif',
                            textShadow: '0 20px 40px rgba(0,0,0,0.5)' // Gives depth over the stars
                        }}
                    >
                        BGMI
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase mt-2 md:mt-4 text-white/40" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        Esports Intelligence Hub
                    </p>
                </motion.div>

                {/* ── COMMAND CENTER NAVIGATION ── */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col items-center gap-4 md:gap-5 w-full max-w-sm md:max-w-md"
                >
                    {COMMAND_LINKS.map((link) => (
                        <motion.div key={link.label} variants={itemVariants} className="w-full">
                            <Link href={link.href} className="block w-full">
                                <motion.div
                                    className="relative flex items-center justify-center p-4 w-full rounded-xl overflow-hidden group cursor-pointer"
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                    initial={{ opacity: 0.6, scale: 1 }}
                                    whileHover={{
                                        opacity: 1,
                                        scale: 1.05,
                                        borderColor: 'rgba(243,175,25,0.3)',
                                        background: 'rgba(243,175,25,0.05)',
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <h2
                                        className="text-lg md:text-2xl font-black uppercase tracking-[0.2em] transition-all duration-300 text-white/80 group-hover:text-[#F3AF19]"
                                        style={{
                                            fontFamily: 'Rajdhani, sans-serif',
                                        }}
                                    >
                                        <span className="relative z-10 transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(243,175,25,1)]">
                                            {link.label}
                                        </span>
                                    </h2>

                                    {/* Subtle gold glow pulse from bottom */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                        style={{
                                            background: 'linear-gradient(to top, rgba(243,175,25,0.1) 0%, transparent 100%)'
                                        }}
                                    />
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </main>
    );
}
