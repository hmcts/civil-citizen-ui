module.exports = {
  root: true,
  env: { browser: true, es6: true, node: true, mocha: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'import', 'mocha'],
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:mocha/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.eslint.json',
  },
  globals: { Atomics: 'readonly', SharedArrayBuffer: 'readonly' },
  rules: {
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-shadow': 'error',
    'mocha/no-mocha-arrows': 'off',
    'mocha/no-async-describe': 'off',
    'mocha/no-setup-in-describe': 'off',
    'mocha/no-hooks-for-single-case': 'off',
    'mocha/max-top-level-suites': 'off',
    'mocha/no-exports': 'off',
    'mocha/no-exclusive-tests': 'off',
    'mocha/no-top-level-hooks': 'off',
    'mocha/no-identical-title': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    curly: 'error',
    eqeqeq: 'error',
    'import/no-duplicates': 'error',
    'import/no-named-as-default': 'error',
    'linebreak-style': ['error', 'unix'],
    'no-console': 'warn',
    'no-prototype-builtins': 'off',
    'no-return-await': 'error',
    'no-unneeded-ternary': [
      'error',
      {
        defaultAssignment: false,
      },
    ],
    'object-curly-spacing': ['error', 'always'],
    'object-shorthand': ['error', 'properties'],
    quotes: [
      'error',
      'single',
      {
        allowTemplateLiterals: false,
        avoidEscape: true,
      },
    ],
    semi: ['error', 'always'],
    'sort-imports': [
      'error',
      {
        allowSeparatedGroups: false,
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      },
    ],
    'import/no-unresolved': 'off',
    'import/namespace': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/ban-ts-comment': 'off'

  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    }
  },
};
