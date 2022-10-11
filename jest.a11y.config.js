module.exports = {
  roots: ['<rootDir>/src/test/a11y'],
  "testRegex": "(/src/test/.test.*|\\.(test|spec))\\.(ts|js)$",
  "testEnvironment": "node",
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testTimeout: 6000,
  globals: {
      'ts-jest': {
        isolatedModules: true
      }
    },
  "moduleFileExtensions": ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
