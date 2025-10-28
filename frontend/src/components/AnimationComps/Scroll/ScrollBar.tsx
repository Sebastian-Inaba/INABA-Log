// src/components/AnimationComps/Scroll/ScrollBar.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ScrollWrapper.module.css';

// Type for Lenis scroll library compatibility
type LenisLike = {
    on?: (ev: 'scroll', fn: (e: unknown) => void) => void;
    off?: (ev: 'scroll', fn: (e: unknown) => void) => void;
    scrollTo?: (
        y: number,
        opts?: { immediate?: boolean; duration?: number },
    ) => void;
};

export function ScrollBar() {
    // Refs for DOM elements
    const trackRef = useRef<HTMLDivElement | null>(null);
    const thumbRef = useRef<HTMLDivElement | null>(null);

    // State for drag tracking
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(false);
    const [isVisible, setIsVisible] = useState(false);

    // Refs for drag position and scroll state
    const dragStartY = useRef(0);
    const scrollStartY = useRef(0);
    const hideTimeoutRef = useRef<number | null>(null);

    // Refs for thumb sizing and animation
    const thumbSizeRef = useRef({ height: 0, top: 0 });
    const animationFrameRef = useRef<number | null>(null);

    // Calculate scroll dimensions
    const getScrollHeights = useCallback(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollHeight = Math.max(
            body?.scrollHeight || 0,
            doc?.scrollHeight || 0,
        );
        const clientHeight = doc?.clientHeight || window.innerHeight;
        const scrollTop =
            typeof window.scrollY === 'number' ? window.scrollY : 0;
        return { scrollHeight, clientHeight, scrollTop };
    }, []);

    // Update thumb position and size based on scroll
    const updateThumb = useCallback(
        (externalY?: number) => {
            const { scrollHeight, clientHeight } = getScrollHeights();
            const canScroll = scrollHeight > clientHeight;
            setIsVisible(canScroll);

            if (!canScroll) {
                thumbSizeRef.current = { height: 0, top: 0 };
                return;
            }

            const trackHeight =
                trackRef.current?.clientHeight || window.innerHeight;
            const thumbHeight = Math.max(
                (clientHeight / scrollHeight) * trackHeight,
                30,
            );
            const scrollTop =
                typeof externalY === 'number' ? externalY : window.scrollY || 0;
            const scrollPercentage =
                scrollTop / Math.max(1, scrollHeight - clientHeight);
            const thumbTop =
                scrollPercentage * Math.max(0, trackHeight - thumbHeight);

            thumbSizeRef.current = { height: thumbHeight, top: thumbTop };
        },
        [getScrollHeights],
    );

    // Show scrollbar with auto-hide timeout
    const showScrollbar = useCallback(() => {
        setIsVisible(true);
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }
        if (!isDraggingRef.current) {
            hideTimeoutRef.current = window.setTimeout(() => {
                setIsVisible(false);
            }, 1500);
        }
    }, []);

    // Handle thumb drag start
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        isDraggingRef.current = true;
        dragStartY.current = e.clientY;
        scrollStartY.current = window.scrollY || 0;
        document.body.style.userSelect = 'none';
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        setIsVisible(true);
    };

    // Drag handling effect
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - dragStartY.current;
            const trackHeight =
                trackRef.current?.clientHeight || window.innerHeight;
            const { scrollHeight, clientHeight } = getScrollHeights();
            const thumbHeight = thumbSizeRef.current.height || 30;
            const scrollable = Math.max(0, scrollHeight - clientHeight);
            const denom = Math.max(1, trackHeight - thumbHeight);
            const scrollDelta = (deltaY / denom) * scrollable;
            const newScroll = scrollStartY.current + scrollDelta;

            // Scroll using Lenis if available(its not but might do that in the future), else native
            const lenis = (window as unknown as { lenis?: LenisLike }).lenis;
            if (lenis && typeof lenis.scrollTo === 'function') {
                try {
                    lenis.scrollTo(newScroll, { immediate: true });
                } catch {
                    window.scrollTo(0, newScroll);
                }
            } else {
                window.scrollTo(0, newScroll);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            isDraggingRef.current = false;
            document.body.style.userSelect = '';
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = window.setTimeout(
                () => setIsVisible(false),
                1200,
            );
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, getScrollHeights]);

    // Main scroll listener and animation effect
    useEffect(() => {
        updateThumb();

        // Native scroll and resize handlers
        const nativeScrollHandler = () => {
            updateThumb();
            showScrollbar();
        };
        const resizeHandler = () => updateThumb();

        window.addEventListener('scroll', nativeScrollHandler, {
            passive: true,
        });
        window.addEventListener('resize', resizeHandler);

        // Lenis scroll handler
        const lenis = (window as unknown as { lenis?: LenisLike }).lenis;
        const lenisHandler = (e: unknown) => {
            let y: number | undefined;
            if (typeof e === 'number') y = e;
            else if (e && typeof e === 'object') {
                const obj = e as Record<string, unknown>;
                if (typeof obj.y === 'number') y = obj.y;
                else if (typeof obj.scroll === 'number') y = obj.scroll;
            }
            updateThumb(y);
            showScrollbar();
        };

        try {
            if (lenis && typeof lenis.on === 'function') {
                lenis.on('scroll', lenisHandler);
            }
        } catch {
            // ignore failures to attach
        }

        // Animation loop with separate lerp values
        const THUMB_POSITION_LERP = {
            DRAGGING: 1, // Immediate during drag
            NORMAL: 0.15, // Smooth when scrolling
        };

        const THUMB_SIZE_LERP = 0.01; // Smooth size changes

        const animate = () => {
            const thumbEl = thumbRef.current;
            if (thumbEl) {
                const curHeight = parseFloat(thumbEl.style.height || '0') || 0;
                const curTop = parseFloat(thumbEl.style.top || '0') || 0;
                const { height: targetH, top: targetT } = thumbSizeRef.current;

                // Separate lerp values for position vs size
                const positionLerp = isDraggingRef.current
                    ? THUMB_POSITION_LERP.DRAGGING
                    : THUMB_POSITION_LERP.NORMAL;
                const sizeLerp = THUMB_SIZE_LERP;

                const newH = curHeight + (targetH - curHeight) * sizeLerp;
                const newT = curTop + (targetT - curTop) * positionLerp;

                thumbEl.style.height = `${newH}px`;
                thumbEl.style.top = `${newT}px`;
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            window.removeEventListener('scroll', nativeScrollHandler);
            window.removeEventListener('resize', resizeHandler);
            try {
                if (lenis && typeof lenis.off === 'function') {
                    lenis.off('scroll', lenisHandler);
                }
            } catch {
                // ignore
            }
            if (animationFrameRef.current)
                cancelAnimationFrame(animationFrameRef.current);
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, [updateThumb, showScrollbar]);

    // Handle track clicks for page jumping
    const handleTrackClick = (e: React.MouseEvent) => {
        if (e.target !== trackRef.current) return;

        const rect = trackRef.current!.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const trackH = rect.height;
        const { scrollHeight, clientHeight } = getScrollHeights();
        const percent = clickY / Math.max(1, trackH);
        const targetScroll = percent * Math.max(0, scrollHeight - clientHeight);

        // Scroll using Lenis if available, else native
        const lenis = (window as unknown as { lenis?: LenisLike }).lenis;
        if (lenis && typeof lenis.scrollTo === 'function') {
            try {
                lenis.scrollTo(targetScroll, { duration: 0.5 });
            } catch {
                window.scrollTo({ top: targetScroll, behavior: 'smooth' });
            }
        } else {
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }

        showScrollbar();
    };

    return (
        <div
            ref={trackRef}
            className={`${styles.scrollbarTrack} ${isDragging ? styles.dragging : ''} ${!isVisible ? styles.hidden : ''}`}
            onClick={handleTrackClick}
            onMouseEnter={showScrollbar}
            aria-hidden
        >
            <div
                ref={thumbRef}
                className={styles.scrollbarThumb}
                onMouseDown={handleMouseDown}
            />
        </div>
    );
}
