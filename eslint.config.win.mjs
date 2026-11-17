import baseConfig from './eslint.config.mjs';

/**
 * Windows lint variant of the flat config.
 * @remarks Turns off `linebreak-style` so CRLF checkouts do not fail CI/local lint.
 */
export default [
  ...baseConfig,
  {
    rules: {
      'linebreak-style': 'off',
    },
  },
];
