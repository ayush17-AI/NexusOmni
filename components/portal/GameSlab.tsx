'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

type GameKey = 'bgmi' | 'valorant' | 'coming';

interface GameSlabProps {
    id: string;
    title: string;
    subtitle: string;
    href: string;
    index: number;
    hoveredIndex: number | null;
    setHoveredIndex: (index: number | null) => void;
    isTransitioning: boolean;
    setIsTransitioning: (val: boolean) => void;
}

const CONFIG = {
    bgmi: {
        accent: '#FFB800',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    },
    valorant: {
        accent: '#FF4655',
        image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=800&auto=format&fit=crop',
    },
    coming: {
        accent: '#777777',
        image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop',
    }
};

export default function GameSlab(props: GameSlabProps) {
    const router = useRouter();
    const cfg = CONFIG[props.id as GameKey];

    // Define structural values manually or via framer variants
    const isHovered = props.hoveredIndex === props.index;
    const isAnotherHovered = props.hoveredIndex !== null && !isHovered;

    // Transition overrides
    const isThisTransitioning = props.isTransitioning && props.id === 'bgmi';
    const isOtherTransitioning = props.isTransitioning && props.id !== 'bgmi';

    // Base spring settings
    const springConfig = { type: "spring", stiffness: 300, damping: 30 };
    const transitionProps = props.isTransitioning
        ? { duration: isThisTransitioning ? 0.8 : 0.4, ease: "easeInOut" }
        : { ...springConfig };

    const handlePortalClick = () => {
        if (props.id === 'bgmi') {
            props.setIsTransitioning(true);
        } else {
            router.push(props.href);
        }
    };

    const edgeGlow = isHovered
        ? `0 0 25px 2px ${cfg.accent}, inset 0 0 10px 1px ${cfg.accent}`
        : `0 0 15px 1px ${cfg.accent}`;

    return (
        <motion.div
            animate={{
                // Base Layout & Hover standard - using GPU accelerated transforms
                scale: isThisTransitioning ? 2.5 : (isHovered ? 1.05 : 1),
                z: isHovered && !props.isTransitioning ? 100 : 0,
                opacity: isThisTransitioning ? 0 : (isOtherTransitioning ? 0 : (isAnotherHovered ? 0.3 : 1)),
                // Reduced filter complexity for better performance
                filter: isAnotherHovered ? 'blur(2px)' : 'blur(0px)',
                y: isHovered && !props.isTransitioning ? -15 : 0,
            }}
            transition={transitionProps}
            onAnimationComplete={() => {
                if (isThisTransitioning) {
                    window.location.href = '/bgmi';
                }
            }}
            onPointerOver={() => !props.isTransitioning && props.setHoveredIndex(props.index)}
            onPointerOut={() => !props.isTransitioning && props.setHoveredIndex(null)}
            onClick={handlePortalClick}
            className="relative cursor-pointer select-none group flex flex-col items-center justify-center p-6 pointer-events-auto transform-gpu"
            style={{
                // Establish local 3D space for nested elements
                transformStyle: 'preserve-3d',
                width: '320px',
                height: '480px',
            }}
        >
            {/* The Diorama Slab - Frosted Glass Glassmorphism */}
            <div
                className="absolute inset-0 z-10 transition-all duration-300 pointer-events-none"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(12px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                    borderRadius: '16px',
                    border: `1px solid ${isHovered ? cfg.accent : 'rgba(255, 255, 255, 0.1)'}`,
                    boxShadow: isHovered ? edgeGlow : `0 4px 30px rgba(0, 0, 0, 0.5)`,
                    transform: 'translateZ(0px)',
                    transformStyle: 'preserve-3d',
                }}
            />

            {/* 3D Wallpaper Integration - Recessed behind the glass */}
            <div
                className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
                style={{
                    display: 'grid',
                    overflow: 'hidden',
                    isolation: 'isolate',
                    borderRadius: '16px', // Matching glass slab border radius
                    // Push the image back in 3D space to create the diorama parallax
                    transform: 'translateZ(-50px)',
                    opacity: isAnotherHovered ? 0.2 : 1.0,
                }}
            >
                <img
                    src={cfg.image}
                    alt={props.title}
                    style={{
                        gridArea: '1/1',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 'inherit',
                        opacity: 0.35, // High transparency to let Starfield bleed through
                        mixBlendMode: 'screen', // Blends into the glass and stars
                    }}
                />
            </div>

            {/* Floating 3D Text Overlays - Pushed forward */}
            <div
                className="relative z-20 flex flex-col items-center pointer-events-none"
                style={{
                    // Push text forward in 3D space
                    transform: 'translateZ(50px)',
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Floating Shadow for text depth */}
                <h2
                    className="text-white font-black tracking-wider text-4xl mb-1 text-center transition-all duration-300 uppercase leading-none"
                    style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        textShadow: isHovered
                            ? `0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px ${cfg.accent}`
                            : '0 5px 15px rgba(0,0,0,0.8)'
                    }}
                >
                    {props.title}
                </h2>

                <h3
                    className="text-xs tracking-[0.2em] uppercase font-bold text-center mt-2"
                    style={{ color: cfg.accent, fontFamily: 'Exo 2, sans-serif' }}
                >
                    {props.subtitle}
                </h3>

                {/* Enter Zone Button appearing on hover */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                    className="absolute top-full mt-12 text-xs tracking-[0.3em] font-bold"
                    style={{ color: cfg.accent, fontFamily: 'Exo 2, sans-serif' }}
                >
                    ENTER ZONE →
                </motion.div>
            </div>

        </motion.div>
    );
}
