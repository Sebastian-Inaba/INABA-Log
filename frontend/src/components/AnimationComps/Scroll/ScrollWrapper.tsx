// src/components/AnimationComps/Scroll/ScrollWrapper.tsx
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollBar } from './ScrollBar';
import Lenis from 'lenis';

interface LenisScrollProps {
    children: ReactNode;
    onDirectionChange?: (dir: 'up' | 'down') => void;
}

// Hook to detect if we're on mobile/tablet
function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.innerWidth >= 1024; // lg breakpoint
    });

    useEffect(() => {
        const checkIsDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        window.addEventListener('resize', checkIsDesktop);
        return () => window.removeEventListener('resize', checkIsDesktop);
    }, []);

    return isDesktop;
}

export function LenisScroll({ children, onDirectionChange }: LenisScrollProps) {
    const isDesktop = useIsDesktop();
    const lenisRef = useRef<Lenis | null>(null);
    const location = useLocation();
    const moRef = useRef<MutationObserver | null>(null);
    const lastScrollRef = useRef<number>(0);
    const lastDirectionRef = useRef<'up' | 'down'>('up');
    const isScrollingRef = useRef<boolean>(false);
    const scrollTimeoutRef = useRef<number | null>(null);

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
        // Only initialize Lenis on desktop
        if (!isDesktop) return;

        // Initialize Lenis for smooth scrolling
        lenisRef.current = new Lenis({
            lerp: 0.07,
            smoothWheel: true,
            wheelMultiplier: 1,
            autoRaf: true,
        });

        window.lenis = lenisRef.current;

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

        (async () => {
            await waitForImagesToLoad();
            lenisRef.current?.resize?.();
        })();

        let resizeScheduled = false;
        let lastResizeTime = 0;
        const RESIZE_THROTTLE = 300;
        const pendingResize = { scheduled: false };

        const scheduleResize = () => {
            if (isScrollingRef.current) {
                pendingResize.scheduled = true;
                return;
            }

            const now = Date.now();

            if (now - lastResizeTime >= RESIZE_THROTTLE) {
                if (lenisRef.current) {
                    lenisRef.current.resize();
                }
                lastResizeTime = now;
                resizeScheduled = false;
                pendingResize.scheduled = false;
                return;
            }

            if (resizeScheduled) return;
            resizeScheduled = true;

            setTimeout(
                () => {
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

        const checkPendingResize = () => {
            if (pendingResize.scheduled && !isScrollingRef.current) {
                scheduleResize();
            }
        };

        const pendingInterval = window.setInterval(checkPendingResize, 500);

        moRef.current = new MutationObserver((mutations) => {
            const shouldResize = mutations.some((mutation) => {
                if (mutation.type === 'childList') {
                    const hasElementNodes =
                        Array.from(mutation.addedNodes).some(
                            (node) => node.nodeType === Node.ELEMENT_NODE,
                        ) ||
                        Array.from(mutation.removedNodes).some(
                            (node) => node.nodeType === Node.ELEMENT_NODE,
                        );
                    return hasElementNodes;
                }

                if (mutation.type === 'attributes') {
                    const attrName = mutation.attributeName;
                    return (
                        attrName === 'src' ||
                        attrName === 'srcset' ||
                        attrName === 'style' ||
                        attrName === 'class' ||
                        attrName === 'aria-expanded'
                    );
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
                attributeFilter: [
                    'src',
                    'srcset',
                    'style',
                    'class',
                    'aria-expanded',
                ],
            });
        }

        let resizeDebounce: number | null = null;
        const onExternalContentChange = () => {
            if (resizeDebounce) {
                window.clearTimeout(resizeDebounce);
            }
            resizeDebounce = window.setTimeout(() => {
                if (lenisRef.current && !isScrollingRef.current) {
                    lenisRef.current.resize();
                }
                resizeDebounce = null;
            }, 60);
        };
        window.addEventListener(
            'lenis:contentchange',
            onExternalContentChange as EventListener,
        );

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

            window.removeEventListener(
                'lenis:contentchange',
                onExternalContentChange as EventListener,
            );
        };
    }, [onDirectionChange, isDesktop]);

    useEffect(() => {
        if (!isDesktop || !lenisRef.current) return;

        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

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

                requestAnimationFrame(async () => {
                    await waitForImagesToLoad();
                    lenisRef.current?.resize?.();

                    window.scrollTo(0, 0);
                    try {
                        lenisRef.current?.scrollTo(0, { immediate: true });
                    } catch {
                        // ignore
                    }
                });
            });
        });
    }, [location.pathname, location.search, isDesktop]);

    useEffect(() => {
        if (!isDesktop) return;

        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        const onPop = () => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            if (!lenisRef.current) return;

            lenisRef.current.stop();

            requestAnimationFrame(() => {
                window.scrollTo(0, 0);

                try {
                    lenisRef.current?.scrollTo(0, {
                        immediate: true,
                        force: true,
                    });
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
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'auto';
            }
        };
    }, [isDesktop]);

    return (
        <div className="h-full w-full">
            {children}
            {isDesktop && <ScrollBar />}
        </div>
    );
}
