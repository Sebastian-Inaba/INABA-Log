// src/components/Header/NavList.tsx
import { Link } from 'react-router-dom';
import type { RouteConfig } from '../../../../routes/routes';

type NavItemWithPath = RouteConfig & { path: string };

type NavListProps = {
    navItems: NavItemWithPath[]; // List of routes to render
    navFont: string; // Font for the link labels
    onItemClick?: () => void;
    tabIndex?: number; // TabIndex to control keyboard navigation
};

export function NavList({
    navItems,
    navFont,
    onItemClick,
    tabIndex,
}: NavListProps) {
    return (
        <ul className="flex flex-col gap-4">
            {navItems.map((route) => {
                const IconComponent = route.icon;
                return (
                    <li key={route.path}>
                        {/* Each navigation link */}
                        <Link
                            to={route.path}
                            onClick={onItemClick}
                            tabIndex={tabIndex}
                            className="flex items-center gap-2 px-4 py-2 bg-green-400 rounded-3xl hover:bg-green-500 transition-colors"
                        >
                            {/* Optional icon */}
                            {IconComponent &&
                                typeof IconComponent === 'function' && (
                                    <IconComponent className="w-5 h-5" />
                                )}
                            {/* Link label */}
                            <span
                                style={{
                                    fontFamily: navFont,
                                    color: '#252525',
                                }}
                                className="font-semibold"
                            >
                                {route.label}
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
