// src/layout/AppLayout.tsx
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/GlobalComps/Header/Header';
import { Footer } from '../components/GlobalComps/Footer/Footer';
import { LenisScroll } from '../components/AnimationComps/Scroll/ScrollWrapper';
import { LineNetworkBackdrop } from '../components/AnimationComps/LineNetworkBackdrop';

export function AppLayout() {
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    // Handle scroll direction
    useEffect(() => {
        let lastValidScrollY = 0;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Ignore negative scroll positions
            if (currentScrollY < 0) {
                return;
            }

            // Ignore very small scroll changes
            const scrollDelta = Math.abs(currentScrollY - lastValidScrollY);
            if (scrollDelta < 3) {
                return;
            }

            // Hide header when scrolling down past threshold
            if (currentScrollY > lastValidScrollY && currentScrollY > 80) {
                setIsHeaderVisible(false);
            }
            // Show header when scrolling up
            else if (currentScrollY < lastValidScrollY) {
                setIsHeaderVisible(true);
            }

            lastValidScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Reflect header-hidden state on the root element
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute(
                'data-header-hidden',
                isHeaderVisible ? 'false' : 'true',
            );
        }
    }, [isHeaderVisible]);

    return (
        <div className="flex flex-col min-h-screen text-white">
            {/* Line Network Backdrop webgl */}
            <LineNetworkBackdrop
                lineCount={20}
                lineColor="#9162CB66"
                lineWidth={0.05}
                duration={60000}
                endpointBand={0.9}
                sphereSize={0.12}
                blurAmount={50}
            />

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
                <main className="flex-1 w-full relative z-10 min-h-screen">
                    <Outlet />
                </main>
            </LenisScroll>

            {/* Footer */}
            <footer className="w-full mt-auto h-auto bg-neutral-800 flex items-start justify-center p-4 relative z-50">
                <Footer />
            </footer>
        </div>
    );
}
