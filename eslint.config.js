const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const codeceptjs = require('eslint-plugin-codeceptjs');
const globals = require('globals');

const sharedGlobals = {
  ...globals.browser,
  ...globals.es2015,
  ...globals.node,
  ...globals.jest,
  ...codeceptjs.environments.codeceptjs.globals,
  Atomics: 'readonly',
  SharedArrayBuffer: 'readonly',
};

module.exports = [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      '**/*.d.ts',
      '**/*.cjs',
      '**/*.mjs',
      'src/main/public/**',
      'src/main/types/**',
      'jest.*config.js',
      '.semgrep/**',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: sharedGlobals,
    },
    plugins: {
      codeceptjs,
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      'comma-dangle': ['error', 'always-multiline'],
      semi: ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-useless-assignment': 'off',
      'no-unassigned-vars': 'off',
    },
  },
  ...tsPlugin.configs['flat/recommended'].map(config => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: sharedGlobals,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      codeceptjs,
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'always-multiline'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];