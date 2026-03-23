"use client";

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

const ICONS = {
    pan: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M19 9l3 3-3 3"/><path d="M9 19l3 3 3-3"/><path d="M2 12h20"/><path d="M12 2v20"/></svg>,
    pen: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21.17 6.81a1 1 0 0 0-3.98-3.98L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="M15 5l4 4"/></svg>,
    eraser: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21L2.7 16.7a2 2 0 0 1 0-2.8l11.5-11.5a2 2 0 0 1 2.8 0l4.3 4.3c.8.8.8 2 0 2.8L9.8 21z"/><path d="M7 21h14"/><path d="M10 9l5 5"/></svg>,
    shape: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>,
    marker: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
    trash: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
};

const TOOLS: { id: Tool; icon: JSX.Element; label: string; cursor: string }[] = [
    { id: 'pan', icon: ICONS.pan, label: 'Pan', cursor: 'grab' },
    { id: 'pen', icon: ICONS.pen, label: 'Pencil', cursor: 'crosshair' },
    { id: 'eraser', icon: ICONS.eraser, label: 'Eraser', cursor: 'cell' },
    { id: 'shape', icon: ICONS.shape, label: 'Zone', cursor: 'crosshair' },
    { id: 'marker', icon: ICONS.marker, label: 'Marker', cursor: 'crosshair' },
];

