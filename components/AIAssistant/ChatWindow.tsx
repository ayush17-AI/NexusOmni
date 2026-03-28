'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage, { Message } from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string) => void;
}

// Drifting particle component for atmospheric effect
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: 2, height: 2, background: 'rgba(56,189,248,0.4)', ...style }}
      animate={{
        y: [0, -40, 0],
        x: [0, 8, 0],
        opacity: [0, 0.6, 0],
      }}
      transition={{
        duration: (style as { '--dur'?: number })['--dur'] ?? 4,
        repeat: Infinity,
        delay: (style as { '--delay'?: number })['--delay'] ?? 0,
        ease: 'easeInOut',
      }}
    />
  );
}

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  style: {
    bottom: `${10 + Math.random() * 60}%`,
    left: `${5 + Math.random() * 90}%`,
    '--dur': 3 + Math.random() * 3,
    '--delay': Math.random() * 4,
  } as React.CSSProperties,
}));

export default function ChatWindow({ isOpen, messages, isLoading, onSend }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="chat-window"
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed bottom-24 right-6 w-80 sm:w-96 rounded-2xl overflow-hidden flex flex-col"
          style={{
            height: '480px',
            background: 'rgba(8, 15, 30, 0.82)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(56,189,248,0.25)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.08), inset 0 1px 0 rgba(56,189,248,0.12)',
          }}
        >
          {/* Subtle floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {PARTICLES.map((p) => (
              <Particle key={p.id} style={p.style} />
            ))}
          </div>

          {/* Header */}
          <div
            className="relative z-10 flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              background: 'rgba(56,189,248,0.05)',
              borderBottom: '1px solid rgba(56,189,248,0.15)',
            }}
          >
            {/* Animated status dot */}
            <div className="relative flex-shrink-0">
              <motion.span
                className="block w-2 h-2 rounded-full"
                style={{ background: 'rgba(56,189,248,0.9)' }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <motion.span
                className="absolute inset-0 w-2 h-2 rounded-full"
                style={{ background: 'rgba(56,189,248,0.5)' }}
                animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            </div>

            <div className="flex-1">
              <p
                className="text-xs font-bold tracking-widest"
                style={{ color: 'rgba(56,189,248,0.95)', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.18em' }}
              >
                NEXUS AI ASSISTANT
              </p>
              <p className="text-[10px] opacity-50 mt-0.5" style={{ color: 'white', fontFamily: 'Exo 2, sans-serif' }}>
                BGMI Strategy Intelligence
              </p>
            </div>

            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(56,189,248,0.5)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            </motion.div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-3 py-3 scrollbar-thin" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(56,189,248,0.2) transparent' }}>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="h-full flex flex-col items-center justify-center gap-4 text-center px-4"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(56,189,248,0.08)',
                    border: '1px solid rgba(56,189,248,0.2)',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(56,189,248,0.8)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                  </svg>
                </motion.div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'rgba(56,189,248,0.8)', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em' }}>
                    ASK ME ANYTHING
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-50" style={{ color: 'white', fontFamily: 'Exo 2, sans-serif' }}>
                    Strategies · Scoring · Rotations · Loadouts · Tournaments
                  </p>
                </div>
                {/* Quick prompts */}
                <div className="flex flex-col gap-2 w-full mt-2">
                  {[
                    'Best Erangel rotation to Military Base?',
                    'Explain BGIS scoring system',
                    'Best loadout for Miramar?',
                  ].map((q) => (
                    <motion.button
                      key={q}
                      onClick={() => onSend(q)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="text-left text-[11px] px-3 py-2 rounded-lg cursor-pointer"
                      style={{
                        background: 'rgba(56,189,248,0.06)',
                        border: '1px solid rgba(56,189,248,0.18)',
                        color: 'rgba(255,255,255,0.65)',
                        fontFamily: 'Exo 2, sans-serif',
                      }}
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Loading typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-3"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.4)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(56,189,248,0.9)" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                  </svg>
                </div>
                <div
                  className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex gap-1.5 items-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {[0, 0.2, 0.4].map((delay) => (
                    <motion.span
                      key={delay}
                      className="block w-1.5 h-1.5 rounded-full"
                      style={{ background: 'rgba(56,189,248,0.7)' }}
                      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="relative z-10 flex-shrink-0">
            <ChatInput onSend={onSend} isLoading={isLoading} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
