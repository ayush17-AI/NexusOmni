'use client';

import { useEffect, useRef, useState } from 'react';

export default function Starfield() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);

    // Hydration Safety: Ensure canvas only renders after client mount
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
        if (!ctx) return;

        let animationFrameId: number;
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        // Generate static coordinates for stars
        const stars = Array.from({ length: 1500 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            radius: Math.random() * 1.5,
            speed: Math.random() * 0.2 + 0.05,
            alpha: Math.random() * 0.8 + 0.2
        }));

        const handleResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        const render = () => {
            // Absolute black background clearing
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            // Draw drifting stars
            stars.forEach(star => {
                star.y -= star.speed; // Drift upwards slowly
                if (star.y < 0) {
                    star.y = h;
                    star.x = Math.random() * w;
                }
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mounted]);

    if (!mounted) return <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -10, transform: 'translateZ(-500px)', backfaceVisibility: 'hidden' }} />;

    return (
        <canvas
            ref={canvasRef}
            style={{
                display: 'block',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: -10,
                overflow: 'hidden',
                transform: 'translateZ(-500px)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
            }}
        />
    );
}
