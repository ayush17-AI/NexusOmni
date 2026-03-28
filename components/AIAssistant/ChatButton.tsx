'use client';

import { motion } from 'framer-motion';

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function ChatButton({ isOpen, onClick }: ChatButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer select-none focus:outline-none"
      style={{
        background: 'rgba(10, 20, 40, 0.85)',
        border: '1.5px solid rgba(56, 189, 248, 0.6)',
        boxShadow: '0 0 18px rgba(56, 189, 248, 0.45), 0 0 40px rgba(56, 189, 248, 0.2)',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      title="NexusOmni AI Assistant"
    >
      {/* Outer neon ring pulse */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ border: '1.5px solid rgba(56, 189, 248, 0.35)' }}
        animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Icon */}
      <motion.div
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(56,189,248,1)" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(56,189,248,1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.477 2 2 6.238 2 11.5c0 2.364.87 4.527 2.31 6.21L3 21l3.5-1.5C8.2 20.45 10.05 21 12 21c5.523 0 10-4.238 10-9.5S17.523 2 12 2z" />
            <circle cx="8.5" cy="11.5" r="1" fill="rgba(56,189,248,1)" stroke="none" />
            <circle cx="12" cy="11.5" r="1" fill="rgba(56,189,248,1)" stroke="none" />
            <circle cx="15.5" cy="11.5" r="1" fill="rgba(56,189,248,1)" stroke="none" />
          </svg>
        )}
      </motion.div>

      {/* Small "AI" badge */}
      <span
        className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-sm"
        style={{
          background: 'rgba(56,189,248,0.15)',
          border: '1px solid rgba(56,189,248,0.5)',
          color: 'rgb(56,189,248)',
          fontFamily: 'Rajdhani, sans-serif',
          letterSpacing: '0.05em',
        }}
      >
        AI
      </span>
    </motion.button>
  );
}
