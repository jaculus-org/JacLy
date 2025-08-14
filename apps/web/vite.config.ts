import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Derive base path for GitHub Pages (project pages -> /<repo>/, otherwise '/')
const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? '';
const isCI = process.env.CI === 'true';
const base = isCI && repo ? `/${repo}/` : '/';

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
});
