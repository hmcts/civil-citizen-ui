module.exports = {
  roots: ['<rootDir>/src/test/routes'],
  "testRegex": "(/src/test/.*|\\.(test|spec))\\.(ts|js)$",
  "testEnvironment": "node",
  transform: {
    '^.+\\.ts?$': ['ts-jest', { isolatedModules: true }],
  },
  coverageProvider: 'v8',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
