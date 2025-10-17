// src/components/Header/MobileNav.tsx
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { NavList } from './NavList';
import type { RouteConfig } from '../../../../routes/routes';

type MobileNavProps = {
    navItems: RouteConfig[];
    navFont: string;
    logoFont?: string;
};

export function MobileNav({ navItems, navFont, logoFont = 'Poppins' }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [headerHidden, setHeaderHidden] = useState<boolean>(() =>
        typeof document !== 'undefined' ? document.documentElement.getAttribute('data-header-hidden') === 'true' : false
    );

    // observe attribute changes so the portaled nav reacts when header hides/shows
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        const obs = new MutationObserver(() => {
            setHeaderHidden(root.getAttribute('data-header-hidden') === 'true');
        });
        obs.observe(root, { attributes: true, attributeFilter: ['data-header-hidden'] });
        return () => obs.disconnect();
    }, []);

    // Close menu on Escape key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
    }, []);

    // Effect handler for menu state
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    // Portal content so nav lives on document.body (avoid stacking-context issues)
    const portalContent = (
        // add responsive hide so portaled content is hidden on lg+ screens
        <div className={`fixed inset-0 z-[1400] pointer-events-none transition-transform duration-300 lg:hidden ${headerHidden ? '-translate-y-[60px]' : 'translate-y-0'}`}>
            {/* Hamburger button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed top-3.5 right-8 z-[1400] w-10 h-10 flex flex-col justify-center items-center gap-1.5 rounded-md shadow-md transition-transform duration-300 pointer-events-auto ${
                    isOpen ? 'bg-red-400' : 'bg-green-400'
                }`}
                style={{
                    transform: isOpen ? 'translateX(-600%)' : 'translateX(0)',
                }}
                aria-label="Toggle navigation menu"
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
            >
                {/* Hamburger lines */}
                <span className={`block h-0.5 w-6 bg-black transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 w-6 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                <span
                    className={`block h-0.5 w-6 bg-black transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}
                />
            </button>

            {/* Overlay behind menu when open */}
            {isOpen && (
                <div
                    className="fixed inset-0 h-screen bg-black/40 backdrop-blur-sm z-[1200] pointer-events-auto"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Slide-in mobile menu */}
            <div
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-hidden={!isOpen} // Hide from screen readers when closed
                className={`rounded-xl border-1 border-purple-500 fixed top-0 right-0 h-auto w-md max-w-xs bg-neutral-900 shadow-lg z-[1300] p-6 m-0 transition-transform duration-300 flex flex-col pointer-events-auto ${
                    isOpen ? 'translate-x-0' : 'translate-x-[120%]' // Slide in/out animation for nav
                }`}
            >
                {/* Mobile nav header */}
                <div className="flex items-center justify-end mb-8 w-full">
                    <Link
                        to="/"
                        style={{ fontFamily: logoFont }}
                        className="text-2xl text-purple-500 font-bold tracking-widest"
                        onClick={() => setIsOpen(false)}
                        tabIndex={isOpen ? 0 : -1} // Prevent tabbing when menu closed
                    >
                        INABA-Log
                    </Link>
                </div>

                {/* Mobile nav links */}
                <NavList
                    navItems={navItems}
                    navFont={navFont}
                    onItemClick={() => setIsOpen(false)}
                    tabIndex={isOpen ? 0 : -1} // Prevent tabbing when menu closed
                />
            </div>
        </div>
    );

    return (
        <div className="lg:hidden">
            {typeof document !== 'undefined' ? createPortal(portalContent, document.body) : null}
        </div>
    );
}
