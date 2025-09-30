// src/layout/AppLayout.tsx
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/GlobalComps/Header/Header';
import { Footer } from '../components/GlobalComps/Footer/Footer';
import { LenisScroll } from '../components/AnimationComps/Scroll/ScrollWrapper';

export function AppLayout() {
    const location = useLocation();
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
    const [lastScroll, setLastScroll] = useState(0);

    // Disable browser scroll restoration
    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }, []);

    // Reset scroll position and state when route changes
    useEffect(() => {
        window.scrollTo(0, 0);
        setLastScroll(0);
        setScrollDirection('up');
    }, [location.pathname]);

    // Initialize lastScroll with current position on mount
    useEffect(() => {
        setLastScroll(window.scrollY);
    }, []);

    // Track the user's scroll direction
    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            if (currentScroll > lastScroll) {
                setScrollDirection('down'); // user scrolled down
            } else {
                setScrollDirection('up'); // user scrolled up
            }
            setLastScroll(currentScroll);
        };

        // Attach scroll listener
        window.addEventListener('scroll', handleScroll);

        // Cleanup on unmount
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScroll]);

    return (
        <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
            {/* Header - hides when scrolling down */}
            <header
                className={`fixed top-0 w-full bg-neutral-900 z-100 transition-transform duration-300 ${
                    scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
                }`}
                role="banner"
            >
                <Header />
            </header>

            {/* Main content wrapped in Lenis smooth scroll */}
            <LenisScroll>
                <main className="flex-1 w-full pt-[60px]">
                    <Outlet />
                </main>
            </LenisScroll>

            {/* Footer - it's a footer */}
            <footer className="w-full mt-auto h-[300px] bg-neutral-800 flex items-center justify-center p-4 z-10">
                <Footer />
            </footer>
        </div>
    );
}
