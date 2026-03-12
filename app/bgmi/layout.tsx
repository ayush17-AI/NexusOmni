'use client';

import Starfield from '@/components/portal/Starfield';
import { motion } from 'framer-motion';

/**
 * Shared layout for all /bgmi/* routes.
 *
 * Responsibilities:
 *  1. Render the Starfield canvas behind every BGMI sub-page
 *  2. Wrap children in a Framer Motion fade so navigation feels smooth
 *
 * The Starfield is already fixed-positioned (z-index -10) and handles its
 * own resize / cleanup — nothing extra needed here.
 */
export default function BGMILayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen overflow-x-hidden">
            {/* ── Shared cosmic background ── */}
            <Starfield />

            {/* ── Per-page content with smooth fade-in ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ position: 'relative', zIndex: 1 }}
            >
                {children}
            </motion.div>
        </div>
    );
}
