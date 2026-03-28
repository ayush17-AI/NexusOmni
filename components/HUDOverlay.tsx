'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function HUDOverlay() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [codeScan, setCodeScan] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Simulating constantly streaming data numbers
  useEffect(() => {
    const interval = setInterval(() => {
        setCodeScan(prev => (prev + 1) % 9999);
    }, 75);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[-5] w-full h-full pointer-events-none overflow-hidden font-mono uppercase text-[#00f2ff]/30 text-xs tracking-widest">
      
      {/* Vertical Scanning Laser Line */}
      <motion.div 
        className="absolute left-0 w-full h-[1px] bg-[#00f2ff]/30 shadow-[0_0_8px_rgba(0,242,255,0.4)]"
        animate={{ top: ['-5%', '105%', '-5%'] }}
        transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
      />
      
      {/* Horizontal Scanning Guide */}
      <motion.div 
        className="absolute top-0 w-[1px] h-full bg-[#ff001e]/10 shadow-[0_0_8px_rgba(255,0,30,0.2)]"
        animate={{ left: ['-5%', '105%', '-5%'] }}
        transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
      />

      {/* Top Left Coordinate Tracking */}
      <motion.div 
        className="absolute top-6 left-6 flex flex-col gap-1 hidden md:flex"
        animate={{ x: mouse.x * 6, y: mouse.y * 6 }}
        transition={{ type: 'spring', stiffness: 40, damping: 15 }}
      >
        <span>SYS.OP.X: {(mouse.x * 100).toFixed(3)}</span>
        <span>SYS.OP.Y: {(mouse.y * 100).toFixed(3)}</span>
        <span>Z.INDEX: {(codeScan * 0.135).toFixed(3)}</span>
        <span className="mt-2 text-[#27f727]/40">TARGET.LOCK: ACQUIRED</span>
      </motion.div>

      {/* Bottom Right Hex Tracking */}
      <motion.div 
        className="absolute bottom-6 right-6 text-right flex flex-col gap-1 hidden md:flex"
        animate={{ x: mouse.x * -6, y: mouse.y * -6 }}
        transition={{ type: 'spring', stiffness: 40, damping: 15 }}
      >
        <span>MEM.ALLOC: 0x{codeScan.toString(16).toUpperCase().padStart(4, '0')}AF</span>
        <span className="text-[#00f2ff]/40">NET.STATUS: SECURE_CHANNEL</span>
        <span className="text-[#ff001e]/60 font-bold mt-2 animate-pulse">OVERRIDE.READY</span>
      </motion.div>

      {/* Central Tactical Target Brackets - Surrounds the Portal Cards */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ x: mouse.x * -3, y: mouse.y * -3 }}
        transition={{ type: 'spring', stiffness: 60, damping: 20 }}
      >
        <div className="w-[95%] max-w-[1100px] h-[65%] border-x-[1px] border-[#00f2ff]/10 relative">
            <div className="absolute top-0 left-0 w-16 h-[1px] bg-[#00f2ff]/30" />
            <div className="absolute top-0 right-0 w-16 h-[1px] bg-[#00f2ff]/30" />
            
            <div className="absolute bottom-0 left-0 w-16 h-[1px] bg-[#00f2ff]/30" />
            <div className="absolute bottom-0 right-0 w-16 h-[1px] bg-[#00f2ff]/30" />

            {/* Crosshair anchors */}
            <div className="absolute top-1/2 left-0 w-3 h-[1px] bg-[#ff001e]/30 -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-3 h-[1px] bg-[#ff001e]/30 -translate-y-1/2" />
            <div className="absolute top-0 left-1/2 h-3 w-[1px] bg-[#ff001e]/30 -translate-x-1/2" />
            <div className="absolute bottom-0 left-1/2 h-3 w-[1px] bg-[#ff001e]/30 -translate-x-1/2" />
        </div>
      </motion.div>
    </div>
  );
}
