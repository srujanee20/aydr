import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [['babel-plugin-react-compiler']]
            }
        })
    ],
    server: {
        port: 3000,
        strictPort: true
    },
    preview: {
        port: 3030,
        strictPort: true
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        copyPublicDir: true
    }
});
