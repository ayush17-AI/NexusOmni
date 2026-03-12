'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Starfield from '@/components/portal/Starfield';
import GameSlab from '@/components/portal/GameSlab';

const GAMES = [
  { id: 'bgmi', title: 'BGMI', subtitle: 'Battle Royale', href: '/bgmi' },
  { id: 'valorant', title: 'VALORANT', subtitle: 'Tactical Shooter', href: '/valorant' },
  { id: 'coming', title: 'COMING SOON', subtitle: 'Other Game', href: '#' },
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
      className="relative min-h-screen w-full overflow-hidden bg-black"
      style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
    >
      <Starfield />

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
            className="text-5xl font-black tracking-tight text-white md:text-7xl"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              textShadow: '0 0 60px rgba(255,255,255,0.08)',
              mixBlendMode: 'lighten',
            }}
          >
            NEXUSOMNI
          </h1>
          <p
            className="mt-4 text-sm tracking-[0.25em] text-zinc-400 uppercase"
            style={{ fontFamily: 'Exo 2, sans-serif' }}
          >
            Choose your battleground
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

