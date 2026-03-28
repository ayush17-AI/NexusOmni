'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';
import { Message } from './ChatMessage';

// Relative path: works on localhost:3000 AND on Vercel (no env var needed)
const CHAT_API = '/api/chat';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async (text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const data: { reply: string } = await res.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI backend error:', err);
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          '⚠️ AI server is temporarily unavailable. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    // Fixed to bottom-right corner, above all page content
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <ChatWindow
        isOpen={isOpen}
        messages={messages}
        isLoading={isLoading}
        onSend={handleSend}
      />
      {/* Float animation only on the button, not the whole container */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChatButton isOpen={isOpen} onClick={() => setIsOpen((o) => !o)} />
      </motion.div>
    </div>
  );
}
