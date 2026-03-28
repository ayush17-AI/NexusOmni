'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function GlitchArena() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isGlitching, setIsGlitching] = useState(false);
  const [isPixelated, setIsPixelated] = useState(false);

  // Random System Glitches Simulation (RGB Splits)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 120); // Lasts ~120ms
      
      const nextGlitch = Math.random() * 2000 + 3000; // Triggers every 3 to 5 seconds
      timeout = setTimeout(triggerGlitch, nextGlitch);
    };
    
    timeout = setTimeout(triggerGlitch, 3000); // Initial delay
    return () => clearTimeout(timeout);
  }, []);

  // Parallax Tracker & Global Hover Pixelation Trigger
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
      
      // If the mouse passes over an anchor or button (Portal Cards), briefly glitch the data transmission
      const target = e.target as HTMLElement;
      if (target.closest('a') !== null || target.closest('button') !== null) {
          // Add a random chance so it doesn't trigger 60 times a second while dragging the mouse inside a card
          if (!isPixelated && Math.random() > 0.85) { 
              setIsPixelated(true);
              setTimeout(() => setIsPixelated(false), 150); // Glitch clears quickly
          }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPixelated]);

  return (
    <div className={`fixed inset-0 z-[-20] w-full h-full bg-[#000000] overflow-hidden pointer-events-none ${isGlitching ? 'glitch-anim' : ''}`}>
      
      {/* Heavy Cyber-Hexagonal Armor Background */}
      <motion.div 
        className="absolute inset-[-10%] w-[120%] h-[120%] hex-bg"
        animate={{
          x: mouse.x * -15, 
          y: mouse.y * -15,
        }}
        transition={{ type: 'spring', stiffness: 45, damping: 25 }}
      />
      
      {/* Scanline Overlay (CRT effect) */}
      <div className="absolute inset-0 scanlines pointer-events-none mix-blend-overlay" />
      
      {/* Static Grain Texture Overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Extreme Pixelation Interactive Glitch */}
      {isPixelated && (
        <div className="absolute inset-0 bg-white/5 mix-blend-difference pointer-events-none backdrop-saturate-150 backdrop-blur-[3px]" />
      )}
      
      {/* RGB Split Overlay Core (triggered concurrently with the CSS class transformation) */}
      {isGlitching && (
        <div className="absolute inset-0 glitch-split-layer pointer-events-none mix-blend-exclusion" />
      )}
    </div>
  );
}
