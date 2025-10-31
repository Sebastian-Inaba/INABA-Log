// src/components/AnimationComps/LineNetworkBackdrop.tsx
import { useEffect, useRef } from 'react';

// This was created with performance in mind and with heavy help of AI
// I cant imagine doing all of this calculation and WebGL setup by hand

interface LineNetworkBackdropProps {
    lineCount?: number;
    lineColor?: string;
    lineWidth?: number;
    duration?: number;
    endpointBand?: number;
    sphereSize?: number;
    blurAmount?: number;
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

/**
 * Animated line network backdrop using WebGL for high performance rendering.
 * Creates flowing bezier curves with sinusoidal motion and soft blur effects.
 */
export function LineNetworkBackdrop({
    lineCount = 10,
    lineColor = 'rgba(99, 102, 241, 0.3)',
    lineWidth = 2,
    duration = 6000,
    endpointBand = 0.18,
    sphereSize = 0.12,
    blurAmount = 2,
}: LineNetworkBackdropProps) {
    // Canvas and WebGL context references
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);

    // Geometry and animation state
    const linesRef = useRef<Line[]>([]);
    const motionTargetsRef = useRef<MotionTarget[]>([]);
    const lastTimeRef = useRef<number>(0);

    // WebGL resources
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const positionBufferRef = useRef<WebGLBuffer | null>(null);
    const alphaBufferRef = useRef<WebGLBuffer | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Initialize WebGL context with performance optimizations
        const gl = canvas.getContext('webgl', {
            alpha: false, // Opaque background for better performance
            antialias: true, // Hardware anti-aliasing instead of multi-pass blur
            desynchronized: true, // Allow async rendering
        });
        if (!gl) {
            console.error('WebGL not supported');
            return;
        }
        glRef.current = gl;

        // === SHADER SETUP ===
        // Vertex shader: transforms positions and passes through alpha for gradient
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute float a_alpha;
            uniform vec2 u_resolution;
            varying float v_alpha;
            
            void main() {
                // Convert from pixel coordinates to clip space (-1 to 1)
                vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                v_alpha = a_alpha;
            }
        `;

        // Fragment shader: applies color and alpha gradient for soft edges
        const fragmentShaderSource = `
            precision mediump float;
            uniform vec4 u_color;
            varying float v_alpha;
            
