import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        react(), 
        tailwindcss()
    ],
    server: { host: true }, // Allow access from network (for mobile testing)
    base: mode === 'production' ? '/INABA-Log/' : '/', // use base name on production
}))