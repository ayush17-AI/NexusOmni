'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';

// 8 digital rain bars with varied positions and speeds
const RAIN_BARS = [
  { left: '8%',  duration: 6.0, delay: 0.0, opacity: 0.10 },
  { left: '18%', duration: 8.5, delay: 1.2, opacity: 0.08 },
  { left: '29%', duration: 7.2, delay: 0.4, opacity: 0.12 },
  { left: '41%', duration: 9.0, delay: 2.1, opacity: 0.08 },
  { left: '53%', duration: 6.8, delay: 0.9, opacity: 0.10 },
  { left: '64%', duration: 7.5, delay: 1.7, opacity: 0.09 },
  { left: '75%', duration: 8.0, delay: 0.3, opacity: 0.11 },
  { left: '87%', duration: 6.5, delay: 2.5, opacity: 0.08 },
];

export default function CommandCenterGrid() {
  // Mouse-tracked spotlight position
  const mouseX = useMotionValue(
    typeof window !== 'undefined' ? window.innerWidth / 2 : 760
  );
  const mouseY = useMotionValue(
    typeof window !== 'undefined' ? window.innerHeight / 2 : 400
  );

  // Smooth spring lag for the spotlight glow
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  // Parallax offset for hex grid (inverted mouse direction = depth effect)
  const parallaxX = useSpring(useMotionValue(0), { stiffness: 40, damping: 18 });
  const parallaxY = useSpring(useMotionValue(0), { stiffness: 40, damping: 18 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Invert and scale movement to max ±8px
      const nx = (e.clientX / window.innerWidth - 0.5) * -16;
      const ny = (e.clientY / window.innerHeight - 0.5) * -16;
      parallaxX.set(nx);
      parallaxY.set(ny);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, parallaxX, parallaxY]);

  return (
    // Layer 1: Base pitch-black background
    <div
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none"
      style={{ zIndex: -30, background: '#000000' }}
    >
      {/* ── Layer 2: Parallax Hexagon Command Grid ── */}
      <motion.div
        className="absolute inset-[-5%] w-[110%] h-[110%]"
        style={{
          x: parallaxX,
          y: parallaxY,
          zIndex: -25,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='56' height='97' viewBox='0 0 56 97' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 0l24.25 14v28L28 56 3.75 42V14z' fill='none' stroke='%23111111' stroke-width='1'/%3E%3Cpath d='M28 56l24.25 14v28L28 112 3.75 98V70z' fill='none' stroke='%23111111' stroke-width='1'/%3E%3Cpath d='M56 28l24.25 14v28L56 84 31.75 70V42z' fill='none' stroke='%23111111' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '56px 97px',
          opacity: 0.6,
        }}
      />

      {/* ── Hex Grid Cyan Scan Line — repeats every 4s ── */}
      <motion.div
        className="absolute left-0 w-full pointer-events-none"
        style={{
          zIndex: -24,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #00f2ff 40%, #00f2ff 60%, transparent 100%)',
          boxShadow: '0 0 12px 3px rgba(0,242,255,0.5)',
        }}
        animate={{ top: ['-2%', '102%'] }}
        transition={{
          duration: 4,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 0,
        }}
      />

      {/* ── Layer 3: Digital Rain Bars ── */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: -20 }}
      >
        {RAIN_BARS.map((bar, i) => (
          <motion.div
            key={i}
            className="absolute top-0 w-[1px]"
            style={{
              left: bar.left,
              height: '100%',
              background: `linear-gradient(to bottom, transparent 0%, rgba(0,242,255,${bar.opacity}) 30%, rgba(0,242,255,${bar.opacity}) 70%, transparent 100%)`,
            }}
            animate={{ y: ['-100%', '100%'] }}
            transition={{
              duration: bar.duration,
              delay: bar.delay,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* ── Layer 4: Mouse Radial Spotlight Glow ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          zIndex: -15,
          width: 600,
          height: 600,
          borderRadius: '50%',
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          background:
            'radial-gradient(circle, rgba(0,242,255,0.13) 0%, rgba(0,242,255,0.04) 40%, transparent 70%)',
        }}
      />

      {/* ── Layer 5: Edge Vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: -10,
          background:
            'radial-gradient(circle at center, transparent 38%, rgba(0,0,0,0.82) 100%)',
        }}
      />
    </div>
  );
}
