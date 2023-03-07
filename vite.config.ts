import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '/dayoff-audio-visualizer-v1/',
  // build: {
  //   rollupOptions: {
  //     external: ['p5'],
  //     output: {
  //       globals: {
  //         p5: 'p5',
  //       },
  //     },
  //   },
  // },
})
