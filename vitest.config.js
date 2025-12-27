import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['.github/scripts/__tests__/**/*.test.js'],
    exclude: ['frontend/**', 'backend/**', 'node_modules/**'],
  },
});
