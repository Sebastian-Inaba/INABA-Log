// src/routes/routes.tsx
import { AppLayout } from '../layout/AppLayout';
import { AdminWrapper } from '../layout/wrapper/AdminWrapper';
import { Home } from '../pages/Home';
import { Post } from '../pages/Post';
import { Research } from '../pages/Research';
import { Admin } from '../pages/Admin';
import { Login } from '../pages/Login';
import { NotFound } from '../pages/NotFound';
import { AuthProvider } from '../provider/AuthProvider';

export const routesConfig = [
    {
        element: <AppLayout />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/post', element: <Post /> },
            { path: '/research', element: <Research /> },
            {
                path: '/login',
                element: (
                    <AuthProvider>
                        <Login />
                    </AuthProvider>
                ),
            },
            { path: '*', element: <NotFound /> },
            {
                path: '/admin',
                element: (
                    <AuthProvider>
                        <AdminWrapper>
                            <Admin />
                        </AdminWrapper>
                    </AuthProvider>
                ),
            },
        ],
    },
];
