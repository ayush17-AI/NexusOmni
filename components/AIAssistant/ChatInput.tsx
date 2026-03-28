'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  };

  return (
    <div
      className="px-3 py-3 flex items-end gap-2"
      style={{ borderTop: '1px solid rgba(56,189,248,0.1)' }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask about BGMI strategies, rules..."
        rows={1}
        disabled={isLoading}
        className="flex-1 resize-none text-sm rounded-xl px-3 py-2.5 focus:outline-none placeholder:opacity-40 disabled:opacity-50"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(56,189,248,0.2)',
          color: 'rgba(255,255,255,0.9)',
          fontFamily: 'Exo 2, sans-serif',
          maxHeight: '96px',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(56,189,248,0.55)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(56,189,248,0.2)'; }}
      />

      <motion.button
        onClick={handleSend}
        disabled={!value.trim() || isLoading}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background: 'rgba(56,189,248,0.18)',
          border: '1px solid rgba(56,189,248,0.4)',
        }}
      >
        {isLoading ? (
          <motion.span
            className="w-4 h-4 rounded-full"
            style={{ border: '2px solid transparent', borderTopColor: 'rgba(56,189,248,0.9)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(56,189,248,0.95)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}
