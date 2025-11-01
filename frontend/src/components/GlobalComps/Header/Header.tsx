// src/components/Header/Header.tsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { routesConfig } from '../../../routes/routes';
import { DesktopNav } from './ChildComps/DesktopNav';
import { MobileNav } from './ChildComps/MobileNav';
import { LogoIcon } from '../../../assets/icons/icons';

type HeaderProps = {
    navFont?: string;
};

export function Header({ navFont = 'Lato' }: HeaderProps) {
    const navItems = useMemo(
        () => routesConfig[0].children?.filter((r) => r.showInNav) ?? [],
        [],
    );

    return (
        <div
            className="w-full max-w-6xl mx-auto flex items-center justify-between px-4 py-4 relative
             bg-neutral-900/40 backdrop-blur-lg rounded-lg border border-neutral-800"
        >
            {/* Logo */}
            <Link
                to="/"
                className="tracking-widest flex items-center"
                aria-label="Logo link to homepage"
            >
                <LogoIcon className="h-12 w-auto"></LogoIcon>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Main Navigation" className="hidden lg:block mt-1">
                <DesktopNav navItems={navItems} navFont={navFont} />
            </nav>

            {/* Mobile nav */}
            <MobileNav navItems={navItems} navFont={navFont} />
        </div>
    );
}
