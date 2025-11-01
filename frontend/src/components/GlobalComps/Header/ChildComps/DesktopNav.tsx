// src/components/Header/DesktopNav.tsx
import type { RouteConfig } from '../../../../routes/routes';
import { Link } from 'react-router-dom';

type DesktopNavProps = {
    navItems: RouteConfig[];
    navFont: string;
    onItemClick?: () => void;
};

export function DesktopNav({
    navItems,
    navFont,
    onItemClick,
}: DesktopNavProps) {
    return (
        <ul className="flex flex-row gap-4">
            {navItems.map((route) => {
                const IconComponent = route.icon;
                return (
                    <li key={route.path} className="group">
                        <Link
                            to={route.path!}
                            onClick={onItemClick}
                            className="flex items-center gap-2 px-3 py-2 rounded bg-green-400 transform transition-transform duration-200 ease-out hover:scale-105 focus:outline-none focus-visible:scale-105"
                            aria-label={route.label}
                        >
                            {/* icon */}
                            {IconComponent &&
                                typeof IconComponent === 'function' && (
                                    <IconComponent className="w-5 h-5 shrink-0 ml-0.5" />
                                )}
                            {/* Label text */}
                            <span
                                style={{
                                    fontFamily: navFont,
                                    color: '#252525',
                                }}
                                className="font-semibold whitespace-nowrap"
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
