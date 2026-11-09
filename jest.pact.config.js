module.exports = {
  maxWorkers: 1,
  globalSetup: '<rootDir>/src/test/contract/setup.js',
  roots: ['<rootDir>/src/test/contract/consumers'],
  testRegex: '(/src/test/.*|\\.(test|spec))\\.(ts|js)$',
  testEnvironment: 'node',
  transform: {
    '.*/node_modules/uuid/.+\\.(js|mjs|cjs)$': 'babel-jest',
    '^.+\\.ts?$': ['ts-jest', { tsconfig: '<rootDir>/src/test/contract/tsconfig.pact.json' }],
    // ESM-only deps: transform so Jest can load them
    '.*/node_modules/(nock|@mswjs/interceptors|rettime|@open-draft|strict-event-emitter|outvariant|is-node-process|headers-polyfill|@mswjs)/.+\\.(js|mjs|cjs)$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(uuid|nock|@mswjs/interceptors|rettime|@open-draft|strict-event-emitter|outvariant|is-node-process|headers-polyfill|@mswjs)/)(?!.*?/node_modules/)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^nock$': '<rootDir>/__mocks__/nockCjs.js',
    '^otplib$': '<rootDir>/__mocks__/otplib.js',
    '^client/(.*)$': '<rootDir>/src/main/app/client/$1',
    '^common/(.*)$': '<rootDir>/src/main/common/$1',
    '^models/(.*)$': '<rootDir>/src/main/common/models/$1',
    '^services/(.*)$': '<rootDir>/src/main/services/$1',
    '^form/(.*)$': '<rootDir>/src/main/common/form/$1',
    '^modules/(.*)$': '<rootDir>/src/main/modules/$1',
    '^routes/(.*)$': '<rootDir>/src/main/routes/$1',
  },
};
