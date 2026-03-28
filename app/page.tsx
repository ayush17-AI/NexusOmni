'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Orbitron, Syncopate } from 'next/font/google';
import GameSlab from '@/components/portal/GameSlab';


const orbitron = Orbitron({ subsets: ['latin'], weight: '900' });
const syncopate = Syncopate({ subsets: ['latin'], weight: '700' });

const GAMES = [
  { id: 'bgmi', title: 'BGMI', subtitle: 'Battle Royale', href: '/bgmi' },
  { id: 'ff', title: 'FREE FIRE', subtitle: 'Survival Shooter', href: '/freefire' },
  { id: 'cod', title: 'CALL OF DUTY', subtitle: 'Tactical Combat', href: '/cod' },
];

export default function Home() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="relative min-h-screen w-screen overflow-hidden" 
      style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
    >
      {/* ── Cinematic Video Background ── */}
      <div className="fixed inset-0 z-[-10] w-full h-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(4px)', transform: 'scale(1.04)' }}
          src="/videos/shinobi_bg.mp4"
        />
        {/* Radial vignette — darkens edges, keeps center clear for portal cards */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.80) 100%)'
          }}
        />
      </div>
      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-bold tracking-[0.4em] text-zinc-500 uppercase">
            Esports Intelligence Platform
          </p>
          <h1
            className={`${orbitron.className} uppercase text-6xl md:text-8xl tracking-widest text-white`}
            style={{
              textShadow: '0 0 15px rgba(255,255,255,0.2), 0 0 40px rgba(34,211,238,0.15)'
            }}
          >
            NEXUSOMNI
          </h1>
          <p
            className={`${syncopate.className} mt-6 text-sm tracking-[0.25em] text-zinc-400 uppercase`}
          >
            ◆ CHOOSE YOUR BATTLEGROUND ◆
          </p>
        </motion.div>

        {/* Portal Slabs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          className="flex flex-col items-center gap-6 md:flex-row md:gap-8"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {GAMES.map((game, index) => (
            <GameSlab
              key={game.id}
              id={game.id}
              title={game.title}
              subtitle={game.subtitle}
              href={game.href}
              index={index}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
              isTransitioning={isTransitioning}
              setIsTransitioning={setIsTransitioning}
            />
          ))}
        </motion.div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 text-xs tracking-[0.3em] text-zinc-600 uppercase"
          style={{ fontFamily: 'Exo 2, sans-serif' }}
        >
          Hover to illuminate · Click to enter
        </motion.p>
      </div>
    </div>
  );
}

