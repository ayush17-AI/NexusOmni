'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';

const interTight = Inter_Tight({ subsets: ['latin'], weight: '900' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '700'] });

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
        <main className="min-h-screen w-screen overflow-x-hidden overflow-y-auto flex flex-col items-center text-white relative" style={{ height: 'auto' }}>

            {/* Fixed Fullscreen Background Video Layer */}
            <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="fixed top-0 left-0 w-full h-full object-cover -z-10"
            >
                <source src="/videos/bgmi-background.mp4" type="video/mp4" />
            </video>

            {/* Dark Overlay Layer for Text Readability */}
            <div className="fixed top-0 left-0 w-full h-full bg-black/50 -z-20 pointer-events-none" />

            {/* Breadcrumb back to home */}
            <Link
                href="/"
                prefetch={true}
                className="absolute top-8 left-8 z-20 text-xs tracking-[0.3em] transition-colors hover:text-[#F3AF19]"
                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Exo 2, sans-serif' }}
            >
                <div className="flex items-center gap-2">
                    <span className="opacity-50">◄</span> NEXUS PORTAL
                </div>
            </Link>



            <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto px-4 mt-8">

                {/* ── HERO TITLE ── */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-16 flex flex-col items-center"
                >
                    <p className="text-xs tracking-[0.4em] mb-4 text-[#F3AF19] font-['Exo_2']" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        ◆ BATTLEGROUND ZONE
                    </p>
                    <h1
                        className={`${interTight.className} text-[6rem] sm:text-8xl md:text-[10rem] uppercase tracking-[0.15em] text-[#D1D9E6] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
                        style={{
                            textShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.5)'
                        }}
                    >
                        BGMI
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase mt-2 md:mt-4 text-white/40" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        Esports Intelligence Hub
                    </p>
                </motion.div>

                {/* ── COMMAND CENTER NAVIGATION PORTALS ── */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col items-center gap-3 w-full max-w-sm md:max-w-md mt-8 md:mt-12 max-h-[60vh] justify-center"
                >
                    {COMMAND_LINKS.map((link) => (
                        <motion.div key={link.label} variants={itemVariants} className="w-full">
                            <Link href={link.href} className="block w-full">
                                <motion.div
                                    className="relative flex items-center justify-center py-2.5 px-4 w-full rounded-xl overflow-hidden group cursor-pointer backdrop-blur-md transition-all duration-300 ease-out"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }}
                                    initial={{ opacity: 0.8, scale: 1 }}
                                    whileHover={{
                                        opacity: 1,
                                        scale: 1.05,
                                        borderColor: 'rgba(0,242,255,0.4)',
                                        background: 'rgba(0,242,255,0.1)',
                                        boxShadow: '0 0 20px rgba(0,242,255,0.2)'
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <h2
                                        className={`${jetbrainsMono.className} text-lg font-bold uppercase tracking-[0.3em] transition-all duration-300 text-white/90 group-hover:text-[#00F2FF]`}
                                    >
                                        <span className="relative z-10 transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(0,242,255,0.8)]">
                                            {link.label}
                                        </span>
                                    </h2>

                                    {/* Subtle Cyan glow pulse from bottom */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                        style={{
                                            background: 'linear-gradient(to top, rgba(0,242,255,0.15) 0%, transparent 100%)'
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
