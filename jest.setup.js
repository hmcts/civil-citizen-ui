const nockModule = require('nock');
// nock is ESM (transpiled by babel-jest), so the API may be under `default`
const nock = nockModule.default || nockModule;

afterAll(() => {
  nock.cleanAll();
  nock.restore();
});
