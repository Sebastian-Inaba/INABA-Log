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
import { AuthProvider } from '../provider/AuthProvider';

// SVG icons for Nav
import HomeIcon from '../assets/icons/other/homeIcon.svg';
import PostIcon from '../assets/icons/other/postIcon.svg';
import ResearchIcon from '../assets/icons/other/deepDiveIcon.svg';
// Social Icons
import GitHubIcon from '../assets/icons/brands/GitHubBrand.svg';
import LinkedInIcon from '../assets/icons/brands/LinkedInBrand.svg';
import InstagramIcon from '../assets/icons/brands/InstagramBrand.svg';
// Other Icons
import longArrow from '../assets/icons/other/longArrowIcon.svg';

export const socialIcons = [
    { icon: GitHubIcon, label: 'GitHub', url: 'https://github.com/yourname' },
    { icon: LinkedInIcon, label: 'LinkedIn', url: 'https://linkedin.com/in/yourname' },
    { icon: InstagramIcon, label: 'Instagram', url: 'https://instagram.com/yourname' },
];

export const otherIcons = [{ icon: longArrow, label: 'a long arrow' }];

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
            { path: '/', element: <Home />, label: 'Home', showInNav: true, icon: HomeIcon, iconLabel: 'A home Icon shaped like a house' },
            {
                path: '/post',
                element: <Post />,
                label: 'Posts',
                showInNav: true,
                icon: PostIcon,
                iconLabel: 'A home Icon shaped like a note',
            },
            {
                path: '/research',
                element: <Research />,
                label: 'Deep Dives',
                showInNav: true,
                icon: ResearchIcon,
                iconLabel: 'A home Icon shaped like a lightbulb',
            },
            {
                path: '/login',
                element: (
                    <AuthProvider>
                        <Login />
                    </AuthProvider>
                ),
                showInNav: false,
            },
            { path: '*', element: <NotFound />, showInNav: false },
            {
                path: '/admin',
                element: (
                    <AuthProvider>
                        <AdminWrapper>
                            <Admin />
                        </AdminWrapper>
                    </AuthProvider>
                ),
                label: 'Admin',
                showInNav: false,
            },
        ],
    },
];
