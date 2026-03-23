"use client";

import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  phase: number;
  speed: number;
  dropSpeed: number;
}

const NUM_STARS = 700;

export default function InteractiveStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    let rafId: number;
    let stars: Star[] = [];
    let time = 0;

    const rnd = (a: number, b: number) => Math.random() * (b - a) + a;

    const initStars = (w: number, h: number) => {
      stars = Array.from({ length: NUM_STARS }, () => {
        const hero = Math.random() < 0.05;
        return {
          x: rnd(0, w),
          y: rnd(0, h),
          radius: hero ? rnd(3.0, 4.5) : rnd(1.5, 3.5),
          alpha: rnd(0.4, 1.0),
          phase: rnd(0, Math.PI * 2),
          speed: rnd(0.004, 0.025),
          dropSpeed: rnd(0.1, 0.4), // Slow downward drift
        };
      });
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      initStars(w, h);
    };

    const draw = () => {
      time += 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Pure black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      for (const star of stars) {
        // Vertical drift simulating calm space movement
        star.y += star.dropSpeed;
        
        // Reset to top when passing the bottom
        if (star.y > h + star.radius) {
            star.y = -star.radius;
            star.x = rnd(0, w);
        }

        // Twinkling sine wave
        const twinkle = 0.55 + 0.45 * Math.sin(time * star.speed + star.phase);
        const a = star.alpha * twinkle;

        // Subtle glow map for hero objects
        if (star.radius > 2.8 && a > 0.6) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(180,210,255,${a * 0.45})`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    
    // Initial configuration
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, [mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div style={{ position: "fixed", inset: 0, background: "#000000", zIndex: -1 }} />;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "#000000",
        pointerEvents: "none",
      }}
    />
  );
}
