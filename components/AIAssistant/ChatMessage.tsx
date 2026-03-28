'use client';

import { motion } from 'framer-motion';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

/** Renders a single line of markdown-ish text into styled JSX */
function renderLine(line: string, key: number) {
  // Headings: ## or ###
  if (/^###\s/.test(line)) {
    return (
      <p key={key} className="font-bold text-xs mt-2 mb-0.5 uppercase tracking-wider" style={{ color: 'rgba(56,189,248,0.7)' }}>
        {renderInline(line.replace(/^###\s/, ''))}
      </p>
    );
  }
  if (/^##\s/.test(line)) {
    return (
      <p key={key} className="font-bold text-sm mt-2 mb-1" style={{ color: 'rgba(56,189,248,0.9)' }}>
        {renderInline(line.replace(/^##\s/, ''))}
      </p>
    );
  }

  // Numbered list: "1. " or "1️⃣ "
  const numberedMatch = line.match(/^(\d+[.)]\s|[1-9]️⃣\s)/);
  if (numberedMatch) {
    const content = line.slice(numberedMatch[0].length);
    return (
      <p key={key} className="font-semibold mt-2 mb-0.5 flex gap-1.5 items-start" style={{ color: 'rgba(56,189,248,0.9)' }}>
        <span className="flex-shrink-0">{numberedMatch[0].trim()}</span>
        <span>{renderInline(content)}</span>
      </p>
    );
  }

  // Bullet: "- " or "• "
  if (/^[-•]\s/.test(line)) {
    return (
      <p key={key} className="pl-2 mb-0.5 flex gap-1.5 items-start">
        <span style={{ color: 'rgba(56,189,248,0.7)' }} className="flex-shrink-0 mt-0.5">•</span>
        <span>{renderInline(line.replace(/^[-•]\s/, ''))}</span>
      </p>
    );
  }

  // Bold-only line (e.g. **heading**)
  if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
    return (
      <p key={key} className="font-bold mb-1 mt-1.5" style={{ color: 'rgba(56,189,248,0.9)' }}>
        {line.replace(/\*\*/g, '')}
      </p>
    );
  }

  // Empty line → spacer
  if (line.trim() === '') return <br key={key} />;

  // Default paragraph
  return <p key={key} className="mb-0.5">{renderInline(line)}</p>;
}

/** Renders inline markdown: **bold** and *italic* */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const raw = match[0];
    if (raw.startsWith('**')) {
      parts.push(<strong key={match.index} style={{ color: 'rgba(56,189,248,0.9)' }}>{raw.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={match.index} className="opacity-80">{raw.slice(1, -1)}</em>);
    }
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {/* Avatar for assistant */}
      {!isUser && (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-0.5"
          style={{
            background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.4)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(56,189,248,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        </div>
      )}

      <div
        className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
        style={
          isUser
            ? {
                background: 'rgba(56,189,248,0.12)',
                border: '1px solid rgba(56,189,248,0.3)',
                color: 'rgba(255,255,255,0.92)',
                borderBottomRightRadius: '4px',
                fontFamily: 'Exo 2, sans-serif',
              }
            : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.82)',
                borderBottomLeftRadius: '4px',
                fontFamily: 'Exo 2, sans-serif',
              }
        }
      >
        {isUser
          ? <p>{message.content}</p>
          : message.content.split('\n').map((line, i) => renderLine(line, i))
        }

        <p className="text-[10px] mt-1.5 opacity-40 text-right" style={{ fontFamily: 'Exo 2, sans-serif' }}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}
