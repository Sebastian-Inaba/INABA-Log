// src/routes/routes.tsx
import type { ReactNode, ComponentType } from 'react';
import { AppLayout } from '../layout/AppLayout';
import { AdminWrapper } from '../layout/wrapper/AdminWrapper';
import { Home } from '../pages/Home';
import { Post } from '../pages/Post';
import { Research } from '../pages/Research';
import { Admin } from '../pages/Admin';
import { Login } from '../pages/Login';
import { PostDetail } from '../pages/PostDetail';
import { ResearchDetail } from '../pages/ResearchDetail';
import { NotFound } from '../pages/NotFound';
import { NavIcons } from '../assets/icons/icons';

// TypeScript types for my routes
export type RouteConfig = {
    path: string;
    element: ReactNode;
    label?: string;
    showInNav?: boolean;
    icon?: ComponentType<{ className?: string }>;
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
                icon: NavIcons.Home,
                iconLabel: 'A home Icon shaped like a house',
                iconKey: 'home',
            },
            {
                path: '/post',
                element: <Post />,
                label: 'Posts',
                showInNav: true,
                icon: NavIcons.Post,
                iconLabel: 'A home Icon shaped like a note',
                iconKey: 'post',
            },
            {
                path: '/research',
                element: <Research />,
                label: 'Deep Dives',
                showInNav: true,
                icon: NavIcons.Research,
                iconLabel: 'A home Icon shaped like a lightbulb',
                iconKey: 'research',
            },
            {
                path: '/post/:slug',
                element: <PostDetail />,
                label: 'Post Detail',
                showInNav: false,
            },
            {
                path: '/research/:slug',
                element: <ResearchDetail />,
                label: 'Research Detail',
                showInNav: false,
            },
            {
                path: '/login',
                element: <Login />,
                label: 'Login',
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
