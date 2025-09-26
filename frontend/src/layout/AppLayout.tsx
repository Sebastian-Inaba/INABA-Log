// src/layout/AppLayout.tsx
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/GlobalComps/Header/Header';
import { Footer } from '../components/GlobalComps/Footer/Footer';
import { LenisScroll } from '../components/AnimationComps/Scroll/ScrollWrapper';

export function AppLayout() {
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
    const [lastScroll, setLastScroll] = useState(0);

    useEffect(() => {
        // Scroll event handler
        const handleScroll = () => {
            const currentScroll = window.scrollY;

            if (currentScroll > lastScroll) {
                setScrollDirection('down');
            } else {
                setScrollDirection('up');
            }

            setLastScroll(currentScroll);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScroll]);

    return (
        <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
            {/* Header*/}
            <header
                className={`fixed top-0 w-full bg-neutral-900 z-100 transition-transform duration-300 ${
                    scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
                }`}
                role="banner"
            >
                <Header />
            </header>

            {/* Main */}
            <LenisScroll>
                <main className="flex-1 w-full pt-[60px]">
                    <Outlet />
                </main>
            </LenisScroll>

            {/* Footer */}
            <footer className="w-full mt-auto h-[300px] bg-neutral-800 flex items-center justify-center p-4 z-10">
                <Footer />
            </footer>
        </div>
    );
}
