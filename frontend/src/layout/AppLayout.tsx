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

    // reflect header-hidden state on the root element so portaled elements can react
    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (scrollDirection === 'down') {
                document.documentElement.setAttribute('data-header-hidden', 'true');
            } else {
                document.documentElement.setAttribute('data-header-hidden', 'false');
            }
        }
    }, [scrollDirection]);

    return (
        <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
            {/* Header */}
            <header
                className={`fixed top-0 w-full bg-neutral-900 z-100 transition-transform duration-300 ${
                    scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
                }`}
                role="banner"
            >
                <Header />
            </header>

            {/* Main content wrapped in Lenis smooth scroll */}
            <LenisScroll onDirectionChange={setScrollDirection}>
                <main className="flex-1 w-full pt-[60px] relative z-10">
                    <Outlet />
                </main>
            </LenisScroll>

            {/* Footer */}
            <footer className="w-full mt-auto h-[300px] bg-neutral-800 flex items-center justify-center p-4 relative z-50">
                <Footer />
            </footer>
        </div>
    );
}