export default function MapViewer({ map, mapName }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const coordsRef = useRef<HTMLParagraphElement>(null);
    const zoomLevelRef = useRef<HTMLSpanElement>(null);

    // High performance Transform state detached from React tree
    const transformRef = useRef({ x: 0, y: 0, scale: 1 });
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    const [activeTool, setActiveTool] = useState<Tool>('pan');
    const [brushSize, setBrushSize] = useState(4);
    const [activeColor, setActiveColor] = useState(COLORS[0].hex);
    
    // Drawing loop state
    const isDrawingRef = useRef(false);
    const shapeStart = useRef<{ x: number; y: number } | null>(null);
    const snapshotRef = useRef<ImageData | null>(null);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);
    const pointsQueue = useRef<{x: number, y: number}[]>([]);

    const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
    const [pins, setPins] = useState<{ id: number; px: number; py: number }[]>([]);

    /* ── Performant UI Updaters ── */
    const updateTransformUI = useCallback(() => {
        if (innerRef.current) {
            // Rigid body translation over an absolute (0,0) transform pivot
            innerRef.current.style.transform = `translate(${transformRef.current.x}px, ${transformRef.current.y}px) scale(${transformRef.current.scale})`;
        }
        if (zoomLevelRef.current) {
            zoomLevelRef.current.innerText = `${Math.round(transformRef.current.scale * 100)}%`;
        }
    }, []);

    /* ── Initial Map Centering ── */
    const resetView = useCallback(() => {
        const el = containerRef.current;
        const inner = innerRef.current;
        if (el && inner) {
            const cw = el.clientWidth;
            const ch = el.clientHeight;
            const iw = inner.offsetWidth;
            const ih = inner.offsetHeight;
            // Center map relative to viewport strictly using translation math
            transformRef.current = { 
                x: (cw - iw) / 2, 
                y: (ch - ih) / 2, 
                scale: 1 
            };
        } else {
            transformRef.current = { x: 0, y: 0, scale: 1 };
        }
        updateTransformUI();
    }, [updateTransformUI]);

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
            // Trigger 0,0 alignment once elements mount and get geometry
            resetView();
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [resetView]);

    /* ── Math-certified Focal Zoom Engine ── */
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const el = containerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        
        // Mouse coordinate relative to the unscaled container viewport
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        const t = transformRef.current;
        const zoomSensitivity = 0.002;
        
        // Exponential zoom limits matching standard interactive maps (0.5x to 4x)
        const oldScale = t.scale;
        const newScale = Math.min(Math.max(oldScale - e.deltaY * zoomSensitivity, 0.5), 4);
        
        // ── RATIO-BASED CENTERED ZOOM CALCULUS ── //
        // Shifts the transform (x,y) inversely to the scale change around the cursor pivot
        // so the pixel under the mouse never visually moves across the screen.
        t.x = cursorX - (cursorX - t.x) * (newScale / oldScale);
        t.y = cursorY - (cursorY - t.y) * (newScale / oldScale);
        t.scale = newScale;

        updateTransformUI();
    }, [updateTransformUI]);

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
        // getBoundingClientRect natively returns the current fully scaled DOM geometry 
        // regardless of scale ratios, guaranteeing drawing layer alignment perfectly.
        const rect = canvas.getBoundingClientRect(); 
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const setupCtx = (c: CanvasRenderingContext2D, isEraser = false) => {
        if (isEraser) {
            c.globalCompositeOperation = 'destination-out';
            c.lineWidth = brushSize * 3; // Clear defined eraser radius independent of global
        } else {
            c.globalCompositeOperation = 'source-over';
            c.strokeStyle = activeColor;
            c.lineWidth = brushSize;
        }
        c.lineCap = 'round';
        c.lineJoin = 'round';
    };

    /* ── requestAnimationFrame High Performance Draw Loop ── */
    useEffect(() => {
        let maxRafId: number;

        const drawLoop = () => {
            if (isDrawingRef.current && pointsQueue.current.length > 0 && (activeTool === 'pen' || activeTool === 'eraser')) {
                const c = ctx();
                if (c && lastPoint.current) {
                    setupCtx(c, activeTool === 'eraser');
                    
                    let prev = lastPoint.current;
                    c.beginPath();
                    c.moveTo(prev.x, prev.y);
                    
                    // Flush the batched point queue using quadratic smoothed interpolation
                    while (pointsQueue.current.length > 0) {
                        const p = pointsQueue.current.shift()!;
                        const mx = (prev.x + p.x) / 2;
                        const my = (prev.y + p.y) / 2;
                        c.quadraticCurveTo(prev.x, prev.y, mx, my);
                        prev = p;
                    }
                    
                    c.stroke();
                    lastPoint.current = prev;
                }
            }
            maxRafId = requestAnimationFrame(drawLoop);
        };

        maxRafId = requestAnimationFrame(drawLoop);
        return () => cancelAnimationFrame(maxRafId);
    }, [activeTool, activeColor, brushSize]);

    /* ── Unified mouse events ── */
    const onMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'pan') {
            isDraggingRef.current = true;
            dragStartRef.current = { 
                x: e.clientX - transformRef.current.x, 
                y: e.clientY - transformRef.current.y 
            };
            if (innerRef.current) innerRef.current.style.transition = 'none';
            return;
        }
        
        const { x, y } = toCanvasCoords(e.clientX, e.clientY);

        if (activeTool === 'pen' || activeTool === 'eraser') {
            isDrawingRef.current = true;
            lastPoint.current = { x, y };
            pointsQueue.current = [];
            
            // Draw a single dot immediately on click
            const c = ctx();
            if (c) {
                setupCtx(c, activeTool === 'eraser');
                c.beginPath();
                c.arc(x, y, (activeTool === 'eraser' ? brushSize * 3 : brushSize) / 2, 0, Math.PI * 2);
                c.fill();
            }
            return;
        }
        
        if (activeTool === 'shape') {
            isDrawingRef.current = true;
            shapeStart.current = { x, y };
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
        // High-perf sub-DOM update for coordinate readout (bypasses massive React re-render)
        const canvas = canvasRef.current;
        if (canvas && coordsRef.current) {
            const { x, y } = toCanvasCoords(e.clientX, e.clientY);
            coordsRef.current.innerText = `X: ${String(Math.round((x / canvas.width) * 100)).padStart(3, '0')} · Y: ${String(Math.round((y / canvas.height) * 100)).padStart(3, '0')}`;
        }

        if (activeTool === 'pan' && isDraggingRef.current) {
            transformRef.current.x = e.clientX - dragStartRef.current.x;
            transformRef.current.y = e.clientY - dragStartRef.current.y;
            updateTransformUI();
            return;
        }
        
        if ((activeTool === 'pen' || activeTool === 'eraser') && isDrawingRef.current) {
            const { x, y } = toCanvasCoords(e.clientX, e.clientY);
            pointsQueue.current.push({ x, y });
            return;
        }
        
        if (activeTool === 'shape' && isDrawingRef.current && shapeStart.current) {
            const c = ctx();
            if (!c || !snapshotRef.current) return;
            // Write layout back, then draw the preview
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
        isDraggingRef.current = false;
        if (innerRef.current) innerRef.current.style.transition = 'transform 0.08s ease-out';
        
        if (isDrawingRef.current) {
            isDrawingRef.current = false;
            lastPoint.current = null;
            shapeStart.current = null;
            snapshotRef.current = null;
            pointsQueue.current = [];
        }
    };

    const clearAll = () => {
        const canvas = canvasRef.current;
        if (canvas) ctx()?.clearRect(0, 0, canvas.width, canvas.height);
        setPins([]);
    };

    const cursorStyle = () => {
        if (activeTool === 'pan') return isDraggingRef.current ? 'grabbing' : 'grab';
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
                />
            </div>

            {/* ── TOP BAR ── */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4"
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
                    {/* Bypassing React render for raw high speed coordinate updates */}
                    <p ref={coordsRef} className="text-[9px] tracking-[0.25em] text-cyan-400/50 font-mono mt-0.5">
                        X: 000 · Y: 000
                    </p>
                </div>

                {/* Zoom controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const cw = containerRef.current?.clientWidth || 0;
                            const ch = containerRef.current?.clientHeight || 0;
                            const t = transformRef.current;
                            const newScale = Math.min(t.scale + 0.5, 4);
                            t.x = (cw / 2) - ((cw / 2) - t.x) * (newScale / t.scale);
                            t.y = (ch / 2) - ((ch / 2) - t.y) * (newScale / t.scale);
                            t.scale = newScale;
                            updateTransformUI();
                        }}
                        className="w-8 h-8 rounded-lg text-white font-bold text-sm transition-all duration-200 flex items-center justify-center cursor-pointer"
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                    >
                        +
                    </button>
                    <span ref={zoomLevelRef} className="text-white/40 text-xs w-12 text-center font-mono tracking-widest">
                        100%
                    </span>
                    <button
                        onClick={() => {
                            const cw = containerRef.current?.clientWidth || 0;
                            const ch = containerRef.current?.clientHeight || 0;
                            const t = transformRef.current;
                            const newScale = Math.max(t.scale - 0.5, 0.5);
                            t.x = (cw / 2) - ((cw / 2) - t.x) * (newScale / t.scale);
                            t.y = (ch / 2) - ((ch / 2) - t.y) * (newScale / t.scale);
                            t.scale = newScale;
                            updateTransformUI();
                        }}
                        className="w-8 h-8 rounded-lg text-white font-bold text-sm transition-all duration-200 flex items-center justify-center cursor-pointer"
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
                        className="px-3 h-8 rounded-lg text-white/60 text-xs tracking-wide transition-all duration-200 cursor-pointer ml-1"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    >
                        RESET
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
            >
                {/* 
                  Removed display: flex & justify-content: center.
                  The inner container is strictly controlled by mathematical transform translation relative 
                  to its natural 0,0 top-left origin, precisely syncing the physics cursor offsets.
                 */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                    }}
                >
                    <div 
                        ref={innerRef} 
                        className="relative" 
                        style={{ 
                            width: '85vw', 
                            height: '85vh',
                            transformOrigin: '0 0', // THIS IS THE KEY TO FIXING JITTERY ZOOM!
                            transition: 'transform 0.08s ease-out'
                        }}
                    >
                        {/* Map image */}
                        <img
                            src={map}
                            alt={mapName}
                            className="w-full h-full object-contain pointer-events-none"
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

                        {/* Native Drawing canvas */}
                        <canvas
                            ref={canvasRef}
                            width={canvasSize.w}
                            height={canvasSize.h}
                            className="absolute inset-0 w-full h-full pointer-events-none"
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

            {/* ── PROFESSIONAL FLOATING TOOL PANEL ── */}
            <div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-stretch gap-4"
                style={{ pointerEvents: 'auto' }}
            >
                {/* Tools Box */}
                <div
                    className="flex items-center gap-2 p-2 rounded-2xl"
                    style={{
                        background: 'rgba(9, 9, 11, 0.65)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    {TOOLS.map(t => {
                        const isActive = activeTool === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTool(t.id)}
                                title={t.label}
                                className="flex flex-col items-center justify-center rounded-xl transition-all duration-200 gap-1.5 cursor-pointer relative"
                                style={{
                                    width: 60,
                                    height: 56,
                                    background: isActive ? 'rgba(34,211,238,0.12)' : 'transparent',
                                    color: isActive ? '#22d3ee' : 'rgba(255,255,255,0.5)',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                                    }
                                }}
                            >
                                {t.icon}
                                <span className="text-[9px] font-semibold tracking-wide uppercase leading-none">
                                    {t.label}
                                </span>
                                {isActive && (
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-400 rounded-t-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Sub-tools Box (Brush + Colors) */}
                <div
                    className="flex items-center gap-4 px-5 py-2 rounded-2xl"
                    style={{
                        background: 'rgba(9, 9, 11, 0.65)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        opacity: (activeTool === 'pen' || activeTool === 'shape' || activeTool === 'eraser') ? 1 : 0.4,
                        pointerEvents: (activeTool === 'pen' || activeTool === 'shape' || activeTool === 'eraser') ? 'auto' : 'none',
                        transition: 'opacity 0.2s',
                    }}
                >
                    {/* Brush size slider */}
                    <div className="flex flex-col gap-1.5 justify-center mt-1">
                        <span className="text-white/40 text-[9px] font-semibold tracking-[0.2em] uppercase">Thickness</span>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={2}
                                max={20}
                                value={brushSize}
                                onChange={e => setBrushSize(Number(e.target.value))}
                                className="w-24 accent-cyan-400"
                                style={{ cursor: 'pointer', height: '4px' }}
                            />
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[10px] font-mono text-cyan-400">
                                {brushSize}
                            </div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/10 mx-1" />

                    {/* Color swatches */}
                    <div className="flex flex-col gap-1.5 justify-center mt-1">
                        <span className="text-white/40 text-[9px] font-semibold tracking-[0.2em] uppercase">Palettes</span>
                        <div className="flex gap-2 items-center h-[24px]">
                            {COLORS.map(c => (
                                <button
                                    key={c.hex}
                                    title={c.label}
                                    onClick={() => setActiveColor(c.hex)}
                                    className="rounded-full transition-all duration-200 cursor-pointer"
                                    style={{
                                        width: activeColor === c.hex ? 20 : 14,
                                        height: activeColor === c.hex ? 20 : 14,
                                        background: c.hex,
                                        boxShadow: activeColor === c.hex
                                            ? `0 0 12px ${c.hex}`
                                            : 'none',
                                        border: activeColor === c.hex
                                            ? `2px solid #fff`
                                            : '2px solid transparent',
                                        opacity: activeTool === 'eraser' ? 0.2 : 1,
                                        pointerEvents: activeTool === 'eraser' ? 'none' : 'auto'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Status Box - Clear action */}
                <button
                    onClick={clearAll}
                    title="Clear Canvas"
                    className="flex flex-col items-center justify-center rounded-2xl transition-all duration-200 px-5 gap-1.5 cursor-pointer group"
                    style={{
                        background: 'rgba(220, 38, 38, 0.1)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                        border: '1px solid rgba(220,38,38,0.3)',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.6)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
                    }}
                >
                    <span className="text-red-400 group-hover:text-red-300 transition-colors">
                        {ICONS.trash}
                    </span>
                    <span className="text-[9px] font-semibold tracking-wide uppercase leading-none text-red-400 group-hover:text-red-300">
                        Clear
                    </span>
                </button>
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
                input[type=range] {
                    -webkit-appearance: none;
                    background: transparent;
                }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 14px;
                    width: 14px;
                    border-radius: 50%;
                    background: #22d3ee;
                    cursor: pointer;
                    margin-top: -5px;
                    box-shadow: 0 0 10px rgba(34,211,238,0.5);
                }
                input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 4px;
                    cursor: pointer;
                    background: rgba(255,255,255,0.1);
                    border-radius: 2px;
                }
            `}</style>
        </div>
    );
}
