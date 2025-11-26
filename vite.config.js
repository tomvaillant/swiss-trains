import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte()],
    base: '/swiss-trains/',
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist'
    }
});
