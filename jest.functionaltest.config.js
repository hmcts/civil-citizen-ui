module.exports = {
  roots: ['<rootDir>/src/integration-test'],
  testRegex: '(/src/integration-test/.*|\\.(test|spec))\\.(ts|js)$',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePaths: ['<rootDir>/src/main'],
  reporters: [
    'default',
    [ 'jest-junit', {
      outputDirectory: "./functional-output",
      outputName: "test-output.html"
    } ]
  ],
}
