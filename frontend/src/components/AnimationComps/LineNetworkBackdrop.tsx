// src/components/AnimationComps/LineNetworkBackdrop.tsx

// This was made with heavy help from AI

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface LineNetworkBackdropProps {
    lineCount?: number; // number of lines to draw
    lineColor?: string; // stroke color for the lines
    lineWidth?: number; // stroke width in CSS pixels
    duration?: number; // base animation duration (ms)
    endpointBand?: number; // fraction (0..1) of height used as vertical band for edge endpoints
    sphereSize?: number; // fraction (0..1) of height used to compute central bulge radius
}

type Line = {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    cx: number[]; // control point X positions (4 control x values)
};

type MotionTarget = {
    angle: number; // animated angle used to compute control Y positions via sin(angle + phase)
    phase: number; // per-line phase offset so lines are out of sync
    radius: number; // movement amplitude for this line (px)
};

export function LineNetworkBackdrop({
    lineCount = 8,
    lineColor = 'rgba(99, 102, 241, 0.3)',
    lineWidth = 2,
    duration = 6000,
    endpointBand = 0.18,
    sphereSize = 0.12,
}: LineNetworkBackdropProps) {
    // refs to hold DOM canvas and animation state across renders
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const animationsRef = useRef<Array<{ pause: () => void }>>([]); // anime.js animation handles
    const linesRef = useRef<Line[]>([]); // geometry for each line
    const motionTargetsRef = useRef<MotionTarget[]>([]); // animated parameters for each line

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        /**
         * setupCanvasSize
         * - Scales the canvas backing buffer by devicePixelRatio to avoid jagged thin strokes on high-DPI (Retina) displays.
         * - Returns logical CSS width/height (W,H) for subsequent geometry calculations.
         */
        const setupCanvasSize = () => {
            const dpr = Math.max(1, window.devicePixelRatio || 1);
            const cssW = window.innerWidth;
            const cssH = window.innerHeight;
            canvas.style.width = `${cssW}px`;
            canvas.style.height = `${cssH}px`;
            canvas.width = Math.round(cssW * dpr);
            canvas.height = Math.round(cssH * dpr);
            // reset any existing transforms, then scale to DPR so drawing calls use CSS pixels
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            return { W: cssW, H: cssH };
        };

        /**
         * initGeometry
         * - Recreates the line geometry (endpoints and control Xs).
         * - Endpoints are placed inside a small vertical band around center (endpointBand),
         *   so all left endpoints originate from roughly the same area and likewise on the right.
         * - Control X positions are fixed fractions of width so curves consistently bulge in center.
         * - Motion targets are created or refreshed; radius depends on sphereSize.
         */
        const initGeometry = () => {
            const { W, H } = setupCanvasSize();
            const midY = H / 2;

            // endpointBand: if fractional (0..1), convert to px; otherwise treat as px
            const bandPx = endpointBand < 1 ? H * endpointBand : endpointBand;

            // control point X coordinates (tunable)
            const x1 = W * 0.22;
            const x2 = W * 0.4;
            const x3 = W * 0.6;
            const x4 = W * 0.78;

            // Build lines: endpoints inside the vertical band near midY (small jitter for natural look)
            linesRef.current = Array.from({ length: lineCount }, () => {
                const jitter = (Math.random() - 0.5) * (bandPx * 0.25);
                const startY = midY + (Math.random() - 0.5) * bandPx + jitter;
                const endY =
                    midY + (Math.random() - 0.5) * bandPx - jitter * 0.5;

                return {
                    startX: 0,
                    startY,
                    endX: W,
                    endY,
                    cx: [x1, x2, x3, x4],
                };
            });

            // Create or refresh motion targets (preserve existing angles when possible)
            if (motionTargetsRef.current.length !== lineCount) {
                motionTargetsRef.current = linesRef.current.map(() => ({
                    angle: Math.random() * Math.PI * 2,
                    phase: Math.random() * Math.PI * 2,
                    // radius determines how large the central bulge can be for this line (px)
                    radius: H * sphereSize * (0.6 + Math.random() * 0.9),
                }));
            } else {
                // refresh radius/phase to adapt to new size without resetting angle -> avoids jumps
                motionTargetsRef.current.forEach((t) => {
                    t.phase = Math.random() * Math.PI * 2;
                    t.radius = H * sphereSize * (0.6 + Math.random() * 0.9);
                });
            }
        };

        /**
         * startAngleAnimations
         * - Starts an anime.js linear loop for each motion target's 'angle' property.
         * - Using a single continuously-increasing angle (linear easing) yields smooth periodic motion when sampled every frame.
         */
        const startAngleAnimations = () => {
            // stop previous animations (if any)
            animationsRef.current.forEach((a) => a.pause());
            animationsRef.current = [];

            motionTargetsRef.current.forEach((t, i) => {
                const anim = animate(t, {
                    angle: [t.angle, t.angle + Math.PI * 2],
                    duration: duration * (1 + Math.random() * 0.6),
                    easing: 'linear',
                    loop: true,
                    delay: i * 80,
                });
                animationsRef.current.push(anim);
            });
        };

        /**
         * draw
         * - Called via requestAnimationFrame at ~60fps.
         * - For each line: compute control point Ys with smooth sinusoidal motion around the center.
         * - Enforce tangent continuity at the center join so the two cubic Beziers meet with matching slope (C¹ continuity).
         * - Draw two cubic bezier segments per line (left->center and center->right).
         */
        const draw = () => {
            if (!ctx) return;
            const W = canvas.clientWidth;
            const H = canvas.clientHeight;
            const midX = W / 2;
            const midY = H / 2;

            // clear the canvas for this frame
            ctx.clearRect(0, 0, W, H);

            // styling for crisp rounded strokes
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // iterate lines and draw each as two cubic bezier segments joined at (midX, middleY)
            for (let i = 0; i < linesRef.current.length; i++) {
                const line = linesRef.current[i];
                const t = motionTargetsRef.current[i];

                // compute raw control Ys for the 4 control points using sin-based orbiting motion
                const rawYs = line.cx.map((x: number, j: number) => {
                    // proximity factor makes controls near the center move more than near edges
                    const proximity = 1 - Math.abs((x - midX) / midX);
                    const localPhase = t.phase + j * 0.9;
                    const cpRadius = t.radius * (0.3 + 0.7 * proximity);
                    return midY + Math.sin(t.angle + localPhase) * cpRadius;
                });

                // Tangent continuity enforcement at the join:
                // We want the slope of the left cubic at the join to equal the slope of the right cubic at the join.
                // Solve for y_rightControl so slopes match:
                // slope_left = (midY - rawYs[1]) / (midX - xLeft)
                // slope_right = (yRight - midY) / (xRight - midX)
                // => yRight = midY + (xRight - midX) * (midY - rawYs[1]) / (midX - xLeft)
                const xLeft = line.cx[1];
                const xRight = line.cx[2];
                let enforcedRightY = rawYs[2];
                const denom = midX - xLeft;
                if (Math.abs(denom) > 1e-6) {
                    enforcedRightY =
                        midY + ((xRight - midX) * (midY - rawYs[1])) / denom;
                }
                // Use the enforced right control Y directly (strict C¹ continuity)
                const cp2Y = enforcedRightY;

                // final controlYs (we use raw for cp0, cp1, cp3; cp2 replaced with enforced value)
                const controlYs = [rawYs[0], rawYs[1], cp2Y, rawYs[3]];

                // middle anchor point for the visual bulge (keeps center moving smoothly)
                const middleY =
                    midY + Math.sin(t.angle + 0.1) * (t.radius * 0.85);

                // draw the two Bezier segments: left->center and center->right
                ctx.beginPath();
                ctx.moveTo(line.startX, line.startY);

                // left segment (start -> mid)
                ctx.bezierCurveTo(
                    line.cx[0],
                    controlYs[0],
                    line.cx[1],
                    controlYs[1],
                    midX,
                    middleY,
                );

                // right segment (mid -> end)
                ctx.bezierCurveTo(
                    line.cx[2],
                    controlYs[2],
                    line.cx[3],
                    controlYs[3],
                    line.endX,
                    line.endY,
                );

                ctx.stroke();
            }

            // schedule next frame
            rafRef.current = requestAnimationFrame(draw);
        };

        // Initialize geometry, start animations and begin drawing loop
        initGeometry();
        startAngleAnimations();
        draw();

        // Resize handler: re-init geometry and animations (throttled)
        let resizeTimeout: number | undefined;
        const onResize = () => {
            if (resizeTimeout) window.clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(() => {
                initGeometry();
                startAngleAnimations();
            }, 80);
        };
        window.addEventListener('resize', onResize);

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', onResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            animationsRef.current.forEach((a) => a.pause());
            animationsRef.current = [];
            linesRef.current = [];
            motionTargetsRef.current = [];
            if (resizeTimeout) window.clearTimeout(resizeTimeout);
        };
    }, [lineCount, lineColor, lineWidth, duration, endpointBand, sphereSize]);

    // full-screen canvas behind UI (pointer-events-none so it doesn't block interaction)
    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
}
