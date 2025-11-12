import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './assets/fonts/font.css';
import App from './App.tsx';
import { log, error } from './utilities/logger.ts';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);

// Register service worker after app load
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register(`${import.meta.env.BASE_URL}sw.js`)
            .then((registration) =>
                log(
                    'Service Worker registered with scope:',
                    registration.scope,
                ),
            )
            .catch((err) => error('Service Worker registration failed:', err));
    });
}
