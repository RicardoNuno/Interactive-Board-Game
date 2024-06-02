import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '', // Use the name of your GitHub repository
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/js'),
      'three': path.resolve(__dirname, 'node_modules/three')
    }
  },
  build: {
    outDir: 'dist'
  }
});
