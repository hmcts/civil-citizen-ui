module.exports = {
  roots: ['<rootDir>/src/integration-test'],
  'testRegex': '(/src/integration-test/.*|\\.(test|spec))\\.(ts|js)$',
   'moduleFileExtensions': [
    'ts',
    'js'
  ],
  'testEnvironment': 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  reporters: [
    'default',
    [ 'jest-junit', {
      outputDirectory: './smoke-output',
      outputName: 'test-output.html'
    } ]
  ],
};
