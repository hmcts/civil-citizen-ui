module.exports = {
  roots: ['<rootDir>/src/test/contract/consumers'],
  testRegex: '(/src/test/.*|\\.(test|spec))\\.(ts|js)$',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^client/(.*)$': '<rootDir>/src/main/app/client/$1',
  },
};
