import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ['opentype.js', 'svelte-file-dropzone']
  },
  ssr: {
    noExternal: ['opentype.js', 'svelte-file-dropzone']
  }
});