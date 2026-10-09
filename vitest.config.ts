import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@orblob/config': path.resolve(__dirname, './packages/config/src/index.ts'),
      '@orblob/core': path.resolve(__dirname, './packages/core/src/index.ts'),
      '@orblob/codegen': path.resolve(__dirname, './packages/codegen/src/index.ts'),
      '@orblob/react': path.resolve(__dirname, './packages/react/src/index.tsx'),
      '@orblob/vanilla': path.resolve(__dirname, './packages/vanilla/src/index.ts'),
    },
  },
});
