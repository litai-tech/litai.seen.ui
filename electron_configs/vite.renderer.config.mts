import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, '..'),  // Project root
  publicDir: path.resolve(__dirname, '../public'),
  plugins: [
    tailwindcss(),
  ],
})
