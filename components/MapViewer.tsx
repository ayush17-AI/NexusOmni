'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';

type Tool = 'pan' | 'pen' | 'marker' | 'shape' | 'eraser';

type Props = {
    map: string;
    mapName: string;
};

const COLORS = [
    { hex: '#22d3ee', label: 'Cyan' },
    { hex: '#facc15', label: 'Yellow' },
    { hex: '#f87171', label: 'Red' },
    { hex: '#4ade80', label: 'Green' },
    { hex: '#fb923c', label: 'Orange' },
    { hex: '#ffffff', label: 'White' },
];

const TOOLS: { id: Tool; icon: string; label: string; cursor: string }[] = [
    { id: 'pan', icon: '✋', label: 'Pan / Move', cursor: 'grab' },
    { id: 'pen', icon: '✏️', label: 'Freehand Draw', cursor: 'crosshair' },
    { id: 'marker', icon: '📍', label: 'Strategy Marker', cursor: 'crosshair' },
    { id: 'shape', icon: '⬛', label: 'Shape / Zone', cursor: 'crosshair' },
    { id: 'eraser', icon: '🧽', label: 'Eraser', cursor: 'cell' },
];

export default function MapViewer({ map, mapName }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const [activeTool, setActiveTool] = useState<Tool>('pan');
    const [brushSize, setBrushSize] = useState(4);
    const [activeColor, setActiveColor] = useState(COLORS[0].hex);
    const isDrawing = useRef(false);
    const shapeStart = useRef<{ x: number; y: number } | null>(null);
    const snapshotRef = useRef<ImageData | null>(null);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);

    const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
    const [pins, setPins] = useState<{ id: number; px: number; py: number }[]>([]);
    const [coords, setCoords] = useState({ x: 0, y: 0 });

    /* ── Sync canvas pixel size to displayed element size ── */
    useEffect(() => {
        const el = innerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            for (const e of entries) {
                setCanvasSize({
                    w: Math.round(e.contentRect.width),
                    h: Math.round(e.contentRect.height),
                });
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    /* ── Scroll-to-zoom ── */
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        setScale(prev => Math.min(Math.max(prev - e.deltaY * 0.003, 0.3), 8));
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    /* ── Canvas context helpers ── */
    const ctx = () => canvasRef.current?.getContext('2d') ?? null;

    const toCanvasCoords = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const setupCtx = (c: CanvasRenderingContext2D) => {
        c.strokeStyle = activeColor;
        c.lineWidth = brushSize;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.globalCompositeOperation = 'source-over';
    };

    /* ── Unified mouse events ── */
    const onMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'pan') {
            setIsDragging(true);
            dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
            return;
        }
        const { x, y } = toCanvasCoords(e.clientX, e.clientY);

        if (activeTool === 'pen') {
            isDrawing.current = true;
            lastPoint.current = { x, y };
            const c = ctx();
            if (!c) return;
            setupCtx(c);
            c.beginPath();
            c.moveTo(x, y);
            return;
        }
        if (activeTool === 'eraser') {
            isDrawing.current = true;
            return;
        }
        if (activeTool === 'shape') {
            isDrawing.current = true;
            shapeStart.current = { x, y };
            // snapshot canvas so we can redraw preview each frame
            const c = ctx();
            const canvas = canvasRef.current;
            if (c && canvas) {
                snapshotRef.current = c.getImageData(0, 0, canvas.width, canvas.height);
            }
            return;
        }
        if (activeTool === 'marker') {
            const canvas = canvasRef.current!;
            setPins(prev => [
                ...prev,
                { id: Date.now(), px: x / canvas.width, py: y / canvas.height },
            ]);
        }
    };

    const onMouseMove = (e: React.MouseEvent) => {
        // Update coordinate readout
        const canvas = canvasRef.current;
        if (canvas) {
            const { x, y } = toCanvasCoords(e.clientX, e.clientY);
            setCoords({
                x: Math.round((x / canvas.width) * 100),
                y: Math.round((y / canvas.height) * 100),
            });
        }

        if (activeTool === 'pan' && isDragging) {
            setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
            return;
        }
        if (activeTool === 'pen' && isDrawing.current) {
            const c = ctx();
            if (!c) return;
            const { x, y } = toCanvasCoords(e.clientX, e.clientY);
            const prev = lastPoint.current ?? { x, y };
            // Smooth quadratic curve
            const mx = (prev.x + x) / 2;
            const my = (prev.y + y) / 2;
            setupCtx(c);
            c.quadraticCurveTo(prev.x, prev.y, mx, my);
            c.stroke();
            c.beginPath();
            c.moveTo(mx, my);
            lastPoint.current = { x, y };
            return;
        }
        if (activeTool === 'eraser' && isDrawing.current) {
            const c = ctx();
            if (!c) return;
            const { x, y } = toCanvasCoords(e.clientX, e.clientY);
            const eraserR = brushSize * 4;
            c.save();
            c.globalCompositeOperation = 'destination-out';
            c.beginPath();
            c.arc(x, y, eraserR, 0, Math.PI * 2);
            c.fill();
            c.restore();
        }
        if (activeTool === 'shape' && isDrawing.current && shapeStart.current) {
            const c = ctx();
            if (!c || !snapshotRef.current) return;
            const cvs = canvasRef.current!;
            c.putImageData(snapshotRef.current, 0, 0);
            const { x, y } = toCanvasCoords(e.clientX, e.clientY);
            const rx = Math.abs(x - shapeStart.current.x) / 2;
            const ry = Math.abs(y - shapeStart.current.y) / 2;
            const cx2 = (x + shapeStart.current.x) / 2;
            const cy2 = (y + shapeStart.current.y) / 2;
            setupCtx(c);
            c.beginPath();
            c.ellipse(cx2, cy2, rx, ry, 0, 0, Math.PI * 2);
            c.stroke();
        }
    };

    const onMouseUp = () => {
        setIsDragging(false);
        if (isDrawing.current) {
            ctx()?.beginPath();
            isDrawing.current = false;
            lastPoint.current = null;
            shapeStart.current = null;
            snapshotRef.current = null;
        }
    };

    /* ── Touch support ── */
    const onTouchStart = (e: React.TouchEvent) => {
        if (activeTool !== 'pan') return;
        const t = e.touches[0];
        setIsDragging(true);
        dragStart.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
    };
    const onTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const t = e.touches[0];
        setOffset({ x: t.clientX - dragStart.current.x, y: t.clientY - dragStart.current.y });
    };

    const clearAll = () => {
        const canvas = canvasRef.current;
        if (canvas) ctx()?.clearRect(0, 0, canvas.width, canvas.height);
        setPins([]);
    };

    const resetView = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

    const cursorStyle = () => {
        if (activeTool === 'pan') return isDragging ? 'grabbing' : 'grab';
        const t = TOOLS.find(t => t.id === activeTool);
        return t?.cursor ?? 'default';
    };

    return (
        <div className="w-screen h-screen overflow-hidden relative flex flex-col select-none"
            style={{ background: '#030810' }}
        >
            {/* Animated scan line */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div style={{ animation: 'scan-line 8s linear infinite' }}
                    className="absolute left-0 right-0 h-px"
                    id="scanline"
                // Inline keyframe defined at bottom
                />
            </div>

            {/* ── TOP BAR ── */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)', backdropFilter: 'blur(8px)' }}
            >
                {/* Back link */}
                <Link
                    href="/bgmi/maps"
                    className="flex items-center gap-2 text-xs tracking-[0.35em] transition-all duration-300 group"
                    style={{ fontFamily: 'Exo 2, sans-serif', color: 'rgba(243,175,25,0.65)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(243,175,25,1)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(243,175,25,0.65)')}
                >
                    <span className="group-hover:-translate-x-1 transition-transform inline-block">◄</span> MAPS
                </Link>

                {/* Center: Map name + coordinate readout */}
                <div className="flex flex-col items-center">
                    <h1
                        className="text-lg font-black uppercase tracking-[0.35em]"
                        style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            background: 'linear-gradient(135deg, #F3AF19, #fff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        {mapName}
                    </h1>
                    <p className="text-[9px] tracking-[0.25em] text-cyan-400/50 font-mono mt-0.5">
                        X: {String(coords.x).padStart(3, '0')} · Y: {String(coords.y).padStart(3, '0')}
                    </p>
                </div>

                {/* Zoom controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setScale(s => Math.min(s + 0.5, 8))}
                        className="w-8 h-8 rounded-lg text-white font-bold text-sm transition-all duration-200 flex items-center justify-center"
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    >
                        +
                    </button>
                    <span className="text-white/40 text-xs w-12 text-center font-mono">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={() => setScale(s => Math.max(s - 0.5, 0.3))}
                        className="w-8 h-8 rounded-lg text-white font-bold text-sm transition-all duration-200 flex items-center justify-center"
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    >
                        −
                    </button>
                    <button
                        onClick={resetView}
                        className="px-3 h-8 rounded-lg text-white/60 text-xs tracking-wide transition-all duration-200"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* ── MAP CANVAS AREA ── */}
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden relative"
                style={{ cursor: cursorStyle() }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={() => { setIsDragging(false); isDrawing.current = false; }}
            >
                <div
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div ref={innerRef} className="relative" style={{ width: '85vw', height: '85vh' }}>
                        {/* Map image */}
                        <img
                            src={map}
                            alt={mapName}
                            className="w-full h-full object-contain"
                            draggable={false}
                        />

                        {/* Tactical coordinate grid overlay */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundImage: `
                                    linear-gradient(rgba(0,255,180,0.04) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(0,255,180,0.04) 1px, transparent 1px)
                                `,
                                backgroundSize: '80px 80px',
                            }}
                        />

                        {/* Map edge glow */}
                        <div
                            className="absolute inset-0 pointer-events-none rounded-sm"
                            style={{
                                boxShadow: 'inset 0 0 40px rgba(56,189,248,0.08), inset 0 0 80px rgba(0,255,180,0.04)',
                                animation: 'map-glow 4s ease-in-out infinite',
                            }}
                        />

                        {/* Drawing canvas */}
                        <canvas
                            ref={canvasRef}
                            width={canvasSize.w}
                            height={canvasSize.h}
                            className="absolute inset-0 w-full h-full"
                            style={{ pointerEvents: 'none' }}
                        />

                        {/* Custom dropped pins */}
                        {pins.map(pin => (
                            <button
                                key={pin.id}
                                className="absolute text-2xl leading-none -translate-x-1/2 -translate-y-full hover:scale-125 transition-transform z-10"
                                style={{
                                    left: `${pin.px * 100}%`,
                                    top: `${pin.py * 100}%`,
                                    pointerEvents: activeTool === 'pan' ? 'auto' : 'none',
                                    filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.8)) drop-shadow(0 2px 4px #000)',
                                }}
                                title="Click to remove"
                                onClick={e => {
                                    e.stopPropagation();
                                    setPins(prev => prev.filter(p => p.id !== pin.id));
                                }}
                            >
                                📍
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── FLOATING TOOL PANEL (bottom center) ── */}
            <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3"
                style={{ pointerEvents: 'auto' }}
            >
                {/* Brush size + Color row */}
                <div
                    className="flex items-center gap-4 px-5 py-3 rounded-2xl"
                    style={{
                        background: 'rgba(6,12,28,0.85)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(56,189,248,0.15)',
                        boxShadow: '0 0 24px rgba(0,0,0,0.6)',
                    }}
                >
                    {/* Brush size */}
                    <div className="flex items-center gap-2">
                        <span className="text-white/30 text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: 'Exo 2, sans-serif' }}>Size</span>
                        <input
                            type="range"
                            min={2}
                            max={20}
                            value={brushSize}
                            onChange={e => setBrushSize(Number(e.target.value))}
                            className="w-20 accent-cyan-400"
                            style={{ cursor: 'pointer' }}
                        />
                        <span className="text-cyan-400/70 text-xs font-mono w-4">{brushSize}</span>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-5 bg-white/10" />

                    {/* Color swatches */}
                    <div className="flex items-center gap-2">
                        <span className="text-white/30 text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: 'Exo 2, sans-serif' }}>Color</span>
                        <div className="flex gap-1.5">
                            {COLORS.map(c => (
                                <button
                                    key={c.hex}
                                    title={c.label}
                                    onClick={() => setActiveColor(c.hex)}
                                    className="rounded-full transition-all duration-200"
                                    style={{
                                        width: activeColor === c.hex ? 18 : 14,
                                        height: activeColor === c.hex ? 18 : 14,
                                        background: c.hex,
                                        boxShadow: activeColor === c.hex
                                            ? `0 0 10px ${c.hex}, 0 0 20px ${c.hex}80`
                                            : 'none',
                                        border: activeColor === c.hex
                                            ? `2px solid ${c.hex}`
                                            : '1px solid rgba(255,255,255,0.2)',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tool buttons row */}
                <div
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                    style={{
                        background: 'rgba(6,12,28,0.9)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: `0 0 40px rgba(0,0,0,0.7), 0 0 ${activeTool !== 'pan' ? '20px rgba(34,211,238,0.1)' : '0px transparent'}`,
                    }}
                >
                    {TOOLS.map(t => {
                        const isActive = activeTool === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTool(t.id)}
                                title={t.label}
                                className="flex flex-col items-center gap-1 rounded-xl transition-all duration-200"
                                style={{
                                    width: 52,
                                    height: 52,
                                    background: isActive
                                        ? 'rgba(34,211,238,0.18)'
                                        : 'rgba(255,255,255,0.04)',
                                    border: isActive
                                        ? '1px solid rgba(34,211,238,0.6)'
                                        : '1px solid rgba(255,255,255,0.08)',
                                    boxShadow: isActive
                                        ? '0 0 16px rgba(34,211,238,0.3), inset 0 0 12px rgba(34,211,238,0.1)'
                                        : 'none',
                                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                    justifyContent: 'center',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                }}
                            >
                                <span className="text-lg leading-none">{t.icon}</span>
                                <span
                                    className="text-[7px] tracking-wide uppercase leading-none"
                                    style={{
                                        color: isActive ? 'rgba(34,211,238,0.9)' : 'rgba(255,255,255,0.3)',
                                        fontFamily: 'Exo 2, sans-serif',
                                    }}
                                >
                                    {t.label.split(' ')[0]}
                                </span>
                            </button>
                        );
                    })}

                    {/* Divider */}
                    <div className="w-px h-10 bg-white/10 mx-1" />

                    {/* Clear All */}
                    <button
                        onClick={clearAll}
                        title="Clear All"
                        className="flex flex-col items-center gap-1 rounded-xl transition-all duration-200"
                        style={{
                            width: 52,
                            height: 52,
                            background: 'rgba(239,68,68,0.12)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                            e.currentTarget.style.boxShadow = '0 0 14px rgba(239,68,68,0.3)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <span className="text-lg leading-none">🗑</span>
                        <span className="text-[7px] tracking-wide uppercase leading-none text-red-400/60" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                            Clear
                        </span>
                    </button>
                </div>

                {/* Status hint */}
                <div className="text-[9px] tracking-[0.25em] uppercase text-center pointer-events-none" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                    {activeTool === 'pan' && <span className="text-white/25">Scroll to zoom · Drag to pan</span>}
                    {activeTool === 'pen' && <span className="text-cyan-400/60">Click and drag to draw freely</span>}
                    {activeTool === 'marker' && <span className="text-cyan-400/60">Click to drop a strategy marker</span>}
                    {activeTool === 'shape' && <span className="text-cyan-400/60">Click and drag to draw a zone</span>}
                    {activeTool === 'eraser' && <span className="text-cyan-400/60">Drag over drawings to erase</span>}
                </div>
            </div>

            {/* CSS Keyframes */}
            <style>{`
                @keyframes scan-line {
                    0%   { top: -2px; opacity: 0; }
                    5%   { opacity: 0.4; }
                    95%  { opacity: 0.15; }
                    100% { top: 100vh; opacity: 0; }
                }
                #scanline {
                    background: linear-gradient(to right, transparent, rgba(0,255,180,0.3), transparent);
                }
                @keyframes map-glow {
                    0%, 100% { opacity: 0.6; }
                    50%      { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
