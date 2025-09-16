// src/components/Header/NavList.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { RouteConfig } from '../../../routes/routes';

type NavItemWithPath = RouteConfig & { path: string };

type NavListProps = {
    navItems: NavItemWithPath[]; // List of routes to render
    navFont: string;             // Font for the link labels
    onItemClick?: () => void;    
    tabIndex?: number;           // TabIndex to control keyboard navigation
};

export const NavList: React.FC<NavListProps> = ({ navItems, navFont, onItemClick, tabIndex }) => {
    return (
        <ul className={`flex flex-col gap-4`}>
            {navItems.map((route) => (
                <li key={route.path}>
                    {/* Each navigation link */}
                    <Link
                        to={route.path}
                        onClick={onItemClick}
                        tabIndex={tabIndex} 
                        className="flex items-center gap-2 px-4 py-2 bg-green-400 rounded-3xl hover:bg-green-500 transition-colors"
                    >
                        {/* Optional icon */}
                        {route.icon && (
                            <img
                                src={route.icon}
                                alt={route.iconLabel}
                                className="w-5 h-5"
                                loading="lazy"
                            />
                        )}
                        {/* Link label */}
                        <span
                            style={{ fontFamily: navFont, color: '#252525' }}
                            className="font-semibold"
                        >
                            {route.label}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
};
