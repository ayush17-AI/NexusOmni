'use client';

import { useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface WheatBlade {
  x: number;       // base x (0–1 normalised)
  height: number;  // base height in px
  sway: number;    // sway amplitude
  phase: number;   // sway phase offset
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PARTICLE_COUNT = 180;
const WHEAT_BLADES_PER_LAYER = 80;
const VEHICLE_CYCLE = 18000; // ms per full L→R traverse
const LAYER_SPEEDS = [0.12, 0.07, 0.04]; // px/frame for each wheat layer

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createParticles(count: number, w: number, h: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: 0.15 + Math.random() * 0.35,
    vy: -(0.05 + Math.random() * 0.15),
    size: 0.8 + Math.random() * 2.2,
    opacity: 0.04 + Math.random() * 0.18,
  }));
}

function createWheatLayer(blades: number): WheatBlade[] {
  return Array.from({ length: blades }, (_, i) => ({
    x: i / blades + (Math.random() * 0.5) / blades,
    height: 40 + Math.random() * 60,
    sway: 6 + Math.random() * 10,
    phase: Math.random() * Math.PI * 2,
  }));
}

// ─── Draw passes ─────────────────────────────────────────────────────────────

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1a0d05');
  grad.addColorStop(0.42, '#7a2c04');
  grad.addColorStop(0.62, '#ff7a18');
  grad.addColorStop(0.78, '#d45b0a');
  grad.addColorStop(1, '#3b1d0a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawSunRays(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w * 0.52;
  const cy = h * 0.62; // horizon centre

  ctx.save();
  ctx.translate(cx, cy);

  const RAY_COUNT = 10;
  for (let i = 0; i < RAY_COUNT; i++) {
    const angle = (i / RAY_COUNT) * Math.PI - Math.PI / 2 + (Math.PI * 0.05);
    const spread = 0.045; // half-width of each ray in radians

    ctx.save();
    ctx.rotate(angle);
    const rayLen = Math.sqrt(w * w + h * h) * 0.9;

    // Build a thin triangle path for each ray
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
      Math.cos(-spread) * rayLen,
      Math.sin(-spread) * rayLen,
    );
    ctx.lineTo(
      Math.cos(spread) * rayLen,
      Math.sin(spread) * rayLen,
    );
    ctx.closePath();

    const rayGrad = ctx.createLinearGradient(0, 0, 0, rayLen);
    rayGrad.addColorStop(0, 'rgba(255,185,80,0.13)');
    rayGrad.addColorStop(0.5, 'rgba(255,140,30,0.05)');
    rayGrad.addColorStop(1, 'rgba(255,140,30,0)');
    ctx.fillStyle = rayGrad;
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawWheatLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  blades: WheatBlade[],
  layerIndex: number,     // 0 = farthest back, 2 = closest
  offsetX: number,        // scrolled offset
  time: number,
) {
  const horizonY = h * 0.68;
  const depthT = layerIndex / 2; // 0..1

  // Darken closer layers slightly more; front layer is richest
  const darkColor = `rgba(${8 + depthT * 12},${3 + depthT * 4},${1},1)`;
  const lightColor = `rgba(${30 + depthT * 20},${16 + depthT * 8},${2 + depthT * 2},0.9)`;
  const baseScale = 0.6 + depthT * 0.4; // closer = taller
  const bladeW = 2 + depthT * 2;

  for (const blade of blades) {
    const bx = ((blade.x * w + offsetX) % (w + 40)) - 20;
    const baseY = horizonY + 4 * (2 - layerIndex);
    const bladeH = blade.height * baseScale;
    const sway = Math.sin(time * 0.0008 + blade.phase) * blade.sway;

    ctx.beginPath();
    ctx.moveTo(bx, baseY);

    // Quadratic curve: base → tip with sway
    ctx.quadraticCurveTo(
      bx + sway,
      baseY - bladeH * 0.5,
      bx + sway * 1.5,
      baseY - bladeH,
    );

    // Stem width taper
    ctx.lineWidth = bladeW;
    ctx.strokeStyle = layerIndex === 2 ? darkColor : lightColor;
    ctx.stroke();

    // Seed head at the tip
    ctx.beginPath();
    ctx.arc(bx + sway * 1.5, baseY - bladeH, bladeW * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = layerIndex === 2 ? darkColor : lightColor;
    ctx.fill();
  }
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number,
  h: number,
) {
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,160,60,${p.opacity.toFixed(3)})`;
    ctx.fill();
  }
}

function tickParticles(particles: Particle[], w: number, h: number) {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x > w + 4) p.x = -4;
    if (p.y < -4) p.y = h + 4;
  }
}

function drawVehicle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  progress: number, // 0..1 across the screen
) {
  const horizonY = h * 0.67;
  const scale = 0.55; // small & distant
  const vw = 90 * scale;
  const vh = 38 * scale;
  const vx = -vw + progress * (w + vw * 2);
  const vy = horizonY - vh * 0.5;

  ctx.save();
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = '#120a02';

  // Body
  ctx.beginPath();
  ctx.roundRect(vx, vy + vh * 0.3, vw, vh * 0.7, 3 * scale);
  ctx.fill();

  // Roof / cab
  ctx.beginPath();
  ctx.roundRect(vx + vw * 0.15, vy, vw * 0.6, vh * 0.4, 3 * scale);
  ctx.fill();

  // Wheels
  const wheelR = 7 * scale;
  const wheelY = vy + vh - wheelR * 0.5;
  for (const wx of [vx + vw * 0.2, vx + vw * 0.8]) {
    ctx.beginPath();
    ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dust trail (behind the vehicle)
  const trailX = vx;
  for (let i = 0; i < 6; i++) {
    const dx = -(i * 14 * scale + Math.random() * 6);
    const dy = Math.random() * 8 - 4;
    ctx.beginPath();
    ctx.arc(trailX + dx, wheelY + dy, (3 + i * 2) * scale, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180,120,40,${0.12 - i * 0.018})`;
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createRadialGradient(
    w / 2, h / 2, h * 0.1,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.6, 'rgba(0,0,0,0.25)');
  grad.addColorStop(1, 'rgba(0,0,0,0.78)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BGMIAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mutable state kept in closure (no React state → no re-renders)
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    const wheatLayers: WheatBlade[][] = [];
    const layerOffsets = [0, 0, 0];
    let rafId = 0;
    let startTime = performance.now();

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w;
      canvas!.height = h;

      // Re-initialise on resize so particle positions stay sensible
      particles = createParticles(PARTICLE_COUNT, w, h);
      wheatLayers.length = 0;
      for (let i = 0; i < 3; i++) {
        wheatLayers.push(createWheatLayer(WHEAT_BLADES_PER_LAYER));
      }
    }

    function draw(now: number) {
      const time = now - startTime;
      const vehicleProgress = (time % VEHICLE_CYCLE) / VEHICLE_CYCLE;

      ctx!.clearRect(0, 0, w, h);

      // Pass 1 — sky
      drawSky(ctx!, w, h);

      // Pass 2 — sun rays
      drawSunRays(ctx!, w, h);

      // Pass 3 — wheat silhouettes (back → front)
      for (let i = 0; i < 3; i++) {
        layerOffsets[i] = (layerOffsets[i] + LAYER_SPEEDS[i]) % (w + 40);
        drawWheatLayer(ctx!, w, h, wheatLayers[i], i, layerOffsets[i], time);
      }

      // Pass 4 — dust particles
      tickParticles(particles, w, h);
      drawParticles(ctx!, particles, w, h);

      // Pass 5 — vehicle silhouette
      drawVehicle(ctx!, w, h, vehicleProgress);

      // Pass 6 — cinematic vignette
      drawVignette(ctx!, w, h);

      rafId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -20,
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
}
