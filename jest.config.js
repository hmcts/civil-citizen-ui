module.exports = {
  roots: ['<rootDir>/src/test/unit'],
  testRegex: '(/src/test/.*|\\.(test|spec))\\.(ts|js)$',
  testEnvironment: 'node',
  testPathIgnorePatterns:['src/test/unit/app/client',
  'src/test/unit/routes/features/claim/checkAnswersController.test.ts',
  'src/test/unit/routes/features/response/checkAnswersController.test.ts'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  reporters: [
      ['jest-slow-test-reporter', {"warnOnSlowerThan": 300, "color": true}]
    ],
  globals: {
          'ts-jest': {
              isolatedModules: true
          }
      },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^common/(.*)$': '<rootDir>/src/main/common/$1',
    '^models/(.*)$': '<rootDir>/src/main/common/models/$1',
    '^form/(.*)$': '<rootDir>/src/main/common/form/$1',
    '^modules/(.*)$': '<rootDir>/src/main/modules/$1',
    '^client/(.*)$': '<rootDir>/src/main/app/client/$1',
    '^routes/(.*)$': '<rootDir>/src/main/routes/$1',
    '^services/(.*)$': '<rootDir>/src/main/services/$1',
  },
  setupFilesAfterEnv: ['./jest.setup.redis-mock.js'],
  coverageProvider: 'v8',
};
