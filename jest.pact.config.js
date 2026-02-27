module.exports = {
  roots: ['<rootDir>/src/test/contract/consumers'],
  testRegex: '(/src/test/.*|\\.(test|spec))\\.(ts|js)$',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': ['ts-jest', { tsconfig: '<rootDir>/src/test/contract/tsconfig.pact.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
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
