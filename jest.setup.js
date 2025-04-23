const nock = require('nock');

afterAll(() => {
  nock.cleanAll();
  nock.restore();
});