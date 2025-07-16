// eslint.config.mjs

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import next from 'eslint-config-next';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // ❌ Ignore folder/files
  {
    ignores: ['node_modules/**', 'dist/**', '.next/**', 'src/generated/**'],
  },

  // ✅ Base JS setup
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      js,
    },
    extends: ['js/recommended'],
  },

  // ✅ TypeScript support
  ...tseslint.configs.recommended,

  // ✅ Next.js rules
  ...next(),

  // ✅ Prettier integration (optional but recommended)
  prettier,
]);
