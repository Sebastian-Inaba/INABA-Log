// src/components/Header/Header.tsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { routesConfig } from '../../../routes/routes';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import type { RouteConfig } from '../../../routes/routes';

type HeaderProps = {
    logoFont?: string;
    navFont?: string;
};

export function Header ({ logoFont = 'Poppins', navFont = 'Lato' }: HeaderProps) {
    const navItems: RouteConfig[] = useMemo(() => routesConfig[0].children?.filter((r) => r.showInNav) ?? [], []);

    return (
        <header className="w-full max-w-6xl mx-auto flex items-center justify-between px-10 py-4 relative">
            {/* Logo */}
            <Link
                to="/"
                style={{ fontFamily: logoFont }}
                className="text-3xl text-purple-500 font-bold tracking-widest flex items-center"
                aria-label="Logo link to homepage"
            >
                INABA-Log
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Main Navigation" className="hidden lg:block mt-1">
                <DesktopNav navItems={navItems} navFont={navFont} />
            </nav>

            {/* Mobile nav */}
            <MobileNav navItems={navItems} navFont={navFont} />
        </header>
    );
};
