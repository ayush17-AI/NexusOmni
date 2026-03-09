'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
    const [mounted, setMounted] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    const [isHoveringPortal, setIsHoveringPortal] = useState(false);
    const [slabCenter, setSlabCenter] = useState({ x: 0, y: 0 });

    // Fluid Motion Logic - Spring config with low stiffness for a smooth lag
    const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
    const ringX = useSpring(-100, springConfig);
    const ringY = useSpring(-100, springConfig);

    useEffect(() => {
        setMounted(true);

        const handleMouseMove = (e: MouseEvent) => {
            const clientX = e.clientX;
            const clientY = e.clientY;
            setMousePosition({ x: clientX, y: clientY });

            // Check magnetic distance to portal slabs
            const slabs = document.querySelectorAll('.portal-slab');
            let foundHover = false;

            slabs.forEach(slab => {
                const rect = slab.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Within 100px proximity computation
                const isNear =
                    clientX >= rect.left - 100 &&
                    clientX <= rect.right + 100 &&
                    clientY >= rect.top - 100 &&
                    clientY <= rect.bottom + 100;

                if (isNear) {
                    foundHover = true;
                    setSlabCenter({ x: centerX, y: centerY });
                }
            });

            setIsHoveringPortal(foundHover);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Apply the magnetic snap or follow the mouse
    useEffect(() => {
        if (isHoveringPortal) {
            ringX.set(slabCenter.x);
            ringY.set(slabCenter.y);
        } else {
            ringX.set(mousePosition.x);
            ringY.set(mousePosition.y);
        }
    }, [mousePosition, isHoveringPortal, slabCenter, ringX, ringY]);

    if (!mounted) return null;

    return (
        <div
            className="pointer-events-none fixed inset-0 z-[9999]"
            style={{ pointerEvents: 'none' }}
        >
            {/* Center Point - Tiny 3px solid pink dot */}
            <motion.div
                className="absolute shrink-0 rounded-full bg-[#FF00FF]"
                style={{
                    width: 3,
                    height: 3,
                    x: mousePosition.x,
                    y: mousePosition.y,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />

            {/* Outer Ring - 35px circle with backdrop blur */}
            <motion.div
                className="absolute shrink-0 rounded-full"
                animate={{
                    opacity: isHoveringPortal ? 1 : 0.6,
                    scale: isHoveringPortal ? 2 : 1,
                }}
                transition={{ duration: 0.2 }}
                style={{
                    width: 35,
                    height: 35,
                    x: ringX,
                    y: ringY,
                    translateX: '-50%',
                    translateY: '-50%',
                    border: '1px solid #FF00FF',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                }}
            />
        </div>
    );
}
