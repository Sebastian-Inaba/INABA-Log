// src/pages/Home.tsx
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { NewestPost } from '../components/HomeComps/NewPost';
import { NewestResearch } from '../components/HomeComps/ResearchHighlight';
import { LatestPosts } from '../components/HomeComps/FiveLatest';
import { FadeIn } from '../components/AnimationComps/FadeIn';

export function Home() {
    // Refs to DOM sections used by the sticky behaviour and measurements
    const topSectionRef = useRef<HTMLDivElement | null>(null);
    const bottomSectionRef = useRef<HTMLDivElement | null>(null);
    const stickyHeaderRef = useRef<HTMLDivElement | null>(null);
    const latestPostsWrapperRef = useRef<HTMLDivElement | null>(null);

    // Sticky state and a ref mirror for the scroll handler (avoid stale closures)
    const [isSticky, setIsSticky] = useState(false);
    const isStickyRef = useRef(isSticky);

    // Keep isStickyRef in sync with state
    useEffect(() => {
        isStickyRef.current = isSticky;
    }, [isSticky]);

    // Style helper functions
    // Apply/Remove fixed styles to the top section when sticky
    const applyFixedStyles = (topOffset: number) => {
        const section = topSectionRef.current;
        if (!section) return;
        // // Styling applied when section becomes sticky
        section.style.position = 'fixed';
        section.style.top = `${topOffset}px`;
        section.style.left = '0';
        section.style.right = '0';
        section.style.boxSizing = 'border-box';
        section.style.width = '';
    };

    const removeFixedStyles = () => {
        const section = topSectionRef.current;
        if (!section) return;
        // Remove previously set inline styles when leaving sticky state
        section.style.position = '';
        section.style.top = '';
        section.style.left = '';
        section.style.right = '';
        section.style.boxSizing = '';
        section.style.width = '';
    };

    // Manage bottom section margin to avoid layout jump when top section is fixed
    const setBottomSectionMargin = (marginPx: number) => {
        const section = bottomSectionRef.current;
        if (!section) return;
        section.style.marginTop = `${marginPx}px`;
    };

    const clearBottomSectionMargin = () => {
        const section = bottomSectionRef.current;
        if (!section) return;
        section.style.marginTop = '';
    };

    // Resize observer & layout measurement
    useLayoutEffect(() => {
        const section = topSectionRef.current;
        if (!section) return;

        // Update measurements when observed elements resize
        const updateMeasurements = () => {
            if (isStickyRef.current) {
                const rect = section.getBoundingClientRect();
                // Keep fixed top position stable and adjust bottom margin to match height
                section.style.top = `${Math.round(rect.top)}px`;
                setBottomSectionMargin(Math.ceil(rect.height));
            }
        };

        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined') {
            // Resize observer to react to content changes (height changes)
            resizeObserver = new ResizeObserver(updateMeasurements);
            resizeObserver.observe(section);
            if (bottomSectionRef.current) {
                resizeObserver.observe(bottomSectionRef.current);
            }
        }

        window.addEventListener('resize', updateMeasurements);
        window.addEventListener('load', updateMeasurements);

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            window.removeEventListener('resize', updateMeasurements);
            window.removeEventListener('load', updateMeasurements);
        };
    }, []);

    // Scroll handler / sticky logic
    useEffect(() => {
        let scrollRafId: number | null = null;

        const handleScroll = () => {
            if (!topSectionRef.current || !bottomSectionRef.current) return;

            const bottomRect = bottomSectionRef.current.getBoundingClientRect();
            const shouldBeSticky = bottomRect.top <= window.innerHeight;

            // Make section sticky when the bottom section enters the viewport threshold
            if (shouldBeSticky && !isStickyRef.current) {
                if (scrollRafId) cancelAnimationFrame(scrollRafId);
                scrollRafId = requestAnimationFrame(() => {
                    const topRect =
                        topSectionRef.current!.getBoundingClientRect();
                    const sectionHeight = Math.ceil(
                        topSectionRef.current!.offsetHeight || topRect.height,
                    );

                    setBottomSectionMargin(sectionHeight);
                    applyFixedStyles(Math.round(topRect.top));
                    setIsSticky(true);
                });
                return;
            }

            // Remove sticky when it should no longer be sticky
            if (!shouldBeSticky && isStickyRef.current) {
                if (scrollRafId) cancelAnimationFrame(scrollRafId);
                scrollRafId = requestAnimationFrame(() => {
                    removeFixedStyles();
                    clearBottomSectionMargin();
                    setIsSticky(false);
                });
            }
        };

        // Scroll handler added with passive option for performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        // run once to set initial state
        handleScroll();

        return () => {
            if (scrollRafId) cancelAnimationFrame(scrollRafId);
            window.removeEventListener('scroll', handleScroll);
            // Ensure styles and margins are cleared on unmount
            removeFixedStyles();
            clearBottomSectionMargin();
        };
    }, []);

    return (
        <div className="w-full mx-auto h-full pt-[70px]" aria-label="Homepage">
            {/* Visually-hidden page title for proper heading hierarchy */}
            <h1 className="sr-only">Home</h1>

            {/* Bento grid top section */}
            <section
                ref={topSectionRef}
                // This section contains featured/newest content; it's made sticky via JS.
                className={`transition-all duration-200 ${isSticky ? 'z-0' : ''}`}
                aria-label="Featured content"
                role="region"
            >
                <div className="max-w-7xl mx-auto relative pt-10 pb-20 px-4">
                    {/* Bento grid layout: 3 columns on desktop, responsive breakpoints */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 auto-rows-fr">
                        {/* New Post */}
                        <FadeIn
                            direction="up"
                            delay={200}
                            className="xl:col-span-7 md:col-span-2 flex flex-col h-full min-h-[400px]"
                        >
                            {/* Fetch handler */}
                            <NewestPost
                                apiUrl="/posts/newest"
                                className="flex-1"
                                aria-label="Newest post"
                            />
                        </FadeIn>

                        {/* Info section */}
                        <FadeIn
                            direction="up"
                            delay={300}
                            className="xl:col-span-5 md:col-span-1 flex flex-col h-full min-h-[300px]"
                        >
                            {/* Fetch handler */}
                            <NewestResearch
                                className="flex-1"
                                aria-label="Research highlight"
                            />
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Bottom section with recent posts */}
            <section
                ref={bottomSectionRef}
                className={`relative ${isSticky ? 'z-40' : 'z-10'} w-full`}
                aria-label="Recent posts section"
                role="region"
                aria-labelledby="recent-posts-heading"
            >
                {/* Decorative background - mark aria-hidden so screen readers ignore it */}
                <div
                    className="absolute top-0 left-0 w-full h-[calc(100%+100px)] bg-neutral-950 z-[-100]"
                    aria-hidden="true"
                />

                <FadeIn direction="up" threshold={0}>
                    {/* Decorative separator */}
                    <div
                        className="w-full max-w-7xl mx-auto border-2 rounded-2xl border-gray-400"
                        aria-hidden="true"
                    />

                    <div className="relative z-50 w-full mx-auto flex flex-col items-center h-fit">
                        <div
                            ref={stickyHeaderRef}
                            className="flex top-0 items-center justify-center w-full py-4 z-50"
                        >
                            <h2
                                id="recent-posts-heading"
                                className="text-3xl italic"
                            >
                                Recent Posts
                            </h2>
                        </div>

                        <div
                            ref={latestPostsWrapperRef}
                            className="w-full max-w-7xl flex justify-center mt-10 mb-15 relative z-10 px-4"
                            role="region"
                            aria-labelledby="recent-posts-heading"
                        >
                            {/* Fetch handler: LatestPosts handles fetching the latest five posts */}
                            <LatestPosts
                                className="w-full"
                                apiUrl="/posts/latest-five"
                                aria-label="Latest posts list"
                            />
                        </div>
                    </div>
                </FadeIn>
            </section>
        </div>
    );
}
