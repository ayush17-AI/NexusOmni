'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';

interface NewsTickerProps {
    items: string[];
}

export default function NewsTicker({ items }: NewsTickerProps) {
    // Duplicate for seamless loop
    const all = [...items, ...items];
    const x = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const speedRef = useRef(-0.9); // px per frame

    useAnimationFrame(() => {
        if (!containerRef.current) return;
        const halfWidth = containerRef.current.scrollWidth / 2;
        let next = x.get() + speedRef.current;
        if (Math.abs(next) >= halfWidth) next = 0;
        x.set(next);
    });

    return (
        <div
            className="relative overflow-hidden rounded-lg"
            style={{
                background: 'linear-gradient(135deg, #F3AF19 0%, #B87333 100%)',
                padding: '1px',
            }}
        >
            {/* Fade edges */}
            <div
                className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, #B87333, transparent)' }}
            />
            <div
                className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to left, #B87333, transparent)' }}
            />

            <div
                className="overflow-hidden rounded-lg"
                style={{ background: 'rgba(18,10,0,0.9)', padding: '12px 0' }}
            >
                <motion.div
                    ref={containerRef}
                    style={{ x, display: 'flex', gap: 0, whiteSpace: 'nowrap', willChange: 'transform' }}
                >
                    {all.map((item, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-3"
                            style={{
                                fontFamily: 'Exo 2, sans-serif',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                letterSpacing: '0.04em',
                                color: '#F3AF19',
                                padding: '0 40px',
                            }}
                        >
                            {item}
                            <span style={{ color: '#B87333', fontSize: '0.6rem', marginLeft: 8 }}>◆</span>
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