            void main() {
                gl_FragColor = vec4(u_color.rgb, u_color.a * v_alpha);
            }
        `;

        // Compile shader helper function
        const createShader = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(
            gl.FRAGMENT_SHADER,
            fragmentShaderSource,
        );

        if (!vertexShader || !fragmentShader) return;

        // Link shaders into a program
        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            return;
        }
        programRef.current = program;

        // Get shader attribute and uniform locations
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        const alphaLocation = gl.getAttribLocation(program, 'a_alpha');
        const resolutionLocation = gl.getUniformLocation(
            program,
            'u_resolution',
        );
        const colorLocation = gl.getUniformLocation(program, 'u_color');

        // Create GPU buffers for vertex data
        const positionBuffer = gl.createBuffer();
        const alphaBuffer = gl.createBuffer();
        positionBufferRef.current = positionBuffer;
        alphaBufferRef.current = alphaBuffer;

        // Parse RGBA color string to normalized WebGL color
        const parseColor = (
            color: string,
        ): [number, number, number, number] => {
            const match = color.match(
                /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
            );
            if (match) {
                return [
                    parseInt(match[1]) / 255,
                    parseInt(match[2]) / 255,
                    parseInt(match[3]) / 255,
                    match[4] ? parseFloat(match[4]) : 1.0,
                ];
            }
            return [0.39, 0.4, 0.95, 0.3]; // Default: indigo with 30% opacity
        };

        const [r, g, b, a] = parseColor(lineColor);

        // Canvas dimensions
        let W = 0,
            H = 0,
            midX = 0,
            midY = 0;

        // Setup canvas size with device pixel ratio for crisp rendering
        const setupCanvasSize = () => {
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const cssW = window.innerWidth;
            const cssH = window.innerHeight;
            canvas.style.width = `${cssW}px`;
            canvas.style.height = `${cssH}px`;
            canvas.width = Math.round(cssW * dpr);
            canvas.height = Math.round(cssH * dpr);

            // Use device pixel sizes for all internal geometry to avoid
            // coordinate mismatches between CPU geometry and GPU resolution.
            W = canvas.width;
            H = canvas.height;
            midX = W * 0.5;
            midY = H * 0.5;

            gl.viewport(0, 0, canvas.width, canvas.height);
            return { W, H };
        };

        // Initialize line geometry and motion parameters
        const initGeometry = () => {
            const { W: devW, H: devH } = setupCanvasSize();
            const midYLocal = devH * 0.5;
            const bandPx =
                endpointBand < 1 ? devH * endpointBand : endpointBand;

            // Control point X positions (25% spacing for smooth curves)
            const x1 = devW * 0.22;
            const x2 = devW * 0.4;
            const x3 = devW * 0.6;
            const x4 = devW * 0.78;

            // Create line geometry with randomized endpoints
            linesRef.current = Array.from({ length: lineCount }, () => {
                const jitter = (Math.random() - 0.5) * (bandPx * 0.25);
                const startY =
                    midYLocal + (Math.random() - 0.5) * bandPx + jitter;
                const endY =
                    midYLocal + (Math.random() - 0.5) * bandPx - jitter * 0.5;

                return {
                    startX: 0,
                    startY,
                    endX: devW,
                    endY,
                    cx: [x1, x2, x3, x4], // Bezier control points
                };
            });

            // Calculate base animation speed (full rotation per duration)
            const baseSpeed = (Math.PI * 2) / (duration * 0.001 * 60);

            // Initialize or update motion targets for sinusoidal animation
            if (motionTargetsRef.current.length !== lineCount) {
                motionTargetsRef.current = linesRef.current.map(() => ({
                    angle: Math.random() * Math.PI * 2,
                    phase: Math.random() * Math.PI * 2,
                    radius: devH * sphereSize * (0.6 + Math.random() * 0.9),
                    speed: baseSpeed * (1 + Math.random() * 0.6),
                }));
            } else {
                // On resize, keep existing angles but recalculate radius
                motionTargetsRef.current.forEach((t) => {
                    t.phase = Math.random() * Math.PI * 2;
                    t.radius = devH * sphereSize * (0.6 + Math.random() * 0.9);
                    t.speed = baseSpeed * (1 + Math.random() * 0.6);
                });
            }
        };

        // Tessellate cubic bezier curve into line segments for rendering
        const tessellate = (
            x0: number,
            y0: number, // Start point
            x1: number,
            y1: number, // Control point 1
            x2: number,
            y2: number, // Control point 2
            x3: number,
            y3: number, // End point
            segments: number = 30,
        ): number[] => {
            const points: number[] = [];
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const t2 = t * t;
                const t3 = t2 * t;
                const mt = 1 - t;
                const mt2 = mt * mt;
                const mt3 = mt2 * mt;

                // Cubic bezier formula
                const x =
                    mt3 * x0 + 3 * mt2 * t * x1 + 3 * mt * t2 * x2 + t3 * x3;
                const y =
                    mt3 * y0 + 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t3 * y3;
                points.push(x, y);
            }
            return points;
        };

        // Animation constants
        const phases = [0, 0.9, 1.8, 2.7]; // Phase offsets for control points
        const proximityWeights = [0.3, 0.7]; // Motion influence based on distance from center

        // Reusable arrays to avoid garbage collection
        const rawYs = new Float32Array(4);
        const controlYs = new Float32Array(4);

        // Main render loop
        const draw = (currentTime: number) => {
            if (!gl || !program) return;

            // Calculate delta time for frame-independent animation
            const deltaTime = lastTimeRef.current
                ? currentTime - lastTimeRef.current
                : 16.67;
            lastTimeRef.current = currentTime;
            const deltaFactor = Math.min(deltaTime, 100) / 16.67;

            // Clear to dark background
            gl.clearColor(0.075, 0.075, 0.075, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);
            // Pass device pixel resolution to shader (matches vertex coords).
            gl.uniform2f(resolutionLocation, W, H);

            const lines = linesRef.current;
            const targets = motionTargetsRef.current;
            const len = lines.length;
            const midXInv = 1 / midX;

            // Enable alpha blending for smooth overlaps
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            // === OPTIMIZED BLUR: Single pass with wider, softer lines ===
            // Instead of multiple render passes, we use:
            // 1. Hardware anti-aliasing (enabled in context)
            // 2. Wider lines with alpha gradient from center to edges
            // 3. Adjustable line width based on blur amount
            const effectiveWidth = lineWidth * (1 + blurAmount * 0.3);

            gl.uniform4f(colorLocation, r, g, b, a);

            // We'll build one big vertex buffer for all lines *but*
            // insert degenerate vertices between strips so the TRIANGLE_STRIP
            // does not connect separate lines together. This keeps a single
            // draw call for performance while preventing A->B connectors.
            const allVertices: number[] = [];
            const allAlphas: number[] = [];

            for (let i = 0; i < len; i++) {
                const line = lines[i];
                const t = targets[i];

                // Update animation angle
                t.angle += t.speed * deltaFactor;
                if (t.angle > 12.566370614359172) t.angle -= 6.283185307179586; // Wrap at 2π

                const cx = line.cx;
                const tAngle = t.angle;
                const tPhase = t.phase;
                const tRadius = t.radius;

                // Compute animated control points with sinusoidal motion
                for (let j = 0; j < 4; j++) {
                    const x = cx[j];
                    // Lines move more at screen center, less at edges
                    const proximity = 1 - Math.abs((x - midX) * midXInv);
                    const cpRadius =
                        tRadius *
                        (proximityWeights[0] + proximityWeights[1] * proximity);
                    rawYs[j] =
                        midY + Math.sin(tAngle + tPhase + phases[j]) * cpRadius;
                }

                // Use animated control points directly for smooth flowing curves
                controlYs[0] = rawYs[0];
                controlYs[1] = rawYs[1];
                controlYs[2] = rawYs[2];
                controlYs[3] = rawYs[3];

                // Calculate middle point as average of inner control points for continuity
                const middleY = (rawYs[1] + rawYs[2]) * 0.5;

                // Tessellate two bezier curves (left and right halves)
                const points1 = tessellate(
                    line.startX,
                    line.startY,
                    cx[0],
                    controlYs[0],
                    cx[1],
                    controlYs[1],
                    midX,
                    middleY,
                );

                const points2 = tessellate(
                    midX,
                    middleY,
                    cx[2],
                    controlYs[2],
                    cx[3],
                    controlYs[3],
                    line.endX,
                    line.endY,
                );

                const allPoints = [...points1, ...points2.slice(2)];

                // Create triangle strip with alpha gradient for soft edges for this line
                const halfThickness = effectiveWidth * 0.5;
                const centerAlpha = 1.0; // Fully opaque at center

                // Build this line's strip first (two verts per point: top & bottom)
                const lineStripVerts: number[] = [];
                const lineStripAlphas: number[] = [];

                for (let j = 0; j < allPoints.length - 2; j += 2) {
                    const x1 = allPoints[j];
                    const y1 = allPoints[j + 1];
                    const x2 = allPoints[j + 2];
                    const y2 = allPoints[j + 3];

                    // Calculate perpendicular direction for line thickness
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const segLen = Math.sqrt(dx * dx + dy * dy);
                    if (segLen === 0) continue;

                    const nx = -dy / segLen;
                    const ny = dx / segLen;

                    const offsetX = nx * halfThickness;
                    const offsetY = ny * halfThickness;

                    // Add vertices for triangle strip (two vertices per segment)
                    lineStripVerts.push(
                        x1 + offsetX,
                        y1 + offsetY, // Top edge
                        x1 - offsetX,
                        y1 - offsetY, // Bottom edge
                    );
                    lineStripAlphas.push(centerAlpha, centerAlpha);

                    // Add final segment vertices at the end of strip
                    if (j === allPoints.length - 4) {
                        lineStripVerts.push(
                            x2 + offsetX,
                            y2 + offsetY,
                            x2 - offsetX,
                            y2 - offsetY,
                        );
                        lineStripAlphas.push(centerAlpha, centerAlpha);
                    }
                }

                if (lineStripVerts.length === 0) {
                    continue;
                }

                // If there's already geometry in allVertices, insert degenerate vertices
                // to break the strip connection between previous line and this one.
                if (allVertices.length > 0) {
                    // previous last vertex (last two numbers)
                    const prevLastX = allVertices[allVertices.length - 2];
                    const prevLastY = allVertices[allVertices.length - 1];
                    // this line's first vertex (first two numbers)
                    const newFirstX = lineStripVerts[0];
                    const newFirstY = lineStripVerts[1];

                    // Duplicate previous last vertex twice (adds 2 verts)
                    allVertices.push(
                        prevLastX,
                        prevLastY,
                        prevLastX,
                        prevLastY,
                    );
                    // Alphas for degenerate vertices: 0 (one per vertex)
                    allAlphas.push(0, 0);

                    // Duplicate new first vertex twice (adds 2 verts)
                    allVertices.push(
                        newFirstX,
                        newFirstY,
                        newFirstX,
                        newFirstY,
                    );
                    // Alphas for degenerate vertices: 0 (one per vertex)
                    allAlphas.push(0, 0);
                }

                // Append this line's strip
                allVertices.push(...lineStripVerts);
                allAlphas.push(...lineStripAlphas);
            }

            if (allVertices.length === 0) {
                rafRef.current = requestAnimationFrame(draw);
                return;
            }

            // Upload vertex data to GPU
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(allVertices),
                gl.DYNAMIC_DRAW,
            );
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(allAlphas),
                gl.DYNAMIC_DRAW,
            );
            gl.enableVertexAttribArray(alphaLocation);
            gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 0, 0);

            // Draw all lines in a single draw call (degenerate vertices prevent cross-line triangles)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, allVertices.length / 2);

            rafRef.current = requestAnimationFrame(draw);
        };

        initGeometry();
        rafRef.current = requestAnimationFrame(draw);

        // Debounced resize handler to avoid performance issues
        let resizeTimeout: number | undefined;
        const onResize = () => {
            if (resizeTimeout) window.clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(initGeometry, 150);
        };
        window.addEventListener('resize', onResize);

        // Cleanup function to free resources
        return () => {
            window.removeEventListener('resize', onResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (gl && positionBuffer) gl.deleteBuffer(positionBuffer);
            if (gl && alphaBuffer) gl.deleteBuffer(alphaBuffer);
            if (gl && program) gl.deleteProgram(program);
            linesRef.current = [];
            motionTargetsRef.current = [];
            if (resizeTimeout) window.clearTimeout(resizeTimeout);
        };
    }, [
        lineCount,
        lineColor,
        lineWidth,
        duration,
        endpointBand,
        sphereSize,
        blurAmount,
    ]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
}
