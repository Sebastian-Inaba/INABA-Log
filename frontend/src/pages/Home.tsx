// src/pages/Home.tsx
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { NewestPost } from '../components/HomeComps/NewPost';
import { NewestResearch } from '../components/HomeComps/ResearchHighlight';
import { LatestPosts } from '../components/HomeComps/FiveLatest';

export function Home() {
    const topRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const stickyRef = useRef<HTMLDivElement | null>(null);
    const latestWrapperRef = useRef<HTMLDivElement | null>(null);
    const [isSticky, setIsSticky] = useState(false);
    const [topHeight, setTopHeight] = useState(0);
    const [fixedTop, setFixedTop] = useState(0);

    useLayoutEffect(() => {
        if (!topRef.current) return;

        // Capture the top wrapper height for spacing placeholder
        setTopHeight(topRef.current.offsetHeight);

        const handleScroll = () => {
            if (!topRef.current || !bottomRef.current) return;

            const topRect = topRef.current.getBoundingClientRect();
            const bottomRect = bottomRef.current.getBoundingClientRect();

            // Stick top wrapper when bottom wrapper enters viewport
            if (bottomRect.top <= window.innerHeight) {
                if (!isSticky) {
                    setFixedTop(topRect.top);
                    setIsSticky(true);
                }
            } else if (isSticky) {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isSticky]);

    useEffect(() => {
        const stickyEl = stickyRef.current;
        const latestEl = latestWrapperRef.current;
        if (!stickyEl || !latestEl) return;

        let rafId: number | null = null;

        const updateClip = () => {
            rafId = requestAnimationFrame(() => {
                const stickyRect = stickyEl.getBoundingClientRect();
                const latestRect = latestEl.getBoundingClientRect();

                // Calculate overlap between sticky header bottom and latest posts top
                const overlap = Math.max(0, stickyRect.bottom - latestRect.top);

                if (overlap > 0) {
                    const inset = `${Math.ceil(overlap)}px 0px 0px 0px`;
                    latestEl.style.clipPath = `inset(${inset})`;
                    latestEl.style.setProperty('-webkit-clip-path', `inset(${inset})`);
                } else {
                    latestEl.style.clipPath = 'none';
                    latestEl.style.removeProperty('-webkit-clip-path');
                }
            });
        };

        // Initial update
        updateClip();

        const onScroll = () => updateClip();
        const onResize = () => updateClip();

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);

        // Cleanup
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            latestEl.style.clipPath = 'none';
            latestEl.style.removeProperty('-webkit-clip-path');
        };
    }, []);

    return (
        <div className="w-full mx-auto h-full">
            {/* Placeholder to preserve space when top wrapper is fixed */}
            {isSticky && <div style={{ height: topHeight }} />}

            {/* Top wrapper: contains newest posts & research */}
            <div
                ref={topRef}
                className={`min-h-8/12  transition-all duration-200 ${isSticky ? 'z-0' : ''}`}
                style={isSticky ? { position: 'fixed', top: fixedTop, left: 0, right: 0 } : { position: 'relative' }}
            >
                <div className="max-w-6xl mx-auto px-4 relative pt-10 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div>
                            <NewestPost apiUrl="/posts/newest" />
                        </div>
                        <div className="flex">
                            <div className="border-2 border-gray-400 mx-6 rounded-2xl" />
                            <NewestResearch apiUrl="/research/newest" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom wrapper: contains sticky heading & five latest posts */}
            <div ref={bottomRef} className={`relative ${isSticky ? 'z-40' : 'z-10'}`}>
                {/* Backdrop blur layer */}
                <div className="absolute inset-0 w-full backdrop-blur-2xl bg-black/40 shadow-lg -z-10" />
                <div className="w-full max-w-10/12 mx-auto border-2 rounded-2xl border-gray-400" />

                <div className="relative z-50 w-full mx-auto flex flex-col items-center h-fit">
                    {/* Sticky heading */}
                    <div ref={stickyRef} className="flex sticky top-0 items-center justify-center w-full pr-150 py-7 z-[80]">
                        <h2 className="text-3xl font-bold">Recent Posts</h2>
                    </div>

                    {/* Latest posts wrapper (clip-path applied dynamically) */}
                    <div ref={latestWrapperRef} className="w-1/2 flex justify-center mt-10 mb-15 relative z-10">
                        <LatestPosts className="w-full" apiUrl="/posts/latest-five" />
                    </div>
                </div>
            </div>
        </div>
    );
}
