module.exports = {
  roots: ['<rootDir>/src/test/unit'],
  cacheDirectory: '<rootDir>/.jest-cache',
  testRegex: '(/src/test/.*|\\.(test|spec))\\.(ts|js)$',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': ['@swc/jest', { jsc: { transform: { hidden: { jest: true } } } }]
  },
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^common/(.*)$': '<rootDir>/src/main/common/$1',
    '^models/(.*)$': '<rootDir>/src/main/common/models/$1',
    '^form/(.*)$': '<rootDir>/src/main/common/form/$1',
    '^modules/(.*)$': '<rootDir>/src/main/modules/$1',
    '^client/(.*)$': '<rootDir>/src/main/app/client/$1',
    '^routes/(.*)$': '<rootDir>/src/main/routes/$1',
    '^services/(.*)$': '<rootDir>/src/main/services/$1',
    '^app/auth/(.*)$': '<rootDir>/src/main/app/auth/$1'
  },
  collectCoverageFrom: ['src/main/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/src/test/'],
  coverageReporters: ['text', 'json'],
  setupFiles: ['./jest.globalMocks.js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
