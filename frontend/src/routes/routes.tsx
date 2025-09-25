// src/routes/routes.tsx
import type { ReactNode } from 'react';
import { AppLayout } from '../layout/AppLayout';
import { AdminWrapper } from '../layout/wrapper/AdminWrapper';
import { Home } from '../pages/Home';
import { Post } from '../pages/Post';
import { Research } from '../pages/Research';
import { Admin } from '../pages/Admin';
import { Login } from '../pages/Login';
import { NotFound } from '../pages/NotFound';
import { navIcons } from '../assets/icons/icons';

// TypeScript types for my routes
export type RouteConfig = {
    path: string;
    element: ReactNode;
    label?: string;
    showInNav?: boolean;
    icon?: string;
    children?: RouteConfig[];
    iconLabel?: string;
};

export const routesConfig = [
    {
        element: <AppLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
                label: 'Home',
                showInNav: true,
                icon: navIcons.home,
                iconLabel: 'A home Icon shaped like a house',
                iconKey: 'home',
            },
            {
                path: '/post',
                element: <Post />,
                label: 'Posts',
                showInNav: true,
                icon: navIcons.post,
                iconLabel: 'A home Icon shaped like a note',
                iconKey: 'post',
            },
            {
                path: '/research',
                element: <Research />,
                label: 'Deep Dives',
                showInNav: true,
                icon: navIcons.research,
                iconLabel: 'A home Icon shaped like a lightbulb',
                iconKey: 'research',
            },
            {
                path: '/login',
                element: <Login />,
                showInNav: false,
            },
            { path: '*', element: <NotFound />, showInNav: false },
            {
                path: '/admin',
                element: (
                    <AdminWrapper>
                        <Admin />
                    </AdminWrapper>
                ),
                label: 'Admin',
                showInNav: false,
            },
        ],
    },
];
