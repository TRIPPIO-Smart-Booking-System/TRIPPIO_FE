// eslint.config.ts (flat config)
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'build/**',
      'out/**',
      'eslint.config.mjs',
      '**/src/generated/*',
      '**/prisma/generated/*',
    ],
  },

  // TS base
  ...tseslint.configs.recommended,

  // React base (bật prop-types)
  pluginReact.configs.flat.recommended,

  // Common for all JS/TS files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },

  // ✅ TypeScript override (type-aware + tắt prop-types)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    // đưa các rule type-aware vào trước...
    ...tseslint.configs.recommendedTypeChecked[0],
    // ...rồi override thêm ở đây để chắc chắn đè lên
    rules: {
      ...(tseslint.configs.recommendedTypeChecked[0]?.rules ?? {}),
      'react/prop-types': 'off', // <-- tắt cho TS
    },
  },

  // Prettier last
  prettier,
];
