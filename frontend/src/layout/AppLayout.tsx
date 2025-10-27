// src/layout/AppLayout.tsx
import { useEffect, useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/GlobalComps/Header/Header';
import { Footer } from '../components/GlobalComps/Footer/Footer';
import { LenisScroll } from '../components/AnimationComps/Scroll/ScrollWrapper';

export function AppLayout() {
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    // Disable browser scroll restoration
    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }, []);

    // Handle scroll direction
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY.current) {
                // Scrolling down - hide header
                setIsHeaderVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
                // Scrolling up - show header
                setIsHeaderVisible(true);
            }
            // When scroll stops, state stays as is

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // reflect header-hidden state on the root element so portaled elements can react
    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (!isHeaderVisible) {
                document.documentElement.setAttribute('data-header-hidden', 'true');
            } else {
                document.documentElement.setAttribute('data-header-hidden', 'false');
            }
        }
    }, [isHeaderVisible]);

    return (
        <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
            {/* Header */}
            <header
                className={`fixed top-0 w-full z-100 transition-transform duration-300 ${
                    !isHeaderVisible ? '-translate-y-full' : 'translate-y-0'
                }`}
                role="banner"
            >
                <Header />
            </header>

            {/* Main content wrapped in Lenis smooth scroll */}
            <LenisScroll>
                <main className="flex-1 w-full relative z-10">
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
