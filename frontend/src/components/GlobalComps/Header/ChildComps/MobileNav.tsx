// src/components/Header/MobileNav.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
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
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const focusableElementsRef = useRef<HTMLElement[]>([]);

    // Close menu on Escape key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            buttonRef.current?.focus();
        }
    }, []);

    // Trap focus within menu when open
    useEffect(() => {
        if (!isOpen) return;

        const getFocusableElements = () => {
            if (!menuRef.current) return [];
            const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
            return Array.from(menuRef.current.querySelectorAll<HTMLElement>(focusableSelectors));
        };

        focusableElementsRef.current = getFocusableElements();

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || !isOpen) return;

            const focusableElements = focusableElementsRef.current;
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                // Shift+Tab: if on first element, wrap to last
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab: if on last element, wrap to first
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
    }, [isOpen]);

    // Prevent background scroll while menu open; restore when closed
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);

            // Prevent scrolling without changing scroll position
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';

            // Add attribute to hide custom scrollbar
            document.documentElement.setAttribute('data-mobile-menu-open', 'true');

            // Disable Lenis scrolling
            if (window.lenis) {
                window.lenis.stop();
            }
        } else {
            document.removeEventListener('keydown', handleKeyDown);

            // Restore scrolling
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';

            // Remove attribute
            document.documentElement.removeAttribute('data-mobile-menu-open');

            // Re-enable Lenis scrolling
            if (window.lenis) {
                window.lenis.start();
            }
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.documentElement.removeAttribute('data-mobile-menu-open');
            if (window.lenis) {
                window.lenis.start();
            }
        };
    }, [isOpen, handleKeyDown]);

    return (
        <div className="lg:hidden">
            {/* Overlay covers entire viewport including scrollbar */}
            {isOpen && (
                <div
                    className="fixed top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-sm z-1200"
                    style={{
                        width: '100vw',
                        height: '100vh',
                        margin: 0,
                        padding: 0,
                    }}
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Expanding hamburger/menu container */}
            <div
                ref={menuRef}
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-hidden={!isOpen}
                style={{
                    width: isOpen ? 'min(320px, calc(100vw - 32px))' : '40px',
                    height: isOpen ? '280px' : '40px',
                    borderRadius: isOpen ? '0.75rem' : '0.375rem',
                    padding: isOpen ? '1.5rem' : '0',
                }}
                className={`fixed top-3.5 right-4 bg-neutral-900 z-1300 flex flex-col transition-all duration-500 ease-in-out origin-top-right overflow-hidden ${
                    isOpen ? 'border border-purple-500' : 'border-0'
                }`}
            >
                {/* Toggle button */}
                <button
                    ref={buttonRef}
                    onClick={() => setIsOpen((prev) => !prev)}
                    style={{
                        top: isOpen ? '24px' : '0',
                        right: isOpen ? '24px' : '0',
                    }}
                    className={`absolute w-10 h-10 z-10 flex flex-col justify-center items-center gap-1.5 rounded-md shadow-md transition-all duration-500 ease-in-out ${
                        isOpen ? 'bg-red-400 border-0' : 'bg-green-400 border border-purple-500'
                    }`}
                    aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={isOpen}
                    aria-controls="mobile-menu"
                >
                    <div className="relative w-7 h-5">
                        <span
                            style={{
                                position: 'absolute',
                                left: isOpen ? '50%' : '0%',
                                top: isOpen ? '9px' : '0px',
                                width: isOpen ? '0%' : '100%',
                                height: '2px',
                                background: 'black',
                                borderRadius: '9999px',
                                transformOrigin: 'center',
                                transition: 'left 240ms ease, top 240ms ease, width 240ms ease, opacity 180ms linear',
                                opacity: 1,
                                display: 'block',
                            }}
                        />
                        <span
                            style={{
                                position: 'absolute',
                                left: '0%',
                                top: '9px',
                                width: '100%',
                                height: '2px',
                                background: 'black',
                                borderRadius: '9999px',
                                transformOrigin: 'center',
                                transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                                transition: 'transform 300ms cubic-bezier(.4,0,.2,1)',
                                display: 'block',
                            }}
                        />
                        <span
                            style={{
                                position: 'absolute',
                                left: '0%',
                                top: '9px',
                                width: '100%',
                                height: '2px',
                                background: 'black',
                                borderRadius: '9999px',
                                transformOrigin: 'center',
                                transform: isOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
                                transition: 'transform 300ms cubic-bezier(.4,0,.2,1)',
                                display: 'block',
                            }}
                        />
                        <span
                            style={{
                                position: 'absolute',
                                left: isOpen ? '50%' : '0%',
                                top: isOpen ? '9px' : '18px',
                                width: isOpen ? '0%' : '100%',
                                height: '2px',
                                background: 'black',
                                borderRadius: '9999px',
                                transformOrigin: 'center',
                                transition: 'left 240ms ease, top 240ms ease, width 240ms ease, opacity 180ms linear',
                                opacity: 1,
                                display: 'block',
                            }}
                        />
                    </div>
                </button>

                {/* Menu content - fades in as container expands */}
                <div
                    style={{
                        opacity: isOpen ? 1 : 0,
                        pointerEvents: isOpen ? 'auto' : 'none',
                    }}
                    className="transition-opacity duration-500 ease-in-out flex flex-col h-full"
                >
                    <div className="flex items-center justify-between mb-8 w-full shrink-0">
                        <Link
                            to="/"
                            style={{ fontFamily: logoFont, whiteSpace: 'nowrap' }}
                            className="text-2xl text-purple-500 font-bold tracking-widest whitespace-nowrap z-5"
                            onClick={() => setIsOpen(false)}
                            tabIndex={isOpen ? 0 : -1}
                        >
                            INABA-Log
                        </Link>
                    </div>

                    {/* NavList items respect isOpen state for tabbing */}
                    <div className="shrink-0">
                        <NavList navItems={navItems} navFont={navFont} onItemClick={() => setIsOpen(false)} tabIndex={isOpen ? 0 : -1} />
                    </div>
                </div>
            </div>
        </div>
    );
}
