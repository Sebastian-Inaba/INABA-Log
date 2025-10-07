// src/pages/Home.tsx
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { NewestPost } from '../components/HomeComps/NewPost';
import { NewestResearch } from '../components/HomeComps/ResearchHighlight';
import { LatestPosts } from '../components/HomeComps/FiveLatest';
import { FadeIn } from '../components/AnimationComps/FadeIn';

export function Home() {
    // Refs to important DOM elements
    const topSectionRef = useRef<HTMLDivElement | null>(null);
    const bottomSectionRef = useRef<HTMLDivElement | null>(null);
    const stickyHeaderRef = useRef<HTMLDivElement | null>(null);
    const latestPostsWrapperRef = useRef<HTMLDivElement | null>(null);

    // State to track sticky status
    const [isSticky, setIsSticky] = useState(false);
    const isStickyRef = useRef(isSticky);

    // Sync mutable ref with state
    useEffect(() => {
        isStickyRef.current = isSticky;
    }, [isSticky]);

    /** Apply fixed positioning to the top section */
    const applyFixedStyles = (topOffset: number) => {
        const section = topSectionRef.current;
        if (!section) return;
        section.style.position = 'fixed';
        section.style.top = `${topOffset}px`;
        section.style.left = '0';
        section.style.right = '0';
        section.style.boxSizing = 'border-box';
        section.style.width = '';
    };

    /** Remove fixed positioning from the top section */
    const removeFixedStyles = () => {
        const section = topSectionRef.current;
        if (!section) return;
        section.style.position = '';
        section.style.top = '';
        section.style.left = '';
        section.style.right = '';
        section.style.boxSizing = '';
        section.style.width = '';
    };

    /** Set bottom section margin to prevent layout shift when sticky */
    const setBottomSectionMargin = (marginPx: number) => {
        const section = bottomSectionRef.current;
        if (!section) return;
        section.style.marginTop = `${marginPx}px`;
    };

    /** Clear bottom section margin */
    const clearBottomSectionMargin = () => {
        const section = bottomSectionRef.current;
        if (!section) return;
        section.style.marginTop = '';
    };

    /** Keep measurements updated during sticky state (responsive handling) */
    useLayoutEffect(() => {
        const section = topSectionRef.current;
        if (!section) return;

        const updateMeasurements = () => {
            // Always update if sticky, but also check if we should BECOME sticky
            if (isStickyRef.current) {
                const rect = section.getBoundingClientRect();
                applyFixedStyles(Math.round(rect.top));
                setBottomSectionMargin(Math.ceil(rect.height));
            } else {
                // Check if we should become sticky due to zoom change
                const bottomRect = bottomSectionRef.current?.getBoundingClientRect();
                if (bottomRect && bottomRect.top <= window.innerHeight) {
                    // Force re-evaluation of sticky state
                    const topRect = section.getBoundingClientRect();
                    const sectionHeight = Math.ceil(section.offsetHeight || topRect.height);
                    setBottomSectionMargin(sectionHeight);
                    applyFixedStyles(Math.round(topRect.top));
                    setIsSticky(true);
                }
            }
        };

        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined') {
            // Observe size changes to keep measurements accurate
            resizeObserver = new ResizeObserver(updateMeasurements);
            resizeObserver.observe(section);
            // Also observe the bottom section to catch layout changes
            if (bottomSectionRef.current) {
                resizeObserver.observe(bottomSectionRef.current);
            }
        }

        // Also react to window resize/load
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

    /** Scroll handler for sticky top section */
    useEffect(() => {
        let scrollRafId: number | null = null;
        let checkRafId: number | null = null;

        const handleScroll = () => {
            if (!topSectionRef.current || !bottomSectionRef.current) return;

            const bottomRect = bottomSectionRef.current.getBoundingClientRect();
            const shouldBeSticky = bottomRect.top <= window.innerHeight;

            // Enter sticky state
            if (shouldBeSticky && !isStickyRef.current) {
                if (scrollRafId) cancelAnimationFrame(scrollRafId);
                scrollRafId = requestAnimationFrame(() => {
                    const topRect = topSectionRef.current!.getBoundingClientRect();
                    const sectionHeight = Math.ceil(topSectionRef.current!.offsetHeight || topRect.height);

                    setBottomSectionMargin(sectionHeight);
                    applyFixedStyles(Math.round(topRect.top));
                    setIsSticky(true);
                });
                return;
            }

            // Exit sticky state
            if (!shouldBeSticky && isStickyRef.current) {
                if (scrollRafId) cancelAnimationFrame(scrollRafId);
                scrollRafId = requestAnimationFrame(() => {
                    removeFixedStyles();
                    clearBottomSectionMargin();
                    setIsSticky(false);
                });
            }
        };

        // Force immediate check after layout changes (zoom, resize)
        const handleLayoutChange = () => {
            // If currently sticky, force un-stick first to get accurate measurements
            if (isStickyRef.current) {
                removeFixedStyles();
                clearBottomSectionMargin();
                setIsSticky(false);
            }

            if (checkRafId) cancelAnimationFrame(checkRafId);
            checkRafId = requestAnimationFrame(() => {
                // Double RAF to ensure layout is fully recalculated
                requestAnimationFrame(() => {
                    handleScroll();
                });
            });
        };

        // Attach listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleLayoutChange);

        // Add visual viewport change listener for zoom
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleLayoutChange);
        }

        // Initial check
        handleScroll();

        return () => {
            if (scrollRafId) cancelAnimationFrame(scrollRafId);
            if (checkRafId) cancelAnimationFrame(checkRafId);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleLayoutChange);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleLayoutChange);
            }
            // Clean up any styles left behind
            removeFixedStyles();
            clearBottomSectionMargin();
        };
    }, []);

    /** Clip-path adjustment for latest posts section to prevent overlap */
    useEffect(() => {
        const stickyHeader = stickyHeaderRef.current;
        const latestPostsWrapper = latestPostsWrapperRef.current;
        if (!stickyHeader || !latestPostsWrapper) return;

        let clipRafId: number | null = null;

        const updateClipPath = () => {
            clipRafId = requestAnimationFrame(() => {
                const stickyRect = stickyHeader.getBoundingClientRect();
                const latestRect = latestPostsWrapper.getBoundingClientRect();

                // Calculate overlap between sticky header bottom and latest posts top
                const overlap = Math.max(0, stickyRect.bottom - latestRect.top);

                if (overlap > 0) {
                    // Clip the top of the latest posts wrapper to avoid visual overlap
                    const inset = `${Math.ceil(overlap)}px 0px 0px 0px`;
                    latestPostsWrapper.style.clipPath = `inset(${inset})`;
                    latestPostsWrapper.style.setProperty('-webkit-clip-path', `inset(${inset})`);
                } else {
                    // No overlap, clear clipping
                    latestPostsWrapper.style.clipPath = 'none';
                    latestPostsWrapper.style.removeProperty('-webkit-clip-path');
                }
            });
        };

        // Run initially
        updateClipPath();

        window.addEventListener('scroll', updateClipPath, { passive: true });
        window.addEventListener('resize', updateClipPath);

        return () => {
            if (clipRafId) cancelAnimationFrame(clipRafId);
            window.removeEventListener('scroll', updateClipPath);
            window.removeEventListener('resize', updateClipPath);
            // Ensure clipping is cleared on unmount
            latestPostsWrapper.style.clipPath = 'none';
            latestPostsWrapper.style.removeProperty('-webkit-clip-path');
        };
    }, []);

    return (
        <div className="w-full mx-auto h-full overflow-x-hidden overflow-y-auto hide-scrollbar">
            {/* Top section (newest post & research highlight) */}
            <div ref={topSectionRef} className={`transition-all duration-200 ${isSticky ? 'z-0' : ''}`}>
                <div className="max-w-11/12 mx-auto relative pt-10 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Newest post wrapper */}
                        <FadeIn direction="up" className="flex justify-center items-center">
                            <NewestPost apiUrl="/posts/newest" />
                        </FadeIn>
                        {/* Latest research wrapper*/}
                        <FadeIn direction="up" delay={100} className="flex mt-10 lg:mt-0">
                            {/* Divider */}
                            <div className="border-2 border-gray-400 mx-0 mr-4 lg:mx-6 rounded-2xl" />
                            <NewestResearch apiUrl="/research/newest" />
                        </FadeIn>
                    </div>
                </div>
            </div>

            {/* Bottom section (sticky heading + latest posts) */}
            <FadeIn direction="up" threshold={0}>
                <div ref={bottomSectionRef} className={`relative ${isSticky ? 'z-40' : 'z-10'} w-full`}>
                    {/* Backdrop blur */}
                    <div className="absolute inset-0 w-full backdrop-blur-2xl bg-black/40 shadow-lg -z-10" />
                    {/* Divider */}
                    <div className="w-full max-w-10/12 mx-auto border-2 rounded-2xl border-gray-400" />

                    <div className="relative z-50 w-full mx-auto flex flex-col items-center h-fit">
                        {/* Sticky heading*/}
                        <div ref={stickyHeaderRef} className="flex sticky top-0 items-center justify-center w-full lg:pr-150 py-7 z-[80]">
                            <h2 className="text-3xl font-bold">Recent Posts</h2>
                        </div>

                        {/* Latest posts wrapper*/}
                        <div
                            ref={latestPostsWrapperRef}
                            className="w-full xl:w-1/2 flex justify-center mt-10 mb-15 relative z-10 px-4 xl:px-0"
                        >
                            <LatestPosts className="w-full" apiUrl="/posts/latest-five" />
                        </div>
                    </div>
                </div>
            </FadeIn>
        </div>
    );
}
