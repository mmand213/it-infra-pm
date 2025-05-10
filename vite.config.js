import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/project-manager/',    // ← your repo name
  plugins: [react()],
});
