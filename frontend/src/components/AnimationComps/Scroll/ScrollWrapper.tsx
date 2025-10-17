// src/components/AnimationComps/Scroll/ScrollWrapper.tsx
import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

// TypeScript declaration for window.lenis
declare global {
    interface Window {
        lenis?: Lenis;
    }
}

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

    // track last scroll and last direction in refs to compute diffs cheaply
    const lastScrollRef = useRef<number>(0);
    const lastDirectionRef = useRef<'up' | 'down'>('up');
    // track if user is actively scrolling
    const isScrollingRef = useRef<boolean>(false);
    // timeout ref for debouncing scroll
    const scrollTimeoutRef = useRef<number | null>(null);

    // Returns once every image is either complete or has fired load/error.
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
        });

        // Make Lenis available globally
        window.lenis = lenisRef.current;

        // Track when user is actively scrolling
        const handleWheel = () => {
            isScrollingRef.current = true;
            if (scrollTimeoutRef.current) {
                window.clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = window.setTimeout(() => {
                isScrollingRef.current = false;
            }, 150);
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        window.addEventListener('touchmove', handleWheel, { passive: true });

        // wire a Lenis 'scroll' listener
        const handleLenisScroll = (e: unknown) => {
            let current = window.scrollY;

            if (typeof e === 'number') {
                current = e;
            } else if (typeof e === 'object' && e !== null) {
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
            lenisRef.current?.on?.('scroll', handleLenisScroll);
        } catch {
            // If Lenis build doesn't support `.on`, skip
        }

        // Initial measurement
        (async () => {
            await waitForImagesToLoad();
            lenisRef.current?.resize?.();
        })();

        // Very conservative resize scheduling - only when NOT scrolling
        let resizeScheduled = false;
        let lastResizeTime = 0;
        const RESIZE_THROTTLE = 300; // Increased from 150ms
        const pendingResize = { scheduled: false };

        const scheduleResize = () => {
            // NEVER resize while user is scrolling
            if (isScrollingRef.current) {
                // Mark that we need a resize later
                pendingResize.scheduled = true;
                return;
            }

            const now = Date.now();

            // Immediate update if enough time has passed
            if (now - lastResizeTime >= RESIZE_THROTTLE) {
                if (lenisRef.current) {
                    lenisRef.current.resize();
                }
                lastResizeTime = now;
                resizeScheduled = false;
                pendingResize.scheduled = false;
                return;
            }

            // Otherwise throttle
            if (resizeScheduled) return;
            resizeScheduled = true;

            setTimeout(
                () => {
                    // Check again if still not scrolling
                    if (!isScrollingRef.current && lenisRef.current) {
                        lenisRef.current.resize();
                        lastResizeTime = Date.now();
                        pendingResize.scheduled = false;
                    }
                    resizeScheduled = false;
                },
                RESIZE_THROTTLE - (now - lastResizeTime),
            );
        };

        // Check for pending resizes when scrolling stops
        const checkPendingResize = () => {
            if (pendingResize.scheduled && !isScrollingRef.current) {
                scheduleResize();
            }
        };

        const pendingInterval = window.setInterval(checkPendingResize, 500);

        // Only observe very specific layout-changing mutations
        moRef.current = new MutationObserver((mutations) => {
            const shouldResize = mutations.some((mutation) => {
                // Only care about childList changes (elements added/removed)
                if (mutation.type === 'childList') {
                    // Ignore if nodes are just text nodes
                    const hasElementNodes =
                        Array.from(mutation.addedNodes).some((node) => node.nodeType === Node.ELEMENT_NODE) ||
                        Array.from(mutation.removedNodes).some((node) => node.nodeType === Node.ELEMENT_NODE);
                    return hasElementNodes;
                }

                // For attributes, ONLY src/srcset (images loading)
                if (mutation.type === 'attributes') {
                    const attrName = mutation.attributeName;
                    return attrName === 'src' || attrName === 'srcset';
                }

                return false;
            });

            if (shouldResize) {
                scheduleResize();
            }
        });

        if (document.body && moRef.current) {
            moRef.current.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src', 'srcset'], // Only image sources
            });
        }

        // Cleanup
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchmove', handleWheel);

            if (scrollTimeoutRef.current) {
                window.clearTimeout(scrollTimeoutRef.current);
            }

            window.clearInterval(pendingInterval);

            moRef.current?.disconnect();
            moRef.current = null;

            try {
                lenisRef.current?.off?.('scroll', handleLenisScroll);
            } catch {
                // ignore
            }

            lenisRef.current?.destroy?.();
            lenisRef.current = null;
            window.lenis = undefined;
        };
    }, [onDirectionChange]);

    // Reset scroll on route change
    useEffect(() => {
        if (!lenisRef.current) return;

        // Immediately force scroll to 0
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Stop Lenis
        lenisRef.current.stop();

        // Force Lenis to 0
        requestAnimationFrame(() => {
            window.scrollTo(0, 0);

            try {
                lenisRef.current?.scrollTo(0, { immediate: true, force: true });
            } catch {
                // fallback
            }

            // Resume and re-measure
            requestAnimationFrame(() => {
                lenisRef.current?.start();

                requestAnimationFrame(async () => {
                    await waitForImagesToLoad();
                    lenisRef.current?.resize?.();

                    // Final safety scroll
                    window.scrollTo(0, 0);
                    try {
                        lenisRef.current?.scrollTo(0, { immediate: true });
                    } catch {
                        // ignore
                    }
                });
            });
        });
    }, [location.pathname, location.search]);

    // Handle browser back/forward - prevent scroll restoration
    useEffect(() => {
        // Disable browser scroll restoration
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        const onPop = () => {
            // Immediately force to top
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            if (!lenisRef.current) return;

            lenisRef.current.stop();

            requestAnimationFrame(() => {
                window.scrollTo(0, 0);

                try {
                    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
                } catch {
                    // fallback
                }

                requestAnimationFrame(() => {
                    lenisRef.current?.start();
                    window.scrollTo(0, 0);

                    requestAnimationFrame(() => {
                        lenisRef.current?.resize?.();
                    });
                });
            });
        };

        window.addEventListener('popstate', onPop);

        return () => {
            window.removeEventListener('popstate', onPop);
            // Restore default behavior on cleanup
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'auto';
            }
        };
    }, []);

    return <div className="h-full w-full">{children}</div>;
}
