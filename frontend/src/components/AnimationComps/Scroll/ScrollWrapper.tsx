// src/components/AnimationComps/Scroll/ScrollWrapper.tsx
import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

interface LenisScrollProps {
    children: ReactNode;
}

export function LenisScroll({ children }: LenisScrollProps) {
    // Ref to store the Lenis instance
    const lenisRef = useRef<Lenis | null>(null);
    // Get current location to detect route changes
    const location = useLocation();

    useEffect(() => {
        // Initialize Lenis for smooth scrolling
        lenisRef.current = new Lenis({
            lerp: 0.1, // smoothing factor
            smoothWheel: true, // enable smooth wheel scroll
            wheelMultiplier: 1, // control wheel sensitivity
            autoRaf: true, // automatically hook into requestAnimationFrame
        });

        // Cleanup Lenis instance on unmount
        return () => {
            lenisRef.current?.destroy();
            lenisRef.current = null;
        };
    }, []);

    // Reset/scroll-to-top on route change and force Lenis to recalc.
    useEffect(() => {
        if (!lenisRef.current) return;

        // Immediately put viewport at 0 using Lenis )
        try {
            lenisRef.current.scrollTo(0, { immediate: true });
        } catch {
            // fallback to window scroll if Lenis method unavailable briefly
            window.scrollTo(0, 0);
        }

        // Force Lenis to re-measure / reflow after navigation
        // a small double-rAF ensures DOM has updated (images/layout) before we ask Lenis to recalc.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                lenisRef.current?.scrollTo(window.scrollY, { immediate: true });
                window.dispatchEvent(new Event('resize'));
            });
        });
    }, [location.pathname]);

    // Handle browser back/forward (popstate) as an extra safety
    useEffect(() => {
        const onPop = () => {
            if (!lenisRef.current) return;
            try {
                lenisRef.current.scrollTo(0, { immediate: true });
            } catch {
                window.scrollTo(0, 0);
            }
            // Allow layout to settle and force re-measure
            requestAnimationFrame(() => requestAnimationFrame(() => window.dispatchEvent(new Event('resize'))));
        };

        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    return <div className="h-full w-full">{children}</div>;
}
