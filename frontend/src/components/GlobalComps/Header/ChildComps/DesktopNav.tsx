// src/components/Header/DesktopNav.tsx
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { RouteConfig } from '../../../../routes/routes';

type DesktopNavProps = {
    navItems: RouteConfig[];
    navFont: string;
    onItemClick?: () => void;
};

export function DesktopNav({ navItems, navFont, onItemClick }: DesktopNavProps) {
    const [hoveredWidths, setHoveredWidths] = useState<Record<string, number>>({});
    const [isHovered, setIsHovered] = useState<Record<string, boolean>>({});
    const labelRefs = useRef<Record<string, HTMLSpanElement | null>>({});

    return (
        <ul className={`flex flex-row gap-4`}>
            {navItems.map((route) => {
                const handleMouseEnter = () => {
                    setIsHovered((prev) => ({ ...prev, [route.path!]: true }));

                    const labelEl = labelRefs.current[route.path!];
                    if (labelEl) {
                        setHoveredWidths((prev) => ({
                            ...prev,
                            [route.path!]: labelEl.offsetWidth + 50, // expand width based on label(kind of)
                        }));
                    }
                };

                const handleMouseLeave = () => {
                    setIsHovered((prev) => ({ ...prev, [route.path!]: false }));

                    setHoveredWidths((prev) => ({
                        ...prev,
                        [route.path!]: 40, // collapse width to default
                    }));
                };

                return (
                    <li key={route.path} className="group">
                        <Link
                            to={route.path!}
                            onClick={onItemClick}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            style={{
                                width: hoveredWidths[route.path!] ?? 40,
                                transition: isHovered[route.path!]
                                    ? 'width 0.5s ease-out' // expand
                                    : 'width 0.8s ease-out', // collapse
                            }}
                            className="flex items-center gap-2 px-2 py-2 rounded bg-green-400 overflow-hidden"
                        >
                            {/* icon */}
                            {route.icon && (
                                <img src={route.icon} alt={route.iconLabel} className="w-5 h-5 flex-shrink-0 ml-0.5" loading="lazy" />
                            )}
                            {/* Label text */}
                            <span
                                ref={(el: HTMLSpanElement | null) => {
                                    labelRefs.current[route.path!] = el;
                                }}
                                style={{ fontFamily: navFont, color: '#252525' }}
                                className="font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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
