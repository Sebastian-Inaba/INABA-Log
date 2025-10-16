// src/layout/AppLayout.tsx
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/GlobalComps/Header/Header';
import { Footer } from '../components/GlobalComps/Footer/Footer';
import { LenisScroll } from '../components/AnimationComps/Scroll/ScrollWrapper';

export function AppLayout() {
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

    // Disable browser scroll restoration
    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }, []);

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
            {/* Pass setScrollDirection so Lenis can notify about direction changes */}
            <LenisScroll onDirectionChange={setScrollDirection}>
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
