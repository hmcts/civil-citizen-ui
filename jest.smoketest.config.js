module.exports = {
  roots: ['<rootDir>/src/integration-test'],
  testRegex: '(/src/integration-test/.*\\.(test|spec))\\.(ts|js)$',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': ['ts-jest', { tsconfig: 'tsconfig.jest.integration.json' }],
    '.*/node_modules/(@exodus/bytes|html-encoding-sniffer|@asamuzakjp/css-color|cssstyle|@csstools|parse5|jsdom|@tootallnate/once)/.+\\.(js|mjs|cjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@exodus/bytes|html-encoding-sniffer|@asamuzakjp/css-color|cssstyle|@csstools|parse5|jsdom|@tootallnate/once)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^otplib$': '<rootDir>/__mocks__/otplib.js',
    '^common/(.*)$': '<rootDir>/src/main/common/$1',
    '^models/(.*)$': '<rootDir>/src/main/common/models/$1',
    '^form/(.*)$': '<rootDir>/src/main/common/form/$1',
    '^modules/(.*)$': '<rootDir>/src/main/modules/$1',
    '^client/(.*)$': '<rootDir>/src/main/app/client/$1',
    '^routes/(.*)$': '<rootDir>/src/main/routes/$1',
    '^services/(.*)$': '<rootDir>/src/main/services/$1',
    '^app/auth/(.*)$': '<rootDir>/src/main/app/auth/$1',
  },
  setupFilesAfterEnv: [
    './jest.setup.redis-mock.js',
    './jest.setup.js',
    '<rootDir>/src/integration-test/setup/testSetup.ts',
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './smoke-output',
      outputName: 'test-output.html',
    }],
  ],
};
