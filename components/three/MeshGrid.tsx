'use client';

import { useState, useEffect, useRef } from 'react';
import GameSlab from '../portal/GameSlab';
import { motion } from 'framer-motion'; // Added motion import

const PORTAL_CONFIG = [
    {
        id: 'bgmi',
        game: 'bgmi',
        title: 'BGMI',
        subtitle: 'Battlegrounds Mobile India',
        href: '/bgmi',
    },
    {
        id: 'ff',
        game: 'ff',
        title: 'FREE FIRE',
        subtitle: 'Garena Free Fire MAX',
        href: '/freefire',
    },
    {
        id: 'cod',
        game: 'cod',
        title: 'COD: MW',
        subtitle: 'Call of Duty Mobile',
        href: '/cod',
    },
];

export default function PortalGrid({ isTransitioning, setIsTransitioning }: { isTransitioning: boolean, setIsTransitioning: (val: boolean) => void }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    // Hydration Safety Wrapper
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="relative w-full h-full" />;
    }

    return (
        <div
            className="relative w-full h-full flex items-center justify-center perspective-[1000px]"
            style={{
                perspective: '1000px',
                zIndex: 1,
                position: 'relative',
                transform: 'translateZ(0px)',
                transformStyle: 'preserve-3d'
            }}
        >
            {/* Base perspective container for the full 3D viewport */}
            <div
                className="flex flex-col md:flex-row items-center justify-center gap-12"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {PORTAL_CONFIG.map((cfg, idx) => (
                    <GameSlab
                        key={cfg.id}
                        index={idx}
                        {...cfg}
                        hoveredIndex={hoveredIndex}
                        setHoveredIndex={setHoveredIndex}
                        isTransitioning={isTransitioning}
                        setIsTransitioning={setIsTransitioning}
                    />
                ))}
                {/* Removed Aeroplane Video Sequence */}
            </div>
        </div>
    );
}
