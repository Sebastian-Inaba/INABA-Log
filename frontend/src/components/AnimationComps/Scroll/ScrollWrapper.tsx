// src/components/AnimationComps/Scroll/ScrollWrapper.tsx
import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

interface LenisScrollProps {
    children: ReactNode;
    onDirectionChange?: (dir: 'up' | 'down') => void;
}

export function LenisScroll({ children, onDirectionChange }: LenisScrollProps) {
    // Ref to store the Lenis instance
    const lenisRef = useRef<Lenis | null>(null);
    // Get current location to detect route changes
    const location = useLocation();
    // MutationObserver ref so we can disconnect on cleanup
    const moRef = useRef<MutationObserver | null>(null);
    // debounced resize timer ref
    const resizeTimerRef = useRef<number | null>(null);

    // track last scroll and last direction in refs to compute diffs cheaply
    const lastScrollRef = useRef<number>(0);
    const lastDirectionRef = useRef<'up' | 'down'>('up');

    // Prevents thrashing when many DOM mutations arrive at once.
    const scheduleResize = (ms = 120) => {
        if (resizeTimerRef.current) {
            window.clearTimeout(resizeTimerRef.current);
        }
        resizeTimerRef.current = window.setTimeout(() => {
            try {
                // call Lenis resize method if available
                lenisRef.current?.resize?.();
            } catch {
                // fallback: dispatch a normal resize event so other code can react
                window.dispatchEvent(new Event('resize'));
            }
            resizeTimerRef.current = null;
        }, ms);
    };

    // Returns once every image is either complete or has fired load/error.
    // This helps avoid layout shifts that would cause Lenis to under-measure the page height.
    const waitForImagesToLoad = async () => {
        const imgs = Array.from(document.images);
        if (!imgs.length) return;
        await Promise.all(
            imgs.map((img) => {
                if (img.complete) return Promise.resolve();
                return new Promise<void>((resolve) => {
                    const onDone = () => resolve();
                    img.addEventListener('load', onDone, { once: true });
                    img.addEventListener('error', onDone, { once: true });
                });
            }),
        );
    };

    useEffect(() => {
        // Initialize Lenis for smooth scrolling
        lenisRef.current = new Lenis({
            lerp: 0.1, // smoothing factor
            smoothWheel: true, // enable smooth wheel scroll
            wheelMultiplier: 1, // control wheel sensitivity
            autoRaf: true, // automatically hook into requestAnimationFrame
            // keep autoResize default — we'll still call resize explicitly where needed
        });

        // wire a Lenis 'scroll' listener to compute direction and notify parent
        const handleLenisScroll = (e: unknown) => {
            let current = window.scrollY;

            if (typeof e === 'number') {
                current = e;
            } else if (typeof e === 'object' && e !== null) {
                // Narrow to a shape we can read safely
                const ev = e as { scroll?: number; y?: number };
                if (typeof ev.scroll === 'number') {
                    current = ev.scroll;
                } else if (typeof ev.y === 'number') {
                    current = ev.y;
                }
            }

            const last = lastScrollRef.current;
            const dir: 'up' | 'down' = current > last ? 'down' : 'up';

            if (dir !== lastDirectionRef.current) {
                lastDirectionRef.current = dir;
                onDirectionChange?.(dir);
            }

            lastScrollRef.current = current;
        };

        try {
            // attach if API available
            lenisRef.current?.on?.('scroll', handleLenisScroll);
        } catch {
            // If Lenis build doesn't support `.on`, we gracefully skip attaching.
        }

        // Helps the first measurement after mount be accurate for pages with images.
        (async () => {
            await waitForImagesToLoad();
            scheduleResize(0);
        })();

        // Debounce resize calls.
        moRef.current = new MutationObserver(() => {
            scheduleResize(120);
        });

        if (document.body && moRef.current) {
            moRef.current.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                // only watch attributes that commonly affect layout / images
                attributeFilter: ['src', 'srcset', 'style', 'class'],
            });
        }

        // Cleanup Lenis instance on unmount and disconnect observer
        return () => {
            // stop observing
            moRef.current?.disconnect();
            moRef.current = null;

            // remove Lenis listener if possible
            try {
                lenisRef.current?.off?.('scroll', handleLenisScroll);
            } catch {
                // ignore if not supported
            }

            // destroy Lenis instance
            lenisRef.current?.destroy?.();
            lenisRef.current = null;

            // clear any pending resize timers
            if (resizeTimerRef.current) {
                window.clearTimeout(resizeTimerRef.current);
                resizeTimerRef.current = null;
            }
        };
    }, [onDirectionChange]);

    // Reset/scroll-to-top on route change and force Lenis to recalc.
    useEffect(() => {
        if (!lenisRef.current) return;

        // Immediately put viewport at 0 using Lenis
        try {
            lenisRef.current.scrollTo(0, { immediate: true });
        } catch {
            // fallback to window scroll if Lenis method unavailable briefly
            window.scrollTo(0, 0);
        }

        // Force Lenis to re-measure / reflow after navigation
        // a small double-rAF ensures DOM has updated (images/layout) before we ask Lenis to recalc.
        requestAnimationFrame(() => {
            requestAnimationFrame(async () => {
                // Force a resize so Lenis measures the final content height.
                await waitForImagesToLoad();

                try {
                    lenisRef.current?.resize?.();
                } catch {
                    window.dispatchEvent(new Event('resize'));
                }

                // Sync Lenis internal scroll position with window scroll
                try {
                    lenisRef.current?.scrollTo(window.scrollY, { immediate: true });
                } catch {
                    // nothing
                }
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
            requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                    // Schedule a resize after pop navigation as well
                    scheduleResize(0);
                }),
            );
        };

        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    return <div className="h-full w-full">{children}</div>;
}
