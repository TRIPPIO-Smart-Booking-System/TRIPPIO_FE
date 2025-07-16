// eslint.config.mjs

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import next from 'eslint-config-next';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['node_modules/**', 'dist/**', '.next/**', 'src/generated/**'],
  },

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

  ...tseslint.configs.recommended,

  ...next(),

  prettier,
]);
