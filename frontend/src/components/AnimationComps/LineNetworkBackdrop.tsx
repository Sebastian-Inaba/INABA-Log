// src/components/AnimationComps/LineNetworkBackdrop.tsx
import { useEffect, useRef } from 'react';

interface LineNetworkBackdropProps {
    lineCount?: number;
    lineColor?: string;
    lineWidth?: number;
    duration?: number;
    endpointBand?: number;
    sphereSize?: number;
}

type Line = {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    cx: number[];
};

type MotionTarget = {
    angle: number;
    phase: number;
    radius: number;
    speed: number;
};

export function LineNetworkBackdrop({
    lineCount = 8,
    lineColor = 'rgba(99, 102, 241, 0.3)',
    lineWidth = 2,
    duration = 6000,
    endpointBand = 0.18,
    sphereSize = 0.12,
}: LineNetworkBackdropProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const linesRef = useRef<Line[]>([]);
    const motionTargetsRef = useRef<MotionTarget[]>([]);
    const lastTimeRef = useRef<number>(0);
    const isFirefox = useRef<boolean>(false);
    const targetFPS = useRef<number>(60);
    const sinCache = useRef<Float32Array | null>(null);
    const cosCache = useRef<Float32Array | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        isFirefox.current = /firefox/i.test(navigator.userAgent);
        targetFPS.current = isFirefox.current && lineCount > 20 ? 30 : 60;
        const frameInterval = 1000 / targetFPS.current;
        
        const ctx = canvas.getContext('2d', {
            alpha: false,
            desynchronized: true,
            willReadFrequently: false,
        });
        if (!ctx) return;

        // Pre-compute sin/cos lookup tables for faster trig
        const CACHE_SIZE = 360;
        sinCache.current = new Float32Array(CACHE_SIZE);
        cosCache.current = new Float32Array(CACHE_SIZE);
        for (let i = 0; i < CACHE_SIZE; i++) {
            const angle = (i / CACHE_SIZE) * Math.PI * 2;
            sinCache.current[i] = Math.sin(angle);
            cosCache.current[i] = Math.cos(angle);
        }

        let W = 0, H = 0, midX = 0, midY = 0;

        const setupCanvasSize = () => {
            const dpr = isFirefox.current ? 1 : Math.min(2, window.devicePixelRatio || 1);
            const cssW = window.innerWidth;
            const cssH = window.innerHeight;
            canvas.style.width = `${cssW}px`;
            canvas.style.height = `${cssH}px`;
            canvas.width = Math.round(cssW * dpr);
            canvas.height = Math.round(cssH * dpr);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            
            W = cssW;
            H = cssH;
            midX = W * 0.5;
            midY = H * 0.5;
            
            return { W: cssW, H: cssH };
        };

        const initGeometry = () => {
            const { W, H } = setupCanvasSize();
            const midY = H * 0.5;
            const bandPx = endpointBand < 1 ? H * endpointBand : endpointBand;

            const x1 = W * 0.22;
            const x2 = W * 0.4;
            const x3 = W * 0.6;
            const x4 = W * 0.78;

            linesRef.current = Array.from({ length: lineCount }, () => {
                const jitter = (Math.random() - 0.5) * (bandPx * 0.25);
                const startY = midY + (Math.random() - 0.5) * bandPx + jitter;
                const endY = midY + (Math.random() - 0.5) * bandPx - jitter * 0.5;

                return {
                    startX: 0,
                    startY,
                    endX: W,
                    endY,
                    cx: [x1, x2, x3, x4],
                };
            });

            const baseSpeed = (Math.PI * 2) / ((duration * 0.001) * targetFPS.current);

            if (motionTargetsRef.current.length !== lineCount) {
                motionTargetsRef.current = linesRef.current.map(() => ({
                    angle: Math.random() * Math.PI * 2,
                    phase: Math.random() * Math.PI * 2,
                    radius: H * sphereSize * (0.6 + Math.random() * 0.9),
                    speed: baseSpeed * (1 + Math.random() * 0.6),
                }));
            } else {
                motionTargetsRef.current.forEach((t) => {
                    t.phase = Math.random() * Math.PI * 2;
                    t.radius = H * sphereSize * (0.6 + Math.random() * 0.9);
                    t.speed = baseSpeed * (1 + Math.random() * 0.6);
                });
            }
        };

        // Fast sin lookup
        const fastSin = (angle: number): number => {
            if (!sinCache.current) return Math.sin(angle);
            const normalized = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const index = Math.floor((normalized / (Math.PI * 2)) * 360) % 360;
            return sinCache.current[index];
        };

        const rawYs = new Float32Array(4);
        const controlYs = new Float32Array(4);
        let lastDrawTime = 0;
        
        // Cache frequently accessed values
        const phases = [0, 0.9, 1.8, 2.7];
        const proximityWeights = [0.3, 0.7];

        const draw = (currentTime: number) => {
            if (!ctx) return;
            
            const timeSinceLastDraw = currentTime - lastDrawTime;
            if (timeSinceLastDraw < frameInterval - 1) {
                rafRef.current = requestAnimationFrame(draw);
                return;
            }
            
            lastDrawTime = currentTime;
            const deltaTime = lastTimeRef.current ? currentTime - lastTimeRef.current : frameInterval;
            lastTimeRef.current = currentTime;
            const deltaFactor = Math.min(deltaTime, 100) / frameInterval;

            ctx.fillStyle = '#131313'; 
            ctx.fillRect(0, 0, W, H);

            ctx.strokeStyle = lineColor;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();

            const lines = linesRef.current;
            const targets = motionTargetsRef.current;
            const len = lines.length;
            const midXInv = 1 / midX;

            for (let i = 0; i < len; i++) {
                const line = lines[i];
                const t = targets[i];

                t.angle += t.speed * deltaFactor;
                if (t.angle > 12.566370614359172) t.angle -= 6.283185307179586; // PI * 4 and PI * 2

                // Compute all control points
                const cx = line.cx;
                const tAngle = t.angle;
                const tPhase = t.phase;
                const tRadius = t.radius;

                for (let j = 0; j < 4; j++) {
                    const x = cx[j];
                    const proximity = 1 - Math.abs((x - midX) * midXInv);
                    const cpRadius = tRadius * (proximityWeights[0] + proximityWeights[1] * proximity);
                    rawYs[j] = midY + fastSin(tAngle + tPhase + phases[j]) * cpRadius;
                }

                const xLeft = cx[1];
                const xRight = cx[2];
                const denom = midX - xLeft;
                
                controlYs[0] = rawYs[0];
                controlYs[1] = rawYs[1];
                controlYs[2] = Math.abs(denom) > 0.000001 
                    ? midY + ((xRight - midX) * (midY - rawYs[1])) / denom 
                    : rawYs[2];
                controlYs[3] = rawYs[3];
                
                const middleY = midY + fastSin(tAngle + 0.1) * (tRadius * 0.85);

                ctx.moveTo(line.startX, line.startY);
                ctx.bezierCurveTo(cx[0], controlYs[0], cx[1], controlYs[1], midX, middleY);
                ctx.bezierCurveTo(cx[2], controlYs[2], cx[3], controlYs[3], line.endX, line.endY);
            }

            ctx.stroke();
            rafRef.current = requestAnimationFrame(draw);
        };

        initGeometry();
        rafRef.current = requestAnimationFrame(draw);

        let resizeTimeout: number | undefined;
        const onResize = () => {
            if (resizeTimeout) window.clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(initGeometry, 150);
        };
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            linesRef.current = [];
            motionTargetsRef.current = [];
            sinCache.current = null;
            cosCache.current = null;
            if (resizeTimeout) window.clearTimeout(resizeTimeout);
        };
    }, [lineCount, lineColor, lineWidth, duration, endpointBand, sphereSize]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
}